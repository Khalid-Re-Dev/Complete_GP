#!/usr/bin/env python3
"""
Script to create Django Store Management App
This script creates a complete Django app for store management
"""

import os
import sys
from pathlib import Path

def create_store_app():
    """Create Django store management app with all necessary files"""
    
    print("🏪 Creating Store Management Django App...")
    
    # Define the app structure
    app_structure = {
        'store_management': {
            '__init__.py': '',
            'admin.py': admin_content,
            'apps.py': apps_content,
            'models.py': models_content,
            'views.py': views_content,
            'serializers.py': serializers_content,
            'urls.py': urls_content,
            'permissions.py': permissions_content,
            'utils.py': utils_content,
            'migrations': {
                '__init__.py': ''
            },
            'tests': {
                '__init__.py': '',
                'test_models.py': test_models_content,
                'test_views.py': test_views_content,
                'test_serializers.py': test_serializers_content
            }
        }
    }
    
    # Create the directory structure
    create_directory_structure('backend', app_structure)
    
    # Create management commands
    create_management_commands()
    
    # Create fixtures for testing
    create_fixtures()
    
    print("✅ Store Management App created successfully!")
    print("\n📋 Next steps:")
    print("1. Add 'store_management' to INSTALLED_APPS in settings.py")
    print("2. Include store_management.urls in main urls.py")
    print("3. Run: python manage.py makemigrations store_management")
    print("4. Run: python manage.py migrate")
    print("5. Run: python manage.py create_sample_stores (optional)")

def create_directory_structure(base_path, structure):
    """Recursively create directory structure with files"""
    for name, content in structure.items():
        path = Path(base_path) / name
        
        if isinstance(content, dict):
            # It's a directory
            path.mkdir(parents=True, exist_ok=True)
            create_directory_structure(path, content)
        else:
            # It's a file
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"📄 Created: {path}")

def create_management_commands():
    """Create Django management commands"""
    commands_dir = Path('backend/store_management/management/commands')
    commands_dir.mkdir(parents=True, exist_ok=True)
    
    # __init__.py files
    (commands_dir.parent / '__init__.py').write_text('')
    (commands_dir / '__init__.py').write_text('')
    
    # Create sample stores command
    (commands_dir / 'create_sample_stores.py').write_text(sample_stores_command)
    
    print("📄 Created: management commands")

def create_fixtures():
    """Create fixture files for testing"""
    fixtures_dir = Path('backend/store_management/fixtures')
    fixtures_dir.mkdir(parents=True, exist_ok=True)
    
    (fixtures_dir / 'sample_stores.json').write_text(sample_stores_fixture)
    (fixtures_dir / 'sample_applications.json').write_text(sample_applications_fixture)
    
    print("📄 Created: fixture files")

# File contents
admin_content = '''"""
Store Management Admin Configuration
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import StoreApplication, Store, StoreAnalytics, StoreFeedback, StoreNotification

@admin.register(StoreApplication)
class StoreApplicationAdmin(admin.ModelAdmin):
    list_display = ['store_name', 'applicant', 'status', 'business_type', 'created_at']
    list_filter = ['status', 'business_type', 'created_at']
    search_fields = ['store_name', 'applicant__email', 'business_email']
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

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'business_type', 'is_active', 'is_verified', 'rating', 'created_at']
    list_filter = ['is_active', 'is_verified', 'business_type', 'created_at']
    search_fields = ['name', 'owner__email', 'email']
    readonly_fields = ['created_at', 'updated_at', 'total_products', 'total_sales']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('owner', 'name', 'description', 'business_type')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'address')
        }),
        ('Legal Information', {
            'fields': ('business_license', 'tax_id')
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified')
        }),
        ('Statistics', {
            'fields': ('total_products', 'total_sales', 'rating'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(StoreAnalytics)
class StoreAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['store', 'date', 'total_views', 'unique_visitors', 'total_sales']
    list_filter = ['date', 'store']
    date_hierarchy = 'date'

@admin.register(StoreFeedback)
class StoreFeedbackAdmin(admin.ModelAdmin):
    list_display = ['store', 'customer_name', 'rating', 'created_at', 'has_response']
    list_filter = ['rating', 'created_at', 'is_verified']
    search_fields = ['customer_name', 'customer_email', 'comment']
    
    def has_response(self, obj):
        return bool(obj.owner_response)
    has_response.boolean = True
    has_response.short_description = 'Has Response'

@admin.register(StoreNotification)
class StoreNotificationAdmin(admin.ModelAdmin):
    list_display = ['store', 'title', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message']
'''

