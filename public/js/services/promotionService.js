// Promotion Service - handles all promotion-related API calls
import { apiCall } from './api.js';

class PromotionService {
  constructor() {
    this.baseEndpoint = '/promotions';
  }

  /**
   * Get all active promotions
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Promotions data
   */
  async getPromotions(params = {}) {
    try {
      console.log('🎯 Fetching promotions from API...');
      
      // Build query string
      const queryParams = new URLSearchParams();
      
      // Add common filters
      if (params.is_active !== undefined) {
        queryParams.append('is_active', params.is_active);
      }
      
      if (params.is_valid !== undefined) {
        queryParams.append('is_valid', params.is_valid);
      }
      
      if (params.store) {
        queryParams.append('store', params.store);
      }
      
      if (params.discount_type) {
        queryParams.append('discount_type', params.discount_type);
      }
      
      if (params.ordering) {
        queryParams.append('ordering', params.ordering);
      }
      
      const endpoint = queryParams.toString() 
        ? `${this.baseEndpoint}/?${queryParams.toString()}`
        : `${this.baseEndpoint}/`;
      
      console.log('📡 Promotions API call:', endpoint);
      
      const response = await apiCall(endpoint, 'GET');
      
      console.log('✅ Promotions fetched successfully:', response);
      
      // Handle different response formats
      if (response && typeof response === 'object') {
        // If response has results array (paginated)
        if (response.results && Array.isArray(response.results)) {
          return response;
        }
        // If response is direct array
        if (Array.isArray(response)) {
          return { results: response, count: response.length };
        }
        // If response is single object
        return { results: [response], count: 1 };
      }
      
      return { results: [], count: 0 };
      
    } catch (error) {
      console.error('❌ Error fetching promotions:', error);
      throw error;
    }
  }

  /**
   * Get active promotions only
   * @returns {Promise<Array>} Active promotions
   */
  async getActivePromotions() {
    try {
      const response = await this.getPromotions({ 
        is_active: true, 
        is_valid: true,
        ordering: '-value' // Order by highest value first
      });
      
      return response.results || response || [];
    } catch (error) {
      console.error('❌ Error fetching active promotions:', error);
      return [];
    }
  }

  /**
   * Get featured promotions for homepage
   * @param {number} limit - Number of promotions to return
   * @returns {Promise<Array>} Featured promotions
   */
  async getFeaturedPromotions(limit = 3) {
    try {
      console.log('🌟 Fetching featured promotions...');
      
      const promotions = await this.getActivePromotions();
      
      // Filter and sort promotions for homepage display
      const featured = promotions
        .filter(promo => promo.is_active && promo.is_valid)
        .sort((a, b) => {
          // Prioritize by discount value and type
          const aValue = parseFloat(a.value) || 0;
          const bValue = parseFloat(b.value) || 0;
          
          // Percentage discounts get priority
          if (a.discount_type === 'percentage' && b.discount_type !== 'percentage') {
            return -1;
          }
          if (b.discount_type === 'percentage' && a.discount_type !== 'percentage') {
            return 1;
          }
          
          return bValue - aValue;
        })
        .slice(0, limit);
      
      console.log(`✅ Featured promotions (${featured.length}):`, featured);
      return featured;
      
    } catch (error) {
      console.error('❌ Error fetching featured promotions:', error);
      return [];
    }
  }

  /**
   * Get promotion by ID
   * @param {number} id - Promotion ID
   * @returns {Promise<Object>} Promotion data
   */
  async getPromotionById(id) {
    try {
      console.log(`🎯 Fetching promotion ${id}...`);
      
      const response = await apiCall(`${this.baseEndpoint}/${id}/`, 'GET');
      
      console.log('✅ Promotion fetched:', response);
      return response;
      
    } catch (error) {
      console.error(`❌ Error fetching promotion ${id}:`, error);
      throw error;
    }
  }

  /**
   * Apply promotion to order
   * @param {string} promoCode - Promotion code
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Applied promotion result
   */
  async applyPromotion(promoCode, orderData) {
    try {
      console.log(`🎯 Applying promotion code: ${promoCode}`);
      
      const response = await apiCall(`${this.baseEndpoint}/apply/`, 'POST', {
        code: promoCode,
        order_data: orderData
      });
      
      console.log('✅ Promotion applied:', response);
      return response;
      
    } catch (error) {
      console.error(`❌ Error applying promotion ${promoCode}:`, error);
      throw error;
    }
  }

  /**
   * Format promotion for display
   * @param {Object} promotion - Raw promotion data
   * @returns {Object} Formatted promotion
   */
  formatPromotion(promotion) {
    if (!promotion) return null;

    const value = parseFloat(promotion.value) || 0;
    let displayValue = '';
    let displayText = '';

    switch (promotion.discount_type) {
      case 'percentage':
        displayValue = `${Math.round(value)}%`;
        displayText = `${Math.round(value)}% OFF`;
        break;
      case 'fixed_amount':
        displayValue = `$${value.toFixed(2)}`;
        displayText = `$${value.toFixed(2)} OFF`;
        break;
      case 'buy_one_get_one':
        displayValue = 'BOGO';
        displayText = 'Buy One Get One Free';
        break;
      default:
        displayValue = `${value}`;
        displayText = promotion.name;
    }

    return {
      ...promotion,
      displayValue,
      displayText,
      formattedValue: value,
      isPercentage: promotion.discount_type === 'percentage',
      isFixedAmount: promotion.discount_type === 'fixed_amount',
      isBogo: promotion.discount_type === 'buy_one_get_one',
      minimumAmount: parseFloat(promotion.minimum_order_amount) || 0,
      remainingUses: (promotion.max_uses || 0) - (promotion.current_uses || 0),
      isLimitedTime: promotion.end_date && new Date(promotion.end_date) > new Date(),
      endDate: promotion.end_date ? new Date(promotion.end_date) : null,
      startDate: promotion.start_date ? new Date(promotion.start_date) : null
    };
  }

  /**
   * Check if promotion is valid for current conditions
   * @param {Object} promotion - Promotion data
   * @param {Object} conditions - Current conditions (user, cart, etc.)
   * @returns {boolean} Is promotion valid
   */
  isPromotionValid(promotion, conditions = {}) {
    if (!promotion || !promotion.is_active || !promotion.is_valid) {
      return false;
    }

    const now = new Date();
    
    // Check date validity
    if (promotion.start_date && new Date(promotion.start_date) > now) {
      return false;
    }
    
    if (promotion.end_date && new Date(promotion.end_date) < now) {
      return false;
    }

    // Check usage limits
    if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
      return false;
    }

    // Check minimum order amount
    if (conditions.orderAmount && promotion.minimum_order_amount) {
      if (conditions.orderAmount < parseFloat(promotion.minimum_order_amount)) {
        return false;
      }
    }

    return true;
  }
}

// Create and export singleton instance
const promotionService = new PromotionService();
export default promotionService;