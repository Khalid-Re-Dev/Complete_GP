"""
Django admin configuration for stores app.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    StoreApplication,
    StoreAnalytics,
    ProductAnalytics,
    StoreViewLog,
    ProductViewLog,
    StoreNotification,
    StoreFeedback
)


@admin.register(StoreApplication)
class StoreApplicationAdmin(admin.ModelAdmin):
    """
    Admin interface for store applications.
    """
    list_display = [
        'store_name', 'applicant', 'status', 'business_type',
        'created_at', 'reviewed_at', 'reviewed_by'
    ]
    list_filter = ['status', 'business_type', 'created_at', 'reviewed_at']
    search_fields = ['store_name', 'applicant__username', 'applicant__email', 'business_email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Application Info', {
            'fields': ('applicant', 'status', 'reviewed_by', 'review_notes')
        }),
        ('Store Details', {
            'fields': ('store_name', 'store_description', 'business_type')
        }),
        ('Contact Information', {
            'fields': ('business_email', 'business_phone', 'business_address')
        }),
        ('Legal Information', {
            'fields': ('business_license', 'tax_id')
        }),
        ('Documents', {
            'fields': ('business_license_document', 'identity_document')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'reviewed_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('applicant', 'reviewed_by')
    
    actions = ['approve_applications', 'reject_applications']
    
    def approve_applications(self, request, queryset):
        """Bulk approve applications."""
        count = 0
        for application in queryset.filter(status='pending'):
            application.status = 'approved'
            application.reviewed_by = request.user
            application.save()
            count += 1
        
        self.message_user(request, f'Successfully approved {count} applications.')
    approve_applications.short_description = "Approve selected applications"
    
    def reject_applications(self, request, queryset):
        """Bulk reject applications."""
        count = 0
        for application in queryset.filter(status='pending'):
            application.status = 'rejected'
            application.reviewed_by = request.user
            application.save()
            count += 1
        
        self.message_user(request, f'Successfully rejected {count} applications.')
    reject_applications.short_description = "Reject selected applications"


@admin.register(StoreAnalytics)
class StoreAnalyticsAdmin(admin.ModelAdmin):
    """
    Admin interface for store analytics.
    """
    list_display = [
        'store', 'total_products', 'total_views', 'unique_visitors',
        'average_rating', 'overall_score_display', 'last_updated'
    ]
    list_filter = ['last_updated']
    search_fields = ['store__name', 'store__owner__username']
    readonly_fields = ['last_updated', 'overall_score_display']
    
    fieldsets = (
        ('Store Info', {
            'fields': ('store',)
        }),
        ('Product Metrics', {
            'fields': ('total_products', 'active_products', 'out_of_stock_products')
        }),
        ('View Metrics', {
            'fields': ('total_views', 'unique_visitors')
        }),
        ('Engagement Metrics', {
            'fields': ('total_likes', 'total_comments', 'total_shares')
        }),
        ('Sales Metrics', {
            'fields': ('total_orders', 'total_revenue')
        }),
        ('Rating Metrics', {
            'fields': ('average_rating', 'total_reviews')
        }),
        ('Performance Scores', {
            'fields': ('popularity_score', 'engagement_score', 'quality_score', 'overall_score_display')
        }),
        ('Timestamps', {
            'fields': ('last_updated',),
            'classes': ('collapse',)
        })
    )
    
    def overall_score_display(self, obj):
        """Display overall score with color coding."""
        score = obj.get_overall_score()
        if score >= 80:
            color = 'green'
        elif score >= 60:
            color = 'orange'
        else:
            color = 'red'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}/100</span>',
            color, score
        )
    overall_score_display.short_description = 'Overall Score'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('store', 'store__owner')


@admin.register(ProductAnalytics)
class ProductAnalyticsAdmin(admin.ModelAdmin):
    """
    Admin interface for product analytics.
    """
    list_display = [
        'product', 'total_views', 'total_likes', 'conversion_rate',
        'engagement_rate', 'performance_trend', 'last_updated'
    ]
    list_filter = ['performance_trend', 'last_updated']
    search_fields = ['product__name', 'product__store__name']
    readonly_fields = ['last_updated']
    
    fieldsets = (
        ('Product Info', {
            'fields': ('product',)
        }),
        ('View Metrics', {
            'fields': ('total_views', 'unique_views')
        }),
        ('Engagement Metrics', {
            'fields': ('total_likes', 'total_comments', 'total_shares')
        }),
        ('Conversion Metrics', {
            'fields': ('add_to_cart_count', 'purchase_count')
        }),
        ('Performance Metrics', {
            'fields': ('conversion_rate', 'engagement_rate', 'performance_trend')
        }),
        ('Timestamps', {
            'fields': ('last_updated',),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product', 'product__store')


@admin.register(StoreViewLog)
class StoreViewLogAdmin(admin.ModelAdmin):
    """
    Admin interface for store view logs.
    """
    list_display = ['store', 'user', 'session_id', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['store__name', 'user__username', 'ip_address']
    readonly_fields = ['viewed_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('store', 'user')


@admin.register(ProductViewLog)
class ProductViewLogAdmin(admin.ModelAdmin):
    """
    Admin interface for product view logs.
    """
    list_display = ['product', 'user', 'session_id', 'view_duration', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['product__name', 'user__username', 'ip_address']
    readonly_fields = ['viewed_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product', 'user', 'product__store')


@admin.register(StoreNotification)
class StoreNotificationAdmin(admin.ModelAdmin):
    """
    Admin interface for store notifications.
    """
    list_display = [
        'store', 'notification_type', 'title', 'is_read',
        'is_important', 'created_at'
    ]
    list_filter = ['notification_type', 'is_read', 'is_important', 'created_at']
    search_fields = ['store__name', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    
    fieldsets = (
        ('Notification Info', {
            'fields': ('store', 'notification_type', 'title', 'message')
        }),
        ('Related Objects', {
            'fields': ('related_product',)
        }),
        ('Status', {
            'fields': ('is_read', 'is_important')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'read_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('store', 'related_product')


@admin.register(StoreFeedback)
class StoreFeedbackAdmin(admin.ModelAdmin):
    """
    Admin interface for store feedback.
    """
    list_display = [
        'store', 'customer', 'rating', 'overall_rating_display',
        'is_verified', 'is_featured', 'created_at'
    ]
    list_filter = ['rating', 'is_verified', 'is_featured', 'created_at']
    search_fields = ['store__name', 'customer__username', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at', 'responded_at', 'overall_rating_display']
    
    fieldsets = (
        ('Feedback Info', {
            'fields': ('store', 'customer', 'title', 'comment')
        }),
        ('Ratings', {
            'fields': ('rating', 'service_rating', 'delivery_rating', 'product_quality_rating', 'overall_rating_display')
        }),
        ('Status', {
            'fields': ('is_verified', 'is_featured')
        }),
        ('Store Response', {
            'fields': ('owner_response', 'responded_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def overall_rating_display(self, obj):
        """Display overall rating with stars."""
        rating = obj.get_overall_rating()
        stars = '★' * int(rating) + '☆' * (5 - int(rating))
        return format_html(
            '<span title="{:.1f}/5.0">{}</span>',
            rating, stars
        )
    overall_rating_display.short_description = 'Overall Rating'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('store', 'customer')
    
    actions = ['verify_feedback', 'feature_feedback']
    
    def verify_feedback(self, request, queryset):
        """Bulk verify feedback."""
        count = queryset.update(is_verified=True)
        self.message_user(request, f'Successfully verified {count} feedback entries.')
    verify_feedback.short_description = "Verify selected feedback"
    
    def feature_feedback(self, request, queryset):
        """Bulk feature feedback."""
        count = queryset.update(is_featured=True)
        self.message_user(request, f'Successfully featured {count} feedback entries.')
    feature_feedback.short_description = "Feature selected feedback"