apps_content = '''"""
Store Management App Configuration
"""
from django.apps import AppConfig

class StoreManagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'store_management'
    verbose_name = 'Store Management'
    
    def ready(self):
        import store_management.signals
'''

models_content = '''"""
Store Management Models
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class StoreApplication(models.Model):
    """Model for store creation applications"""
    
    STATUS_CHOICES = [
        ('pending', 'قيد المراجعة'),
        ('approved', 'موافق عليه'),
        ('rejected', 'مرفوض'),
    ]
    
    # Application Info
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='store_applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, null=True, blank=True, 
                                   related_name='reviewed_applications',
                                   on_delete=models.SET_NULL)
    review_notes = models.TextField(blank=True)
    
    # Store Details
    store_name = models.CharField(max_length=200)
    store_description = models.TextField()
    business_type = models.CharField(max_length=100)
    
    # Contact Information
    business_email = models.EmailField()
    business_phone = models.CharField(max_length=20)
    business_address = models.TextField()
    
    # Legal Information
    business_license = models.CharField(max_length=100)
    tax_id = models.CharField(max_length=50)
    
    # Documents
    business_license_document = models.FileField(upload_to='store_documents/')
    identity_document = models.FileField(upload_to='store_documents/')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Store Application'
        verbose_name_plural = 'Store Applications'
    
    def __str__(self):
        return f"{self.store_name} - {self.get_status_display()}"
    
    def save(self, *args, **kwargs):
        if self.status in ['approved', 'rejected'] and not self.reviewed_at:
            self.reviewed_at = timezone.now()
        super().save(*args, **kwargs)

class Store(models.Model):
    """Model for stores"""
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_stores')
    name = models.CharField(max_length=200)
    description = models.TextField()
    business_type = models.CharField(max_length=100)
    
    # Contact Information
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    
    # Legal Information
    business_license = models.CharField(max_length=100)
    tax_id = models.CharField(max_length=50)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Statistics
    total_products = models.IntegerField(default=0)
    total_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rating = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Store'
        verbose_name_plural = 'Stores'
    
    def __str__(self):
        return self.name

class StoreAnalytics(models.Model):
    """Model for store analytics data"""
    
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='analytics')
    date = models.DateField()
    
    # View Metrics
    total_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    
    # Engagement Metrics
    total_likes = models.IntegerField(default=0)
    total_comments = models.IntegerField(default=0)
    total_shares = models.IntegerField(default=0)
    
    # Conversion Metrics
    add_to_cart_count = models.IntegerField(default=0)
    purchase_count = models.IntegerField(default=0)
    total_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Performance Metrics
    conversion_rate = models.FloatField(default=0)
    engagement_rate = models.FloatField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['store', 'date']
        verbose_name = 'Store Analytics'
        verbose_name_plural = 'Store Analytics'
    
    def __str__(self):
        return f"{self.store.name} - {self.date}"

class StoreFeedback(models.Model):
    """Model for store feedback/reviews"""
    
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='feedback')
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    product_name = models.CharField(max_length=200, blank=True)
    
    # Store owner response
    owner_response = models.TextField(blank=True)
    response_date = models.DateTimeField(null=True, blank=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Store Feedback'
        verbose_name_plural = 'Store Feedback'
    
    def __str__(self):
        return f"{self.store.name} - {self.rating} stars"

class StoreNotification(models.Model):
    """Model for store notifications"""
    
    NOTIFICATION_TYPES = [
        ('order', 'طلب جديد'),
        ('review', 'مراجعة جديدة'),
        ('stock', 'تنبيه المخزون'),
        ('performance', 'تنبيه الأداء'),
        ('system', 'إشعار النظام'),
    ]
    
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    
    # Optional data for specific notification types
    related_object_id = models.IntegerField(null=True, blank=True)
    action_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Store Notification'
        verbose_name_plural = 'Store Notifications'
    
    def __str__(self):
        return f"{self.store.name} - {self.title}"
'''

