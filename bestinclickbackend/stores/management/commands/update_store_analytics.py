"""
Management command to update store analytics.
This command should be run periodically (e.g., via cron job) to keep analytics up to date.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from products.models import Store
from stores.services import StoreAnalyticsService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Update store analytics for all stores'

    def add_arguments(self, parser):
        parser.add_argument(
            '--store-id',
            type=int,
            help='Update analytics for a specific store ID',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update even if recently updated',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Starting store analytics update...')
        )
        
        analytics_service = StoreAnalyticsService()
        
        if options['store_id']:
            # Update specific store
            try:
                store = Store.objects.get(id=options['store_id'])
                self.update_store_analytics(analytics_service, store, options['force'])
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully updated analytics for store: {store.name}')
                )
            except Store.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Store with ID {options["store_id"]} not found')
                )
        else:
            # Update all stores
            stores = Store.objects.filter(is_active=True)
            updated_count = 0
            error_count = 0
            
            for store in stores:
                try:
                    self.update_store_analytics(analytics_service, store, options['force'])
                    updated_count += 1
                    self.stdout.write(f'Updated: {store.name}')
                except Exception as e:
                    error_count += 1
                    self.stdout.write(
                        self.style.ERROR(f'Error updating {store.name}: {str(e)}')
                    )
                    logger.error(f'Error updating analytics for store {store.id}: {str(e)}')
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Analytics update completed. Updated: {updated_count}, Errors: {error_count}'
                )
            )

    def update_store_analytics(self, analytics_service, store, force=False):
        """Update analytics for a single store."""
        # Update store metrics
        analytics_service.update_store_product_metrics(store)
        analytics_service.update_store_view_metrics(store)
        analytics_service.update_store_engagement_metrics(store)
        analytics_service.update_store_feedback_metrics(store)
        
        # Update product analytics for all store products
        for product in store.products.all():
            analytics_service.update_product_view_metrics(product)
            analytics_service.update_product_engagement_metrics(product, 'update')
        
        self.stdout.write(f'  ✓ Updated analytics for {store.name}')