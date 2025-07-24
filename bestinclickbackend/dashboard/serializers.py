"""
Serializers for dashboard app.
"""

from rest_framework import serializers
from products.models import Product
from .models import StoreAnalytics, ProductPerformance


class StoreAnalyticsSerializer(serializers.ModelSerializer):
    """
    Serializer for store analytics data.
    """
    
    class Meta:
        model = StoreAnalytics
        fields = [
            'date', 'total_views', 'unique_visitors', 'product_views',
            'total_clicks', 'add_to_cart_count', 'conversion_rate',
            'total_orders', 'total_revenue', 'average_order_value'
        ]


class ProductPerformanceSerializer(serializers.ModelSerializer):
    """
    Serializer for product performance data.
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = ProductPerformance
        fields = [
            'product', 'product_name', 'date', 'views', 'clicks',
            'add_to_cart', 'purchases', 'average_time_on_page',
            'bounce_rate'
        ]


class StoreProductSerializer(serializers.ModelSerializer):
    """
    Serializer for products in store dashboard.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    final_price = serializers.DecimalField(
        source='get_final_price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'price', 'final_price', 'discount_percentage',
            'in_stock', 'stock_quantity', 'average_rating', 'total_reviews',
            'view_count', 'is_active', 'is_featured', 'category_name',
            'brand_name', 'created_at', 'updated_at'
        ]