views_content = '''"""
Store Management Views
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import StoreApplication, Store, StoreAnalytics, StoreFeedback, StoreNotification
from .serializers import (
    StoreApplicationSerializer, StoreSerializer, StoreAnalyticsSerializer,
    StoreFeedbackSerializer, StoreNotificationSerializer
)
from .permissions import IsStoreOwner, IsStoreOwnerOrReadOnly

class StoreApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for store applications"""
    serializer_class = StoreApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return StoreApplication.objects.all()
        return StoreApplication.objects.filter(applicant=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_application(self, request):
        """Get current user's application"""
        try:
            application = StoreApplication.objects.get(applicant=request.user)
            serializer = self.get_serializer(application)
            return Response(serializer.data)
        except StoreApplication.DoesNotExist:
            return Response({'detail': 'No application found'}, status=404)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Approve store application"""
        application = self.get_object()
        application.status = 'approved'
        application.reviewed_by = request.user
        application.review_notes = request.data.get('review_notes', '')
        application.save()
        
        # Create the store
        store = Store.objects.create(
            owner=application.applicant,
            name=application.store_name,
            description=application.store_description,
            business_type=application.business_type,
            email=application.business_email,
            phone=application.business_phone,
            address=application.business_address,
            business_license=application.business_license,
            tax_id=application.tax_id,
            is_verified=True
        )
        
        return Response({'detail': 'Application approved and store created'})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Reject store application"""
        application = self.get_object()
        application.status = 'rejected'
        application.reviewed_by = request.user
        application.review_notes = request.data.get('review_notes', '')
        application.save()
        
        return Response({'detail': 'Application rejected'})

class StoreViewSet(viewsets.ModelViewSet):
    """ViewSet for stores"""
    serializer_class = StoreSerializer
    permission_classes = [IsStoreOwnerOrReadOnly]
    
    def get_queryset(self):
        if self.action == 'list':
            return Store.objects.filter(is_active=True)
        return Store.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_stores(self, request):
        """Get current user's stores"""
        stores = Store.objects.filter(owner=request.user)
        serializer = self.get_serializer(stores, many=True)
        return Response({'stores': serializer.data})
    
    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """Get store dashboard data"""
        store = self.get_object()
        
        # Get recent analytics
        recent_analytics = StoreAnalytics.objects.filter(store=store).order_by('-date')[:30]
        
        # Get recent feedback
        recent_feedback = StoreFeedback.objects.filter(store=store).order_by('-created_at')[:10]
        
        # Get unread notifications
        unread_notifications = StoreNotification.objects.filter(
            store=store, is_read=False
        ).order_by('-created_at')[:5]
        
        return Response({
            'store': StoreSerializer(store).data,
            'recent_analytics': StoreAnalyticsSerializer(recent_analytics, many=True).data,
            'recent_feedback': StoreFeedbackSerializer(recent_feedback, many=True).data,
            'unread_notifications': StoreNotificationSerializer(unread_notifications, many=True).data
        })

class StoreAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for store analytics"""
    serializer_class = StoreAnalyticsSerializer
    permission_classes = [IsStoreOwner]
    
    def get_queryset(self):
        return StoreAnalytics.objects.filter(store__owner=self.request.user)

class StoreFeedbackViewSet(viewsets.ModelViewSet):
    """ViewSet for store feedback"""
    serializer_class = StoreFeedbackSerializer
    permission_classes = [IsStoreOwnerOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return StoreFeedback.objects.filter(store__owner=self.request.user)
        return StoreFeedback.objects.none()
    
    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Respond to feedback"""
        feedback = self.get_object()
        feedback.owner_response = request.data.get('response', '')
        feedback.response_date = timezone.now()
        feedback.save()
        
        return Response({'detail': 'Response added successfully'})

class StoreNotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for store notifications"""
    serializer_class = StoreNotificationSerializer
    permission_classes = [IsStoreOwner]
    
    def get_queryset(self):
        return StoreNotification.objects.filter(store__owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        
        return Response({'detail': 'Notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        StoreNotification.objects.filter(
            store__owner=request.user, is_read=False
        ).update(is_read=True)
        
        return Response({'detail': 'All notifications marked as read'})
'''

