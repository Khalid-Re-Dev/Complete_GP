"""
Management command to create automated notifications for stores.
This command checks for various conditions and creates appropriate notifications.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from products.models import Store
from stores.services import NotificationService
from stores.models import StoreAnalytics
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create automated notifications for stores based on analytics and performance'

    def add_arguments(self, parser):
        parser.add_argument(
            '--store-id',
            type=int,
            help='Create notifications for a specific store ID',
        )
        parser.add_argument(
            '--notification-type',
            type=str,
            choices=['performance', 'milestones', 'recommendations', 'all'],
            default='all',
            help='Type of notifications to create',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Starting automated notification creation...')
        )
        
        notification_service = NotificationService()
        
        if options['store_id']:
            # Process specific store
            try:
                store = Store.objects.get(id=options['store_id'])
                self.process_store_notifications(notification_service, store, options['notification_type'])
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully processed notifications for store: {store.name}')
                )
            except Store.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Store with ID {options["store_id"]} not found')
                )
        else:
            # Process all active stores
            stores = Store.objects.filter(is_active=True)
            processed_count = 0
            notification_count = 0
            
            for store in stores:
                try:
                    count = self.process_store_notifications(
                        notification_service, store, options['notification_type']
                    )
                    processed_count += 1
                    notification_count += count
                    if count > 0:
                        self.stdout.write(f'Created {count} notifications for: {store.name}')
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error processing {store.name}: {str(e)}')
                    )
                    logger.error(f'Error creating notifications for store {store.id}: {str(e)}')
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Notification creation completed. '
                    f'Processed: {processed_count} stores, '
                    f'Created: {notification_count} notifications'
                )
            )

    def process_store_notifications(self, notification_service, store, notification_type):
        """Process notifications for a single store."""
        notification_count = 0
        
        try:
            analytics = store.store_analytics
        except:
            # No analytics yet, skip
            return 0
        
        if notification_type in ['performance', 'all']:
            notification_count += self.create_performance_notifications(
                notification_service, store, analytics
            )
        
        if notification_type in ['milestones', 'all']:
            notification_count += self.create_milestone_notifications(
                notification_service, store, analytics
            )
        
        if notification_type in ['recommendations', 'all']:
            notification_count += self.create_recommendation_notifications(
                notification_service, store, analytics
            )
        
        return notification_count

    def create_performance_notifications(self, notification_service, store, analytics):
        """Create performance-related notifications."""
        count = 0
        
        # Check for low performance
        if analytics.get_overall_score() < 30:
            notification_service.create_low_performance_notification(store)
            count += 1
        
        # Check for high engagement products
        high_engagement_products = store.products.filter(
            product_analytics__engagement_rate__gt=15
        )
        for product in high_engagement_products[:3]:  # Limit to top 3
            notification_service.create_high_engagement_notification(store, product)
            count += 1
        
        return count

    def create_milestone_notifications(self, notification_service, store, analytics):
        """Create milestone-related notifications."""
        count = 0
        
        # View milestones
        view_milestones = [100, 500, 1000, 5000, 10000]
        for milestone in view_milestones:
            if analytics.total_views >= milestone:
                # Check if we haven't already sent this notification
                existing = store.notifications.filter(
                    notification_type='performance_milestone',
                    message__contains=f'{milestone} مشاهدة'
                ).exists()
                
                if not existing:
                    notification_service.create_performance_milestone_notification(
                        store, f'views_{milestone}', milestone
                    )
                    count += 1
                    break  # Only send the highest achieved milestone
        
        # Product count milestones
        product_milestones = [5, 10, 25, 50, 100]
        for milestone in product_milestones:
            if analytics.total_products >= milestone:
                existing = store.notifications.filter(
                    notification_type='performance_milestone',
                    message__contains=f'{milestone} منتج'
                ).exists()
                
                if not existing:
                    notification_service.create_performance_milestone_notification(
                        store, f'products_{milestone}', milestone
                    )
                    count += 1
                    break
        
        return count

    def create_recommendation_notifications(self, notification_service, store, analytics):
        """Create recommendation-related notifications."""
        count = 0
        
        # Low product count recommendation
        if analytics.total_products < 5:
            # Check if we haven't sent this recently (within 7 days)
            recent_notification = store.notifications.filter(
                notification_type='system_update',
                message__contains='إضافة المزيد من المنتجات',
                created_at__gte=timezone.now() - timedelta(days=7)
            ).exists()
            
            if not recent_notification:
                notification_service.create_recommendation_notification(
                    store,
                    'إضافة المزيد من المنتجات',
                    'لزيادة فرص الظهور في نتائج البحث، ننصح بإضافة المزيد من المنتجات إلى متجرك.'
                )
                count += 1
        
        # Low engagement recommendation
        if analytics.engagement_score < 20:
            recent_notification = store.notifications.filter(
                notification_type='system_update',
                message__contains='تحسين جودة المنتجات',
                created_at__gte=timezone.now() - timedelta(days=7)
            ).exists()
            
            if not recent_notification:
                notification_service.create_recommendation_notification(
                    store,
                    'تحسين جودة المنتجات',
                    'لزيادة التفاعل مع منتجاتك، ننصح بإضافة صور عالية الجودة ووصف مفصل للمنتجات.'
                )
                count += 1
        
        return count