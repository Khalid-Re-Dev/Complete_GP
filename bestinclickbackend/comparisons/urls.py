"""
URL configuration for comparisons app.
"""

from django.urls import path
from . import views

app_name = 'comparisons'

urlpatterns = [
    # Product comparison
    path('products/', views.compare_products, name='compare_products'),
    
    # Store comparison
    path('stores/', views.compare_stores, name='compare_stores'),
    
    # Comparison history
    path('history/', views.get_comparison_history, name='comparison_history'),
]
