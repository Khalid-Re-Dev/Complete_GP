"""
Store Management Services
Business logic for store analytics, notifications, and reporting.
"""

from django.db.models import Count, Avg, Sum, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
from products.models import Store, Product
from .models import (
    StoreAnalytics,
    ProductAnalytics,
    StoreViewLog,
    ProductViewLog,
    StoreNotification,
    StoreFeedback
)
import logging

logger = logging.getLogger(__name__)


class StoreAnalyticsService:
    """
    Service for managing store analytics and metrics.
    """
    
    def update_store_view_metrics(self, store, user=None, session_id=None):
        """
        Update store view metrics.
        """
        try:
            analytics, created = StoreAnalytics.objects.get_or_create(store=store)
            
            # Increment total views
            analytics.total_views = F('total_views') + 1
            
            # Check for unique visitor
            if self._is_unique_visitor(store, user, session_id):
                analytics.unique_visitors = F('unique_visitors') + 1
            
            analytics.save(update_fields=['total_views', 'unique_visitors'])
            
            # Refresh from database to get actual values
            analytics.refresh_from_db()
            
            # Update popularity score
            self._update_popularity_score(analytics)
            
        except Exception as e:
            logger.error(f"Error updating store view metrics: {str(e)}")
    
    def update_product_view_metrics(self, product, user=None, session_id=None):
        """
        Update product view metrics.
        """
        try:
            analytics, created = ProductAnalytics.objects.get_or_create(product=product)
            
            # Increment total views
            analytics.total_views = F('total_views') + 1
            
            # Check for unique view
            if self._is_unique_product_viewer(product, user, session_id):
                analytics.unique_views = F('unique_views') + 1
            
            analytics.save(update_fields=['total_views', 'unique_views'])
            
            # Refresh from database
            analytics.refresh_from_db()
            
            # Update conversion and engagement rates
            analytics.update_conversion_rate()
            analytics.update_engagement_rate()
            analytics.save(update_fields=['conversion_rate', 'engagement_rate'])
            
            # Update store analytics
            self.update_store_product_metrics(product.store)
            
        except Exception as e:
            logger.error(f"Error updating product view metrics: {str(e)}")
    
    def update_product_engagement_metrics(self, product, action_type):
        """
        Update product engagement metrics (likes, comments, shares).
        """
        try:
            analytics, created = ProductAnalytics.objects.get_or_create(product=product)
            
            if action_type == 'like':
                analytics.total_likes = F('total_likes') + 1
            elif action_type == 'comment':
                analytics.total_comments = F('total_comments') + 1
            elif action_type == 'share':
                analytics.total_shares = F('total_shares') + 1
            elif action_type == 'add_to_cart':
                analytics.add_to_cart_count = F('add_to_cart_count') + 1
            elif action_type == 'purchase':
                analytics.purchase_count = F('purchase_count') + 1
            
            analytics.save()
            
            # Refresh and update rates
            analytics.refresh_from_db()
            analytics.update_conversion_rate()
            analytics.update_engagement_rate()
            analytics.save(update_fields=['conversion_rate', 'engagement_rate'])
            
            # Update store analytics
            self.update_store_engagement_metrics(product.store)
            
        except Exception as e:
            logger.error(f"Error updating product engagement metrics: {str(e)}")
    
    def update_store_engagement_metrics(self, store):
        """
        Update store-level engagement metrics.
        """
        try:
            analytics, created = StoreAnalytics.objects.get_or_create(store=store)
            
            # Aggregate from all products
            product_analytics = ProductAnalytics.objects.filter(product__store=store)
            
            totals = product_analytics.aggregate(
                total_likes=Sum('total_likes'),
                total_comments=Sum('total_comments'),
                total_shares=Sum('total_shares')
            )
            
            analytics.total_likes = totals['total_likes'] or 0
            analytics.total_comments = totals['total_comments'] or 0
            analytics.total_shares = totals['total_shares'] or 0
            
            analytics.save(update_fields=['total_likes', 'total_comments', 'total_shares'])
            
            # Update engagement score
            self._update_engagement_score(analytics)
            
        except Exception as e:
            logger.error(f"Error updating store engagement metrics: {str(e)}")
    
    def update_store_product_metrics(self, store):
        """
        Update store product count metrics.
        """
        try:
            analytics, created = StoreAnalytics.objects.get_or_create(store=store)
            
            products = store.products.all()
            
            analytics.total_products = products.count()
            analytics.active_products = products.filter(is_active=True).count()
            analytics.out_of_stock_products = products.filter(
                is_active=True,
                in_stock=False
            ).count()
            
            analytics.save(update_fields=[
                'total_products',
                'active_products',
                'out_of_stock_products'
            ])
            
        except Exception as e:
            logger.error(f"Error updating store product metrics: {str(e)}")
    
    def update_store_feedback_metrics(self, store):
        """
        Update store feedback and rating metrics.
        """
        try:
            analytics, created = StoreAnalytics.objects.get_or_create(store=store)
            
            feedback = store.feedback.filter(is_verified=True)
            
            if feedback.exists():
                avg_rating = feedback.aggregate(avg_rating=Avg('rating'))['avg_rating']
                analytics.average_rating = round(avg_rating, 2) if avg_rating else 0.0
                analytics.total_reviews = feedback.count()
            else:
                analytics.average_rating = 0.0
                analytics.total_reviews = 0
            
            analytics.save(update_fields=['average_rating', 'total_reviews'])
            
            # Update quality score
            self._update_quality_score(analytics)
            
        except Exception as e:
            logger.error(f"Error updating store feedback metrics: {str(e)}")
    
    def _is_unique_visitor(self, store, user=None, session_id=None):
        """
        Check if this is a unique visitor to the store.
        """
        try:
            # Check within last 24 hours
            since = timezone.now() - timedelta(hours=24)
            
            query = Q(store=store, viewed_at__gte=since)
            
            if user and user.is_authenticated:
                query &= Q(user=user)
            elif session_id:
                query &= Q(session_id=session_id)
            else:
                return True  # Can't determine uniqueness
            
            return not StoreViewLog.objects.filter(query).exists()
            
        except Exception as e:
            logger.error(f"Error checking unique visitor: {str(e)}")
            return True
    
    def _is_unique_product_viewer(self, product, user=None, session_id=None):
        """
        Check if this is a unique viewer for the product.
        """
        try:
            # Check within last 24 hours
            since = timezone.now() - timedelta(hours=24)
            
            query = Q(product=product, viewed_at__gte=since)
            
            if user and user.is_authenticated:
                query &= Q(user=user)
            elif session_id:
                query &= Q(session_id=session_id)
            else:
                return True  # Can't determine uniqueness
            
            return not ProductViewLog.objects.filter(query).exists()
            
        except Exception as e:
            logger.error(f"Error checking unique product viewer: {str(e)}")
            return True
    
    def _update_popularity_score(self, analytics):
        """
        Update AI-calculated popularity score.
        """
        try:
            # Simple popularity algorithm based on views and engagement
            views_score = min(analytics.total_views / 1000 * 30, 30)  # Max 30 points
            engagement_score = min(
                (analytics.total_likes + analytics.total_comments + analytics.total_shares) / 100 * 20,
                20
            )  # Max 20 points
            rating_score = analytics.average_rating * 10  # Max 50 points
            
            analytics.popularity_score = views_score + engagement_score + rating_score
            analytics.save(update_fields=['popularity_score'])
            
        except Exception as e:
            logger.error(f"Error updating popularity score: {str(e)}")
    
    def _update_engagement_score(self, analytics):
        """
        Update AI-calculated engagement score.
        """
        try:
            if analytics.total_views > 0:
                total_engagements = (
                    analytics.total_likes +
                    analytics.total_comments +
                    analytics.total_shares
                )
                engagement_rate = (total_engagements / analytics.total_views) * 100
                analytics.engagement_score = min(engagement_rate, 100)
            else:
                analytics.engagement_score = 0
            
            analytics.save(update_fields=['engagement_score'])
            
        except Exception as e:
            logger.error(f"Error updating engagement score: {str(e)}")
    
    def _update_quality_score(self, analytics):
        """
        Update AI-calculated quality score.
        """
        try:
            # Base score on average rating and number of reviews
            rating_score = analytics.average_rating * 20  # Max 100 points
            
            # Bonus for having more reviews (credibility)
            review_bonus = min(analytics.total_reviews / 10 * 5, 20)  # Max 20 bonus
            
            analytics.quality_score = min(rating_score + review_bonus, 100)
            analytics.save(update_fields=['quality_score'])
            
        except Exception as e:
            logger.error(f"Error updating quality score: {str(e)}")
    
    def generate_store_report(self, store, start_date, end_date):
        """
        Generate comprehensive analytics report for a store.
        """
        try:
            analytics, created = StoreAnalytics.objects.get_or_create(store=store)
            
            # Get view logs for the period
            view_logs = StoreViewLog.objects.filter(
                store=store,
                viewed_at__gte=start_date,
                viewed_at__lte=end_date
            )
            
            # Get product view logs for the period
            product_view_logs = ProductViewLog.objects.filter(
                product__store=store,
                viewed_at__gte=start_date,
                viewed_at__lte=end_date
            )
            
            # Calculate metrics
            total_views = view_logs.count()
            unique_visitors = view_logs.values('user', 'session_id').distinct().count()
            total_product_views = product_view_logs.count()
            
            # Daily breakdown
            daily_views = self._get_daily_breakdown(view_logs, start_date, end_date)
            
            # Top products
            top_products = self._get_top_products(store, start_date, end_date)
            
            # Recent feedback
            recent_feedback = store.feedback.filter(
                created_at__gte=start_date,
                created_at__lte=end_date
            ).order_by('-created_at')[:10]
            
            return {
                'store_id': store.id,
                'store_name': store.name,
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'days': (end_date - start_date).days
                },
                'overview': {
                    'total_views': total_views,
                    'unique_visitors': unique_visitors,
                    'total_product_views': total_product_views,
                    'average_rating': analytics.average_rating,
                    'total_reviews': analytics.total_reviews,
                    'overall_score': analytics.get_overall_score()
                },
                'daily_views': daily_views,
                'top_products': top_products,
                'recent_feedback_count': recent_feedback.count(),
                'performance_scores': {
                    'popularity_score': analytics.popularity_score,
                    'engagement_score': analytics.engagement_score,
                    'quality_score': analytics.quality_score
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating store report: {str(e)}")
            return {'error': 'Failed to generate report'}
    
    def generate_product_performance_report(self, store, start_date, end_date):
        """
        Generate product performance report for a store.
        """
        try:
            products = store.products.filter(is_active=True)
            product_data = []
            
            for product in products:
                analytics, created = ProductAnalytics.objects.get_or_create(product=product)
                
                # Get views for the period
                period_views = ProductViewLog.objects.filter(
                    product=product,
                    viewed_at__gte=start_date,
                    viewed_at__lte=end_date
                ).count()
                
                product_data.append({
                    'product_id': product.id,
                    'product_name': product.name,
                    'total_views': analytics.total_views,
                    'period_views': period_views,
                    'total_likes': analytics.total_likes,
                    'conversion_rate': analytics.conversion_rate,
                    'engagement_rate': analytics.engagement_rate,
                    'performance_trend': analytics.performance_trend,
                    'price': float(product.price),
                    'average_rating': product.average_rating
                })
            
            # Sort by period views
            product_data.sort(key=lambda x: x['period_views'], reverse=True)
            
            return {
                'store_id': store.id,
                'store_name': store.name,
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'total_products': len(product_data),
                'products': product_data
            }
            
        except Exception as e:
            logger.error(f"Error generating product performance report: {str(e)}")
            return {'error': 'Failed to generate product report'}
    
    def _get_daily_breakdown(self, view_logs, start_date, end_date):
        """
        Get daily view breakdown for the period.
        """
        try:
            daily_data = {}
            current_date = start_date.date()
            end_date_only = end_date.date()
            
            while current_date <= end_date_only:
                daily_data[current_date.isoformat()] = 0
                current_date += timedelta(days=1)
            
            # Count views by date
            for log in view_logs:
                date_key = log.viewed_at.date().isoformat()
                if date_key in daily_data:
                    daily_data[date_key] += 1
            
            return daily_data
            
        except Exception as e:
            logger.error(f"Error getting daily breakdown: {str(e)}")
            return {}
    
    def _get_top_products(self, store, start_date, end_date, limit=10):
        """
        Get top performing products for the period.
        """
        try:
            products = store.products.filter(is_active=True)
            product_performance = []
            
            for product in products:
                period_views = ProductViewLog.objects.filter(
                    product=product,
                    viewed_at__gte=start_date,
                    viewed_at__lte=end_date
                ).count()
                
                if period_views > 0:
                    product_performance.append({
                        'product_id': product.id,
                        'product_name': product.name,
                        'views': period_views,
                        'likes': product.likes.count(),
                        'average_rating': product.average_rating
                    })
            
            # Sort by views and return top products
            product_performance.sort(key=lambda x: x['views'], reverse=True)
            return product_performance[:limit]
            
        except Exception as e:
            logger.error(f"Error getting top products: {str(e)}")
            return []


class NotificationService:
    """
    Service for managing store notifications.
    """
    
    def create_new_review_notification(self, feedback):
        """
        Create notification for new store review.
        """
        try:
            StoreNotification.objects.create(
                store=feedback.store,
                notification_type='new_review',
                title='New Customer Review',
                message=f'You received a new {feedback.rating}-star review from {feedback.customer.get_full_name() or feedback.customer.username}',
                is_important=feedback.rating <= 2  # Mark low ratings as important
            )
        except Exception as e:
            logger.error(f"Error creating new review notification: {str(e)}")
    
    def create_low_stock_notification(self, product):
        """
        Create notification for low stock product.
        """
        try:
            StoreNotification.objects.create(
                store=product.store,
                notification_type='low_stock',
                title='Low Stock Alert',
                message=f'Product "{product.name}" is running low on stock (Current: {product.stock_quantity})',
                related_product=product,
                is_important=True
            )
        except Exception as e:
            logger.error(f"Error creating low stock notification: {str(e)}")
    
    def create_performance_milestone_notification(self, store, milestone_type, value):
        """
        Create notification for performance milestones.
        """
        try:
            messages = {
                'views_1000': f'Congratulations! Your store has reached 1,000 views!',
                'rating_45': f'Great job! Your store rating is now {value}/5.0',
                'products_50': f'Milestone achieved! You now have {value} products in your store'
            }
            
            StoreNotification.objects.create(
                store=store,
                notification_type='performance_milestone',
                title='Performance Milestone Achieved!',
                message=messages.get(milestone_type, f'You achieved a new milestone: {milestone_type}'),
                is_important=False
            )
        except Exception as e:
            logger.error(f"Error creating performance milestone notification: {str(e)}")
    
    def create_high_engagement_notification(self, store, product):
        """
        Create notification for high engagement on a product.
        """
        try:
            StoreNotification.objects.create(
                store=store,
                notification_type='high_engagement',
                title='High Engagement Alert',
                message=f'Your product "{product.name}" is getting lots of attention! Consider promoting it more.',
                related_product=product,
                is_important=False
            )
        except Exception as e:
            logger.error(f"Error creating high engagement notification: {str(e)}")
    
    def check_and_create_automated_notifications(self, store):
        """
        Check for conditions that should trigger automated notifications.
        """
        try:
            # Check for low stock products
            low_stock_products = store.products.filter(
                is_active=True,
                in_stock=True,
                stock_quantity__lte=5
            )
            
            for product in low_stock_products:
                # Check if we haven't sent this notification recently
                recent_notification = StoreNotification.objects.filter(
                    store=store,
                    notification_type='low_stock',
                    related_product=product,
                    created_at__gte=timezone.now() - timedelta(days=7)
                ).exists()
                
                if not recent_notification:
                    self.create_low_stock_notification(product)
            
            # Check for performance milestones
            analytics, created = StoreAnalytics.objects.get_or_create(store=store)
            
            # Check view milestones
            if analytics.total_views >= 1000:
                milestone_exists = StoreNotification.objects.filter(
                    store=store,
                    notification_type='performance_milestone',
                    message__contains='1,000 views'
                ).exists()
                
                if not milestone_exists:
                    self.create_performance_milestone_notification(store, 'views_1000', 1000)
            
            # Check rating milestones
            if analytics.average_rating >= 4.5:
                milestone_exists = StoreNotification.objects.filter(
                    store=store,
                    notification_type='performance_milestone',
                    message__contains='rating is now'
                ).exists()
                
                if not milestone_exists:
                    self.create_performance_milestone_notification(store, 'rating_45', analytics.average_rating)
            
        except Exception as e:
            logger.error(f"Error checking automated notifications: {str(e)}")