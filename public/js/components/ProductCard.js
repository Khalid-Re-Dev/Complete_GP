import { formatCurrency, showToast } from "../utils/helpers.js?v=2024"
import { trackProductClick, trackAddToCart, trackAddToWishlist } from "../services/behaviorTracker.js"
import { addToComparison, isInComparison } from "./ProductComparison.js"
import { cleanImageUrl, createCategoryPlaceholder } from "../utils/imageHandler.js"
import { generateProductImage } from "../utils/localImageGenerator.js"

/**
 * Creates a product card component.
 * @param {object} product - The product data object.
 * @returns {string} The HTML string for the product card.
 */
export function ProductCard(product) {
  // Handle backend data structure
  const finalPrice = product.final_price || product.price
  const originalPrice = product.price
  const hasDiscount = (product.discount_percentage || 0) > 0
  const categoryName = product.category?.name || product.category || 'Uncategorized'
  const productSlug = product.slug || product.id
  const rating = product.average_rating || product.rating || 0
  const reviewsCount = product.total_reviews || product.reviews_count || 0
  const isInStock = product.in_stock !== undefined ? product.in_stock : (product.stock || 0) > 0

  // Get primary image with proper handling
  let imageUrl = generateProductImage(product.name, categoryName)
  
  // Try to use real image if available and valid
  if (product.image_urls && product.image_urls.length > 0) {
    const cleanedUrl = cleanImageUrl(product.image_urls[0])
    if (!cleanedUrl.startsWith('data:')) { // Not a fallback image
      imageUrl = cleanedUrl
    }
  } else if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.is_primary)?.image || product.images[0]?.image
    const cleanedUrl = cleanImageUrl(primaryImage)
    if (!cleanedUrl.startsWith('data:')) { // Not a fallback image
      imageUrl = cleanedUrl
    }
  }

  return `
    <div class="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden"
         data-product-id="${product.id}"
         onclick="handleProductCardClick('${productSlug}', ${JSON.stringify(product).replace(/"/g, '&quot;')})">
      <!-- Product Image -->
      <div class="relative overflow-hidden">
        <img src="${imageUrl}"
             alt="${product.name}"
             class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
             data-fallback-text="${product.name}"
             loading="lazy">

        <!-- Discount Badge -->
        ${hasDiscount ? `
          <div class="absolute top-3 left-3 bg-danger text-white px-2 py-1 rounded-full text-xs font-bold">
            -${Math.round(product.discount_percentage)}%
          </div>
        ` : ''}

        <!-- Action Buttons -->
        <div class="product-card-actions">
          <button class="action-button ${product.is_liked ? 'wishlist-active' : ''}"
                  onclick="event.stopPropagation(); toggleWishlist('${productSlug}', event)"
                  title="Add to Wishlist"
                  aria-label="Add ${product.name} to wishlist">
            <i class="fa-solid fa-heart ${product.is_liked ? 'text-red-500' : ''}"></i>
          </button>
          <button class="action-button ${isInComparison(product.id) ? 'comparison-active' : ''}"
                  onclick="event.stopPropagation(); toggleComparison('${productSlug}', event)"
                  title="${isInComparison(product.id) ? 'Remove from Comparison' : 'Add to Comparison'}"
                  aria-label="${isInComparison(product.id) ? 'Remove' : 'Add'} ${product.name} ${isInComparison(product.id) ? 'from' : 'to'} comparison">
            <i class="fa-solid fa-balance-scale ${isInComparison(product.id) ? 'text-purple-600' : ''}"></i>
          </button>
          <button class="action-button"
                  onclick="event.stopPropagation(); addToCart('${productSlug}', event)"
                  title="Add to Cart"
                  aria-label="Add ${product.name} to cart">
            <i class="fa-solid fa-shopping-cart"></i>
          </button>
          <button class="action-button"
                  onclick="event.stopPropagation(); quickView('${productSlug}', event)"
                  title="Quick View"
                  aria-label="View ${product.name} details">
            <i class="fa-solid fa-eye"></i>
          </button>
        </div>
      </div>

      <!-- Product Info -->
      <div class="p-4 space-y-3">
        <!-- Category -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-secondary bg-secondary bg-opacity-10 px-2 py-1 rounded-full">
            ${categoryName}
          </span>
          ${isInStock ?
            '<span class="text-xs text-success font-medium">In Stock</span>' :
            '<span class="text-xs text-danger font-medium">Out of Stock</span>'
          }
        </div>

        <!-- Product Name -->
        <h3 class="font-semibold text-gray-800 group-hover:text-secondary transition-colors line-clamp-2 leading-tight">
          ${product.name}
        </h3>

        <!-- Rating -->
        ${rating > 0 ? `
          <div class="flex items-center gap-2">
            <div class="flex text-yellow-400 text-sm">
              ${Array.from({length: 5}, (_, i) => `
                <i class="fa-solid fa-star ${i < Math.floor(rating) ? '' : 'text-gray-300'}"></i>
              `).join('')}
            </div>
            <span class="text-xs text-gray-500">${rating.toFixed(1)}</span>
            <span class="text-xs text-gray-400">(${reviewsCount})</span>
          </div>
        ` : ''}

        <!-- Price -->
        <div class="flex items-center justify-between pt-2">
          <div class="flex flex-col">
            ${hasDiscount ? `
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold text-secondary">${formatCurrency(finalPrice)}</span>
                <span class="text-sm text-gray-500 line-through">${formatCurrency(originalPrice)}</span>
              </div>
            ` : `
              <span class="text-lg font-bold text-gray-800">${formatCurrency(finalPrice)}</span>
            `}
          </div>
        </div>
      </div>
    </div>
  `
}

