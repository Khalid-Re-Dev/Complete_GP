import { createElementFromHTML, showToast, formatCurrency } from "../utils/helpers.js"
import { productService, comparisonService } from "../services/api.js"
import { trackProductClick } from "../services/behaviorTracker.js"
import store from "../state/store.js"
import modalManager from "../utils/modalManager.js"

/**
 * Product Comparison System
 * Allows users to compare multiple products side by side
 */

let comparisonProducts = []
const MAX_COMPARISON_PRODUCTS = 4

/**
 * Initialize comparison system
 */
export function initProductComparison() {
  // Load saved comparisons from localStorage
  loadSavedComparisons()
  
  // Update comparison badge
  updateComparisonBadge()
  
  // Add global functions
  setupGlobalFunctions()
  
  console.log('Product Comparison System Initialized')
}

/**
 * Add product to comparison
 */
function addToComparison(product) {
  // Check if product already in comparison
  if (comparisonProducts.find(p => p.id === product.id)) {
    showToast('Product already in comparison', 'warning')
    return false
  }
  
  // Check maximum limit
  if (comparisonProducts.length >= MAX_COMPARISON_PRODUCTS) {
    showToast(`Maximum ${MAX_COMPARISON_PRODUCTS} products can be compared`, 'warning')
    return false
  }
  
  // Add product
  comparisonProducts.push(product)
  saveComparisons()
  updateComparisonBadge()
  
  showToast(`${product.name} added to comparison`, 'success')
  return true
}

/**
 * Remove product from comparison
 */
function removeFromComparison(productId) {
  console.log('🗑️ Removing product from comparison:', productId)
  
  try {
    const index = comparisonProducts.findIndex(p => p.id == productId)
    console.log('📍 Found product at index:', index)
    
    if (index > -1) {
      const removedProduct = comparisonProducts.splice(index, 1)[0]
      console.log('✅ Removed product:', removedProduct.name)
      
      // Save to localStorage
      saveComparisons()
      
      // Update comparison badge
      updateComparisonBadge()
      
      // Update modal if open
      const modal = document.getElementById('comparison-modal')
      if (modal) {
        // If no products left, close modal
        if (comparisonProducts.length === 0) {
          console.log('📭 No products left, closing modal')
          closeComparisonModal()
        } else {
          // Update modal content
          console.log('🔄 Updating modal with remaining products')
          updateComparisonModal()
        }
      }
      
      // Update product cards to reflect removal
      updateProductCardStates()
      
      showToast(`${removedProduct.name} removed from comparison`, 'success')
      return true
    } else {
      console.log('⚠️ Product not found in comparison')
      showToast('Product not found in comparison', 'warning')
      return false
    }
  } catch (error) {
    console.error('❌ Error removing product from comparison:', error)
    showToast('Failed to remove product', 'error')
    return false
  }
}

/**
 * Clear all comparisons
 */
function clearComparisons() {
  console.log('🗑️ Clearing all comparisons...')
  
  try {
    const productCount = comparisonProducts.length
    console.log(`📊 Clearing ${productCount} products from comparison`)
    
    if (productCount === 0) {
      console.log('⚠️ No products to clear')
      showToast('No products in comparison', 'info')
      return true
    }
    
    // Clear the array
    comparisonProducts.splice(0, comparisonProducts.length)
    console.log('✅ Comparison products array cleared')
    
    // Save to localStorage
    saveComparisons()
    
    // Update comparison badge
    updateComparisonBadge()
    
    // Close modal if open
    const modal = document.getElementById('comparison-modal')
    if (modal) {
      console.log('🚪 Closing comparison modal')
      closeComparisonModal()
    }
    
    // Update all product cards to reflect removal
    updateProductCardStates()
    
    showToast(`All ${productCount} products removed from comparison`, 'success')
    console.log('✅ All comparisons cleared successfully')
    
    return true
    
  } catch (error) {
    console.error('❌ Error clearing comparisons:', error)
    showToast('Failed to clear comparisons', 'error')
    return false
  }
}

/**
 * Get current comparison products
 */
function getComparisonProducts() {
  return [...comparisonProducts]
}

/**
 * Update product card states to reflect comparison changes
 */
function updateProductCardStates() {
  console.log('🔄 Updating product card states...')
  
  try {
    // Update all comparison buttons on the page
    const comparisonButtons = document.querySelectorAll('button[onclick*="toggleComparison"]')
    
    comparisonButtons.forEach(button => {
      try {
        // Extract product slug from onclick attribute
        const onclickAttr = button.getAttribute('onclick')
        const slugMatch = onclickAttr.match(/toggleComparison\('([^']+)'/);
        
        if (slugMatch) {
          const productSlug = slugMatch[1]
          
          // Check if this product is in comparison
          const isInComparison = comparisonProducts.some(p => 
            p.slug === productSlug || p.id.toString() === productSlug
          )
          
          // Update button state
          const icon = button.querySelector('i')
          if (isInComparison) {
            button.classList.add('comparison-active')
            if (icon) icon.classList.add('text-purple-600')
            button.title = 'Remove from Comparison'
          } else {
            button.classList.remove('comparison-active')
            if (icon) icon.classList.remove('text-purple-600')
            button.title = 'Add to Comparison'
          }
        }
      } catch (error) {
        console.warn('⚠️ Error updating button state:', error)
      }
    })
    
    console.log('✅ Product card states updated')
    
  } catch (error) {
    console.error('❌ Error updating product card states:', error)
  }
}

/**
 * Check if product is in comparison
 */
function isInComparison(productId) {
  return comparisonProducts.some(p => p.id === productId)
}

/**
 * Create comparison modal - FIXED VERSION
 */
