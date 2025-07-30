import { recommendationService, productService } from "./api.js"
import { logBehavior } from "./behaviorTracker.js"
import store from "../state/store.js"

/**
 * Personalization Service - Manages user personalization and real-time content adaptation
 * Integrates with behavior tracking and AI recommendations
 */
class PersonalizationService {
  constructor() {
    this.sessionId = this.generateSessionId()
    this.userPreferences = this.loadUserPreferences()
    this.realtimeData = {
      viewedProducts: new Set(),
      searchQueries: [],
      categoryInterests: new Map(),
      brandPreferences: new Map(),
      priceRange: { min: 0, max: Infinity },
      sessionStartTime: Date.now()
    }
    
    // Initialize personalization
    this.initialize()
  }

  cleanupData() {
    // Remove invalid product IDs from viewed products
    const validIds = new Set()
    this.realtimeData.viewedProducts.forEach(id => {
      if (id != null && !isNaN(parseInt(id))) {
        validIds.add(parseInt(id))
      }
    })
    this.realtimeData.viewedProducts = validIds
  }

  initialize() {
    // Clean up any invalid data
    this.cleanupData()
    
    // Listen for user authentication changes
    store.addObserver((state) => {
      if (state.isAuthenticated && state.user) {
        this.onUserAuthenticated(state.user)
      } else {
        this.onUserLoggedOut()
      }
    })

    // Start real-time personalization updates
    this.startRealtimeUpdates()
  }

