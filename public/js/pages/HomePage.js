import { createElementFromHTML } from "../utils/helpers.js?v=2024"
import { productService } from "../services/api.js"
import { ProductCard } from "../components/ProductCard.js"
import { createRecommendationsSection } from "../components/Recommendations.js"
import promotionService from "../services/promotionService.js"
import { CountdownTimer } from "../utils/countdown.js"

/**
 * Renders the Home Page, inspired by the provided image.
 * @returns {HTMLElement} The page element.
 */
export default function HomePage() {
  const page = createElementFromHTML(`
        <div class="animate-fade-in">
            <!-- Dynamic Promotions Hero Section -->
            <section id="promotions-hero" class="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
                <div class="container mx-auto px-4">
                    <!-- Loading State -->
                    <div id="promotions-loading" class="text-center">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p class="text-gray-600">Loading amazing offers...</p>
                    </div>
                    
                    <!-- Promotions Content -->
                    <div id="promotions-content" class="hidden">
                        <!-- Will be populated dynamically -->
                    </div>
                    
                    <!-- Fallback Content -->
                    <div id="promotions-fallback" class="text-center hidden">
                        <h1 class="text-5xl font-extrabold text-primary mb-4">Best on Click</h1>
                        <p class="text-xl text-gray-600 mb-8">Discover amazing products at great prices</p>
                        <div>
                            <a href="#/products" class="btn btn-primary mr-4">Shop Now</a>
                            <a href="#/compare" class="btn btn-outline">Compare Products</a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Browse By Category -->
            <section class="categories-section py-16">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-12">
                        <h2 class="section-title text-3xl md:text-4xl font-bold mb-4">
                            Browse By Category
                            <span class="block text-lg font-normal text-gray-600 mt-2">Discover our wide range of premium products</span>
                        </h2>
                        <div class="section-divider"></div>

                        <!-- Quick Category Search -->
                        <div class="mt-8 max-w-md mx-auto">
                            <div class="relative">
                                <input
                                    type="text"
                                    id="category-search"
                                    placeholder="Search categories..."
                                    class="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
                                    style="display: none;"
                                >
                                <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <i class="fa-solid fa-search"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="category-grid" class="category-grid">
                        <!-- Loading skeleton -->
                        <div class="category-skeleton"></div>
                        <div class="category-skeleton"></div>
                        <div class="category-skeleton"></div>
                        <div class="category-skeleton"></div>
                        <div class="category-skeleton"></div>
                        <div class="category-skeleton"></div>
                        <div class="category-skeleton"></div>
                        <div class="category-skeleton"></div>
                        <div class="category-skeleton"></div>
                        <div class="category-skeleton"></div>
                        <div class="category-skeleton"></div>
                        <div class="category-skeleton"></div>
                    </div>

                    <!-- Category Statistics -->
                    <div id="category-stats" class="mt-12 text-center" style="display: none;">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                            <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div class="text-2xl font-bold text-secondary" id="total-categories">0</div>
                                <div class="text-sm text-gray-600">Categories</div>
                            </div>
                            <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div class="text-2xl font-bold text-primary" id="total-products">0</div>
                                <div class="text-sm text-gray-600">Products</div>
                            </div>
                            <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div class="text-2xl font-bold text-green-600" id="avg-products">0</div>
                                <div class="text-sm text-gray-600">Avg per Category</div>
                            </div>
                        </div>
                    </div>

                    <!-- View All Categories Button -->
                    <div class="text-center mt-8">
                        <button onclick="location.hash='/products'" class="btn btn-outline group">
                            <span>View All Products</span>
                            <i class="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                        </button>
                    </div>
                </div>
            </section>

            <!-- New Arrivals -->
            <section class="bg-light-gray py-16">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-2xl font-bold">New Arrivals</h2>
                        <a href="#/products" class="text-secondary font-bold">View All &rarr;</a>
                    </div>
                    <div id="new-arrivals-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        <div class="loader"></div>
                    </div>
                </div>
            </section>

            <!-- AI Recommendations Section -->
            <section class="py-16">
                <div class="container mx-auto px-4">
                    <div id="recommendations-section">
                        <!-- Recommendations will be loaded here -->
                    </div>
                </div>
            </section>
            
            <!-- Additional sections like Popular Products can be added here -->
        </div>
    `)

  // Fetch and render products
  const newArrivalsGrid = page.querySelector("#new-arrivals-grid")
  const categoryGrid = page.querySelector("#category-grid")
  const recommendationsSection = page.querySelector("#recommendations-section")

  productService
    .getProducts("page_size=5")
    .then((data) => {
      newArrivalsGrid.innerHTML = data.results.map(ProductCard).join("")
    })
    .catch((err) => {
      newArrivalsGrid.innerHTML = `<p class="text-danger col-span-full text-center">Could not load products.</p>`
    })

  // Initialize AI Recommendations
  if (recommendationsSection) {
    const recommendationsComponent = createRecommendationsSection({
      type: 'personalized', // Will fallback to general if user not authenticated
      limit: 6,
      title: 'Recommended Just for You',
      showTitle: true,
      className: 'mb-8'
    })
    recommendationsSection.appendChild(recommendationsComponent)
  }

  // Fetch all products to generate dynamic categories
  // Load categories with better error handling and loading states
  async function loadCategories() {
    try {
      const data = await productService.getProducts()
      const products = data.results || data

      // Generate categories from actual product data
      const categoryMap = new Map()
      const categoryIcons = {
        "Electronics": "fa-microchip",
        "Clothing": "fa-tshirt",
        "Home & Garden": "fa-home",
        "Sports & Outdoors": "fa-running",
        "Books": "fa-book",
        "Health & Beauty": "fa-heart",
        "Toys & Games": "fa-gamepad",
        "Automotive": "fa-car",
        "Jewelry": "fa-gem",
        "Food & Beverages": "fa-utensils",
        "Office Supplies": "fa-briefcase",
        "Pet Supplies": "fa-paw"
      }

      // Count products per category
      const categoryProductCount = new Map()

      products.forEach(product => {
        if (product.category && product.category.name) {
          const categoryName = product.category.name

          // Count products
          categoryProductCount.set(categoryName, (categoryProductCount.get(categoryName) || 0) + 1)

          // Add to category map if not exists
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, {
              name: categoryName,
              slug: product.category.slug,
              description: product.category.description,
              icon: categoryIcons[categoryName] || "fa-tag",
              productCount: 0
            })
          }
        }
      })

      // Update product counts
      categoryMap.forEach((category, name) => {
        category.productCount = categoryProductCount.get(name) || 0
      })

      const categories = Array.from(categoryMap.values())
        .sort((a, b) => b.productCount - a.productCount) // Sort by product count

      if (categories.length === 0) {
        categoryGrid.innerHTML = `
          <div class="col-span-full text-center py-12">
            <div class="text-gray-400 text-6xl mb-4">
              <i class="fa-solid fa-box-open"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-600 mb-2">No Categories Available</h3>
            <p class="text-gray-500">Categories will be added soon</p>
          </div>
        `
        return
      }

      // Add category statistics
      const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0)
      const avgProductsPerCategory = Math.round(totalProducts / categories.length)

      // Update statistics display with animation
      const statsContainer = document.getElementById('category-stats')
      if (statsContainer) {
        // Animate numbers counting up
        animateNumber('total-categories', 0, categories.length, 1000)
        animateNumber('total-products', 0, totalProducts, 1500)
        animateNumber('avg-products', 0, avgProductsPerCategory, 1200)
        statsContainer.style.display = 'block'
      }

      // Show search box if there are categories
      const searchBox = document.getElementById('category-search')
      if (searchBox && categories.length > 6) {
        searchBox.style.display = 'block'
        setupCategorySearch(categories)
      }

      // Display categories using the new function
      displayCategories(categories.slice(0, 12))
    } catch (error) {
      console.error('Error loading categories:', error)
      categoryGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-danger text-4xl mb-4">
            <i class="fa-solid fa-exclamation-triangle"></i>
          </div>
          <h3 class="text-xl font-bold text-danger mb-2">خطأ في تحميل التصنيفات</h3>
          <p class="text-gray-500 mb-4">حدث خطأ أثناء تحميل التصنيفات. يرجى المحاولة مرة أخرى.</p>
          <button onclick="location.reload()" class="btn btn-outline">
            <i class="fa-solid fa-refresh mr-2"></i>
            إعادة المحاولة
          </button>
        </div>
      `
    }
  }

  // Utility function to animate numbers
  function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId)
    if (!element) return

    const startTime = performance.now()
    const range = end - start

    function updateNumber(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = Math.round(start + (range * easeOutQuart))

      element.textContent = current.toLocaleString()

      if (progress < 1) {
        requestAnimationFrame(updateNumber)
      }
    }

    requestAnimationFrame(updateNumber)
  }

  // Setup category search functionality
  function setupCategorySearch(allCategories) {
    const searchInput = document.getElementById('category-search')
    const categoryGrid = document.getElementById('category-grid')

    if (!searchInput || !categoryGrid) return

    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase().trim()

      if (searchTerm === '') {
        // Show all categories
        displayCategories(allCategories.slice(0, 12))
      } else {
        // Filter categories
        const filteredCategories = allCategories.filter(cat =>
          cat.name.toLowerCase().includes(searchTerm) ||
          (cat.description && cat.description.toLowerCase().includes(searchTerm))
        )
        displayCategories(filteredCategories.slice(0, 12))
      }
    })
  }

  // Function to display categories
  function displayCategories(categories) {
    const categoryGrid = document.getElementById('category-grid')
    if (!categoryGrid) return

    if (categories.length === 0) {
      categoryGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-gray-400 text-4xl mb-4">
            <i class="fa-solid fa-search"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-600 mb-2">No categories found</h3>
          <p class="text-gray-500">Try a different search term</p>
        </div>
      `
      return
    }

    categoryGrid.innerHTML = categories
      .map(
        (cat) => `
          <div class="category-card" onclick="filterByCategory('${cat.slug}', '${cat.name}', this)" tabindex="0" role="button" aria-label="Browse ${cat.name} products">
              <!-- Icon container -->
              <div class="category-icon-container">
                  <i class="fa-solid ${cat.icon}"></i>
              </div>

              <!-- Category info -->
              <div>
                  <h4 class="category-name">${cat.name}</h4>
                  <p class="category-count">
                      ${cat.productCount} ${cat.productCount === 1 ? 'product' : 'products'}
                  </p>
              </div>

              <!-- Hover arrow -->
              <div class="category-arrow">
                  <i class="fa-solid fa-arrow-right"></i>
              </div>
          </div>
      `,
      )
      .join("")
  }

  // Load categories
  loadCategories()

  // Global function for category filtering with enhanced UX
  window.filterByCategory = function(categorySlug, categoryName, element) {
    // Add visual feedback
    const clickedCard = element || document.activeElement
    if (clickedCard && clickedCard.classList.contains('category-card')) {
      clickedCard.style.transform = 'scale(0.95)'
      setTimeout(() => {
        clickedCard.style.transform = ''
      }, 150)
    }

    // Navigate to products page with category filter
    location.hash = `/products?category=${encodeURIComponent(categoryName)}`
  }

  // Add keyboard support for category cards
  document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('category-card') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      e.target.click()
    }
  })

  // Load promotions for hero section
  async function loadPromotions() {
    const loadingEl = document.getElementById('promotions-loading')
    const contentEl = document.getElementById('promotions-content')
    const fallbackEl = document.getElementById('promotions-fallback')

    // Check if elements exist
    if (!loadingEl || !contentEl || !fallbackEl) {
      console.warn('⚠️ Promotion elements not found, skipping promotions loading')
      return
    }

    try {
      console.log('🎯 Loading promotions for homepage...')
      
      // Get featured promotions
      const promotions = await promotionService.getFeaturedPromotions(3)
      
      if (promotions && promotions.length > 0) {
        console.log('✅ Promotions loaded:', promotions)
        
        // Hide loading, show content
        loadingEl.classList.add('hidden')
        contentEl.classList.remove('hidden')
        
        // Render promotions
        renderPromotions(promotions, contentEl)
      } else {
        console.log('⚠️ No promotions found, showing fallback')
        showFallback()
      }
      
    } catch (error) {
      console.error('❌ Error loading promotions:', error)
      showFallback()
    }

    function showFallback() {
      if (loadingEl) loadingEl.classList.add('hidden')
      if (contentEl) contentEl.classList.add('hidden')
      if (fallbackEl) fallbackEl.classList.remove('hidden')
    }
  }

  // Render promotions in hero section
  function renderPromotions(promotions, container) {
    if (!promotions || promotions.length === 0) return

    // Get the main promotion (highest value)
    const mainPromo = promotions[0]
    const formatted = promotionService.formatPromotion(mainPromo)

    // Create main promotion display
    const mainPromoHTML = `
      <div class="text-center mb-8">
        <div class="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
          🔥 LIMITED TIME OFFER
        </div>
        <h1 class="text-5xl font-extrabold text-primary mb-4">
          ${formatted.displayText}
        </h1>
        <p class="text-xl text-gray-600 mb-2">${mainPromo.description}</p>
        ${formatted.minimumAmount > 0 ? 
          `<p class="text-lg text-gray-500 mb-6">Minimum order: $${formatted.minimumAmount.toFixed(2)}</p>` : 
          '<div class="mb-6"></div>'
        }
        <div class="flex justify-center space-x-4">
          <a href="#/products" class="btn btn-primary text-lg px-8 py-3">
            Shop Now & Save
          </a>
          <a href="#/promotions" class="btn btn-outline text-lg px-8 py-3">
            View All Offers
          </a>
        </div>
        ${formatted.endDate ? 
          `<div class="mt-6">
            <div class="text-sm text-gray-500 mb-4">
              <i class="fa-solid fa-clock mr-1"></i>
              Offer ends: ${formatted.endDate.toLocaleDateString()}
            </div>
            <div id="main-countdown" class="mb-4"></div>
          </div>` : ''
        }
      </div>
    `

    // Create additional promotions carousel if more than 1
    let additionalPromosHTML = ''
    if (promotions.length > 1) {
      const otherPromos = promotions.slice(1)
      additionalPromosHTML = `
        <div class="mt-12">
          <h3 class="text-center text-xl font-bold text-gray-700 mb-6">More Great Offers</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            ${otherPromos.map(promo => {
              const fmt = promotionService.formatPromotion(promo)
              return `
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-secondary hover:shadow-lg transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-2xl font-bold text-secondary">${fmt.displayValue}</span>
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      ${fmt.remainingUses} left
                    </span>
                  </div>
                  <h4 class="font-bold text-gray-800 mb-2">${promo.name}</h4>
                  <p class="text-gray-600 text-sm mb-3">${promo.description}</p>
                  ${fmt.minimumAmount > 0 ? 
                    `<p class="text-xs text-gray-500">Min. order: $${fmt.minimumAmount.toFixed(2)}</p>` : ''
                  }
                </div>
              `
            }).join('')}
          </div>
        </div>
      `
    }

    container.innerHTML = mainPromoHTML + additionalPromosHTML
    
    // Initialize main countdown timer
    if (formatted.endDate) {
      setTimeout(() => {
        const countdownContainer = document.getElementById('main-countdown')
        if (countdownContainer) {
          const timer = new CountdownTimer(formatted.endDate, countdownContainer, {
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
            onComplete: () => {
              console.log('Main promotion expired')
              // Optionally reload promotions
              loadPromotions()
            }
          })
          timer.start()
        }
      }, 100)
    }
  }

  // Initialize promotions loading after page is returned to DOM
  setTimeout(() => {
    loadPromotions()
  }, 100)

  return page
}