serializers_content = '''"""
Store Management Serializers
"""
from rest_framework import serializers
from .models import StoreApplication, Store, StoreAnalytics, StoreFeedback, StoreNotification

class StoreApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    
    class Meta:
        model = StoreApplication
        fields = '__all__'
        read_only_fields = ['applicant', 'status', 'reviewed_by', 'review_notes', 'reviewed_at']

class StoreSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Store
        fields = '__all__'
        read_only_fields = ['owner', 'total_products', 'total_sales', 'rating']

class StoreAnalyticsSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    
    class Meta:
        model = StoreAnalytics
        fields = '__all__'

class StoreFeedbackSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    
    class Meta:
        model = StoreFeedback
        fields = '__all__'
        read_only_fields = ['owner_response', 'response_date']

class StoreNotificationSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    
    class Meta:
        model = StoreNotification
        fields = '__all__'
'''

urls_content = '''"""
Store Management URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'applications', views.StoreApplicationViewSet, basename='store-applications')
router.register(r'stores', views.StoreViewSet, basename='stores')
router.register(r'analytics', views.StoreAnalyticsViewSet, basename='store-analytics')
router.register(r'feedback', views.StoreFeedbackViewSet, basename='store-feedback')
router.register(r'notifications', views.StoreNotificationViewSet, basename='store-notifications')

urlpatterns = [
    path('api/store-management/', include(router.urls)),
]
'''

permissions_content = '''"""
Store Management Permissions
"""
from rest_framework import permissions

class IsStoreOwner(permissions.BasePermission):
    """Permission to only allow store owners to access their own stores"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Check if the object has a store attribute
        if hasattr(obj, 'store'):
            return obj.store.owner == request.user
        # Check if the object is a store
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        return False

class IsStoreOwnerOrReadOnly(permissions.BasePermission):
    """Permission to allow read access to everyone, write access to store owners only"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if the object has a store attribute
        if hasattr(obj, 'store'):
            return obj.store.owner == request.user
        # Check if the object is a store
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        return False
'''

utils_content = '''"""
Store Management Utilities
"""
from django.core.mail import send_mail
from django.conf import settings
from .models import StoreNotification

def send_application_notification(application, status):
    """Send email notification for application status change"""
    subject = f"تحديث حالة طلب المتجر - {application.store_name}"
    
    if status == 'approved':
        message = f"""
        مرحباً {application.applicant.get_full_name()},
        
        نسعد بإبلاغك أنه تم الموافقة على طلب إنشاء متجر "{application.store_name}".
        يمكنك الآن الدخول إلى لوحة التحكم وبدء إضافة منتجاتك.
        
        مع تحيات فريق Best on Click
        """
    elif status == 'rejected':
        message = f"""
        مرحباً {application.applicant.get_full_name()},
        
        نأسف لإبلاغك أنه تم رفض طلب إنشاء متجر "{application.store_name}".
        
        سبب الرفض: {application.review_notes}
        
        يمكنك تقديم طلب جديد بعد معالجة الملاحظات المذكورة.
        
        مع تحيات فريق Best on Click
        """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [application.business_email],
        fail_silently=True,
    )

def create_store_notification(store, title, message, notification_type='system'):
    """Create a notification for a store"""
    return StoreNotification.objects.create(
        store=store,
        title=title,
        message=message,
        notification_type=notification_type
    )

def calculate_store_rating(store):
    """Calculate average rating for a store"""
    feedback = store.feedback.all()
    if feedback.exists():
        total_rating = sum(f.rating for f in feedback)
        return total_rating / feedback.count()
    return 0

def update_store_statistics(store):
    """Update store statistics"""
    # Update total products count
    # This would be connected to your products app
    # store.total_products = store.products.count()
    
    # Update rating
    store.rating = calculate_store_rating(store)
    store.save()
'''