function createComparisonModal() {
  try {
    // Check if we have enough products
    if (comparisonProducts.length < 2) {
      showToast('Add at least 2 products to compare', 'warning')
      return null
    }

    // Check if modal already exists
    const existingModal = document.getElementById('comparison-modal')
    if (existingModal) {
      console.log('Comparison modal already open')
      return null
    }

    // Create modal directly without loading state
    const modal = createComparisonModalContent()
    
    if (!modal) {
      showToast('Failed to create comparison modal', 'error')
      return null
    }

    // Add modal to DOM with proper scroll management
    document.body.appendChild(modal)
    modalManager.openModal('comparison-modal')
    
    // Add ESC key support
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeComparisonModal()
        document.removeEventListener('keydown', handleEscape)
      }
    }
    document.addEventListener('keydown', handleEscape)
    
    // Add entrance animation
    setTimeout(() => {
      modal.classList.add('modal-enter')
    }, 10)
    
    console.log('Comparison modal created successfully')
    return modal
    
  } catch (error) {
    console.error('Error creating comparison modal:', error)
    // Ensure body scroll is restored on error
    modalManager.closeModal('comparison-modal')
    showToast('Error loading comparison', 'error')
    return null
  }
}

function createComparisonModalContent() {
  if (comparisonProducts.length < 2) {
    return null
  }

  const modal = createElementFromHTML(`
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-overlay" id="comparison-modal" onclick="handleComparisonModalClick(event)">
      <div class="bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden modal-content comparison-dialog" onclick="event.stopPropagation()">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-primary/90 text-white">
          <div>
            <h2 class="text-2xl font-bold flex items-center gap-3">
              <i class="fa-solid fa-balance-scale"></i>
              Product Comparison
            </h2>
            <p class="text-primary-light mt-1">Compare ${comparisonProducts.length} products side by side</p>
          </div>
          <button class="text-white hover:text-gray-200 transition-colors text-2xl" onclick="closeComparisonModal()">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <!-- Comparison Content -->
        <div class="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          <!-- Comparison Controls -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <h3 class="text-lg font-semibold text-gray-800">Comparison Criteria:</h3>
              <div class="flex gap-2">
                <button class="btn btn-sm btn-outline comparison-criteria active" 
                        data-criteria="all" 
                        onclick="handleCriteriaClick('all', this)">
                  All Features
                </button>
                <button class="btn btn-sm btn-outline comparison-criteria" 
                        data-criteria="basic" 
                        onclick="handleCriteriaClick('basic', this)">
                  Basic Info
                </button>
                <button class="btn btn-sm btn-outline comparison-criteria" 
                        data-criteria="pricing" 
                        onclick="handleCriteriaClick('pricing', this)">
                  Pricing
                </button>
                <button class="btn btn-sm btn-outline comparison-criteria" 
                        data-criteria="ratings" 
                        onclick="handleCriteriaClick('ratings', this)">
                  Ratings & Reviews
                </button>
                <button class="btn btn-sm btn-outline comparison-criteria" 
                        data-criteria="availability" 
                        onclick="handleCriteriaClick('availability', this)">
                  Availability
                </button>
              </div>
            </div>
            <button class="btn btn-outline text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400" 
                    onclick="confirmClearComparisons()"
                    title="Clear all products from comparison">
              <i class="fa-solid fa-trash mr-2"></i>
              Clear All
            </button>
          </div>

          <!-- Comparison Table -->
          <div class="comparison-table-container">
            ${renderComparisonTable()}
          </div>

          <!-- Action Buttons -->
          <div class="mt-8 pt-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 -mx-6 px-6 pb-6">
            <div class="flex flex-wrap gap-3 justify-center">
              <!-- Refresh Button -->
              <button class="btn btn-outline hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5" 
                      onclick="refreshComparisonData()" 
                      title="Refresh data from backend">
                <i class="fa-solid fa-refresh mr-2"></i>
                Refresh Data
              </button>
              
              <!-- Export Button -->
              <button class="btn btn-outline hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5" 
                      onclick="exportComparison()"
                      title="Export comparison as PDF or Excel">
                <i class="fa-solid fa-download mr-2"></i>
                Export
              </button>
              
              <!-- Share Button -->
              <button class="btn btn-secondary hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5" 
                      onclick="shareComparison()"
                      title="Share comparison with others">
                <i class="fa-solid fa-share mr-2"></i>
                Share
              </button>
              
              <!-- Print Button -->
              <button class="btn btn-outline hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5" 
                      onclick="printComparison()"
                      title="Print comparison table">
                <i class="fa-solid fa-print mr-2"></i>
                Print
              </button>
              
              <!-- Done Button -->
              <button class="btn btn-primary px-8 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5" 
                      onclick="closeComparisonModal()"
                      title="Close comparison modal">
                <i class="fa-solid fa-check mr-2"></i>
                Done
              </button>
            </div>
            
            <!-- Comparison Stats -->
            <div class="mt-4 text-center text-sm text-gray-600">
              <i class="fa-solid fa-info-circle mr-1"></i>
              Comparing ${comparisonProducts.length} products • 
              <span id="visible-criteria-count">All features</span> shown
            </div>
          </div>
        </div>
      </div>
    </div>
  `)

  // Initialize comparison modal
  initializeComparisonModal(modal)

  return modal
}

/**
 * Render comparison table
 */
