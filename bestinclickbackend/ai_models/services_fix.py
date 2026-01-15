"""
Fix for RecommendationService to ensure only existing products are returned
"""

# Add this method to RecommendationService class

def get_general_recommendations_fixed(self, limit: int = 10, category_id: Optional[int] = None, 
                              exclude_products: List[int] = None) -> List[Dict]:
    """
    Get general recommendations based on popularity and trends.
    Fixed version that ensures only existing products are returned.
    """
    try:
        exclude_products = exclude_products or []
        
        # Base queryset - ensure products exist and are active
        queryset = Product.objects.filter(is_active=True).exclude(id__in=exclude_products)
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Get trending products (high view count, recent activity)
        # Add extra filtering to ensure data integrity
        trending_products = queryset.annotate(
            popularity_score=F('view_count') + F('total_reviews') * 2 + F('average_rating') * 10
        ).filter(
            # Ensure basic data exists
            name__isnull=False,
            price__gt=0
        ).order_by('-popularity_score')[:limit * 2]  # Get more than needed in case some fail
        
        recommendations = []
        for product in trending_products:
            try:
                # Double-check product exists and has required data
                if product.is_active and product.name and hasattr(product, 'get_final_price'):
                    final_price = product.get_final_price()
                    if final_price and final_price > 0:
                        recommendations.append({
                            'product_id': product.id,
                            'name': product.name,
                            'price': float(final_price),
                            'rating': product.average_rating or 0.0,
                            'score': 0.8,  # General recommendation confidence
                            'algorithm': 'trending_popularity',
                            'reason': 'Popular and highly rated'
                        })
                        
                        # Stop when we have enough recommendations
                        if len(recommendations) >= limit:
                            break
            except Exception as e:
                logger.warning(f"Skipping product {product.id} due to error: {str(e)}")
                continue
        
        # If we don't have enough recommendations, get some basic ones
        if len(recommendations) < limit:
            basic_products = Product.objects.filter(
                is_active=True,
                name__isnull=False,
                price__gt=0
            ).exclude(
                id__in=exclude_products + [r['product_id'] for r in recommendations]
            ).order_by('-id')[:limit - len(recommendations)]
            
            for product in basic_products:
                try:
                    final_price = product.get_final_price()
                    if final_price and final_price > 0:
                        recommendations.append({
                            'product_id': product.id,
                            'name': product.name,
                            'price': float(final_price),
                            'rating': product.average_rating or 0.0,
                            'score': 0.5,  # Lower confidence for basic recommendations
                            'algorithm': 'basic_fallback',
                            'reason': 'Available product'
                        })
                except Exception as e:
                    logger.warning(f"Skipping fallback product {product.id} due to error: {str(e)}")
                    continue
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error generating general recommendations: {str(e)}")
        return []