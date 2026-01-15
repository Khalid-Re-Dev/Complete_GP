import { createElementFromHTML, showToast } from "../utils/helpers.js"
import { productService } from "../services/api.js"
import { ProductCard } from "../components/ProductCard.js"
import { trackSearch, trackFilter, trackSort } from "../services/behaviorTracker.js"

export default function ProductListPage() {
  const page = createElementFromHTML(`
        <div class="min-h-screen bg-gray-50">
            <!-- Header Section -->
            <div class="bg-white border-b">
                <div class="container mx-auto py-8 px-4">
                    <div class="text-center">
                        <h1 class="text-4xl font-bold text-primary mb-4">All Products</h1>
                        <p class="text-lg text-muted max-w-2xl mx-auto">Discover amazing products with smart search and AI-powered recommendations</p>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="container mx-auto py-8 px-4">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <!-- Filters Sidebar -->
                    <aside class="lg:col-span-1">
                        <!-- Mobile filter toggle -->
                        <div class="lg:hidden mb-6">
                            <button class="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:shadow-md hover:border-secondary/30 transition-all duration-200" onclick="toggleMobileFilters()">
                                <span class="flex items-center font-semibold text-primary">
                                    <div class="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                                        <i class="fa-solid fa-sliders-h text-secondary text-sm"></i>
                                    </div>
                                    Filters & Sort
                                </span>
                                <i class="fa-solid fa-chevron-down text-gray-400 transition-transform duration-200" id="filter-chevron"></i>
                            </button>
                        </div>

                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hidden lg:block" id="filters-panel">
                            <!-- Header -->
                            <div class="border-b border-gray-100 p-6">
                                <h3 class="font-bold text-xl text-primary flex items-center">
                                    <div class="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                                        <i class="fa-solid fa-sliders-h text-secondary"></i>
                                    </div>
                                    Filters
                                </h3>
                                <p class="text-gray-600 text-sm mt-1">Refine your search results</p>
                            </div>

                            <div class="p-6 space-y-8">
                                <!-- Categories -->
                                <div>
                                    <div class="flex items-center justify-between mb-4">
                                        <h4 class="font-semibold text-primary flex items-center">
                                            <i class="fa-solid fa-tags text-secondary mr-2"></i>
                                            Categories
                                        </h4>
                                        <span class="text-xs text-gray-500 bg-light-gray px-2 py-1 rounded font-medium">Filter</span>
                                    </div>
                                    <div id="category-filters" class="space-y-1">
                                        <!-- Categories will be loaded here -->
                                    </div>
                                </div>

                                <!-- Stores Filter -->
                                <div>
                                    <div class="flex items-center justify-between mb-4">
                                        <h4 class="font-semibold text-primary flex items-center">
                                            <i class="fa-solid fa-store text-secondary mr-2"></i>
                                            Stores
                                        </h4>
                                        <span class="text-xs text-gray-500 bg-light-gray px-2 py-1 rounded font-medium" id="store-count">Filter</span>
                                    </div>
                                    <div class="space-y-3">
                                        <!-- Store Select Dropdown -->
                                        <div class="relative group">
                                            <select class="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-gray-700 appearance-none pr-10 transition-all duration-200 hover:border-secondary/50 group-hover:shadow-sm" id="store-select">
                                                <option value="">🏪 All Stores</option>
                                                <!-- Stores will be loaded here -->
                                            </select>
                                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <i class="fa-solid fa-chevron-down text-gray-400 transition-transform duration-200 group-hover:text-secondary" id="store-chevron"></i>
                                            </div>
                                        </div>
                                        
                                        <!-- Selected Store Info -->
                                        <div class="hidden bg-gradient-to-r from-secondary/5 to-primary/5 border border-secondary/20 rounded-lg p-3" id="selected-store-info">
                                            <div class="flex items-center space-x-3">
                                                <div class="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                                                    <i class="fa-solid fa-store text-secondary text-sm"></i>
                                                </div>
                                                <div class="flex-1">
                                                    <h5 class="font-semibold text-primary text-sm" id="selected-store-name"></h5>
                                                    <p class="text-xs text-gray-600" id="selected-store-products"></p>
                                                </div>
                                                <button class="text-gray-400 hover:text-red-500 transition-colors duration-200" onclick="clearStoreFilter()" title="Clear store filter">
                                                    <i class="fa-solid fa-times text-sm"></i>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <!-- Store Loading State -->
                                        <div class="hidden text-center py-3" id="stores-loading">
                                            <div class="inline-flex items-center space-x-2 text-gray-500">
                                                <div class="w-4 h-4 border-2 border-gray-300 border-t-secondary rounded-full animate-spin"></div>
                                                <span class="text-sm">Loading stores...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- Price Range -->
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-4 flex items-center">
                                        <i class="fa-solid fa-dollar-sign text-secondary mr-2"></i>
                                        Price Range
                                    </h4>
                                    <div class="space-y-4">
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-600 mb-2">Min Price</label>
                                                <div class="relative">
                                                    <input type="number" placeholder="$0" class="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-gray-700" id="price-min">
                                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <i class="fa-solid fa-chevron-down text-gray-400 text-xs"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-600 mb-2">Max Price</label>
                                                <div class="relative">
                                                    <input type="number" placeholder="$999" class="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-gray-700" id="price-max">
                                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <i class="fa-solid fa-chevron-down text-gray-400 text-xs"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button class="w-full bg-secondary hover:bg-secondary/90 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 flex items-center justify-center" id="apply-price-filter">
                                            <i class="fa-solid fa-check mr-2"></i>
                                            Apply Price Filter
                                        </button>
                                    </div>
                                </div>

                                <!-- Sort Options -->
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-4 flex items-center">
                                        <i class="fa-solid fa-sort text-secondary mr-2"></i>
                                        Sort By
                                    </h4>
                                    <div class="relative">
                                        <select class="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-gray-700 appearance-none pr-10" id="sort-select">
                                            <option value="name">Name (A-Z)</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                            <option value="rating">Highest Rated</option>
                                            <option value="newest">Newest First</option>
                                        </select>
                                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <i class="fa-solid fa-chevron-down text-gray-400"></i>
                                        </div>
                                    </div>
                                </div>

                                <!-- Clear Filters -->
                                <div class="pt-6">
                                    <button class="w-full border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 font-medium py-2.5 px-4 rounded-md transition-colors duration-200 flex items-center justify-center bg-white" id="clear-filters">
                                        <i class="fa-solid fa-refresh mr-2"></i>
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <!-- Main Content -->
                    <main class="lg:col-span-3">
                        <!-- Search and Actions Bar -->
                        <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
                            <div class="flex flex-col lg:flex-row gap-4">
                                <div class="flex-1">
                                    <div class="relative">
                                        <input type="search" placeholder="Search for products..." class="input-field w-full pl-12 pr-4 py-3 text-lg border-2 focus:border-secondary focus:ring-4 focus:ring-secondary/20" id="search-input">
                                        <i class="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
                                    </div>
                                </div>
                                <button class="btn btn-primary lg:w-auto px-6 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200" id="ai-search-btn">
                                    <i class="fa-solid fa-magic mr-2"></i>
                                    AI Smart Search
                                </button>
                            </div>
                        </div>

                        <!-- Results Header -->
                        <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-5 mb-6">
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div id="results-info" class="text-gray-700 font-semibold flex items-center">
                                    <i class="fa-solid fa-spinner fa-spin mr-3 text-secondary"></i>
                                    Loading products...
                                </div>
                                <div class="flex items-center gap-4">
                                    <span class="text-sm text-gray-600 font-medium hidden sm:block">View:</span>
                                    <div class="flex gap-1 bg-gray-100 rounded-xl p-1.5 shadow-inner">
                                        <button class="btn-view-toggle active" id="grid-view" title="Grid View">
                                            <i class="fa-solid fa-th"></i>
                                        </button>
                                        <button class="btn-view-toggle" id="list-view" title="List View">
                                            <i class="fa-solid fa-list"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Products Grid -->
                        <div id="products-grid" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                            <div class="col-span-full flex justify-center py-12">
                                <div class="text-center">
                                    <div class="loader w-12 h-12 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-4"></div>
                                    <p class="text-gray-500">Loading amazing products...</p>
                                </div>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div class="flex justify-center">
                            <div class="flex gap-2" id="pagination">
                                <!-- Pagination will be loaded here -->
                            </div>
                        </div>
                    </main>
            </div>
        </div>
    `)

  // Initialize page functionality
  initializeProductList(page)

  // Add mobile filter toggle functionality
  window.toggleMobileFilters = function() {
    const filtersPanel = page.querySelector('#filters-panel')
    const chevron = page.querySelector('#filter-chevron')

    if (filtersPanel.classList.contains('hidden')) {
      filtersPanel.classList.remove('hidden')
      filtersPanel.classList.add('block')
      chevron.classList.remove('fa-chevron-down')
      chevron.classList.add('fa-chevron-up')
    } else {
      filtersPanel.classList.add('hidden')
      filtersPanel.classList.remove('block')
      chevron.classList.remove('fa-chevron-up')
      chevron.classList.add('fa-chevron-down')
    }
  }
  
  // Clear store filter functionality
  window.clearStoreFilter = function() {
    const storeSelect = page.querySelector('#store-select')
    const selectedStoreInfo = page.querySelector('#selected-store-info')
    
    if (storeSelect) {
      storeSelect.value = ''
      currentFilters.store = null
    }
    
    if (selectedStoreInfo) {
      selectedStoreInfo.classList.add('hidden')
    }
    
    // Apply filters to refresh products
    applyFilters()
    
    showToast('Store filter cleared', 'info')
  }

  return page
}

