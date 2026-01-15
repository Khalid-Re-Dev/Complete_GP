"""
Store Management Signals
Automatic updates for analytics and notifications.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from products.models import Product, ProductLike
from comments.models import Comment
from .models import StoreAnalytics, ProductAnalytics, StoreFeedback
from .services import StoreAnalyticsService, NotificationService
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Product)
def update_store_product_count(sender, instance, created, **kwargs):
    """
    Update store product count when a product is created or updated.
    """
    try:
        analytics_service = StoreAnalyticsService()
        analytics_service.update_store_product_metrics(instance.store)
        
        # Create analytics record for new product
        if created:
            ProductAnalytics.objects.get_or_create(product=instance)
            
            # Check for automated notifications
            notification_service = NotificationService()
            notification_service.check_and_create_automated_notifications(instance.store)
            
    except Exception as e:
        logger.error(f"Error updating store product count: {str(e)}")


@receiver(post_delete, sender=Product)
def update_store_product_count_on_delete(sender, instance, **kwargs):
    """
    Update store product count when a product is deleted.
    """
    try:
        analytics_service = StoreAnalyticsService()
        analytics_service.update_store_product_metrics(instance.store)
    except Exception as e:
        logger.error(f"Error updating store product count on delete: {str(e)}")


@receiver(post_save, sender=ProductLike)
def update_product_like_metrics(sender, instance, created, **kwargs):
    """
    Update product like metrics when a like is created.
    """
    if created:
        try:
            analytics_service = StoreAnalyticsService()
            analytics_service.update_product_engagement_metrics(instance.product, 'like')
        except Exception as e:
            logger.error(f"Error updating product like metrics: {str(e)}")


@receiver(post_delete, sender=ProductLike)
def update_product_like_metrics_on_delete(sender, instance, **kwargs):
    """
    Update product like metrics when a like is deleted.
    """
    try:
        # Decrease like count
        analytics, created = ProductAnalytics.objects.get_or_create(product=instance.product)
        if analytics.total_likes > 0:
            analytics.total_likes -= 1
            analytics.save(update_fields=['total_likes'])
            
            # Update engagement rate
            analytics.update_engagement_rate()
            analytics.save(update_fields=['engagement_rate'])
            
            # Update store metrics
            analytics_service = StoreAnalyticsService()
            analytics_service.update_store_engagement_metrics(instance.product.store)
            
    except Exception as e:
        logger.error(f"Error updating product like metrics on delete: {str(e)}")


@receiver(post_save, sender=Comment)
def update_product_comment_metrics(sender, instance, created, **kwargs):
    """
    Update product comment metrics when a comment is created.
    """
    if created and hasattr(instance, 'product') and instance.product:
        try:
            analytics_service = StoreAnalyticsService()
            analytics_service.update_product_engagement_metrics(instance.product, 'comment')
        except Exception as e:
            logger.error(f"Error updating product comment metrics: {str(e)}")


@receiver(post_save, sender=StoreFeedback)
def update_store_feedback_metrics(sender, instance, created, **kwargs):
    """
    Update store feedback metrics when feedback is created or updated.
    """
    try:
        analytics_service = StoreAnalyticsService()
        analytics_service.update_store_feedback_metrics(instance.store)
        
        # Check for automated notifications
        if created:
            notification_service = NotificationService()
            notification_service.check_and_create_automated_notifications(instance.store)
            
    except Exception as e:
        logger.error(f"Error updating store feedback metrics: {str(e)}")


@receiver(post_delete, sender=StoreFeedback)
def update_store_feedback_metrics_on_delete(sender, instance, **kwargs):
    """
    Update store feedback metrics when feedback is deleted.
    """
    try:
        analytics_service = StoreAnalyticsService()
        analytics_service.update_store_feedback_metrics(instance.store)
    except Exception as e:
        logger.error(f"Error updating store feedback metrics on delete: {str(e)}")


# Performance monitoring signals
@receiver(post_save, sender=StoreAnalytics)
def check_performance_milestones(sender, instance, **kwargs):
    """
    Check for performance milestones when analytics are updated.
    """
    try:
        notification_service = NotificationService()
        
        # Check view milestones
        if instance.total_views in [100, 500, 1000, 5000, 10000]:
            notification_service.create_performance_milestone_notification(
                instance.store,
                f'views_{instance.total_views}',
                instance.total_views
            )
        
        # Check rating milestones
        if instance.average_rating >= 4.5 and instance.total_reviews >= 10:
            notification_service.create_performance_milestone_notification(
                instance.store,
                'rating_45',
                instance.average_rating
            )
        
        # Check product count milestones
        if instance.total_products in [10, 25, 50, 100]:
            notification_service.create_performance_milestone_notification(
                instance.store,
                f'products_{instance.total_products}',
                instance.total_products
            )
            
    except Exception as e:
        logger.error(f"Error checking performance milestones: {str(e)}")


@receiver(post_save, sender=ProductAnalytics)
def check_product_performance(sender, instance, **kwargs):
    """
    Check product performance and create notifications for high engagement.
    """
    try:
        # Check for high engagement (more than 100 views and good engagement rate)
        if (instance.total_views > 100 and 
            instance.engagement_rate > 10 and 
            instance.total_views % 100 == 0):  # Every 100 views
            
            notification_service = NotificationService()
            notification_service.create_high_engagement_notification(
                instance.product.store,
                instance.product
            )
            
    except Exception as e:
        logger.error(f"Error checking product performance: {str(e)}")