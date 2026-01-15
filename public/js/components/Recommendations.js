import { createElementFromHTML, showToast } from "../utils/helpers.js"
import { recommendationService, productService } from "../services/api.js"
import store from "../state/store.js"

/**
 * Recommendations Component - AI-powered product recommendations
 * Supports both general and personalized recommendations
 */
export default function Recommendations(options = {}) {
  const {
    type = 'general', // 'general' or 'personalized'
    limit = 6,
    categoryId = null,
    excludeProducts = [],
    title = 'Recommended for You',
    showTitle = true,
    className = '',
    onProductClick = null
  } = options

  const { isAuthenticated, user } = store.getState()
  
  // Use personalized recommendations only if user is authenticated
  const recommendationType = isAuthenticated && type === 'personalized' ? 'personalized' : 'general'
  
  const container = createElementFromHTML(`
    <div class="recommendations-container ${className}">
      ${showTitle ? `
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <i class="fa-solid fa-magic text-purple-600"></i>
            ${title}
          </h3>
          <div class="text-sm text-gray-500 flex items-center gap-2">
            <i class="fa-solid fa-robot text-purple-500"></i>
            <span>AI Powered</span>
          </div>
        </div>
      ` : ''}
      
      <div class="recommendations-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <!-- Loading state -->
        <div class="col-span-full flex justify-center py-8">
          <div class="text-center">
            <div class="loader mx-auto mb-4"></div>
            <p class="text-gray-500">Loading recommendations...</p>
          </div>
        </div>
      </div>
    </div>
  `)

  // Load recommendations
  loadRecommendations(container, {
    type: recommendationType,
    limit,
    categoryId,
    excludeProducts,
    onProductClick
  })

  return container
}

