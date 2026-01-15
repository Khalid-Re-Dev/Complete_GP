"""
Store Management Views
API views for store management, analytics, and owner dashboard.
"""

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, F, Count, Avg
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)
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
from .serializers import (
    StoreApplicationSerializer,
    StoreApplicationCreateSerializer,
    StoreApplicationReviewSerializer,
    StoreAnalyticsSerializer,
    ProductAnalyticsSerializer,
    StoreViewLogSerializer,
    ProductViewLogSerializer,
    StoreNotificationSerializer,
    StoreFeedbackSerializer,
    StoreFeedbackCreateSerializer,
    StoreFeedbackResponseSerializer,
    StoreOwnerDashboardSerializer
)
from .permissions import IsStoreOwner, IsAdminUser, IsStoreOwnerOrReadOnly
from .services import StoreAnalyticsService, NotificationService
import logging

logger = logging.getLogger(__name__)


# Store Application Views
class StoreApplicationCreateView(generics.CreateAPIView):
    """
    Create a new store application.
    """
    serializer_class = StoreApplicationCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        """Create application with current user."""
        # Check if user already has a pending or approved application
        existing_application = StoreApplication.objects.filter(
            applicant=self.request.user,
            status__in=['pending', 'approved', 'under_review']
        ).first()
        
        if existing_application:
            from rest_framework import serializers
            raise serializers.ValidationError(
                f"You already have a {existing_application.get_status_display().lower()} application."
            )
        
        serializer.save(applicant=self.request.user)


class StoreApplicationListView(generics.ListAPIView):
    """
    List store applications (admin only).
    """
    serializer_class = StoreApplicationSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['store_name', 'applicant__username', 'applicant__email']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return StoreApplication.objects.select_related('applicant', 'reviewed_by')


class StoreApplicationDetailView(generics.RetrieveAPIView):
    """
    Get store application details (admin only).
    """
    serializer_class = StoreApplicationSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return StoreApplication.objects.select_related('applicant', 'reviewed_by')


class StoreApplicationReviewView(generics.UpdateAPIView):
    """
    Review store application (admin only).
    """
    serializer_class = StoreApplicationReviewSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return StoreApplication.objects.select_related('applicant')


class MyStoreApplicationView(generics.RetrieveAPIView):
    """
    Get current user's store application.
    """
    serializer_class = StoreApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return get_object_or_404(
            StoreApplication,
            applicant=self.request.user
        )


# Store Dashboard Views
class StoreOwnerDashboardView(generics.RetrieveAPIView):
    """
    Get comprehensive dashboard data for store owners.
    """
    serializer_class = StoreOwnerDashboardSerializer
    permission_classes = [IsStoreOwner]
    
    def get_object(self):
        return get_object_or_404(
            Store,
            owner=self.request.user,
            is_active=True
        )


class StoreAnalyticsView(generics.RetrieveAPIView):
    """
    Get detailed store analytics.
    """
    serializer_class = StoreAnalyticsSerializer
    permission_classes = [IsStoreOwner]
    
    def get_object(self):
        store = get_object_or_404(
            Store,
            owner=self.request.user,
            is_active=True
        )
        analytics, created = StoreAnalytics.objects.get_or_create(store=store)
        return analytics


class ProductAnalyticsListView(generics.ListAPIView):
    """
    List analytics for store owner's products.
    """
    serializer_class = ProductAnalyticsSerializer
    permission_classes = [IsStoreOwner]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['total_views', 'conversion_rate', 'engagement_rate']
    ordering = ['-total_views']
    
    def get_queryset(self):
        store = get_object_or_404(
            Store,
            owner=self.request.user,
            is_active=True
        )
        
        # Get or create analytics for all products
        products = store.products.filter(is_active=True)
        for product in products:
            ProductAnalytics.objects.get_or_create(product=product)
        
        return ProductAnalytics.objects.filter(
            product__store=store,
            product__is_active=True
        ).select_related('product')


# Notification Views
class StoreNotificationListView(generics.ListAPIView):
    """
    List store notifications.
    """
    serializer_class = StoreNotificationSerializer
    permission_classes = [IsStoreOwner]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['notification_type', 'is_read', 'is_important']
    ordering = ['-created_at']
    
    def get_queryset(self):
        store = get_object_or_404(
            Store,
            owner=self.request.user,
            is_active=True
        )
        return store.notifications.all()