function renderComparisonTable() {
  // Safety check
  if (!comparisonProducts || comparisonProducts.length === 0) {
    return `
      <div class="text-center py-8">
        <i class="fa-solid fa-balance-scale text-4xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">No products to compare</p>
      </div>
    `
  }

  // Ensure all products have required properties with proper field mapping
  const safeProducts = comparisonProducts.map(product => {
    console.log('🔍 Processing product for comparison:', product)
    
    // Map different field names from backend/mock data
    const mappedProduct = {
      id: product.id || 'N/A',
      name: product.name || 'Unknown Product',
      price: product.price || 0,
      image: product.image || '/images/placeholder.jpg',
      category: product.category?.name || product.category || 'N/A',
      brand: product.brand?.name || product.brand || 'N/A',
      description: product.description || 'No description available',
      
      // Map rating fields - handle different naming conventions
      average_rating: product.average_rating || product.rating || 0,
      total_reviews: product.total_reviews || product.reviews_count || 0,
      
      // Map stock fields
      in_stock: product.in_stock !== undefined ? product.in_stock : (product.stock > 0),
      stock_quantity: product.stock_quantity || product.stock || 0,
      
      // Map store information
      store: product.store?.name || product.store || 'N/A',
      
      // Map discount information
      discount_percentage: product.discount_percentage || 0,
      final_price: product.final_price || (product.price * (1 - (product.discount_percentage || 0) / 100)),
      
      // Keep all original properties
      ...product
    }
    
    console.log('✅ Mapped product:', mappedProduct)
    return mappedProduct
  })

  // Define comparison criteria with backend field mapping
  const criteria = [
    { key: 'basic', label: 'Basic Information', items: [
      { key: 'name', label: 'Product Name', type: 'text', backendField: 'name' },
      { key: 'category', label: 'Category', type: 'text', backendField: 'category.name' },
      { key: 'brand', label: 'Brand', type: 'text', backendField: 'brand.name' },
      { key: 'description', label: 'Description', type: 'text', backendField: 'description' },
      { key: 'sku', label: 'SKU', type: 'text', backendField: 'sku' }
    ]},
    { key: 'pricing', label: 'Pricing', items: [
      { key: 'price', label: 'Original Price', type: 'currency', backendField: 'price' },
      { key: 'discount_percentage', label: 'Discount', type: 'percentage', backendField: 'discount_percentage' },
      { key: 'final_price', label: 'Final Price', type: 'currency', backendField: 'final_price' },
      { key: 'currency', label: 'Currency', type: 'text', backendField: 'currency' }
    ]},
    { key: 'ratings', label: 'Ratings & Reviews', items: [
      { key: 'average_rating', label: 'Average Rating', type: 'rating', backendField: ['average_rating', 'rating'] },
      { key: 'total_reviews', label: 'Total Reviews', type: 'number', backendField: ['total_reviews', 'reviews_count'] },
      { key: 'recommendation_rate', label: 'Recommendation Rate', type: 'percentage', backendField: 'recommendation_rate' }
    ]},
    { key: 'availability', label: 'Availability', items: [
      { key: 'in_stock', label: 'In Stock', type: 'boolean', backendField: 'in_stock' },
      { key: 'stock_quantity', label: 'Stock Quantity', type: 'number', backendField: ['stock_quantity', 'stock'] },
      { key: 'store', label: 'Store', type: 'text', backendField: 'store.name' }
    ]},
    { key: 'specifications', label: 'Specifications', items: [
      { key: 'weight', label: 'Weight', type: 'text', backendField: 'specifications.weight' },
      { key: 'dimensions', label: 'Dimensions', type: 'text', backendField: 'specifications.dimensions' },
      { key: 'color', label: 'Color', type: 'text', backendField: 'specifications.color' },
      { key: 'material', label: 'Material', type: 'text', backendField: 'specifications.material' }
    ]}
  ]

  console.log('📋 Comparison criteria defined:', criteria.length, 'sections')

  return `
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <!-- Product Headers -->
        <thead>
          <tr class="bg-gray-50">
            <th class="text-left p-4 font-semibold text-gray-800 border-b border-gray-200 sticky left-0 bg-gray-50 z-10 min-w-[200px]">
              Features
            </th>
            ${safeProducts.map((product, index) => `
              <th class="border-b border-gray-200 min-w-[280px] max-w-[320px] relative">
                <div class="p-4 space-y-4">
                  <!-- Remove Button - Top Right -->
                  <button class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-all duration-200 z-10 shadow-sm border border-red-200 hover:border-red-500" 
                          onclick="confirmRemoveProduct(${product.id}, '${product.name.replace(/'/g, '&apos;')}')"
                          title="Remove ${product.name.replace(/'/g, '&apos;')} from comparison">
                    <i class="fa-solid fa-times text-xs"></i>
                  </button>
                  
                  <!-- Product Image -->
                  <div class="w-24 h-24 mx-auto mb-3 relative">
                    <img src="${product.image_urls?.[0] || product.image || '/assets/placeholder-product.svg'}" 
                         alt="${product.name}"
                         class="w-full h-full object-cover rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPgogIDxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNWU3ZWIiIHJ4PSI4Ii8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjE1IiBmaWxsPSIjZDFkNWRiIi8+CiAgPHJlY3QgeD0iMTMwIiB5PSI3MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgiIGZpbGw9IiNkMWQ1ZGIiIHJ4PSI0Ii8+CiAgPHJlY3QgeD0iMTMwIiB5PSI4NSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjgiIGZpbGw9IiNkMWQ1ZGIiIHJ4PSI0Ii8+CiAgPHRleHQgeD0iMTUwIiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';">
                    <!-- Product Index Badge -->
                    <div class="absolute -top-2 -left-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                      ${index + 1}
                    </div>
                  </div>
                  
                  <!-- Product Info -->
                  <div class="text-center space-y-2">
                    <!-- Product Name -->
                    <h4 class="font-semibold text-gray-800 text-sm leading-tight px-2" 
                        style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5rem;">
                      ${product.name}
                    </h4>
                    
                    <!-- Product Category & Brand -->
                    <div class="space-y-1">
                      ${product.category ? `<p class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">${product.category}</p>` : ''}
                      ${product.brand ? `<p class="text-xs text-gray-600 font-medium">${product.brand}</p>` : ''}
                    </div>
                    
                    <!-- Quick Price Info -->
                    ${product.final_price ? `
                      <div class="text-center">
                        <span class="text-lg font-bold text-secondary">${formatCurrency(product.final_price)}</span>
                        ${product.discount_percentage > 0 ? `
                          <div class="text-xs text-gray-500">
                            <span class="line-through">${formatCurrency(product.price)}</span>
                            <span class="text-green-600 font-medium ml-1">${product.discount_percentage}% OFF</span>
                          </div>
                        ` : ''}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>

        <!-- Comparison Rows -->
        <tbody>
          ${criteria.map(section => `
            <!-- Section Header -->
            <tr class="comparison-section" data-section="${section.key}">
              <td colspan="${safeProducts.length + 1}" class="bg-blue-50 p-3 font-semibold text-primary border-b border-gray-200">
                <i class="fa-solid fa-chevron-down mr-2 section-toggle cursor-pointer" onclick="toggleSection('${section.key}')"></i>
                ${section.label}
              </td>
            </tr>
            
            <!-- Section Items -->
            ${section.items.map(item => `
              <tr class="comparison-row section-${section.key}" data-criteria="${section.key}">
                <td class="p-4 font-medium text-gray-700 border-b border-gray-100 sticky left-0 bg-white z-10">
                  ${item.label}
                </td>
                ${safeProducts.map(product => `
                  <td class="p-4 text-center border-b border-gray-100">
                    ${renderComparisonValue(product, item)}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          `).join('')}
          
          <!-- Action Row -->
          <tr class="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
            <td class="p-6 font-semibold text-gray-800 sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10">
              <div class="flex items-center">
                <i class="fa-solid fa-bolt text-primary mr-2"></i>
                Quick Actions
              </div>
            </td>
            ${safeProducts.map(product => `
              <td class="p-6 text-center">
                <div class="space-y-3">
                  <!-- View Details Button -->
                  <button class="btn btn-primary btn-sm w-full hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5" 
                          onclick="viewProduct(${product.id})"
                          title="View detailed information about ${product.name.replace(/'/g, '&apos;')}">
                    <i class="fa-solid fa-eye mr-2"></i>
                    View Details
                  </button>
                  
                  <!-- Add to Cart Button -->
                  <button class="btn btn-secondary btn-sm w-full hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5" 
                          onclick="addToCartFromComparison(${product.id})"
                          title="Add ${product.name.replace(/'/g, '&apos;')} to your cart">
                    <i class="fa-solid fa-shopping-cart mr-2"></i>
                    Add to Cart
                  </button>
                  
                  <!-- Quick Compare Toggle -->
                  <button class="btn btn-outline btn-sm w-full text-xs hover:shadow-md transition-all duration-200" 
                          onclick="toggleProductHighlight(${product.id})"
                          title="Highlight this product in comparison">
                    <i class="fa-solid fa-star mr-1"></i>
                    Highlight
                  </button>
                </div>
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `
}

/**
 * Render comparison value based on type
 */
function renderComparisonValue(product, item) {
  if (!product || !item) return 'N/A'
  
  console.log(`🔍 Rendering value for ${item.key} in product ${product.name}`)
  
  // Get value using backend field mapping
  let value = null
  
  if (item.backendField) {
    if (Array.isArray(item.backendField)) {
      // Try multiple field names (for compatibility)
      for (const field of item.backendField) {
        try {
          value = getNestedValue(product, field)
          if (value !== null && value !== undefined) {
            console.log(`✅ Found value using field: ${field}`, value)
            break
          }
        } catch (error) {
          console.warn(`⚠️ Error getting value from ${field}:`, error)
        }
      }
    } else {
      // Single field name
      try {
        value = getNestedValue(product, item.backendField)
        console.log(`🔍 Value from ${item.backendField}:`, value)
      } catch (error) {
        console.warn(`⚠️ Error getting value from ${item.backendField}:`, error)
      }
    }
  }
  
  // Fallback to item key if no backend field mapping worked
  if (value === null || value === undefined) {
    try {
      value = getNestedValue(product, item.key)
      console.log(`🔄 Fallback to ${item.key}:`, value)
    } catch (error) {
      console.warn('⚠️ Error getting fallback value for', item.key, error)
      return 'N/A'
    }
  }
  
  console.log(`📊 Final value for ${item.key}:`, value)
  
  switch (item.type) {
    case 'currency':
      return value ? `<span class="font-semibold text-secondary">${formatCurrency(value)}</span>` : 'N/A'
    
    case 'percentage':
      if (item.key === 'discount') {
        value = product.discount_percentage || 0
        return value > 0 ? `<span class="text-green-600 font-semibold">${value}% OFF</span>` : 'No Discount'
      }
      if (item.key === 'recommendation_rate') {
        const rate = product.average_rating ? Math.round((product.average_rating / 5) * 100) : 0
        return `<span class="font-semibold">${rate}%</span>`
      }
      return value ? `${value}%` : 'N/A'
    
    case 'rating':
      // Handle both average_rating and rating fields
      const ratingValue = product.average_rating || product.rating || 0
      console.log(`🌟 Rating for ${product.name}:`, ratingValue, 'from product:', product)
      
      if (!ratingValue || ratingValue === 0) return '<span class="text-gray-500 text-sm">No Rating</span>'
      
      return `
        <div class="flex items-center justify-center gap-2">
          <div class="flex text-yellow-400 text-sm">
            ${Array.from({length: 5}, (_, i) => `
              <i class="fa-solid fa-star ${i < Math.floor(ratingValue) ? '' : 'text-gray-300'}"></i>
            `).join('')}
          </div>
          <span class="font-semibold text-gray-800">${ratingValue.toFixed(1)}</span>
        </div>
      `
    
    case 'boolean':
      if (item.key === 'in_stock') {
        return value ? 
          '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">In Stock</span>' :
          '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Out of Stock</span>'
      }
      return value ? 'Yes' : 'No'
    
    case 'number':
      // Handle total_reviews specifically
      if (item.key === 'total_reviews') {
        const reviewsValue = product.total_reviews || product.reviews_count || 0
        console.log(`📊 Reviews for ${product.name}:`, reviewsValue, 'from product:', product)
        return reviewsValue > 0 ? reviewsValue.toLocaleString() : '0'
      }
      
      return value !== null && value !== undefined ? value.toLocaleString() : 'N/A'
    
    case 'text':
    default:
      if (item.key === 'category') {
        return product.category?.name || 'Uncategorized'
      }
      if (item.key === 'brand') {
        return product.brand?.name || product.brand || 'N/A'
      }
      if (item.key === 'store') {
        return product.store?.name || 'N/A'
      }
      if (item.key === 'description') {
        return value ? `<div class="text-sm text-gray-600 line-clamp-3">${value}</div>` : 'No description'
      }
      if (item.key === 'final_price') {
        const originalPrice = product.price || 0
        const discount = product.discount_percentage || 0
        const finalPrice = product.final_price || (originalPrice * (1 - discount / 100))
        console.log(`💰 Final price for ${product.name}:`, finalPrice, 'original:', originalPrice, 'discount:', discount)
        return `<span class="font-semibold text-secondary">${formatCurrency(finalPrice)}</span>`
      }
      if (item.key === 'stock_quantity') {
        const stockValue = product.stock_quantity || product.stock || 0
        console.log(`📦 Stock for ${product.name}:`, stockValue, 'from product:', product)
        return stockValue > 0 ? stockValue.toLocaleString() : '0'
      }
      return value || 'N/A'
  }
}

/**
 * Get nested object value
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Initialize comparison modal
 */
function initializeComparisonModal(modal) {
  // Handle escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeComparisonModal()
      document.removeEventListener('keydown', handleEscape)
    }
  }
  document.addEventListener('keydown', handleEscape)

  // Handle criteria filtering (backup event listener)
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('comparison-criteria')) {
      console.log('🎯 Criteria button clicked via event listener:', e.target.dataset.criteria)
      
      // Only handle if onclick didn't work
      if (!e.target.onclick) {
        // Prevent default behavior
        e.preventDefault()
        e.stopPropagation()
        
        // Get criteria from button
        const criteria = e.target.dataset.criteria
        
        // Filter comparison rows
        filterComparisonRows(modal, criteria)
        
        // Track criteria selection for analytics
        trackCriteriaSelection(criteria)
      }
    }
  })
  
  // Initialize with user's preferred criteria or 'all'
  setTimeout(() => {
    const preferredCriteria = localStorage.getItem('preferred_comparison_criteria') || 'all'
    console.log('🎯 Initializing with preferred criteria:', preferredCriteria)
    filterComparisonRows(modal, preferredCriteria)
  }, 100)
}

/**
 * Filter comparison rows based on criteria
 */
function filterComparisonRows(modal, criteria) {
  console.log('🔍 Filtering comparison rows by criteria:', criteria)
  
  try {
    const rows = modal.querySelectorAll('.comparison-row')
    const sections = modal.querySelectorAll('.comparison-section')
    
    console.log(`📊 Found ${rows.length} rows and ${sections.length} sections`)
    
    if (criteria === 'all') {
      console.log('👁️ Showing all sections and rows')
      // Show all rows and sections
      rows.forEach(row => {
        row.style.display = ''
        row.classList.remove('hidden')
      })
      sections.forEach(section => {
        section.style.display = ''
        section.classList.remove('hidden')
      })
    } else {
      console.log(`🎯 Filtering for criteria: ${criteria}`)
      
      // Hide all sections first
      sections.forEach(section => {
        const sectionKey = section.dataset.section
        if (sectionKey === criteria) {
          console.log(`✅ Showing section: ${sectionKey}`)
          section.style.display = ''
          section.classList.remove('hidden')
        } else {
          console.log(`❌ Hiding section: ${sectionKey}`)
          section.style.display = 'none'
          section.classList.add('hidden')
        }
      })
      
      // Filter rows based on criteria
      rows.forEach(row => {
        const rowCriteria = row.dataset.criteria
        if (rowCriteria === criteria) {
          console.log(`✅ Showing row for criteria: ${rowCriteria}`)
          row.style.display = ''
          row.classList.remove('hidden')
        } else {
          console.log(`❌ Hiding row for criteria: ${rowCriteria}`)
          row.style.display = 'none'
          row.classList.add('hidden')
        }
      })
    }
    
    // Update active button state
    updateCriteriaButtonState(modal, criteria)
    
    console.log('✅ Filtering completed successfully')
    
  } catch (error) {
    console.error('❌ Error filtering comparison rows:', error)
  }
}

/**
 * Update criteria button active state
 */
function updateCriteriaButtonState(modal, activeCriteria) {
  console.log('🎨 Updating criteria button state for:', activeCriteria)
  
  try {
    const buttons = modal.querySelectorAll('.comparison-criteria')
    
    buttons.forEach(button => {
      const buttonCriteria = button.dataset.criteria
      
      if (buttonCriteria === activeCriteria) {
        // Activate button
        button.classList.remove('btn-outline')
        button.classList.add('btn-primary', 'active')
        console.log(`✅ Activated button: ${buttonCriteria}`)
      } else {
        // Deactivate button
        button.classList.remove('btn-primary', 'active')
        button.classList.add('btn-outline')
        console.log(`❌ Deactivated button: ${buttonCriteria}`)
      }
    })
    
    // Update criteria count display
    updateCriteriaCount(modal, activeCriteria)
    
  } catch (error) {
    console.error('❌ Error updating button state:', error)
  }
}

/**
 * Update criteria count display
 */
function updateCriteriaCount(modal, activeCriteria) {
  try {
    const countElement = modal.querySelector('#visible-criteria-count')
    if (!countElement) return
    
    const criteriaLabels = {
      'all': 'All features',
      'basic': 'Basic information',
      'pricing': 'Pricing details',
      'ratings': 'Ratings & reviews',
      'availability': 'Availability info',
      'specifications': 'Specifications'
    }
    
    countElement.textContent = criteriaLabels[activeCriteria] || 'Selected criteria'
    
  } catch (error) {
    console.error('❌ Error updating criteria count:', error)
  }
}

/**
 * Track criteria selection for analytics
 */
function trackCriteriaSelection(criteria) {
  console.log('📊 Tracking criteria selection:', criteria)
  
  try {
    // Track user behavior for analytics
    if (window.gtag) {
      gtag('event', 'comparison_criteria_selected', {
        'criteria': criteria,
        'timestamp': new Date().toISOString()
      })
    }
    
    // Store user preference
    localStorage.setItem('preferred_comparison_criteria', criteria)
    
  } catch (error) {
    console.warn('⚠️ Failed to track criteria selection:', error)
  }
}

/**
 * Save comparisons to localStorage
 */
function saveComparisons() {
  try {
    localStorage.setItem('product_comparisons', JSON.stringify(comparisonProducts))
  } catch (error) {
    console.error('Failed to save comparisons:', error)
  }
}

/**
 * Load saved comparisons from localStorage
 */
function loadSavedComparisons() {
  try {
    const saved = localStorage.getItem('product_comparisons')
    if (saved) {
      comparisonProducts = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load saved comparisons:', error)
    comparisonProducts = []
  }
}

/**
 * Update comparison badge in navbar
 */
function updateComparisonBadge() {
  const badges = document.querySelectorAll('.comparison-badge')
  badges.forEach(badge => {
    if (comparisonProducts.length > 0) {
      badge.textContent = comparisonProducts.length
      badge.style.display = 'flex'
    } else {
      badge.style.display = 'none'
    }
  })
}

/**
 * Send comparison to backend for AI analysis
 */
async function sendComparisonToBackend(productIds) {
  try {
    console.log('Sending comparison to backend:', productIds)
    
    const response = await comparisonService.createComparison(productIds)
    
    if (response && response.ai_analysis) {
      console.log('AI analysis received:', response.ai_analysis)
      return response
    }
    
    return null
    
  } catch (error) {
    console.error('Error sending comparison to backend:', error)
    return null
  }
}

/**
 * Setup global functions
 */
function setupGlobalFunctions() {
  window.openComparisonModal = function() {
    try {
      console.log('Opening comparison modal...')
      console.log('Current comparison products:', comparisonProducts.length)
      
      // Create and show modal
      createComparisonModal()
      
    } catch (error) {
      console.error('Error opening comparison modal:', error)
      showToast('Failed to open comparison', 'error')
      // Ensure body scroll is restored
      modalManager.closeModal('comparison-modal')
    }
  }

  // Handle modal backdrop click
  window.handleComparisonModalClick = function(event) {
    // Only close if clicking the backdrop (not the modal content)
    if (event.target.id === 'comparison-modal' || event.target.classList.contains('modal-overlay')) {
      closeComparisonModal()
    }
  }

  window.closeComparisonModal = function() {
    try {
      console.log('🚪 Closing comparison modal...')
      
      const modal = document.getElementById('comparison-modal')
      const loadingModal = document.getElementById('comparison-loading')
      
      if (modal) {
        // Add closing animation
        modal.classList.add('modal-exit')
        
        // Remove after animation
        setTimeout(() => {
          modal.remove()
          console.log('✅ Comparison modal removed')
        }, 300)
      }
      
      if (loadingModal) {
        loadingModal.remove()
        console.log('✅ Loading modal removed')
      }
      
      // Use modal manager to restore scroll properly
      modalManager.closeModal('comparison-modal')
      
      console.log('✅ Comparison modal cleanup completed')
      
    } catch (error) {
      console.error('❌ Error closing comparison modal:', error)
      // Force restore body scroll even on error
      modalManager.closeModal('comparison-modal')
      
      // Force remove modal on error
      const modal = document.getElementById('comparison-modal')
      if (modal) modal.remove()
      const loadingModal = document.getElementById('comparison-loading')
      if (loadingModal) loadingModal.remove()
    }
  }

  // Add missing global functions
  window.viewProduct = function(productId) {
    location.hash = `#/products/${productId}`
  }

  window.addToCartFromComparison = function(productId) {
    // Find product in comparison
    const product = comparisonProducts.find(p => p.id == productId)
    if (product && window.addToCart) {
      window.addToCart(product)
      showToast(`${product.name} added to cart!`, 'success')
    }
  }

  window.exportComparison = function() {
    if (comparisonProducts.length === 0) {
      showToast('No products to export', 'warning')
      return
    }
    
    // Create CSV content
    const headers = ['Product Name', 'Price', 'Category', 'Brand', 'Rating']
    const rows = comparisonProducts.map(product => [
      product.name || 'N/A',
      product.price || 'N/A',
      product.category?.name || product.category || 'N/A',
      product.brand || 'N/A',
      product.average_rating || 'N/A'
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-comparison.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showToast('Comparison exported successfully!', 'success')
  }

  window.shareComparison = function() {
    if (navigator.share) {
      navigator.share({
        title: 'Product Comparison',
        text: `Compare ${comparisonProducts.length} products`,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(window.location.href)
        showToast('Comparison link copied to clipboard!', 'success')
      } else {
        showToast('Sharing not supported on this device', 'info')
      }
    }
  }

  window.toggleSection = function(sectionKey) {
    const rows = document.querySelectorAll(`.section-${sectionKey}`)
    const toggle = document.querySelector(`[onclick="toggleSection('${sectionKey}')"]`)
    
    if (rows.length > 0) {
      const isHidden = rows[0].style.display === 'none'
      rows.forEach(row => {
        row.style.display = isHidden ? '' : 'none'
      })
      
      if (toggle) {
        toggle.className = isHidden ? 
          'fa-solid fa-chevron-down mr-2 section-toggle cursor-pointer' :
          'fa-solid fa-chevron-right mr-2 section-toggle cursor-pointer'
      }
    }
  }

  window.updateComparisonModal = function() {
    const modal = document.getElementById('comparison-modal')
    if (modal) {
      const container = modal.querySelector('.comparison-table-container')
      if (container) {
        container.innerHTML = renderComparisonTable()
      }
    }
  }

  // Function to confirm clearing all comparisons
  window.confirmClearComparisons = function() {
    console.log('🤔 Requesting confirmation to clear all comparisons')
    
    const productCount = comparisonProducts.length
    
    if (productCount === 0) {
      showToast('No products in comparison', 'info')
      return
    }
    
    // Create confirmation dialog
    const confirmed = confirm(`Are you sure you want to remove all ${productCount} products from comparison?`)
    
    if (confirmed) {
      console.log('✅ User confirmed clearing all comparisons')
      clearComparisons()
    } else {
      console.log('❌ User cancelled clearing comparisons')
    }
  }

  // Function to refresh product data from backend
  window.refreshComparisonData = async function() {
    console.log('🔄 Refreshing comparison data from backend...')
    
    try {
      const { productService } = await import('../services/api.js')
      const updatedProducts = []
      
      for (const product of comparisonProducts) {
        console.log(`🔄 Refreshing data for product: ${product.name}`)
        
        try {
          // Get fresh data from backend
          const freshData = await productService.getProductById(product.id)
          if (freshData) {
            console.log(`✅ Fresh data received for ${product.name}:`, freshData)
            
            // Ensure all comparison fields are mapped correctly
            const mappedData = mapBackendDataForComparison(freshData)
            updatedProducts.push(mappedData)
          } else {
            console.log(`⚠️ No fresh data for ${product.name}, keeping existing`)
            updatedProducts.push(product)
          }
        } catch (error) {
          console.error(`❌ Failed to refresh ${product.name}:`, error)
          updatedProducts.push(product)
        }
      }
      
      // Update comparison products with fresh data
      comparisonProducts.splice(0, comparisonProducts.length, ...updatedProducts)
      saveComparisons()
      
      // Update modal if open
      updateComparisonModal()
      
      console.log('✅ Comparison data refreshed successfully')
      showToast('Comparison data updated', 'success')
      
    } catch (error) {
      console.error('❌ Failed to refresh comparison data:', error)
      showToast('Failed to refresh data', 'error')
    }
  }

  // Function to map backend data for comparison
  window.mapBackendDataForComparison = function(backendData) {
    console.log('🗺️ Mapping backend data for comparison:', backendData)
    
    try {
      const mappedData = {
        // Basic fields
        id: backendData.id,
        name: backendData.name || backendData.title,
        description: backendData.description,
        sku: backendData.sku || backendData.product_code,
        
        // Category mapping
        category: backendData.category?.name || backendData.category_name || 'Uncategorized',
        
        // Brand mapping
        brand: backendData.brand?.name || backendData.brand_name || backendData.brand || 'N/A',
        
        // Pricing mapping
        price: backendData.price || backendData.original_price || 0,
        discount_percentage: backendData.discount_percentage || backendData.discount || 0,
        final_price: backendData.final_price || backendData.sale_price || 
                    (backendData.price * (1 - (backendData.discount_percentage || 0) / 100)),
        currency: backendData.currency || 'USD',
        
        // Rating mapping - handle multiple field names
        average_rating: backendData.average_rating || backendData.rating || backendData.avg_rating || 0,
        rating: backendData.rating || backendData.average_rating || 0,
        total_reviews: backendData.total_reviews || backendData.reviews_count || backendData.review_count || 0,
        reviews_count: backendData.reviews_count || backendData.total_reviews || 0,
        recommendation_rate: backendData.recommendation_rate || backendData.recommend_percentage || 0,
        
        // Stock mapping
        in_stock: backendData.in_stock !== undefined ? backendData.in_stock : (backendData.stock > 0),
        stock_quantity: backendData.stock_quantity || backendData.stock || backendData.inventory || 0,
        stock: backendData.stock || backendData.stock_quantity || 0,
        
        // Store mapping
        store: backendData.store?.name || backendData.store_name || backendData.seller || 'N/A',
        
        // Images mapping
        image_urls: backendData.image_urls || backendData.images || [backendData.image],
        image: backendData.image || backendData.image_urls?.[0] || backendData.thumbnail,
        
        // Specifications mapping
        specifications: {
          weight: backendData.specifications?.weight || backendData.weight,
          dimensions: backendData.specifications?.dimensions || backendData.dimensions,
          color: backendData.specifications?.color || backendData.color,
          material: backendData.specifications?.material || backendData.material
        },
        
        // Keep all original data
        ...backendData
      }
      
      console.log('✅ Mapped data for comparison:', mappedData)
      return mappedData
      
    } catch (error) {
      console.error('❌ Error mapping backend data:', error)
      return backendData // Return original data if mapping fails
    }
  }

  window.toggleSection = function(sectionKey) {
    const rows = document.querySelectorAll(`.section-${sectionKey}`)
    const toggle = document.querySelector(`[onclick="toggleSection('${sectionKey}')"]`)
    
    const isVisible = rows[0]?.style.display !== 'none'
    
    rows.forEach(row => {
      row.style.display = isVisible ? 'none' : ''
    })
    
    if (toggle) {
      toggle.classList.toggle('fa-chevron-down', !isVisible)
      toggle.classList.toggle('fa-chevron-right', isVisible)
    }
  }

  window.viewProduct = function(productId) {
    const product = comparisonProducts.find(p => p.id === productId)
    if (product) {
      trackProductClick(product, null, 'comparison_modal')
      location.hash = `/products/${product.slug || product.id}`
      closeComparisonModal()
    }
  }

  window.addToCartFromComparison = async function(productId) {
    const product = comparisonProducts.find(p => p.id === productId)
    if (product) {
      try {
        // Use the global addToCart function if available
        if (window.addToCart) {
          await window.addToCart(product.slug || product.id)
        } else {
          showToast('Add to cart functionality not available', 'error')
        }
      } catch (error) {
        console.error('Failed to add to cart from comparison:', error)
        showToast('Failed to add to cart', 'error')
      }
    }
  }

  // Handle criteria button clicks
  window.handleCriteriaClick = function(criteria, buttonElement) {
    console.log('🎯 Criteria button clicked:', criteria)
    
    try {
      // Prevent default behavior
      event.preventDefault()
      event.stopPropagation()
      
      // Get the modal
      const modal = document.getElementById('comparison-modal')
      if (!modal) {
        console.error('❌ Comparison modal not found')
        return
      }
      
      // Filter comparison rows
      filterComparisonRows(modal, criteria)
      
      // Track criteria selection
      trackCriteriaSelection(criteria)
      
      console.log('✅ Criteria filtering completed for:', criteria)
      
    } catch (error) {
      console.error('❌ Error handling criteria click:', error)
    }
  }



  // Make functions globally accessible
  window.removeFromComparison = removeFromComparison
  window.clearComparisons = clearComparisons
  window.getComparisonProducts = getComparisonProducts
  window.isInComparison = isInComparison
  window.addToComparison = addToComparison
  window.filterComparisonRows = filterComparisonRows
  window.updateCriteriaButtonState = updateCriteriaButtonState


}

// ===== GLOBAL FUNCTIONS FOR COMPARISON UI =====

// Confirm product removal with nice dialog
window.confirmRemoveProduct = function(productId, productName) {
  console.log('🗑️ Confirming removal of product:', productName)
  
  try {
    // Create custom confirmation dialog
    const confirmDialog = document.createElement('div')
    confirmDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]'
    confirmDialog.innerHTML = `
      <div class="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl transform transition-all">
        <div class="text-center">
          <!-- Icon -->
          <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <i class="fa-solid fa-trash text-red-500 text-2xl"></i>
          </div>
          
          <!-- Title -->
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Remove Product</h3>
          
          <!-- Message -->
          <p class="text-gray-600 mb-6">
            Are you sure you want to remove <strong>"${productName}"</strong> from the comparison?
          </p>
          
          <!-- Buttons -->
          <div class="flex gap-3 justify-center">
            <button class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200" 
                    onclick="closeRemoveDialog()">
              Cancel
            </button>
            <button class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200" 
                    onclick="confirmRemoveProductAction(${productId}, '${productName}')">
              <i class="fa-solid fa-trash mr-2"></i>
              Remove
            </button>
          </div>
        </div>
      </div>
    `
    
    document.body.appendChild(confirmDialog)
    
    // Add animation
    setTimeout(() => {
      confirmDialog.querySelector('div > div').style.transform = 'scale(1)'
      confirmDialog.querySelector('div > div').style.opacity = '1'
    }, 10)
    
  } catch (error) {
    console.error('❌ Error showing remove confirmation:', error)
    // Fallback to simple confirm
    if (confirm(`Are you sure you want to remove "${productName}" from comparison?`)) {
      window.removeFromComparison(productId)
    }
  }
}

// Close remove dialog
window.closeRemoveDialog = function() {
  const dialog = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
  if (dialog) {
    dialog.remove()
  }
}

// Confirm and execute removal
window.confirmRemoveProductAction = function(productId, productName) {
  console.log('✅ Confirmed removal of product:', productName)
  
  try {
    // Close dialog
    window.closeRemoveDialog()
    
    // Show loading state
    showToast('Removing product...', 'info')
    
    // Remove product
    window.removeFromComparison(productId)
    
    // Show success message
    setTimeout(() => {
      showToast(`"${productName}" removed from comparison`, 'success')
    }, 300)
    
  } catch (error) {
    console.error('❌ Error removing product:', error)
    showToast('Failed to remove product', 'error')
  }
}

// Toggle product highlight in comparison
window.toggleProductHighlight = function(productId) {
  console.log('⭐ Toggling highlight for product:', productId)
  
  try {
    const modal = document.getElementById('comparison-modal')
    if (!modal) return
    
    // Find all cells for this product
    const comparisonProducts = window.getComparisonProducts()
    const productIndex = comparisonProducts.findIndex(p => p.id == productId)
    if (productIndex === -1) return
    
    // Get all table cells for this product column (index + 2 because of Features column)
    const columnIndex = productIndex + 2
    const cells = modal.querySelectorAll(`table tr td:nth-child(${columnIndex}), table tr th:nth-child(${columnIndex})`)
    
    // Check if already highlighted
    const isHighlighted = cells[0]?.classList.contains('highlighted-product')
    
    // Remove highlight from all products first
    modal.querySelectorAll('.highlighted-product').forEach(cell => {
      cell.classList.remove('highlighted-product', 'bg-yellow-50', 'border-yellow-200')
    })
    
    // Toggle highlight for this product
    if (!isHighlighted) {
      cells.forEach(cell => {
        cell.classList.add('highlighted-product', 'bg-yellow-50', 'border-yellow-200')
      })
      showToast('Product highlighted', 'success')
    } else {
      showToast('Highlight removed', 'info')
    }
    
  } catch (error) {
    console.error('❌ Error toggling product highlight:', error)
  }
}

// Print comparison table
window.printComparison = function() {
  console.log('🖨️ Printing comparison table...')
  
  try {
    const modal = document.getElementById('comparison-modal')
    if (!modal) return
    
    // Get the comparison table
    const table = modal.querySelector('table')
    if (!table) return
    
    // Create print window
    const printWindow = window.open('', '_blank')
    
    // Generate print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Product Comparison - Best on Click</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .product-header { text-align: center; background-color: #f9f9f9; }
          .section-header { background-color: #e3f2fd; font-weight: bold; }
          .price { font-weight: bold; color: #2196F3; }
          .rating { color: #ff9800; }
          img { max-width: 80px; max-height: 80px; object-fit: cover; }
          .print-date { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Product Comparison</h1>
        <div style="text-align: center; margin-bottom: 20px; color: #666;">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
        ${table.outerHTML}
        <div class="print-date">
          Printed from Best on Click - Product Comparison Tool
        </div>
      </body>
      </html>
    `
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
    
    showToast('Preparing print...', 'info')
    
  } catch (error) {
    console.error('❌ Error printing comparison:', error)
    showToast('Failed to print comparison', 'error')
  }
}

// Export functions for use in other components
export {
  addToComparison,
  removeFromComparison,
  clearComparisons,
  getComparisonProducts,
  isInComparison,
  createComparisonModal
}