test_models_content = '''"""
Tests for Store Management Models
"""
from django.test import TestCase
from django.contrib.auth.models import User
from store_management.models import StoreApplication, Store

class StoreApplicationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_store_application(self):
        application = StoreApplication.objects.create(
            applicant=self.user,
            store_name='Test Store',
            store_description='A test store',
            business_type='Electronics',
            business_email='store@example.com',
            business_phone='1234567890',
            business_address='Test Address',
            business_license='123456',
            tax_id='TAX123'
        )
        
        self.assertEqual(application.store_name, 'Test Store')
        self.assertEqual(application.status, 'pending')
        self.assertEqual(str(application), 'Test Store - قيد المراجعة')

class StoreModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='storeowner',
            email='owner@example.com',
            password='testpass123'
        )
    
    def test_create_store(self):
        store = Store.objects.create(
            owner=self.user,
            name='My Store',
            description='My awesome store',
            business_type='Clothing',
            email='mystore@example.com',
            phone='9876543210',
            address='Store Address',
            business_license='654321',
            tax_id='TAX456'
        )
        
        self.assertEqual(store.name, 'My Store')
        self.assertTrue(store.is_active)
        self.assertFalse(store.is_verified)
        self.assertEqual(str(store), 'My Store')
'''

test_views_content = '''"""
Tests for Store Management Views
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from store_management.models import StoreApplication, Store

class StoreApplicationViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_application(self):
        data = {
            'store_name': 'Test Store',
            'store_description': 'A test store',
            'business_type': 'Electronics',
            'business_email': 'store@example.com',
            'business_phone': '1234567890',
            'business_address': 'Test Address',
            'business_license': '123456',
            'tax_id': 'TAX123'
        }
        
        response = self.client.post('/api/store-management/applications/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(StoreApplication.objects.count(), 1)

class StoreViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='storeowner',
            email='owner@example.com',
            password='testpass123'
        )
        self.store = Store.objects.create(
            owner=self.user,
            name='My Store',
            description='My awesome store',
            business_type='Clothing',
            email='mystore@example.com',
            phone='9876543210',
            address='Store Address',
            business_license='654321',
            tax_id='TAX456'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_get_my_stores(self):
        response = self.client.get('/api/store-management/stores/my_stores/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['stores']), 1)
'''

test_serializers_content = '''"""
Tests for Store Management Serializers
"""
from django.test import TestCase
from django.contrib.auth.models import User
from store_management.models import StoreApplication, Store
from store_management.serializers import StoreApplicationSerializer, StoreSerializer

class StoreApplicationSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_serializer_validation(self):
        data = {
            'store_name': 'Test Store',
            'store_description': 'A test store',
            'business_type': 'Electronics',
            'business_email': 'store@example.com',
            'business_phone': '1234567890',
            'business_address': 'Test Address',
            'business_license': '123456',
            'tax_id': 'TAX123'
        }
        
        serializer = StoreApplicationSerializer(data=data)
        self.assertTrue(serializer.is_valid())

class StoreSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='storeowner',
            email='owner@example.com',
            password='testpass123'
        )
    
    def test_store_serializer(self):
        store = Store.objects.create(
            owner=self.user,
            name='My Store',
            description='My awesome store',
            business_type='Clothing',
            email='mystore@example.com',
            phone='9876543210',
            address='Store Address',
            business_license='654321',
            tax_id='TAX456'
        )
        
        serializer = StoreSerializer(store)
        self.assertEqual(serializer.data['name'], 'My Store')
        self.assertIn('owner_name', serializer.data)
'''

