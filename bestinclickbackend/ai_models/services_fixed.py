"""
Fixed version of RecommendationService that ensures only valid products are returned
"""

def get_general_recommendations_fixed(self, limit: int = 10, category_id: Optional[int] = None, 
                              exclude_products: List[int] = None) -> List[Dict]:
    """
    Get general recommendations - FIXED VERSION that only returns existing products.
    """
    try:
        exclude_products = exclude_products or []
        
        # Get ALL active products first
        all_products = Product.objects.filter(is_active=True)
        
        # Apply category filter if specified
        if category_id:
            all_products = all_products.filter(category_id=category_id)
        
        # Exclude specified products
        if exclude_products:
            all_products = all_products.exclude(id__in=exclude_products)
        
        # Get products with proper validation
        valid_products = []
        for product in all_products.order_by('-id')[:limit * 3]:  # Get more than needed
            try:
                # Check if product has all required attributes
                if (hasattr(product, 'name') and product.name and 
                    hasattr(product, 'get_final_price') and 
                    product.get_final_price() and 
                    product.get_final_price() > 0):
                    
                    valid_products.append(product)
                    
                    # Stop when we have enough
                    if len(valid_products) >= limit:
                        break
                        
            except Exception as e:
                logger.warning(f"Skipping invalid product {product.id}: {str(e)}")
                continue
        
        # Build recommendations from valid products
        recommendations = []
        for product in valid_products:
            try:
                final_price = product.get_final_price()
                recommendations.append({
                    'product_id': product.id,
                    'name': product.name,
                    'price': float(final_price),
                    'rating': float(getattr(product, 'average_rating', 0) or 0),
                    'score': 0.8,
                    'algorithm': 'safe_selection',
                    'reason': 'Verified available product'
                })
            except Exception as e:
                logger.warning(f"Error building recommendation for product {product.id}: {str(e)}")
                continue
        
        logger.info(f"Generated {len(recommendations)} safe recommendations")
        return recommendations
        
    except Exception as e:
        logger.error(f"Error in get_general_recommendations_fixed: {str(e)}")
        
        # Emergency fallback - return empty list rather than broken products
        return []