  generateSessionId() {
    return `personalization_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  loadUserPreferences() {
    try {
      const saved = localStorage.getItem('user_preferences')
      return saved ? JSON.parse(saved) : this.getDefaultPreferences()
    } catch (error) {
      console.error('Failed to load user preferences:', error)
      return this.getDefaultPreferences()
    }
  }

  getDefaultPreferences() {
    return {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 1000 },
      sortPreference: 'relevance',
      viewPreference: 'grid',
      notificationsEnabled: true,
      recommendationTypes: ['personalized', 'trending', 'similar'],
      language: 'en',
      currency: 'USD'
    }
  }

  saveUserPreferences() {
    try {
      localStorage.setItem('user_preferences', JSON.stringify(this.userPreferences))
    } catch (error) {
      console.error('Failed to save user preferences:', error)
    }
  }

  onUserAuthenticated(user) {
    console.log('User authenticated, loading personalization data for:', user.username)
    
    // Load user-specific preferences from server if available
    this.loadServerPreferences(user.id)
    
    // Log user login for behavior tracking
    logBehavior("USER_LOGIN", {
      user_id: user.id,
      user_role: user.role,
      login_time: new Date().toISOString()
    })
  }

  onUserLoggedOut() {
    console.log('User logged out, switching to anonymous personalization')
    
    // Keep session-based personalization but remove user-specific data
    this.userPreferences = this.getDefaultPreferences()
    this.saveUserPreferences()
  }

  async loadServerPreferences(userId) {
    try {
      // This would typically fetch from a user preferences API
      // For now, we'll use the realtime personalization endpoint
      const data = await recommendationService.getRealtimePersonalization(this.sessionId)
      
      if (data.user_preferences) {
        this.userPreferences = { ...this.userPreferences, ...data.user_preferences }
        this.saveUserPreferences()
      }
    } catch (error) {
      console.error('Failed to load server preferences:', error)
    }
  }

  // Track user interactions for personalization
  trackInteraction(type, data) {
    switch (type) {
      case 'product_view':
        this.trackProductView(data)
        break
      case 'search':
        this.trackSearch(data)
        break
      case 'category_browse':
        this.trackCategoryBrowse(data)
        break
      case 'filter_use':
        this.trackFilterUse(data)
        break
      case 'purchase':
        this.trackPurchase(data)
        break
      case 'wishlist_add':
        this.trackWishlistAdd(data)
        break
      default:
        console.log('Unknown interaction type:', type)
    }
  }

  trackProductView(data) {
    if (data.productId && !isNaN(parseInt(data.productId))) {
      this.realtimeData.viewedProducts.add(parseInt(data.productId))
    }
    
    // Update category interests
    if (data.category) {
      const current = this.realtimeData.categoryInterests.get(data.category) || 0
      this.realtimeData.categoryInterests.set(data.category, current + 1)
    }

    // Update brand preferences
    if (data.brand) {
      const current = this.realtimeData.brandPreferences.get(data.brand) || 0
      this.realtimeData.brandPreferences.set(data.brand, current + 1)
    }

    // Update price range insights
    if (data.price) {
      this.updatePriceRangeInsights(data.price)
    }
  }

  trackSearch(data) {
    this.realtimeData.searchQueries.push({
      query: data.query,
      timestamp: Date.now(),
      resultsCount: data.resultsCount || 0
    })

    // Keep only last 20 searches
    if (this.realtimeData.searchQueries.length > 20) {
      this.realtimeData.searchQueries = this.realtimeData.searchQueries.slice(-20)
    }
  }

  trackCategoryBrowse(data) {
    const current = this.realtimeData.categoryInterests.get(data.category) || 0
    this.realtimeData.categoryInterests.set(data.category, current + 0.5)
  }

  trackFilterUse(data) {
    // Track filter preferences for future personalization
    if (data.filterType === 'price') {
      this.userPreferences.priceRange = data.value
      this.saveUserPreferences()
    } else if (data.filterType === 'brand') {
      if (!this.userPreferences.brands.includes(data.value)) {
        this.userPreferences.brands.push(data.value)
        this.saveUserPreferences()
      }
    }
  }

  trackPurchase(data) {
    // Strong signal for personalization
    if (data.category) {
      const current = this.realtimeData.categoryInterests.get(data.category) || 0
      this.realtimeData.categoryInterests.set(data.category, current + 3)
    }

    if (data.brand) {
      const current = this.realtimeData.brandPreferences.get(data.brand) || 0
      this.realtimeData.brandPreferences.set(data.brand, current + 2)
    }
  }

  trackWishlistAdd(data) {
    // Medium signal for personalization
    if (data.category) {
      const current = this.realtimeData.categoryInterests.get(data.category) || 0
      this.realtimeData.categoryInterests.set(data.category, current + 1.5)
    }
  }

  updatePriceRangeInsights(price) {
    const numPrice = parseFloat(price)
    if (!isNaN(numPrice)) {
      // Gradually adjust price range based on viewed products
      const currentRange = this.realtimeData.priceRange
      
      if (numPrice < currentRange.min || currentRange.min === 0) {
        this.realtimeData.priceRange.min = Math.max(0, numPrice * 0.8)
      }
      
      if (numPrice > currentRange.max || currentRange.max === Infinity) {
        this.realtimeData.priceRange.max = numPrice * 1.2
      }
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(options = {}) {
    const { isAuthenticated } = store.getState()
    
    try {
      const excludeProducts = Array.from(this.realtimeData.viewedProducts)
        .filter(id => id != null && !isNaN(parseInt(id)))
        .map(id => parseInt(id))
      
      const params = {
        limit: options.limit || 6,
        session_id: this.sessionId,
        exclude_products: excludeProducts
      }
      
      if (options.categoryId) {
        params.category_id = options.categoryId
      }

      let recommendations
      try {
        if (isAuthenticated) {
          recommendations = await recommendationService.getPersonalizedRecommendations(params)
        } else {
          recommendations = await recommendationService.getGeneralRecommendations(params)
        }
      } catch (error) {
        console.log('Recommendations API failed, using fallback strategy:', error.message)
        
        // Fallback: get popular products instead
        try {
          const fallbackProducts = await productService.getProducts('ordering=-views&limit=' + (options.limit || 6))
          recommendations = {
            recommendations: fallbackProducts.results?.map(product => ({
              product_id: product.id,
              score: 0.5,
              algorithm: 'fallback_popular'
            })) || [],
            session_id: this.sessionId
          }
        } catch (fallbackError) {
          console.error('Fallback strategy also failed:', fallbackError)
          return { recommendations: [], session_id: this.sessionId }
        }
      }

      // Enhance recommendations with personalization insights
      return this.enhanceRecommendations(recommendations)
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error)
      throw error
    }
  }

  enhanceRecommendations(recommendations) {
    if (!recommendations.recommendations) return recommendations

    // Add personalization scores based on user behavior
    const enhanced = recommendations.recommendations.map(rec => {
      let personalScore = rec.score || 0.5

      // Boost based on category interest
      if (rec.category && this.realtimeData.categoryInterests.has(rec.category)) {
        const interest = this.realtimeData.categoryInterests.get(rec.category)
        personalScore += Math.min(0.3, interest * 0.1)
      }

      // Boost based on brand preference
      if (rec.brand && this.realtimeData.brandPreferences.has(rec.brand)) {
        const preference = this.realtimeData.brandPreferences.get(rec.brand)
        personalScore += Math.min(0.2, preference * 0.05)
      }

      // Adjust based on price range
      if (rec.price) {
        const price = parseFloat(rec.price)
        const { min, max } = this.realtimeData.priceRange
        if (price >= min && price <= max) {
          personalScore += 0.1
        }
      }

      return {
        ...rec,
        personalization_score: Math.min(1, personalScore),
        personalization_reasons: this.getPersonalizationReasons(rec)
      }
    })

    // Sort by personalization score
    enhanced.sort((a, b) => b.personalization_score - a.personalization_score)

    return {
      ...recommendations,
      recommendations: enhanced,
      personalization_applied: true,
      session_insights: this.getSessionInsights()
    }
  }

  getPersonalizationReasons(recommendation) {
    const reasons = []

    if (recommendation.category && this.realtimeData.categoryInterests.has(recommendation.category)) {
      reasons.push(`You've shown interest in ${recommendation.category}`)
    }