async function loadRecommendations(container, options) {
  const grid = container.querySelector('.recommendations-grid')
  
  // Show loading state
  grid.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-8">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-500">Loading recommendations...</p>
      </div>
    </div>
  `
  
  try {
    let response
    
    // Use personalization service if available for enhanced recommendations
    if (window.personalizationService && options.type === 'personalized') {
      try {
        response = await window.personalizationService.getPersonalizedRecommendations({
          limit: options.limit,
          categoryId: options.categoryId
        })
      } catch (personalizedError) {
        console.log('Personalized recommendations failed, falling back to general:', personalizedError)
        // Fall back to general recommendations
        response = null
      }
    }
    
    // If personalized failed or not available, use direct API calls
    if (!response) {
      // Fallback to direct API calls
      const params = {
        limit: options.limit
      }
      
      if (options.categoryId) {
        params.category_id = options.categoryId
      }
      
      if (options.excludeProducts && options.excludeProducts.length > 0) {
        params.exclude_products = options.excludeProducts
      }

      if (options.type === 'personalized') {
        response = await recommendationService.getPersonalizedRecommendations(params)
      } else {
        response = await recommendationService.getGeneralRecommendations(params)
      }
    }

    if (!response.recommendations || response.recommendations.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-8">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-magic text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-500">No recommendations available at the moment.</p>
        </div>
      `
      return
    }

    // Store session ID for tracking
    container.dataset.sessionId = response.session_id

    // Load product details for each recommendation
    const productPromises = response.recommendations.map(async (rec) => {
      try {
        const product = await productService.getProductById(rec.product_id)
        return { ...product, recommendation_score: rec.score, algorithm: rec.algorithm }
      } catch (error) {
        console.error(`Failed to load product ${rec.product_id}:`, error)
        return null
      }
    })

    const products = (await Promise.all(productPromises)).filter(Boolean)

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-8">
          <p class="text-gray-500">Unable to load recommended products.</p>
        </div>
      `
      return
    }

    // Render product cards
    grid.innerHTML = products.map(product => createRecommendationCard(product, options.onProductClick)).join('')

    // Add click tracking
    addClickTracking(container, response.session_id)

  } catch (error) {
    console.error('Failed to load recommendations:', error)
    
    // Try fallback to general recommendations if personalized failed
    if (options.type === 'personalized') {
      console.log('Falling back to general recommendations...')
      try {
        const fallbackParams = {
          limit: options.limit
        }
        
        if (options.excludeProducts && options.excludeProducts.length > 0) {
          fallbackParams.exclude_products = options.excludeProducts
        }
        
        let fallbackResponse
        try {
          fallbackResponse = await recommendationService.getGeneralRecommendations(fallbackParams)
        } catch (generalError) {
          console.log('General recommendations also failed, using popular products fallback')
          // Final fallback: get popular products
          const popularProducts = await productService.getProducts('ordering=-views&limit=' + options.limit)
          fallbackResponse = {
            recommendations: popularProducts.results?.map(product => ({
              product_id: product.id,
              score: 0.3,
              algorithm: 'popular_fallback'
            })) || [],
            session_id: 'fallback_session'
          }
        }
        
        if (fallbackResponse.recommendations && fallbackResponse.recommendations.length > 0) {
          const productPromises = fallbackResponse.recommendations.map(async (rec) => {
            try {
              const product = await productService.getProductById(rec.product_id)
              return { ...product, recommendation_score: rec.score, algorithm: rec.algorithm }
            } catch (error) {
              console.error(`Failed to load product ${rec.product_id}:`, error)
              return null
            }
          })
          
          const products = (await Promise.all(productPromises)).filter(Boolean)
          if (products.length > 0) {
            grid.innerHTML = products.map(product => createRecommendationCard(product, options.onProductClick)).join('')
            return
          }
        }
      } catch (fallbackError) {
        console.error('Fallback recommendations also failed:', fallbackError)
      }
    }
    
    grid.innerHTML = `
      <div class="col-span-full text-center py-8">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-exclamation-triangle text-red-500 text-2xl"></i>
        </div>
        <p class="text-gray-500 mb-4">Unable to load recommendations at the moment</p>
        <button class="btn btn-outline btn-sm" onclick="location.reload()">
          <i class="fa-solid fa-refresh mr-2"></i>
          Refresh Page
        </button>
      </div>
    `
  }
}

function createRecommendationCard(product, onProductClick) {
  const imageUrl = window.ImageUtils ? 
    window.ImageUtils.getProductImageUrl(product) : 
    (product.images && product.images.length > 0 ? product.images[0].image : '/assets/placeholder-product.svg');
  
  const errorHandler = window.ImageUtils ? 
    window.ImageUtils.getImageErrorHandler() : 
    "this.onerror=null; this.src='/assets/placeholder-product.svg';";

  return `
    <div class="recommendation-card bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer group" 
         data-product-id="${product.id}">
      <div class="relative">
        <img src="${imageUrl}" 
             alt="${product.name}" 
             class="w-full h-32 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
             onerror="${errorHandler}">
        
        <!-- Recommendation Score Badge -->
        <div class="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
          ${Math.round(product.recommendation_score * 100)}% match
        </div>

        <!-- Quick Actions -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div class="flex gap-2">
            <button class="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors add-to-cart-btn" 
                    data-product-id="${product.id}" 
                    title="Add to Cart">
              <i class="fa-solid fa-shopping-cart text-sm"></i>
            </button>
            <button class="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors add-to-comparison-btn" 
                    data-product-id="${product.id}" 
                    title="Add to Comparison">
              <i class="fa-solid fa-balance-scale text-sm"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div class="p-3">
        <h4 class="font-medium text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
          ${product.name}
        </h4>
        
        <div class="flex items-center justify-between mb-2">
          <span class="text-lg font-bold text-green-600">
            $${parseFloat(product.price).toFixed(2)}
          </span>
          ${product.rating ? `
            <div class="flex items-center gap-1 text-xs text-gray-500">
              <i class="fa-solid fa-star text-yellow-500"></i>
              <span>${product.rating}</span>
            </div>
          ` : ''}
        </div>

        <div class="text-xs text-gray-500 mb-2">
          <i class="fa-solid fa-store mr-1"></i>
          ${product.store?.name || 'Unknown Store'}
        </div>

        <!-- Algorithm Info -->
        <div class="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
          <i class="fa-solid fa-brain mr-1"></i>
          ${getAlgorithmDescription(product.algorithm)}
        </div>
      </div>
    </div>
  `
}

function getAlgorithmDescription(algorithm) {
  const descriptions = {
    'collaborative_filtering': 'Similar users liked',
    'content_based': 'Similar products',
    'trending': 'Trending now',
    'popular': 'Popular choice',
    'category_based': 'In your interests',
    'hybrid': 'AI recommended'
  }
  return descriptions[algorithm] || 'Recommended'
}

function addClickTracking(container, sessionId) {
  const cards = container.querySelectorAll('.recommendation-card')
  
  cards.forEach(card => {
    const productId = card.dataset.productId
    
    // Track card clicks
    card.addEventListener('click', async (e) => {
      // Don't track if clicking on action buttons
      if (e.target.closest('.add-to-cart-btn, .add-to-comparison-btn')) {
        return
      }
      
      try {
        await recommendationService.trackInteraction({
          session_id: sessionId,
          product_id: productId,
          action: 'click'
        })
      } catch (error) {
        console.error('Failed to track recommendation click:', error)
      }
      
      // Navigate to product page
      location.hash = `#/products/${productId}`
    })

    // Track add to cart
    const addToCartBtn = card.querySelector('.add-to-cart-btn')
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', async (e) => {
        e.stopPropagation()
        
        try {
          // Add to cart logic would go here
          showToast('Added to cart!', 'success')
          
          // Track the interaction
          await recommendationService.trackInteraction({
            session_id: sessionId,
            product_id: productId,
            action: 'add_to_cart'
          })
        } catch (error) {
          console.error('Failed to add to cart or track interaction:', error)
          showToast('Failed to add to cart', 'error')
        }
      })
    }

    // Track add to comparison
    const addToComparisonBtn = card.querySelector('.add-to-comparison-btn')
    if (addToComparisonBtn) {
      addToComparisonBtn.addEventListener('click', async (e) => {
        e.stopPropagation()
        
        try {
          // Add to comparison logic would go here
          if (window.addToComparison) {
            window.addToComparison(productId)
          }
          showToast('Added to comparison!', 'success')
        } catch (error) {
          console.error('Failed to add to comparison:', error)
          showToast('Failed to add to comparison', 'error')
        }
      })
    }
  })
}

// Export helper function to create recommendations sections
export function createRecommendationsSection(options) {
  return Recommendations(options)
}

// Export function to refresh recommendations
export function refreshRecommendations(container) {
  const options = {
    type: container.dataset.type || 'general',
    limit: parseInt(container.dataset.limit) || 6,
    categoryId: container.dataset.categoryId || null,
    excludeProducts: container.dataset.excludeProducts ? container.dataset.excludeProducts.split(',') : []
  }
  
  loadRecommendations(container, options)
}

// Initialize recommendations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Auto-initialize recommendations containers
  const containers = document.querySelectorAll('[data-recommendations]')
  containers.forEach(container => {
    const options = {
      type: container.dataset.type || 'general',
      limit: parseInt(container.dataset.limit) || 6,
      categoryId: container.dataset.categoryId || null,
      excludeProducts: container.dataset.excludeProducts ? container.dataset.excludeProducts.split(',') : [],
      title: container.dataset.title || 'Recommended for You',
      showTitle: container.dataset.showTitle !== 'false'
    }
    
    const recommendationsComponent = Recommendations(options)
    container.appendChild(recommendationsComponent)
  })
})