@api_view(['POST'])
@permission_classes([IsStoreOwner])
def mark_notification_read(request, notification_id):
    """
    Mark notification as read.
    """
    try:
        store = get_object_or_404(
            Store,
            owner=request.user,
            is_active=True
        )
        
        notification = get_object_or_404(
            StoreNotification,
            id=notification_id,
            store=store
        )
        
        notification.mark_as_read()
        
        return Response({
            'message': 'Notification marked as read',
            'notification_id': notification_id
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        return Response(
            {'error': 'Failed to mark notification as read'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsStoreOwner])
def mark_all_notifications_read(request):
    """
    Mark all notifications as read for the store.
    """
    try:
        store = get_object_or_404(
            Store,
            owner=request.user,
            is_active=True
        )
        
        unread_notifications = store.notifications.filter(is_read=False)
        count = unread_notifications.count()
        
        for notification in unread_notifications:
            notification.mark_as_read()
        
        return Response({
            'message': f'Marked {count} notifications as read',
            'count': count
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {str(e)}")
        return Response(
            {'error': 'Failed to mark notifications as read'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Feedback Views
class StoreFeedbackListView(generics.ListAPIView):
    """
    List store feedback.
    """
    serializer_class = StoreFeedbackSerializer
    permission_classes = [IsStoreOwner]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['rating', 'is_verified', 'is_featured']
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        store = get_object_or_404(
            Store,
            owner=self.request.user,
            is_active=True
        )
        return store.feedback.select_related('customer')


class StoreFeedbackCreateView(generics.CreateAPIView):
    """
    Create feedback for a store (customers only).
    """
    serializer_class = StoreFeedbackCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        store_slug = self.kwargs.get('store_slug')
        context['store'] = get_object_or_404(
            Store,
            slug=store_slug,
            is_active=True,
            is_verified=True
        )
        return context
    
    def perform_create(self, serializer):
        """Create feedback and update store analytics."""
        feedback = serializer.save()
        
        # Update store analytics
        analytics_service = StoreAnalyticsService()
        analytics_service.update_store_feedback_metrics(feedback.store)
        
        # Notify store owner
        notification_service = NotificationService()
        notification_service.create_new_review_notification(feedback)


class StoreFeedbackResponseView(generics.UpdateAPIView):
    """
    Respond to store feedback (store owners only).
    """
    serializer_class = StoreFeedbackResponseSerializer
    permission_classes = [IsStoreOwner]
    
    def get_queryset(self):
        store = get_object_or_404(
            Store,
            owner=self.request.user,
            is_active=True
        )
        return store.feedback.all()


# Analytics Tracking Views
@api_view(['POST'])
@permission_classes([AllowAny])
def track_store_view(request, store_slug):
    """
    Track store page view.
    """
    try:
        store = get_object_or_404(
            Store,
            slug=store_slug,
            is_active=True,
            is_verified=True
        )
        
        # Get visitor information
        user = request.user if request.user.is_authenticated else None
        session_id = request.session.session_key
        ip_address = request.META.get('REMOTE_ADDR')
        referrer = request.META.get('HTTP_REFERER', '')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Create view log
        StoreViewLog.objects.create(
            store=store,
            user=user,
            session_id=session_id,
            ip_address=ip_address,
            referrer=referrer,
            user_agent=user_agent
        )
        
        # Update analytics
        analytics_service = StoreAnalyticsService()
        analytics_service.update_store_view_metrics(store, user, session_id)
        
        return Response({
            'message': 'Store view tracked successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error tracking store view: {str(e)}")
        return Response(
            {'error': 'Failed to track store view'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def track_product_view(request, product_id):
    """
    Track product page view.
    """
    try:
        product = get_object_or_404(
            Product,
            id=product_id,
            is_active=True
        )
        
        # Get visitor information
        user = request.user if request.user.is_authenticated else None
        session_id = request.session.session_key
        ip_address = request.META.get('REMOTE_ADDR')
        referrer = request.META.get('HTTP_REFERER', '')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        view_duration = request.data.get('view_duration', 0)
        
        # Create view log
        ProductViewLog.objects.create(
            product=product,
            user=user,
            session_id=session_id,
            ip_address=ip_address,
            referrer=referrer,
            user_agent=user_agent,
            view_duration=view_duration
        )
        
        # Update analytics
        analytics_service = StoreAnalyticsService()
        analytics_service.update_product_view_metrics(product, user, session_id)
        
        return Response({
            'message': 'Product view tracked successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error tracking product view: {str(e)}")
        return Response(
            {'error': 'Failed to track product view'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_store(request):
    """
    Get current user's store information.
    Returns store data if user has a store, otherwise returns 404.
    """
    try:
        if request.user.role != 'store_owner':
            return Response(
                {'error': 'Only store owners can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Try to find user's store
        try:
            store = Store.objects.get(owner=request.user, is_active=True)
            from products.serializers import StoreSerializer
            serializer = StoreSerializer(store)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Store.DoesNotExist:
            return Response(
                {'error': 'No store found for this user'},
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        logger.error(f"Error getting user store: {str(e)}")
        return Response(
            {'error': 'Failed to get store information'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Analytics Reports
@api_view(['GET'])
@permission_classes([IsStoreOwner])
def store_analytics_report(request):
    """
    Get comprehensive analytics report for store owner.
    """
    try:
        store = get_object_or_404(
            Store,
            owner=request.user,
            is_active=True
        )
        
        # Get date range from query params
        days = int(request.GET.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        analytics_service = StoreAnalyticsService()
        report = analytics_service.generate_store_report(store, start_date, end_date)
        
        return Response(report, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error generating analytics report: {str(e)}")
        return Response(
            {'error': 'Failed to generate analytics report'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsStoreOwner])
def product_performance_report(request):
    """
    Get product performance report for store owner.
    """
    try:
        store = get_object_or_404(
            Store,
            owner=request.user,
            is_active=True
        )
        
        # Get date range from query params
        days = int(request.GET.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        analytics_service = StoreAnalyticsService()
        report = analytics_service.generate_product_performance_report(store, start_date, end_date)
        
        return Response(report, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error generating product performance report: {str(e)}")
        return Response(
            {'error': 'Failed to generate product performance report'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )