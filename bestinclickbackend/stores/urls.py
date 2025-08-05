"""
URL configuration for stores app.
"""

from django.urls import path
from . import views

app_name = 'stores'

urlpatterns = [
    # Store Application URLs
    path('applications/', views.StoreApplicationListView.as_view(), name='application_list'),
    path('applications/create/', views.StoreApplicationCreateView.as_view(), name='application_create'),
    path('applications/<int:pk>/', views.StoreApplicationDetailView.as_view(), name='application_detail'),
    path('applications/<int:pk>/review/', views.StoreApplicationReviewView.as_view(), name='application_review'),
    path('applications/my/', views.MyStoreApplicationView.as_view(), name='my_application'),
    
    # Store Owner Dashboard URLs
    path('my-store/', views.my_store, name='my_store'),
    path('dashboard/', views.StoreOwnerDashboardView.as_view(), name='owner_dashboard'),
    path('analytics/', views.StoreAnalyticsView.as_view(), name='store_analytics'),
    path('analytics/products/', views.ProductAnalyticsListView.as_view(), name='product_analytics'),
    path('analytics/report/', views.store_analytics_report, name='analytics_report'),
    path('analytics/products/report/', views.product_performance_report, name='product_performance_report'),
    
    # Notification URLs
    path('notifications/', views.StoreNotificationListView.as_view(), name='notification_list'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('notifications/read-all/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    
    # Feedback URLs
    path('feedback/', views.StoreFeedbackListView.as_view(), name='feedback_list'),
    path('feedback/<int:pk>/respond/', views.StoreFeedbackResponseView.as_view(), name='feedback_respond'),
    path('<slug:store_slug>/feedback/create/', views.StoreFeedbackCreateView.as_view(), name='feedback_create'),
    
    # Analytics Tracking URLs
    path('track/store/<slug:store_slug>/view/', views.track_store_view, name='track_store_view'),
    path('track/product/<int:product_id>/view/', views.track_product_view, name='track_product_view'),
]