// Helper functions for product card interactions
async function getProductIdFromSlug(slug) {
  try {
    // If slug is actually an ID, return it
    if (!isNaN(slug)) {
      return parseInt(slug)
    }

    // Try to get from current product data first
    const currentProduct = window.currentProduct
    if (currentProduct && currentProduct.slug === slug) {
      return currentProduct.id
    }

    // Fallback: fetch product by slug
    const { productService } = await import('../services/api.js')
    const product = await productService.getProductById(slug)
    return product.id
  } catch (error) {
    console.error('Failed to get product ID:', error)
    throw error
  }
}

function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11)
    localStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

function updateWishlistCounter() {
  // Update wishlist badge
  const wishlistBadges = document.querySelectorAll('.wishlist-badge')
  wishlistBadges.forEach(badge => {
    const currentCount = parseInt(badge.textContent) || 0
    badge.textContent = currentCount + 1
    badge.style.display = 'block'
  })
}

function updateCartCounter() {
  if (window.cart) {
    window.cart.loadCart()
  } else {
    // Update cart badge manually
    const cartBadges = document.querySelectorAll('.cart-badge')
    cartBadges.forEach(badge => {
      const currentCount = parseInt(badge.textContent) || 0
      badge.textContent = currentCount + 1
      badge.style.display = 'block'
    })
  }
}

// Utility functions for product card interactions
window.toggleWishlist = async function(productSlug, event = null) {
  let button = null
  let originalContent = null

  try {
    // Add loading state to button
    if (event) {
      button = event.target.closest('button')
      originalContent = button.innerHTML
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'
      button.disabled = true
    }

    // Import store to check authentication
    const store = await import('../state/store.js')
    const { isAuthenticated } = store.default.getState()

    if (!isAuthenticated) {
      showToast('Please login to add items to wishlist', 'warning')
      location.hash = '/login'
      return
    }

    // Get product ID from slug
    const productId = await getProductIdFromSlug(productSlug)

    // Get product data for tracking
    const productData = await getProductData(productSlug)

    // Track add to wishlist behavior
    if (productData) {
      trackAddToWishlist(productData, 'product_card')
    }

    // Import cart service dynamically to avoid circular dependencies
    const { cartService } = await import('../services/api.js')

    const response = await cartService.saveItem(productId)

    if (response.success || response.message) {
      showToast('Added to wishlist!', 'success')
      updateWishlistCounter()

      // Update the heart icon to show it's liked
      if (button) {
        button.innerHTML = '<i class="fa-solid fa-heart text-red-500"></i>'
        button.title = 'Added to Wishlist'
        button.classList.add('wishlist-active', 'success')

        // Remove success animation after it completes
        setTimeout(() => {
          button.classList.remove('success')
        }, 600)
      }
    } else {
      throw new Error(response.error || 'Failed to add to wishlist')
    }
  } catch (error) {
    console.error('Failed to add to wishlist:', error)
    const errorMessage = error.message || 'Failed to add to wishlist'
    showToast(errorMessage, 'error')

    // Show error state briefly
    if (button && originalContent) {
      button.classList.add('error')
      button.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i>'

      setTimeout(() => {
        button.innerHTML = originalContent
        button.disabled = false
        button.classList.remove('error')
      }, 1500)
    }
  } finally {
    // Re-enable button if not permanently changed
    if (button && !button.innerHTML.includes('text-red-500')) {
      button.disabled = false
      if (originalContent) {
        button.innerHTML = originalContent
      }
    }
  }
}

