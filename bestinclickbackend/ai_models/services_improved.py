"""
Improved AI/ML services for smart search, recommendations, and analysis.
This version includes better error handling and data validation.
"""

import re
import json
import logging
from typing import List, Dict, Any, Optional
from django.db.models import Q, Count, Avg, F
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from products.models import Product, Category, Store
from .models import UserBehaviorLog, UserSessionInteraction
import random

User = get_user_model()
logger = logging.getLogger(__name__)


class RecommendationService:
    """
    Improved AI-powered recommendation engine with better error handling.
    """
    
    def get_general_recommendations(self, limit: int = 10, category_id: Optional[int] = None, 
                                  exclude_products: List[int] = None) -> List[Dict]:
        """
        Get general recommendations based on popularity and trends.
        Improved version with better error handling and data validation.
        """
        try:
            exclude_products = exclude_products or []
            
            # Base queryset - ensure products exist and are active
            queryset = Product.objects.filter(is_active=True).exclude(id__in=exclude_products)
            
            if category_id:
                queryset = queryset.filter(category_id=category_id)
            
            # Get trending products with better filtering
            trending_products = queryset.annotate(
                popularity_score=F('view_count') + F('total_reviews') * 2 + F('average_rating') * 10
            ).filter(
                # Ensure basic data exists
                name__isnull=False,
                price__gt=0
            ).order_by('-popularity_score')[:limit * 2]  # Get more than needed
            
            recommendations = []
            for product in trending_products:
                try:
                    # Validate product data
                    if not self._validate_product(product):
                        continue
                        
                    final_price = product.get_final_price()
                    if not final_price or final_price <= 0:
                        continue
                        
                    recommendations.append({
                        'product_id': product.id,
                        'name': product.name,
                        'price': float(final_price),
                        'rating': float(product.average_rating or 0.0),
                        'score': 0.8,
                        'algorithm': 'trending_popularity',
                        'reason': 'Popular and highly rated'
                    })
                    
                    if len(recommendations) >= limit:
                        break
                        
                except Exception as e:
                    logger.warning(f"Skipping product {product.id}: {str(e)}")
                    continue
            
            # Fallback if not enough recommendations
            if len(recommendations) < limit:
                recommendations.extend(self._get_fallback_recommendations(
                    limit - len(recommendations), 
                    exclude_products + [r['product_id'] for r in recommendations]
                ))
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating general recommendations: {str(e)}")
            return self._get_emergency_fallback(limit)
    
    def _validate_product(self, product) -> bool:
        """Validate that product has all required data."""
        try:
            return (
                product.is_active and 
                product.name and 
                hasattr(product, 'get_final_price') and
                product.get_final_price() and
                product.get_final_price() > 0
            )
        except:
            return False
    
    def _get_fallback_recommendations(self, limit: int, exclude_products: List[int]) -> List[Dict]:
        """Get fallback recommendations when main algorithm fails."""
        try:
            fallback_products = Product.objects.filter(
                is_active=True,
                name__isnull=False,
                price__gt=0
            ).exclude(id__in=exclude_products).order_by('-id')[:limit]
            
            recommendations = []
            for product in fallback_products:
                try:
                    if self._validate_product(product):
                        final_price = product.get_final_price()
                        recommendations.append({
                            'product_id': product.id,
                            'name': product.name,
                            'price': float(final_price),
                            'rating': float(product.average_rating or 0.0),
                            'score': 0.5,
                            'algorithm': 'basic_fallback',
                            'reason': 'Available product'
                        })
                except Exception as e:
                    logger.warning(f"Skipping fallback product {product.id}: {str(e)}")
                    continue
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error in fallback recommendations: {str(e)}")
            return []
    
    def _get_emergency_fallback(self, limit: int) -> List[Dict]:
        """Emergency fallback when everything else fails."""
        try:
            # Get any active products
            products = Product.objects.filter(is_active=True)[:limit]
            recommendations = []
            
            for product in products:
                try:
                    if product.name:
                        recommendations.append({
                            'product_id': product.id,
                            'name': product.name,
                            'price': float(getattr(product, 'price', 0) or 0),
                            'rating': 0.0,
                            'score': 0.1,
                            'algorithm': 'emergency_fallback',
                            'reason': 'System fallback'
                        })
                except:
                    continue
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Emergency fallback failed: {str(e)}")
            return []

    def get_personalized_recommendations(self, user: User, limit: int = 10, 
                                       category_id: Optional[int] = None,
                                       exclude_products: List[int] = None) -> List[Dict]:
        """
        Get personalized recommendations with improved error handling.
        """
        try:
            # For now, fall back to general recommendations with user context
            # This can be enhanced later with actual personalization logic
            return self.get_general_recommendations(limit, category_id, exclude_products)
            
        except Exception as e:
            logger.error(f"Error generating personalized recommendations: {str(e)}")
            return self.get_general_recommendations(limit, category_id, exclude_products)