sample_stores_command = '''"""
Management command to create sample stores
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from store_management.models import Store, StoreApplication, StoreFeedback
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Create sample stores for testing'
    
    def handle(self, *args, **options):
        self.stdout.write('Creating sample stores...')
        
        # Create sample users
        users = []
        for i in range(5):
            user, created = User.objects.get_or_create(
                username=f'storeowner{i+1}',
                defaults={
                    'email': f'owner{i+1}@example.com',
                    'first_name': f'Store Owner {i+1}',
                    'password': 'pbkdf2_sha256$260000$test'  # 'testpass123'
                }
            )
            users.append(user)
        
        # Create sample stores
        store_data = [
            {
                'name': 'متجر الإلكترونيات الذكية',
                'description': 'متجر متخصص في بيع الأجهزة الإلكترونية والذكية',
                'business_type': 'Electronics'
            },
            {
                'name': 'بوتيك الأزياء العصرية',
                'description': 'أحدث صيحات الموضة والأزياء النسائية',
                'business_type': 'Fashion'
            },
            {
                'name': 'متجر الكتب والقرطاسية',
                'description': 'كتب ومستلزمات مكتبية وقرطاسية',
                'business_type': 'Books'
            },
            {
                'name': 'متجر الرياضة واللياقة',
                'description': 'معدات رياضية ومكملات غذائية',
                'business_type': 'Sports'
            },
            {
                'name': 'متجر المنزل والديكور',
                'description': 'أثاث ومستلزمات منزلية وديكورات',
                'business_type': 'Home'
            }
        ]
        
        for i, data in enumerate(store_data):
            store, created = Store.objects.get_or_create(
                name=data['name'],
                defaults={
                    'owner': users[i],
                    'description': data['description'],
                    'business_type': data['business_type'],
                    'email': f'store{i+1}@example.com',
                    'phone': f'05{random.randint(10000000, 99999999)}',
                    'address': f'الرياض، المملكة العربية السعودية - عنوان {i+1}',
                    'business_license': f'CR{random.randint(1000000, 9999999)}',
                    'tax_id': f'TAX{random.randint(100000, 999999)}',
                    'is_verified': True,
                    'rating': round(random.uniform(3.5, 5.0), 1)
                }
            )
            
            if created:
                self.stdout.write(f'Created store: {store.name}')
                
                # Create sample feedback
                for j in range(random.randint(3, 8)):
                    StoreFeedback.objects.create(
                        store=store,
                        customer_name=f'عميل {j+1}',
                        customer_email=f'customer{j+1}@example.com',
                        rating=random.randint(3, 5),
                        comment=f'تجربة رائعة مع متجر {store.name}',
                        product_name=f'منتج تجريبي {j+1}',
                        is_verified=random.choice([True, False])
                    )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created sample stores!')
        )
'''

sample_stores_fixture = '''[
  {
    "model": "store_management.store",
    "pk": 1,
    "fields": {
      "owner": 1,
      "name": "متجر الإلكترونيات الذكية",
      "description": "متجر متخصص في بيع الأجهزة الإلكترونية والذكية",
      "business_type": "Electronics",
      "email": "electronics@example.com",
      "phone": "0501234567",
      "address": "الرياض، المملكة العربية السعودية",
      "business_license": "CR1234567",
      "tax_id": "TAX123456",
      "is_active": true,
      "is_verified": true,
      "total_products": 0,
      "total_sales": "0.00",
      "rating": 4.5
    }
  }
]'''

sample_applications_fixture = '''[
  {
    "model": "store_management.storeapplication",
    "pk": 1,
    "fields": {
      "applicant": 1,
      "status": "pending",
      "store_name": "متجر تجريبي",
      "store_description": "وصف المتجر التجريبي",
      "business_type": "General",
      "business_email": "test@example.com",
      "business_phone": "0501234567",
      "business_address": "عنوان تجريبي",
      "business_license": "CR123456",
      "tax_id": "TAX123456"
    }
  }
]'''

if __name__ == '__main__':
    create_store_app()