window.addToCart = async function(productSlug, event = null) {
  let button = null
  let originalContent = null

  try {
    // Add loading state to button
    if (event) {
      button = event.target.closest('button')
      originalContent = button.innerHTML
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'
      button.disabled = true
    }

    // Get product ID from slug
    const productId = await getProductIdFromSlug(productSlug)

    // Get product data for tracking
    const productData = await getProductData(productSlug)

    // Track add to cart behavior
    if (productData) {
      trackAddToCart(productData, 1, 'product_card')
    }

    // Check if cart component is available
    if (window.cart) {
      await window.cart.addToCart(productId, 1)
    } else {
      // Fallback to direct API call
      const { cartService } = await import('../services/api.js')
      const store = await import('../state/store.js')
      const { isAuthenticated } = store.default.getState()

      // Get session ID for guest users
      const sessionId = isAuthenticated ? null : getOrCreateSessionId()

      const response = await cartService.addToCart(productId, 1, sessionId)

      if (response.success || response.message || response.cart) {
        showToast('Added to cart!', 'success')
        updateCartCounter()

        // Show success state briefly
        if (button) {
          button.innerHTML = '<i class="fa-solid fa-check text-green-500"></i>'
          button.classList.add('cart-success', 'success')

          setTimeout(() => {
            if (originalContent) {
              button.innerHTML = originalContent
              button.classList.remove('cart-success', 'success')
            }
          }, 1500)
        }
      } else {
        throw new Error(response.error || 'Failed to add to cart')
      }
    }
  } catch (error) {
    console.error('Failed to add to cart:', error)
    const errorMessage = error.message || 'Failed to add to cart'
    showToast(errorMessage, 'error')

    // Show error state briefly
    if (button && originalContent) {
      button.classList.add('error')
      button.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i>'

      setTimeout(() => {
        button.innerHTML = originalContent
        button.disabled = false
        button.classList.remove('error')
      }, 1500)
    }
  } finally {
    // Re-enable button
    if (button) {
      button.disabled = false
      // Only restore content if it wasn't changed to success state
      if (button.innerHTML.includes('fa-spinner') && originalContent) {
        button.innerHTML = originalContent
      }
    }
  }
}

window.quickView = function(productSlug, event = null) {
  try {
    // Add loading state to the button if event is provided
    if (event) {
      const button = event.target.closest('button')
      const originalContent = button.innerHTML
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'
      button.disabled = true

      // Reset button after a short delay (in case navigation is slow)
      setTimeout(() => {
        button.innerHTML = originalContent
        button.disabled = false
      }, 1000)
    }

    // Navigate to product detail page
    location.hash = `/products/${productSlug}`
  } catch (error) {
    console.error('Failed to navigate to product:', error)
    showToast('Failed to open product details', 'error')
  }
}

// Helper function to get product data for tracking
async function getProductData(productSlug) {
  try {
    // If slug is actually an ID, convert it
    if (!isNaN(productSlug)) {
      const { productService } = await import('../services/api.js')
      const allProducts = await productService.getProducts()
      return allProducts.results.find(p => p.id === parseInt(productSlug))
    }

    // Try to get from current product data first
    const currentProduct = window.currentProduct
    if (currentProduct && (currentProduct.slug === productSlug || currentProduct.id === productSlug)) {
      return currentProduct
    }

    // Fallback: fetch product by slug
    const { productService } = await import('../services/api.js')
    return await productService.getProductById(productSlug)
  } catch (error) {
    console.error('Failed to get product data for tracking:', error)
    return null
  }
}

// Global function to handle product card clicks with tracking
window.handleProductCardClick = function(productSlug, productData) {
  try {
    // Parse product data if it's a string
    const product = typeof productData === 'string' ? JSON.parse(productData.replace(/&quot;/g, '"')) : productData
    
    // Track the click
    trackProductClick(product, null, 'product_card')
    
    // Navigate to product page
    location.hash = `/products/${productSlug}`
  } catch (error) {
    console.error('Failed to track product click:', error)
    // Still navigate even if tracking fails
    location.hash = `/products/${productSlug}`
  }
}

// Global function to toggle product comparison
window.toggleComparison = async function(productSlug, event = null) {
  let button = null
  let originalContent = null

  try {
    // Add loading state to button
    if (event) {
      button = event.target.closest('button')
      originalContent = button.innerHTML
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'
      button.disabled = true
    }

    // Get product data
    const productData = await getProductData(productSlug)
    if (!productData) {
      throw new Error('Product not found')
    }

    // Import comparison functions
    const { addToComparison, removeFromComparison, isInComparison } = await import('./ProductComparison.js')

    if (isInComparison(productData.id)) {
      // Remove from comparison
      const success = removeFromComparison(productData.id)
      if (success && button) {
        button.innerHTML = '<i class="fa-solid fa-balance-scale"></i>'
        button.classList.remove('comparison-active')
        button.title = 'Add to Comparison'
      }
    } else {
      // Add to comparison
      const success = addToComparison(productData)
      if (success && button) {
        button.innerHTML = '<i class="fa-solid fa-balance-scale text-purple-600"></i>'
        button.classList.add('comparison-active')
        button.title = 'Remove from Comparison'
      }
    }

  } catch (error) {
    console.error('Failed to toggle comparison:', error)
    showToast(error.message || 'Failed to update comparison', 'error')

    // Show error state briefly
    if (button && originalContent) {
      button.classList.add('error')
      button.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i>'

      setTimeout(() => {
        button.innerHTML = originalContent
        button.disabled = false
        button.classList.remove('error')
      }, 1500)
    }
  } finally {
    // Re-enable button
    if (button) {
      button.disabled = false
      // Only restore content if it wasn't changed to success state
      if (button.innerHTML.includes('fa-spinner') && originalContent) {
        button.innerHTML = originalContent
      }
    }
  }
}