function initializeProductList(page) {
  let currentProducts = []
  let filteredProducts = []
  let searchTimeout = null
  let currentFilters = {
    category: null,
    priceMin: null,
    priceMax: null,
    search: '',
    sort: 'name',
    store: null
  }

  // Parse URL parameters on page load
  function parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '')

    if (urlParams.get('search')) {
      currentFilters.search = urlParams.get('search')
      const searchInput = page.querySelector('#search-input')
      if (searchInput) searchInput.value = currentFilters.search
    }

    if (urlParams.get('category')) {
      currentFilters.category = urlParams.get('category')
      const categoryRadio = page.querySelector(`input[name="category"][value="${currentFilters.category}"]`)
      if (categoryRadio) categoryRadio.checked = true
    }

    if (urlParams.get('sort')) {
      currentFilters.sort = urlParams.get('sort')
      const sortSelect = page.querySelector('#sort-select')
      if (sortSelect) sortSelect.value = currentFilters.sort
    }
  }



  // Load stores from API and render dropdown
  async function loadStoresFromAPI() {
    const storeSelect = page.querySelector('#store-select')
    const storesLoading = page.querySelector('#stores-loading')
    const storeCount = page.querySelector('#store-count')
    
    console.log('🏪 Starting loadStoresFromAPI...')
    console.log('Store select element:', storeSelect)
    
    if (!storeSelect) {
      console.error('❌ Store select element not found!')
      return
    }
    
    // Disable select while loading
    storeSelect.disabled = true
    
    try {
      // Show loading state
      if (storesLoading) {
        storesLoading.classList.remove('hidden')
        console.log('📊 Loading state shown')
      }
      
      console.log('🏪 Calling productService.getStores()...')
      const storesResponse = await productService.getStores()
      console.log('✅ Stores loaded successfully:', storesResponse)
      
      // Extract stores array from response
      const storesData = storesResponse.results || storesResponse || []
      console.log('📊 Number of stores:', storesData.length)
      
      // Hide loading state
      if (storesLoading) {
        storesLoading.classList.add('hidden')
      }
      
      // Remove old options except 'All Stores'
      storeSelect.innerHTML = '<option value="">🏪 All Stores</option>'
      
      // Enable the select element
      storeSelect.disabled = false
      
      // Update store count
      if (storeCount) {
        storeCount.textContent = `${storesData.length} stores`
      }
      
      storesData.forEach(store => {
        const option = document.createElement('option')
        option.value = store.name
        
        // Create rich option text with emojis and info
        const verifiedIcon = store.verified ? '✅' : ''
        const ratingStars = store.rating ? `⭐${store.rating}` : ''
        const productCount = store.products_count || 0
        
        option.textContent = `${verifiedIcon} ${store.name} (${productCount} products) ${ratingStars}`.trim()
        
        // Store additional data for later use
        option.dataset.storeId = store.id
        option.dataset.storeRating = store.rating || 0
        option.dataset.storeVerified = store.verified || false
        option.dataset.storeLocation = store.location || ''
        option.dataset.storeProductsCount = productCount
        
        if (currentFilters.store === store.name) {
          option.selected = true
        }
        storeSelect.appendChild(option)
      })
      
      // Add store change event listener
      storeSelect.addEventListener('change', async (e) => {
        console.log('🔄 Store filter changed!')
        const selectedStore = e.target.value
        console.log('🏪 Selected store:', selectedStore)
        
        currentFilters.store = selectedStore || null
        console.log('📊 Updated currentFilters.store:', currentFilters.store)
        
        // Update selected store info
        updateSelectedStoreInfo(selectedStore, storesData)
        
        // Apply filters
        console.log('🔍 Applying filters...')
        await applyFilters()
        
        // Track store filter
        if (selectedStore) {
          trackFilter('store', selectedStore)
        }
        
        console.log('✅ Store filter applied successfully!')
      })
      
      console.log('✅ Store change event listener added!')
      
    } catch (error) {
      console.error('❌ Failed to load stores:', error)
      
      // Hide loading state
      if (storesLoading) {
        storesLoading.classList.add('hidden')
      }
      
      // Show error state
      storeSelect.innerHTML = '<option value="">Failed to load stores</option>'
      storeSelect.disabled = true
      
      if (storeCount) {
        storeCount.textContent = 'Error'
        storeCount.className = 'text-xs text-red-500 bg-red-50 px-2 py-1 rounded font-medium'
      }
      
      showToast('Failed to load stores', 'error')
    }
  }
  
  // Update selected store info display
  function updateSelectedStoreInfo(selectedStoreName, storesData) {
    const selectedStoreInfo = page.querySelector('#selected-store-info')
    const selectedStoreNameEl = page.querySelector('#selected-store-name')
    const selectedStoreProductsEl = page.querySelector('#selected-store-products')
    
    if (!selectedStoreInfo || !selectedStoreName) {
      if (selectedStoreInfo) {
        selectedStoreInfo.classList.add('hidden')
      }
      return
    }
    
    const store = storesData.find(s => s.name === selectedStoreName)
    if (!store) return
    
    // Update store info
    if (selectedStoreNameEl) {
      selectedStoreNameEl.innerHTML = `
        ${store.name}
        ${store.verified ? '<i class="fa-solid fa-check-circle text-green-500 ml-1" title="Verified Store"></i>' : ''}
      `
    }
    
    if (selectedStoreProductsEl) {
      selectedStoreProductsEl.innerHTML = `
        <i class="fa-solid fa-box mr-1"></i>${store.products_count || 0} products
        ${store.rating ? `<span class="mx-2">•</span><i class="fa-solid fa-star text-yellow-500 mr-1"></i>${store.rating}` : ''}
        ${store.location ? `<span class="mx-2">•</span><i class="fa-solid fa-map-marker-alt mr-1"></i>${store.location}` : ''}
      `
    }
    
    // Show store info
    selectedStoreInfo.classList.remove('hidden')
  }

  async function loadProducts() {
    try {
      // Build query parameters
      const params = new URLSearchParams()

      // Add filters to API call
      if (currentFilters.category) {
        params.append('category__name', currentFilters.category)
      }
      if (currentFilters.priceMin) {
        params.append('price__gte', currentFilters.priceMin)
      }
      if (currentFilters.priceMax) {
        params.append('price__lte', currentFilters.priceMax)
      }
      if (currentFilters.search) {
        params.append('search', currentFilters.search)
      }
      if (currentFilters.store) {
        console.log('🏪 Adding store filter to API params:', currentFilters.store)
        params.append('store__name', currentFilters.store)
      }
      if (currentFilters.sort) {
        let ordering = ''
        switch (currentFilters.sort) {
          case 'price-low':
            ordering = 'price'
            break
          case 'price-high':
            ordering = '-price'
            break
          case 'rating':
            ordering = '-average_rating'
            break
          case 'newest':
            ordering = '-created_at'
            break
          default:
            ordering = 'name'
        }
        params.append('ordering', ordering)
      }

      console.log('📡 API call params:', params.toString())
      const data = await productService.getProducts(params.toString())
      console.log('📦 Products received:', data)
      currentProducts = data.results || data
      filteredProducts = [...currentProducts]
      console.log('📊 Filtered products count:', filteredProducts.length)

      // Load categories from API
      await loadCategoriesFromAPI()

      renderProducts()
      updateResultsInfo()
    } catch (error) {
      console.error('Failed to load products:', error)
      page.querySelector('#products-grid').innerHTML =
        '<p class="text-danger col-span-full text-center">Could not load products. Please try again later.</p>'
    }
  }

  // Render products
  function renderProducts() {
    const grid = page.querySelector('#products-grid')
    if (filteredProducts.length === 0) {
      grid.innerHTML = '<p class="text-muted col-span-full text-center">No products found.</p>'
      return
    }

    grid.innerHTML = filteredProducts.map(ProductCard).join('')
  }

  // Update results info
  function updateResultsInfo() {
    const info = page.querySelector('#results-info')
    info.textContent = `Showing ${filteredProducts.length} of ${currentProducts.length} products`
  }

  // Apply filters - now triggers a new API call
  async function applyFilters() {
    console.log('🔍 applyFilters called with currentFilters:', currentFilters)
    
    try {
      // Show loading state
      const grid = page.querySelector('#products-grid')
      grid.innerHTML = `
        <div class="col-span-full flex justify-center py-12">
          <div class="text-center">
            <div class="loader w-12 h-12 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-500">Filtering products...</p>
          </div>
        </div>
      `

      // Reload products with current filters
      console.log('📦 Calling loadProducts with filters...')
      await loadProducts()

      // Update URL to reflect current filters
      updateUrl()

      // Track filter usage
      trackCurrentFilters()

    } catch (error) {
      console.error('Failed to apply filters:', error)
      showToast('Failed to apply filters', 'error')
    }
  }

  // Track current filter state
  function trackCurrentFilters() {
    const activeFilters = {}
    
    if (currentFilters.category) activeFilters.category = currentFilters.category
    if (currentFilters.store) activeFilters.store = currentFilters.store
    if (currentFilters.priceMin) activeFilters.price_min = currentFilters.priceMin
    if (currentFilters.priceMax) activeFilters.price_max = currentFilters.priceMax
    if (currentFilters.search) activeFilters.search = currentFilters.search
    
    // Track search if there's a search query
    if (currentFilters.search) {
      trackSearch(currentFilters.search, activeFilters, currentProducts.length)
      
      // Track search for personalization
      if (window.personalizationService) {
        window.personalizationService.trackInteraction('search', {
          query: currentFilters.search,
          resultsCount: currentProducts.length
        })
      }
    }
    
    // Track individual filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (key !== 'search') {
        trackFilter(key, value, currentProducts.length)
        
        // Track filter usage for personalization
        if (window.personalizationService) {
          window.personalizationService.trackInteraction('filter_use', {
            filterType: key,
            value: value
          })
        }
      }
    })
    
    // Track category browsing for personalization
    if (currentFilters.category && window.personalizationService) {
      window.personalizationService.trackInteraction('category_browse', {
        category: currentFilters.category
      })
    }
    
    // Track sort
    if (currentFilters.sort && currentFilters.sort !== 'name') {
      trackSort(currentFilters.sort, currentProducts.length)
    }
  }

  // Update results info
  function updateResultsInfo() {
    const info = page.querySelector('#results-info')
    if (info) {
      let infoText = `Showing ${currentProducts.length} products`
      
      // Add store filter info if active
      if (currentFilters.store) {
        infoText += ` from ${currentFilters.store}`
      }
      
      // Add category filter info if active
      if (currentFilters.category) {
        infoText += ` in ${currentFilters.category}`
      }
      
      // Add search info if active
      if (currentFilters.search) {
        infoText += ` matching "${currentFilters.search}"`
      }
      
      info.textContent = infoText
    }
  }

  // Load categories from API
  async function loadCategoriesFromAPI() {
    try {
      const categoriesData = await productService.getCategories()
      const container = page.querySelector('#category-filters')

      // Generate category counts from current products
      const categoryMap = new Map()
      currentProducts.forEach(product => {
        if (product.category && product.category.name) {
          const count = categoryMap.get(product.category.name) || 0
          categoryMap.set(product.category.name, count + 1)
        }
      })

      // Combine API categories with counts
      const categories = categoriesData.map(category => ({
        name: category.name,
        count: categoryMap.get(category.name) || 0
      })).filter(category => category.count > 0) // Only show categories with products

      const totalProducts = currentProducts.length
      renderCategories(categories, totalProducts)

    } catch (error) {
      console.error('Failed to load categories:', error)
      // Fallback to generating categories from products
      loadCategoriesFromProducts()
    }
  }

  // Fallback: Load categories from actual product data
  function loadCategoriesFromProducts() {
    const container = page.querySelector('#category-filters')

    // Generate categories from current products
    const categoryMap = new Map()
    currentProducts.forEach(product => {
      if (product.category && product.category.name) {
        const count = categoryMap.get(product.category.name) || 0
        categoryMap.set(product.category.name, count + 1)
      }
    })

    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }))
    const totalProducts = currentProducts.length
    renderCategories(categories, totalProducts)
  }

  // Render categories in the UI
  function renderCategories(categories, totalProducts) {
    const container = page.querySelector('#category-filters')

    // Add "All Categories" option
    const allCategoriesHtml = `
      <label class="category-filter flex items-center p-3 rounded-md hover:bg-light-gray cursor-pointer transition-colors duration-200 border border-secondary bg-secondary/5" data-category="all">
        <input type="radio" name="category" value="" class="category-radio sr-only" checked>
        <div class="w-4 h-4 border-2 border-secondary rounded-full mr-3 flex items-center justify-center bg-secondary">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <span class="font-medium text-primary flex-1">All Categories</span>
        <span class="text-sm text-gray-500 bg-white px-2 py-1 rounded font-medium">${totalProducts}</span>
      </label>
    `

    const categoriesHtml = categories.map(category => `
      <label class="category-filter flex items-center p-3 rounded-md hover:bg-light-gray cursor-pointer transition-colors duration-200" data-category="${category.name}">
        <input type="radio" name="category" value="${category.name}" class="category-radio sr-only">
        <div class="w-4 h-4 border-2 border-gray-300 rounded-full mr-3 flex items-center justify-center"></div>
        <span class="font-medium text-gray-700 flex-1">${category.name}</span>
        <span class="text-sm text-gray-500 bg-light-gray px-2 py-1 rounded font-medium">${category.count}</span>
      </label>
    `).join('')

    container.innerHTML = allCategoriesHtml + categoriesHtml
  }

  // Event listeners
  page.addEventListener('change', async (e) => {
    if (e.target.name === 'category') {
      // Update visual state for all category filters
      const container = page.querySelector('#category-filters')
      container.querySelectorAll('.category-filter').forEach(label => {
        const radio = label.querySelector('.category-radio')
        const radioButton = label.querySelector('div')

        if (radio.checked) {
          // Selected state
          label.className = 'category-filter flex items-center p-3 rounded-md hover:bg-light-gray cursor-pointer transition-colors duration-200 border border-secondary bg-secondary/5'
          radioButton.className = 'w-4 h-4 border-2 border-secondary rounded-full mr-3 flex items-center justify-center bg-secondary'
          radioButton.innerHTML = '<div class="w-2 h-2 bg-white rounded-full"></div>'
        } else {
          // Unselected state
          label.className = 'category-filter flex items-center p-3 rounded-md hover:bg-light-gray cursor-pointer transition-colors duration-200'
          radioButton.className = 'w-4 h-4 border-2 border-gray-300 rounded-full mr-3 flex items-center justify-center'
          radioButton.innerHTML = ''
        }
      })

      // Track category filter
      const newCategory = e.target.value || null
      if (newCategory !== currentFilters.category) {
        trackFilter('category', newCategory || 'all', 0) // Results count will be updated after load
      }

      // Update filter
      currentFilters.category = newCategory
      await applyFilters()
    }

    if (e.target.id === 'sort-select') {
      const newSort = e.target.value
      if (newSort !== currentFilters.sort) {
        trackSort(newSort, currentProducts.length)
      }
      currentFilters.sort = newSort
      await applyFilters()
    }
  })

  page.addEventListener('click', async (e) => {
    if (e.target.id === 'apply-price-filter') {
      const minInput = page.querySelector('#price-min')
      const maxInput = page.querySelector('#price-max')
      const newPriceMin = minInput.value ? parseFloat(minInput.value) : null
      const newPriceMax = maxInput.value ? parseFloat(maxInput.value) : null
      
      // Track price filter if changed
      if (newPriceMin !== currentFilters.priceMin || newPriceMax !== currentFilters.priceMax) {
        const priceRange = `${newPriceMin || 0}-${newPriceMax || 'max'}`
        trackFilter('price_range', priceRange, 0) // Results count will be updated after load
      }
      
      currentFilters.priceMin = newPriceMin
      currentFilters.priceMax = newPriceMax
      await applyFilters()
    }

    if (e.target.id === 'clear-filters') {
      // Reset all filters including store
      currentFilters = { 
        category: null, 
        priceMin: null, 
        priceMax: null, 
        search: '', 
        sort: 'name',
        store: null 
      }
      
      // Reset form elements
      const searchInput = page.querySelector('#search-input')
      const priceMin = page.querySelector('#price-min')
      const priceMax = page.querySelector('#price-max')
      const sortSelect = page.querySelector('#sort-select')
      const storeSelect = page.querySelector('#store-select')
      const selectedStoreInfo = page.querySelector('#selected-store-info')
      const categoryRadio = page.querySelector('input[name="category"][value=""]')
      
      if (searchInput) searchInput.value = ''
      if (priceMin) priceMin.value = ''
      if (priceMax) priceMax.value = ''
      if (sortSelect) sortSelect.value = 'name'
      if (storeSelect) storeSelect.value = ''
      if (selectedStoreInfo) selectedStoreInfo.classList.add('hidden')
      if (categoryRadio) categoryRadio.checked = true
      
      // Apply filters and show success message
      applyFilters()
      showToast('All filters cleared', 'success')
    }

    if (e.target.id === 'ai-search-btn') {
      showToast("AI search feature coming soon!", "info")
    }
  })

  page.addEventListener('input', (e) => {
    if (e.target.id === 'search-input') {
      const newSearch = e.target.value
      currentFilters.search = newSearch
      
      // Debounce search
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(async () => {
        await applyFilters()
      }, 300)
    }
  })

  // Add mobile filter toggle functionality
  window.toggleMobileFilters = function() {
    const filtersPanel = page.querySelector('#filters-panel')
    const chevron = page.querySelector('#filter-chevron')

    if (filtersPanel.classList.contains('hidden')) {
      filtersPanel.classList.remove('hidden')
      filtersPanel.style.animation = 'slideDown 0.3s ease-out'
      chevron.style.transform = 'rotate(180deg)'
      // Add backdrop for mobile
      if (window.innerWidth < 1024) {
        document.body.style.overflow = 'hidden'
      }
    } else {
      filtersPanel.style.animation = 'slideUp 0.3s ease-in'
      setTimeout(() => {
        filtersPanel.classList.add('hidden')
      }, 250)
      chevron.style.transform = 'rotate(0deg)'
      document.body.style.overflow = 'auto'
    }
  }

  // Hide filters on mobile by default
  if (window.innerWidth < 1024) {
    page.querySelector('#filters-panel').classList.add('hidden')
  } 

  // Parse URL parameters on page load
  function parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '')

    if (urlParams.get('search')) {
      currentFilters.search = urlParams.get('search')
      const searchInput = page.querySelector('#search-input')
      if (searchInput) searchInput.value = currentFilters.search
    }

    if (urlParams.get('category')) {
      currentFilters.category = urlParams.get('category')
      const categoryRadio = page.querySelector(`input[name="category"][value="${currentFilters.category}"]`)
      if (categoryRadio) categoryRadio.checked = true
    }

    if (urlParams.get('sort')) {
      currentFilters.sort = urlParams.get('sort')
      const sortSelect = page.querySelector('#sort-select')
      if (sortSelect) sortSelect.value = currentFilters.sort
    }

    if (urlParams.get('store')) {
      currentFilters.store = urlParams.get('store')
    }
  }

  // Update URL to reflect current filters
  function updateUrl() {
    const params = new URLSearchParams()
    
    if (currentFilters.search) params.set('search', currentFilters.search)
    if (currentFilters.category) params.set('category', currentFilters.category)
    if (currentFilters.sort && currentFilters.sort !== 'name') params.set('sort', currentFilters.sort)
    if (currentFilters.store) params.set('store', currentFilters.store)
    if (currentFilters.priceMin) params.set('price_min', currentFilters.priceMin)
    if (currentFilters.priceMax) params.set('price_max', currentFilters.priceMax)
    
    const newUrl = params.toString() ? `#/products?${params.toString()}` : '#/products'
    if (window.location.hash !== newUrl) {
      history.replaceState(null, '', newUrl)
    }
  }

  // Initialize
  parseUrlParams()
  
  // Load data
  Promise.all([
    loadStoresFromAPI(),
    loadProducts()
  ]).catch(error => {
    console.error('Failed to initialize product list:', error)
  })
}
