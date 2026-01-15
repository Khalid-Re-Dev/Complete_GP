import { createElementFromHTML } from "../utils/helpers.js?v=2024"
import promotionService from "../services/promotionService.js"
import { CountdownTimer, createPromotionCountdowns } from "../utils/countdown.js"

/**
 * Renders the Promotions Page
 * @returns {HTMLElement} The page element
 */
export default function PromotionsPage() {
  const page = createElementFromHTML(`
    <div class="animate-fade-in">
      <!-- Page Header -->
      <section class="bg-gradient-to-r from-red-50 to-pink-50 py-16">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">
            🎉 Special Offers & Promotions
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't miss out on these amazing deals! Save big on your favorite products.
          </p>
        </div>
      </section>

      <!-- Promotions Content -->
      <section class="py-16">
        <div class="container mx-auto px-4">
          
          <!-- Loading State -->
          <div id="promotions-loading" class="text-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p class="text-gray-600 text-lg">Loading amazing offers...</p>
          </div>

          <!-- Promotions Grid -->
          <div id="promotions-grid" class="hidden">
            <!-- Will be populated dynamically -->
          </div>

          <!-- No Promotions State -->
          <div id="no-promotions" class="text-center py-16 hidden">
            <div class="text-gray-400 text-6xl mb-6">
              <i class="fa-solid fa-tags"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-600 mb-4">No Active Promotions</h3>
            <p class="text-gray-500 mb-8">Check back soon for exciting offers!</p>
            <a href="#/products" class="btn btn-primary">
              Browse Products
            </a>
          </div>

          <!-- Error State -->
          <div id="promotions-error" class="text-center py-16 hidden">
            <div class="text-red-400 text-6xl mb-6">
              <i class="fa-solid fa-exclamation-triangle"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-600 mb-4">Unable to Load Promotions</h3>
            <p class="text-gray-500 mb-8">Please try again later or contact support.</p>
            <button id="retry-promotions" class="btn btn-primary mr-4">
              Try Again
            </button>
            <a href="#/products" class="btn btn-outline">
              Browse Products
            </a>
          </div>

        </div>
      </section>
    </div>
  `)

  // Load promotions
  async function loadPromotions() {
    const loadingEl = document.getElementById('promotions-loading')
    const gridEl = document.getElementById('promotions-grid')
    const noPromosEl = document.getElementById('no-promotions')
    const errorEl = document.getElementById('promotions-error')

    // Check if elements exist
    if (!loadingEl || !gridEl || !noPromosEl || !errorEl) {
      console.warn('⚠️ Promotions page elements not found, skipping promotions loading')
      return
    }

    // Show loading
    loadingEl.classList.remove('hidden')
    gridEl.classList.add('hidden')
    noPromosEl.classList.add('hidden')
    errorEl.classList.add('hidden')

    try {
      console.log('🎯 Loading all promotions...')
      
      const promotions = await promotionService.getActivePromotions()
      
      if (promotions && promotions.length > 0) {
        console.log('✅ Promotions loaded:', promotions)
        
        // Hide loading, show grid
        if (loadingEl) loadingEl.classList.add('hidden')
        if (gridEl) gridEl.classList.remove('hidden')
        
        // Render promotions
        renderPromotionsGrid(promotions, gridEl)
      } else {
        console.log('⚠️ No promotions found')
        if (loadingEl) loadingEl.classList.add('hidden')
        if (noPromosEl) noPromosEl.classList.remove('hidden')
      }
      
    } catch (error) {
      console.error('❌ Error loading promotions:', error)
      if (loadingEl) loadingEl.classList.add('hidden')
      if (errorEl) errorEl.classList.remove('hidden')
    }
  }

  // Render promotions grid
  function renderPromotionsGrid(promotions, container) {
    if (!promotions || promotions.length === 0) return

    const promotionsHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${promotions.map(promo => {
          const formatted = promotionService.formatPromotion(promo)
          
          // Determine card style based on discount type
          let cardClass = 'bg-white'
          let badgeClass = 'bg-blue-500'
          let iconClass = 'fa-tag'
          
          if (formatted.isPercentage) {
            cardClass = 'bg-gradient-to-br from-blue-50 to-blue-100'
            badgeClass = 'bg-blue-500'
            iconClass = 'fa-percentage'
          } else if (formatted.isFixedAmount) {
            cardClass = 'bg-gradient-to-br from-green-50 to-green-100'
            badgeClass = 'bg-green-500'
            iconClass = 'fa-dollar-sign'
          } else if (formatted.isBogo) {
            cardClass = 'bg-gradient-to-br from-purple-50 to-purple-100'
            badgeClass = 'bg-purple-500'
            iconClass = 'fa-gift'
          }

          return `
            <div class="promotion-card ${cardClass} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <!-- Promotion Badge -->
              <div class="relative">
                <div class="absolute top-4 right-4 ${badgeClass} text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                  <i class="fa-solid ${iconClass} mr-1"></i>
                  ${formatted.displayValue}
                </div>
                
                <!-- Promotion Header -->
                <div class="p-6 pb-4">
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 ${badgeClass} rounded-full flex items-center justify-center text-white text-xl mr-4">
                      <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-800">${promo.name}</h3>
                      <p class="text-sm text-gray-600">${formatted.displayText}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Promotion Details -->
              <div class="px-6 pb-6">
                <p class="text-gray-700 mb-4">${promo.description}</p>
                
                <!-- Promotion Info -->
                <div class="space-y-2 mb-6">
                  ${formatted.minimumAmount > 0 ? `
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fa-solid fa-shopping-cart w-4 mr-2"></i>
                      Minimum order: $${formatted.minimumAmount.toFixed(2)}
                    </div>
                  ` : ''}
                  
                  ${formatted.remainingUses > 0 ? `
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fa-solid fa-users w-4 mr-2"></i>
                      ${formatted.remainingUses} uses remaining
                    </div>
                  ` : ''}
                  
                  ${formatted.endDate ? `
                    <div class="text-sm text-gray-600 mb-2">
                      <i class="fa-solid fa-clock w-4 mr-2"></i>
                      Valid until: ${formatted.endDate.toLocaleDateString()}
                    </div>
                    <div id="countdown-${promo.id}" class="mb-2"></div>
                  ` : ''}
                </div>

                <!-- Action Buttons -->
                <div class="flex space-x-3">
                  <a href="#/products" class="flex-1 btn btn-primary text-center">
                    Shop Now
                  </a>
                  <button onclick="copyPromoCode('${promo.code || promo.name}')" 
                          class="btn btn-outline px-4" 
                          title="Copy promotion code">
                    <i class="fa-solid fa-copy"></i>
                  </button>
                </div>
              </div>

              <!-- Progress Bar for Limited Uses -->
              ${promo.max_uses && promo.max_uses > 0 ? `
                <div class="px-6 pb-4">
                  <div class="bg-gray-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300" 
                         style="width: ${Math.max(10, (formatted.remainingUses / promo.max_uses) * 100)}%"></div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1 text-center">
                    ${promo.current_uses || 0} of ${promo.max_uses} used
                  </p>
                </div>
              ` : ''}
            </div>
          `
        }).join('')}
      </div>
    `

    container.innerHTML = promotionsHTML
    
    // Initialize countdown timers
    setTimeout(() => {
      createPromotionCountdowns(promotions)
    }, 100)
  }

  // Copy promotion code function
  window.copyPromoCode = function(code) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        // Show success message
        const toast = createElementFromHTML(`
          <div class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            <i class="fa-solid fa-check mr-2"></i>
            Promotion code copied!
          </div>
        `)
        document.body.appendChild(toast)
        
        setTimeout(() => {
          toast.remove()
        }, 3000)
      }).catch(() => {
        alert(`Promotion code: ${code}`)
      })
    } else {
      alert(`Promotion code: ${code}`)
    }
  }

  // Retry button handler
  const retryBtn = page.querySelector('#retry-promotions')
  if (retryBtn) {
    retryBtn.addEventListener('click', loadPromotions)
  }

  // Initialize promotions loading after page is returned to DOM
  setTimeout(() => {
    loadPromotions()
  }, 100)

  return page
}