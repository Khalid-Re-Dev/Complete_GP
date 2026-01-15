"""
Store Management Serializers
Serializers for store management, analytics, and owner dashboard.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from products.models import Store, Product
from .models import (
    StoreApplication,
    StoreAnalytics,
    ProductAnalytics,
    StoreViewLog,
    ProductViewLog,
    StoreNotification,
    StoreFeedback
)

User = get_user_model()


class StoreApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for store applications.
    """
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    applicant_email = serializers.CharField(source='applicant.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = StoreApplication
        fields = [
            'id', 'applicant', 'applicant_name', 'applicant_email',
            'store_name', 'store_description', 'business_type',
            'business_email', 'business_phone', 'business_address',
            'business_license', 'tax_id',
            'business_license_document', 'identity_document',
            'status', 'status_display',
            'review_notes', 'reviewed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['applicant', 'reviewed_at', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create store application with current user as applicant."""
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)


class StoreApplicationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating store applications (customer-facing).
    """
    class Meta:
        model = StoreApplication
        fields = [
            'store_name', 'store_description', 'business_type',
            'business_email', 'business_phone', 'business_address',
            'business_license', 'tax_id',
            'business_license_document', 'identity_document'
        ]
    
    def validate_business_email(self, value):
        """Validate business email is different from user email."""
        user = self.context['request'].user
        if value == user.email:
            raise serializers.ValidationError(
                "Business email should be different from your personal email."
            )
        return value


class StoreApplicationReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for reviewing store applications (admin-only).
    """
    class Meta:
        model = StoreApplication
        fields = ['status', 'review_notes']
    
    def validate_status(self, value):
        """Validate status transition."""
        if self.instance and self.instance.status == 'approved':
            raise serializers.ValidationError(
                "Cannot change status of already approved application."
            )
        return value
    
    def update(self, instance, validated_data):
        """Update application and create store if approved."""
        from django.utils import timezone
        
        # Set review information
        validated_data['reviewed_by'] = self.context['request'].user
        validated_data['reviewed_at'] = timezone.now()
        
        # Update application
        application = super().update(instance, validated_data)
        
        # Create store if approved
        if validated_data.get('status') == 'approved':
            self._create_store_from_application(application)
        
        return application
    
    def _create_store_from_application(self, application):
        """Create store from approved application."""
        # Update user role to store_owner
        user = application.applicant
        user.role = 'store_owner'
        user.save()
        
        # Create store
        store = Store.objects.create(
            owner=user,
            name=application.store_name,
            description=application.store_description,
            email=application.business_email,
            phone=application.business_phone,
            address=application.business_address,
            is_active=True,
            is_verified=True
        )
        
        # Create analytics record
        StoreAnalytics.objects.create(store=store)
        
        # Create welcome notification
        StoreNotification.objects.create(
            store=store,
            notification_type='system_update',
            title='Welcome to Best on Click!',
            message='Your store has been approved and is now live. Start adding products to begin selling.',
            is_important=True
        )


class StoreAnalyticsSerializer(serializers.ModelSerializer):
    """
    Serializer for store analytics.
    """
    store_name = serializers.CharField(source='store.name', read_only=True)
    overall_score = serializers.SerializerMethodField()
    
    class Meta:
        model = StoreAnalytics
        fields = [
            'store', 'store_name',
            'total_products', 'active_products', 'out_of_stock_products',
            'total_views', 'unique_visitors',
            'total_likes', 'total_comments', 'total_shares',
            'total_orders', 'total_revenue',
            'average_rating', 'total_reviews',
            'popularity_score', 'engagement_score', 'quality_score',
            'overall_score', 'last_updated'
        ]
        read_only_fields = ['store', 'last_updated']
    
    def get_overall_score(self, obj):
        """Get overall performance score."""
        return obj.get_overall_score()


class ProductAnalyticsSerializer(serializers.ModelSerializer):
    """
    Serializer for product analytics.
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = ProductAnalytics
        fields = [
            'product', 'product_name', 'product_price',
            'total_views', 'unique_views',
            'total_likes', 'total_comments', 'total_shares',
            'add_to_cart_count', 'purchase_count',
            'conversion_rate', 'engagement_rate',
            'performance_trend', 'last_updated'
        ]
        read_only_fields = ['product', 'last_updated']


class StoreViewLogSerializer(serializers.ModelSerializer):
    """
    Serializer for store view logs.
    """
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = StoreViewLog
        fields = [
            'id', 'store', 'user', 'user_name',
            'session_id', 'ip_address',
            'referrer', 'user_agent',
            'viewed_at'
        ]
        read_only_fields = ['viewed_at']


class ProductViewLogSerializer(serializers.ModelSerializer):
    """
    Serializer for product view logs.
    """
    user_name = serializers.CharField(source='user.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = ProductViewLog
        fields = [
            'id', 'product', 'product_name',
            'user', 'user_name',
            'session_id', 'ip_address',
            'referrer', 'user_agent',
            'view_duration', 'viewed_at'
        ]
        read_only_fields = ['viewed_at']


class StoreNotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for store notifications.
    """
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    related_product_name = serializers.CharField(source='related_product.name', read_only=True)
    
    class Meta:
        model = StoreNotification
        fields = [
            'id', 'store',
            'notification_type', 'notification_type_display',
            'title', 'message',
            'related_product', 'related_product_name',
            'is_read', 'is_important',
            'created_at', 'read_at'
        ]
        read_only_fields = ['store', 'created_at', 'read_at']


class StoreFeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for store feedback.
    """
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    overall_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = StoreFeedback
        fields = [
            'id', 'store', 'customer', 'customer_name',
            'rating', 'title', 'comment',
            'service_rating', 'delivery_rating', 'product_quality_rating',
            'overall_rating',
            'is_verified', 'is_featured',
            'owner_response', 'responded_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['customer', 'responded_at', 'created_at', 'updated_at']
    
    def get_overall_rating(self, obj):
        """Get overall rating from all categories."""
        return obj.get_overall_rating()


class StoreFeedbackCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating store feedback (customer-facing).
    """
    class Meta:
        model = StoreFeedback
        fields = [
            'rating', 'title', 'comment',
            'service_rating', 'delivery_rating', 'product_quality_rating'
        ]
    
    def create(self, validated_data):
        """Create feedback with current user as customer."""
        validated_data['customer'] = self.context['request'].user
        validated_data['store'] = self.context['store']
        return super().create(validated_data)


class StoreFeedbackResponseSerializer(serializers.ModelSerializer):
    """
    Serializer for store owner responses to feedback.
    """
    class Meta:
        model = StoreFeedback
        fields = ['owner_response']
    
    def update(self, instance, validated_data):
        """Update feedback with owner response."""
        from django.utils import timezone
        
        validated_data['responded_at'] = timezone.now()
        return super().update(instance, validated_data)


class StoreOwnerDashboardSerializer(serializers.Serializer):
    """
    Comprehensive dashboard data for store owners.
    """
    store_info = serializers.SerializerMethodField()
    analytics = serializers.SerializerMethodField()
    recent_notifications = serializers.SerializerMethodField()
    top_products = serializers.SerializerMethodField()
    recent_feedback = serializers.SerializerMethodField()
    performance_summary = serializers.SerializerMethodField()
    
    def get_store_info(self, store):
        """Get basic store information."""
        from products.serializers import StoreSerializer
        return StoreSerializer(store, context=self.context).data
    
    def get_analytics(self, store):
        """Get store analytics."""
        analytics, created = StoreAnalytics.objects.get_or_create(store=store)
        return StoreAnalyticsSerializer(analytics, context=self.context).data
    
    def get_recent_notifications(self, store):
        """Get recent unread notifications."""
        notifications = store.notifications.filter(is_read=False)[:5]
        return StoreNotificationSerializer(notifications, many=True, context=self.context).data
    
    def get_top_products(self, store):
        """Get top performing products."""
        from products.serializers import ProductSerializer
        
        products = store.products.filter(is_active=True).order_by('-view_count', '-average_rating')[:5]
        return ProductSerializer(products, many=True, context=self.context).data
    
    def get_recent_feedback(self, store):
        """Get recent feedback."""
        feedback = store.feedback.all()[:5]
        return StoreFeedbackSerializer(feedback, many=True, context=self.context).data
    
    def get_performance_summary(self, store):
        """Get performance summary."""
        analytics, created = StoreAnalytics.objects.get_or_create(store=store)
        
        return {
            'total_products': analytics.total_products,
            'total_views': analytics.total_views,
            'total_likes': analytics.total_likes,
            'average_rating': analytics.average_rating,
            'overall_score': analytics.get_overall_score(),
            'performance_trend': self._calculate_trend(store),
        }
    
    def _calculate_trend(self, store):
        """Calculate performance trend."""
        # Simple trend calculation based on recent views
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        last_week = now - timedelta(days=7)
        previous_week = last_week - timedelta(days=7)
        
        recent_views = StoreViewLog.objects.filter(
            store=store,
            viewed_at__gte=last_week
        ).count()
        
        previous_views = StoreViewLog.objects.filter(
            store=store,
            viewed_at__gte=previous_week,
            viewed_at__lt=last_week
        ).count()
        
        if previous_views == 0:
            return 'stable'
        
        change_percent = ((recent_views - previous_views) / previous_views) * 100
        
        if change_percent > 10:
            return 'improving'
        elif change_percent < -10:
            return 'declining'
        else:
            return 'stable'