    if (recommendation.brand && this.realtimeData.brandPreferences.has(recommendation.brand)) {
      reasons.push(`You like ${recommendation.brand} products`)
    }

    if (this.realtimeData.searchQueries.length > 0) {
      const recentSearches = this.realtimeData.searchQueries.slice(-3)
      const matchingSearch = recentSearches.find(search => 
        recommendation.name.toLowerCase().includes(search.query.toLowerCase()) ||
        (recommendation.category && recommendation.category.toLowerCase().includes(search.query.toLowerCase()))
      )
      if (matchingSearch) {
        reasons.push(`Matches your recent search for "${matchingSearch.query}"`)
      }
    }

    return reasons
  }

  getSessionInsights() {
    const topCategories = Array.from(this.realtimeData.categoryInterests.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, score]) => ({ category, score }))

    const topBrands = Array.from(this.realtimeData.brandPreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([brand, score]) => ({ brand, score }))

    return {
      session_duration: Date.now() - this.realtimeData.sessionStartTime,
      products_viewed: this.realtimeData.viewedProducts.size,
      searches_performed: this.realtimeData.searchQueries.length,
      top_categories: topCategories,
      top_brands: topBrands,
      price_range_interest: this.realtimeData.priceRange
    }
  }

  // Start real-time updates
  startRealtimeUpdates() {
    // Update personalization data every 30 seconds
    setInterval(() => {
      this.updateRealtimePersonalization()
    }, 30000)
  }

  async updateRealtimePersonalization() {
    const { isAuthenticated } = store.getState()
    
    if (!isAuthenticated) return

    try {
      const data = await recommendationService.getRealtimePersonalization(this.sessionId)
      
      if (data.suggested_categories) {
        // Update category suggestions
        this.updateCategorySuggestions(data.suggested_categories)
      }

      if (data.price_recommendations) {
        // Update price range suggestions
        this.updatePriceRecommendations(data.price_recommendations)
      }
    } catch (error) {
      console.error('Failed to update realtime personalization:', error)
    }
  }

  updateCategorySuggestions(categories) {
    // Emit event for UI components to update
    document.dispatchEvent(new CustomEvent('personalization:categories-updated', {
      detail: { categories }
    }))
  }

  updatePriceRecommendations(priceData) {
    // Emit event for UI components to update
    document.dispatchEvent(new CustomEvent('personalization:price-updated', {
      detail: { priceData }
    }))
  }

  // Public API methods
  getUserPreferences() {
    return { ...this.userPreferences }
  }

  updateUserPreferences(updates) {
    this.userPreferences = { ...this.userPreferences, ...updates }
    this.saveUserPreferences()
    
    // Emit event for UI updates
    document.dispatchEvent(new CustomEvent('personalization:preferences-updated', {
      detail: { preferences: this.userPreferences }
    }))
  }

  getRealtimeData() {
    return {
      ...this.realtimeData,
      viewedProducts: Array.from(this.realtimeData.viewedProducts),
      categoryInterests: Object.fromEntries(this.realtimeData.categoryInterests),
      brandPreferences: Object.fromEntries(this.realtimeData.brandPreferences)
    }
  }

  clearPersonalizationData() {
    this.realtimeData = {
      viewedProducts: new Set(),
      searchQueries: [],
      categoryInterests: new Map(),
      brandPreferences: new Map(),
      priceRange: { min: 0, max: Infinity },
      sessionStartTime: Date.now()
    }
    
    this.userPreferences = this.getDefaultPreferences()
    this.saveUserPreferences()
  }
}

// Create singleton instance
const personalizationService = new PersonalizationService()

// Export for use in other modules
export default personalizationService

// Also export the class for testing
export { PersonalizationService }