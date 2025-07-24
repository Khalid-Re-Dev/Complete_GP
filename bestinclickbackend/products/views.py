"""
API views for products app.
"""

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, F
from ai_models.services import SearchService, RecommendationService
from .models import Category, Brand, Store, Product, ProductLike
from .serializers import (
    CategorySerializer,
    BrandSerializer,
    StoreSerializer,
    ProductSerializer,
    ProductCreateUpdateSerializer,
    ProductLikeSerializer
)
from .filters import ProductFilter
from .permissions import IsStoreOwnerOrReadOnly
import logging

logger = logging.getLogger(__name__)


class CategoryListView(generics.ListAPIView):
    """
    List all active categories with hierarchical structure.
    """
    queryset = Category.objects.filter(is_active=True, parent=None).order_by('sort_order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class BrandListView(generics.ListAPIView):
    """
    List all active brands.
    """
    queryset = Brand.objects.filter(is_active=True).order_by('name')
    serializer_class = BrandSerializer
    permission_classes = [AllowAny]


class StoreListView(generics.ListAPIView):
    """
    List all active and verified stores.
    """
    queryset = Store.objects.filter(is_active=True, is_verified=True).order_by('-average_rating', 'name')
    serializer_class = StoreSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'average_rating', 'created_at']


class StoreDetailView(generics.RetrieveAPIView):
    """
    Get store details.
    """
    queryset = Store.objects.filter(is_active=True, is_verified=True)
    serializer_class = StoreSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class ProductListView(generics.ListAPIView):
    """
    List products with filtering, searching, and sorting.
    """
    queryset = Product.objects.filter(is_active=True).select_related(
        'category', 'brand', 'store'
    ).prefetch_related('images')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['name', 'price', 'average_rating', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Smart search integration
        search_query = self.request.query_params.get('search')
        if search_query:
            search_service = SearchService()
            enhanced_query = search_service.enhance_search_query(search_query)
            
            # Apply enhanced search
            queryset = queryset.filter(
                Q(name__icontains=enhanced_query) |
                Q(description__icontains=enhanced_query) |
                Q(attributes__icontains=enhanced_query)
            )
        
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """
    Get product details and increment view count.
    """
    queryset = Product.objects.filter(is_active=True).select_related(
        'category', 'brand', 'store'
    ).prefetch_related('images')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Increment view count
        Product.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        
        # Log user behavior for AI
        if hasattr(request, 'user') and request.user.is_authenticated:
            from ai_models.models import UserBehaviorLog
            UserBehaviorLog.objects.create(
                user=request.user,
                product=instance,
                action_type='view',
                metadata={'source': 'product_detail'}
            )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def similar_products(request, slug):
    """
    Get similar products using AI recommendations.
    """
    try:
        product = get_object_or_404(Product, slug=slug, is_active=True)
        
        recommendation_service = RecommendationService()
        similar_products = recommendation_service.get_similar_products(
            product=product,
            limit=request.GET.get('limit', 10)
        )
        
        return Response({
            'product': ProductSerializer(product, context={'request': request}).data,
            'similar_products': similar_products
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting similar products: {str(e)}")
        return Response(
            {'error': 'Failed to get similar products'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_product_like(request, slug):
    """
    Like or unlike a product.
    """
    try:
        product = get_object_or_404(Product, slug=slug, is_active=True)
        
        like, created = ProductLike.objects.get_or_create(
            user=request.user,
            product=product
        )
        
        if not created:
            like.delete()
            liked = False
        else:
            liked = True
        
        # Log user behavior for AI
        from ai_models.models import UserBehaviorLog
        UserBehaviorLog.objects.create(
            user=request.user,
            product=product,
            action_type='like' if liked else 'dislike',
            metadata={'source': 'product_detail'}
        )
        
        return Response({
            'liked': liked,
            'message': 'Product liked' if liked else 'Product unliked'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error toggling product like: {str(e)}")
        return Response(
            {'error': 'Failed to toggle like'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def best_products(request):
    """
    Get AI-determined best products with recommendations.
    """
    try:
        category_id = request.GET.get('category_id')
        limit = int(request.GET.get('limit', 10))
        
        recommendation_service = RecommendationService()
        best_products = recommendation_service.get_best_products(
            category_id=category_id,
            limit=limit
        )
        
        return Response({
            'best_products': best_products,
            'algorithm_info': {
                'description': 'AI-determined best products based on ratings, reviews, and user behavior'
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting best products: {str(e)}")
        return Response(
            {'error': 'Failed to get best products'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class ProductCreateView(generics.CreateAPIView):
    """
    Create a new product (store owners only).
    """
    serializer_class = ProductCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Ensure user is store owner and assign their store
        if not self.request.user.is_store_owner:
            raise PermissionError("Only store owners can create products")
        
        store = get_object_or_404(Store, owner=self.request.user, is_active=True)
        serializer.save(store=store)


class ProductUpdateView(generics.UpdateAPIView):
    """
    Update product (store owners only, own products).
    """
    serializer_class = ProductCreateUpdateSerializer
    permission_classes = [IsAuthenticated, IsStoreOwnerOrReadOnly]
    
    def get_queryset(self):
        return Product.objects.filter(store__owner=self.request.user)
