"""
Store Management Models
Advanced store management with analytics and owner dashboard functionality.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from django.utils import timezone
from decimal import Decimal
import uuid

User = get_user_model()


class StoreApplication(models.Model):
    """
    Store application for users who want to become store owners.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('under_review', 'Under Review'),
    ]
    
    # Application details
    applicant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='store_applications'
    )
    
    # Store information
    store_name = models.CharField(max_length=200)
    store_description = models.TextField()
    business_type = models.CharField(
        max_length=100,
        help_text="Type of business (e.g., Electronics, Clothing, etc.)"
    )
    
    # Contact information
    business_email = models.EmailField()
    business_phone = models.CharField(max_length=20)
    business_address = models.TextField()
    
    # Legal information
    business_license = models.CharField(
        max_length=100,
        help_text="Business license number"
    )
    tax_id = models.CharField(
        max_length=50,
        help_text="Tax identification number"
    )
    
    # Documents (optional file uploads)
    business_license_document = models.FileField(
        upload_to='store_applications/licenses/',
        null=True,
        blank=True
    )
    identity_document = models.FileField(
        upload_to='store_applications/identity/',
        null=True,
        blank=True
    )
    
    # Application status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Review information
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications',
        limit_choices_to={'role': 'admin'}
    )
    review_notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'store_applications'
        indexes = [
            models.Index(fields=['applicant', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Application for {self.store_name} by {self.applicant.username}"


class StoreAnalytics(models.Model):
    """
    Store analytics and performance metrics.
    """
    store = models.OneToOneField(
        'products.Store',
        on_delete=models.CASCADE,
        related_name='store_analytics'
    )
    
    # Product metrics
    total_products = models.PositiveIntegerField(default=0)
    active_products = models.PositiveIntegerField(default=0)
    out_of_stock_products = models.PositiveIntegerField(default=0)
    
    # View metrics
    total_views = models.PositiveIntegerField(default=0)
    unique_visitors = models.PositiveIntegerField(default=0)
    
    # Engagement metrics
    total_likes = models.PositiveIntegerField(default=0)
    total_comments = models.PositiveIntegerField(default=0)
    total_shares = models.PositiveIntegerField(default=0)
    
    # Sales metrics (if orders system exists)
    total_orders = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Rating metrics
    average_rating = models.FloatField(default=0.0)
    total_reviews = models.PositiveIntegerField(default=0)
    
    # Performance scores (AI-calculated)
    popularity_score = models.FloatField(
        default=0.0,
        help_text="AI-calculated popularity score (0-100)"
    )
    engagement_score = models.FloatField(
        default=0.0,
        help_text="AI-calculated engagement score (0-100)"
    )
    quality_score = models.FloatField(
        default=0.0,
        help_text="AI-calculated quality score based on reviews (0-100)"
    )
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stores_analytics'
    
    def __str__(self):
        return f"Analytics for {self.store.name}"
    
    def get_overall_score(self):
        """Calculate overall store performance score."""
        return (self.popularity_score + self.engagement_score + self.quality_score) / 3


class ProductAnalytics(models.Model):
    """
    Individual product analytics for store owners.
    """
    product = models.OneToOneField(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='product_analytics'
    )
    
    # View metrics
    total_views = models.PositiveIntegerField(default=0)
    unique_views = models.PositiveIntegerField(default=0)
    
    # Engagement metrics
    total_likes = models.PositiveIntegerField(default=0)
    total_comments = models.PositiveIntegerField(default=0)
    total_shares = models.PositiveIntegerField(default=0)
    
    # Conversion metrics
    add_to_cart_count = models.PositiveIntegerField(default=0)
    purchase_count = models.PositiveIntegerField(default=0)
    
    # Performance metrics
    conversion_rate = models.FloatField(
        default=0.0,
        help_text="Conversion rate from views to purchases (%)"
    )
    engagement_rate = models.FloatField(
        default=0.0,
        help_text="Engagement rate (likes + comments + shares) / views (%)"
    )
    
    # AI insights
    performance_trend = models.CharField(
        max_length=20,
        choices=[
            ('improving', 'Improving'),
            ('stable', 'Stable'),
            ('declining', 'Declining'),
        ],
        default='stable'
    )
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stores_product_analytics'
    
    def __str__(self):
        return f"Analytics for {self.product.name}"
    
    def update_conversion_rate(self):
        """Update conversion rate based on views and purchases."""
        if self.total_views > 0:
            self.conversion_rate = (self.purchase_count / self.total_views) * 100
        else:
            self.conversion_rate = 0.0
    
    def update_engagement_rate(self):
        """Update engagement rate based on interactions and views."""
        if self.total_views > 0:
            total_engagements = self.total_likes + self.total_comments + self.total_shares
            self.engagement_rate = (total_engagements / self.total_views) * 100
        else:
            self.engagement_rate = 0.0


class StoreViewLog(models.Model):
    """
    Log store page views for analytics.
    """
    store = models.ForeignKey(
        'products.Store',
        on_delete=models.CASCADE,
        related_name='view_logs'
    )
    
    # Visitor information
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='store_views'
    )
    session_id = models.CharField(max_length=100, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # View details
    referrer = models.URLField(blank=True)
    user_agent = models.TextField(blank=True)
    
    # Timestamps
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'store_view_logs'
        indexes = [
            models.Index(fields=['store', 'viewed_at']),
            models.Index(fields=['user', 'viewed_at']),
            models.Index(fields=['session_id', 'viewed_at']),
        ]
    
    def __str__(self):
        return f"View of {self.store.name} at {self.viewed_at}"


class ProductViewLog(models.Model):
    """
    Log product page views for analytics.
    """
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='view_logs'
    )
    
    # Visitor information
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='product_views'
    )
    session_id = models.CharField(max_length=100, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # View details
    referrer = models.URLField(blank=True)
    user_agent = models.TextField(blank=True)
    view_duration = models.PositiveIntegerField(
        default=0,
        help_text="Time spent viewing product in seconds"
    )
    
    # Timestamps
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'product_view_logs'
        indexes = [
            models.Index(fields=['product', 'viewed_at']),
            models.Index(fields=['user', 'viewed_at']),
            models.Index(fields=['session_id', 'viewed_at']),
        ]
    
    def __str__(self):
        return f"View of {self.product.name} at {self.viewed_at}"


class StoreNotification(models.Model):
    """
    Notifications for store owners about their store performance.
    """
    NOTIFICATION_TYPES = [
        ('new_review', 'New Review'),
        ('low_stock', 'Low Stock Alert'),
        ('high_engagement', 'High Engagement'),
        ('performance_milestone', 'Performance Milestone'),
        ('system_update', 'System Update'),
    ]
    
    store = models.ForeignKey(
        'products.Store',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    
    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES
    )
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Related objects (optional)
    related_product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # Status
    is_read = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'store_notifications'
        indexes = [
            models.Index(fields=['store', 'is_read', 'created_at']),
            models.Index(fields=['notification_type', 'created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.store.name}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


class StoreFeedback(models.Model):
    """
    Customer feedback and reviews for stores.
    """
    store = models.ForeignKey(
        'products.Store',
        on_delete=models.CASCADE,
        related_name='feedback'
    )
    
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='store_feedback'
    )
    
    # Feedback details
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=200)
    comment = models.TextField()
    
    # Feedback categories
    service_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Customer service rating",
        null=True,
        blank=True,
        default=5
    )
    delivery_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Delivery experience rating",
        null=True,
        blank=True,
        default=5
    )
    product_quality_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Product quality rating",
        null=True,
        blank=True,
        default=5
    )
    
    # Status
    is_verified = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    # Store owner response
    owner_response = models.TextField(blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'store_feedback'
        unique_together = ['store', 'customer']
        indexes = [
            models.Index(fields=['store', 'rating', 'created_at']),
            models.Index(fields=['customer', 'created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback for {self.store.name} by {self.customer.username}"
    
    def get_overall_rating(self):
        """Calculate overall rating from all categories."""
        service = self.service_rating or 0
        delivery = self.delivery_rating or 0
        quality = self.product_quality_rating or 0
        
        if service == 0 and delivery == 0 and quality == 0:
            return 0
        
        total_ratings = sum([1 for rating in [service, delivery, quality] if rating > 0])
        total_score = service + delivery + quality
        
        return round(total_score / total_ratings, 2) if total_ratings > 0 else 0