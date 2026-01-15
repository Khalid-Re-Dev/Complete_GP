import store from "../state/store.js"

/**
 * Renders the navigation bar.
 * It dynamically updates based on the user's authentication state.
 * @param {HTMLElement} container - The container element to render the navbar into.
 */
export function renderNavbar(container) {
  if (!container) return

  function render() {
    const { isAuthenticated, user } = store.getState()

  const authLinks = isAuthenticated
    ? `
            ${user.role === 'admin' ? `
                <div class="relative group">
                    <button class="flex items-center gap-2 hover:text-purple-600 transition-colors">
                        <i class="fa-solid fa-crown text-xl text-purple-600"></i>
                        <span>Super Admin</span>
                        <i class="fa-solid fa-chevron-down text-xs"></i>
                    </button>
                    <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div class="py-2">
                            <a href="#/super-admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">
                                <i class="fa-solid fa-tachometer-alt mr-2 text-purple-600"></i>
                                Super Admin Dashboard
                            </a>
                            <div class="border-t border-gray-200 my-1"></div>
                            <a href="#/super-admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fa-solid fa-users mr-2"></i>
                                User Management
                            </a>
                            <a href="#/super-admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fa-solid fa-store mr-2"></i>
                                Store Management
                            </a>
                            <a href="#/super-admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fa-solid fa-box mr-2"></i>
                                Product Management
                            </a>
                            <div class="border-t border-gray-200 my-1"></div>
                            <a href="#/super-admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fa-solid fa-chart-bar mr-2"></i>
                                Analytics & Reports
                            </a>
                            <a href="#/super-admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fa-solid fa-cog mr-2"></i>
                                System Settings
                            </a>
                        </div>
                    </div>
                </div>
            ` : ''}
            ${user.role === 'store_owner' ? `
                <div class="relative group">
                    <button class="flex items-center gap-2 hover:text-blue-600 transition-colors">
                        <i class="fa-solid fa-store text-xl"></i>
                        <span>Store</span>
                        <i class="fa-solid fa-chevron-down text-xs"></i>
                    </button>
                    <div class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div class="py-2">
                            <a href="#/store/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fa-solid fa-chart-line mr-2"></i>
                                لوحة التحكم
                            </a>
                            <a href="#/products-management" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fa-solid fa-box mr-2"></i>
                                إدارة المنتجات
                            </a>
                            <a href="#/products/add" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fa-solid fa-plus mr-2"></i>
                                إضافة منتج
                            </a>
                            <div class="border-t border-gray-200 my-1"></div>
                            <a href="#/store/analytics" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fa-solid fa-chart-bar mr-2"></i>
                                التحليلات
                            </a>
                            <a href="#/store/feedback" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fa-solid fa-comments mr-2"></i>
                                آراء العملاء
                            </a>
                            <a href="#/reports" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fa-solid fa-file-alt mr-2"></i>
                                التقارير
                            </a>
                        </div>
                    </div>
                </div>
            ` : ''}
            ${user.role === 'customer' ? `
                <a href="#/store/apply" class="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fa-solid fa-store text-sm"></i>
                    <span>إنشاء متجر</span>
                </a>
            ` : ''}
            <a href="#/dashboard" class="flex items-center gap-2">
                <i class="fa-solid fa-user-circle text-xl"></i>
                <span>${user.username}</span>
            </a>
            <a href="#" id="logout-btn" class="flex items-center gap-2">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Logout</span>
            </a>
        `
    : `
            <a href="#/login" class="font-bold text-secondary">Login</a>
            <span class="text-gray-300">/</span>
            <a href="#/register" class="font-bold text-secondary">Register</a>
        `

  const html = `
        <nav class="bg-white shadow-sm sticky top-0 z-50">
            <div class="container mx-auto px-4">
                <!-- Top bar -->
                <div class="hidden md:flex justify-between items-center py-2 text-sm text-muted border-b">
                    <div>
                        <span>(225) 555-0118</span>
                        <span class="mx-2">|</span>
                        <span>michelle.rivera@example.com</span>
                    </div>
                    <div>Follow Us and get a chance to win 80% off</div>
                </div>
                <!-- Main nav -->
                <div class="flex justify-between items-center py-4">
                    <a href="#/" class="text-2xl font-extrabold text-primary flex items-center gap-2 hover:text-secondary transition-colors">
                        <div class="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm">
                            <i class="fa-solid fa-shopping-bag"></i>
                        </div>
                        Best on Click
                    </a>
                    <div class="hidden lg:flex items-center gap-6 text-muted font-bold">
                        <a href="#/" class="hover:text-secondary transition-colors">Home</a>
                        <a href="#/products" class="hover:text-secondary transition-colors">Products</a>
                        <a href="#/promotions" class="hover:text-secondary transition-colors flex items-center gap-1">
                            <i class="fa-solid fa-tags text-red-500"></i>
                            Offers
                        </a>
                        <a href="#/about" class="hover:text-secondary transition-colors">About</a>
                        <a href="#/contact" class="hover:text-secondary transition-colors">Contact</a>
                    </div>

                    <!-- Mobile menu button -->
                    <button class="lg:hidden text-primary" onclick="toggleMobileMenu()">
                        <i class="fa-solid fa-bars text-xl"></i>
                    </button>
                    <div class="flex items-center gap-4 text-secondary font-bold">
                        ${authLinks}
                        <button class="flex items-center gap-1 hover:text-blue-600 transition-colors" onclick="toggleSearch()" title="Search">
                            <i class="fa-solid fa-search"></i>
                        </button>
                        <div class="relative">
                            <button class="flex items-center gap-1 hover:text-blue-600 transition-colors relative" onclick="openComparisonModal()" title="Product Comparison">
                                <i class="fa-solid fa-balance-scale"></i>
                                <span class="comparison-badge text-xs bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center absolute -top-2 -right-2" style="display: none;">0</span>
                            </button>
                        </div>
                        <div class="relative">
                            <a href="#/cart" class="flex items-center gap-1 hover:text-blue-600 transition-colors relative" title="Shopping Cart">
                                <i class="fa-solid fa-shopping-cart"></i>
                                <span class="cart-badge text-xs bg-danger text-white rounded-full w-5 h-5 flex items-center justify-center absolute -top-2 -right-2" style="display: none;">0</span>
                            </a>
                        </div>
                        <a href="#/wishlist" class="flex items-center gap-1 hover:text-blue-600 transition-colors relative" title="Wishlist">
                            <i class="fa-solid fa-heart"></i>
                            <span class="wishlist-badge text-xs bg-danger text-white rounded-full w-5 h-5 flex items-center justify-center absolute -top-2 -right-2" style="display: none;">0</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Mobile Menu (Hidden by default) -->
            <div id="mobile-menu" class="hidden lg:hidden border-t bg-white">
                <div class="container mx-auto px-4 py-4">
                    <div class="flex flex-col space-y-4">
                        <a href="#/" class="text-muted hover:text-secondary transition-colors font-bold">Home</a>
                        <a href="#/products" class="text-muted hover:text-secondary transition-colors font-bold">Products</a>
                        <a href="#/promotions" class="text-muted hover:text-secondary transition-colors font-bold flex items-center gap-2">
                            <i class="fa-solid fa-tags text-red-500"></i>
                            Special Offers
                        </a>
                        <a href="#/about" class="text-muted hover:text-secondary transition-colors font-bold">About</a>
                        <a href="#/contact" class="text-muted hover:text-secondary transition-colors font-bold">Contact</a>
                        <div class="border-t pt-4">
                            ${authLinks}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search Bar (Hidden by default) -->
            <div id="search-bar" class="hidden border-t bg-light-gray">
                <div class="container mx-auto px-4 py-4">
                    <div class="relative">
                        <div class="flex gap-2">
                            <div class="relative flex-1">
                                <input type="search"
                                       placeholder="Search for products, categories, brands..."
                                       class="input-field w-full pr-12"
                                       id="global-search"
                                       autocomplete="off">
                                <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <i class="fa-solid fa-search"></i>
                                </div>
                            </div>
                            <button class="btn btn-primary" onclick="performSearch()">
                                <i class="fa-solid fa-magic mr-2"></i>
                                Smart Search
                            </button>
                            <button class="btn btn-outline" onclick="toggleSearch()">
                                <i class="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <!-- Search suggestions will be inserted here by SmartSearch component -->
                    </div>
                </div>
            </div>
        </nav>
    `

    container.innerHTML = html

  // Add event listener for logout button
  const logoutBtn = document.getElementById("logout-btn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault()

      // Use the global auth service if available
      if (window.auth) {
        await window.auth.logout()
      } else {
        // Fallback to manual logout
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        store.setState({ isAuthenticated: false, user: null, token: null })
        location.hash = "/"
      }
    })
  }

  // Cart functionality is handled by direct navigation to cart page

  // Add global functions for navbar interactions
  window.toggleSearch = function() {
    const searchBar = document.getElementById("search-bar")
    const searchInput = document.getElementById("global-search")

    if (searchBar.classList.contains("hidden")) {
      searchBar.classList.remove("hidden")
      searchInput.focus()
    } else {
      searchBar.classList.add("hidden")
      searchInput.value = ""
    }
  }

  window.performSearch = function() {
    const searchInput = document.getElementById("global-search")
    const query = searchInput.value.trim()

    if (query) {
      // Use smart search if available
      if (window.performSmartSearch) {
        window.performSmartSearch(query)
      } else {
        location.hash = `/products?search=${encodeURIComponent(query)}`
      }
      window.toggleSearch() // Close search bar
    }
  }

  // Enhanced global search function for smart search integration
  window.performSmartSearch = function(query) {
    location.hash = `/products?search=${encodeURIComponent(query)}`
  }

  window.toggleMobileMenu = function() {
    const mobileMenu = document.getElementById("mobile-menu")
    const menuButton = document.querySelector('[onclick="toggleMobileMenu()"] i')

    if (mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.remove("hidden")
      menuButton.classList.remove("fa-bars")
      menuButton.classList.add("fa-times")
    } else {
      mobileMenu.classList.add("hidden")
      menuButton.classList.remove("fa-times")
      menuButton.classList.add("fa-bars")
    }
  }

  // Add enter key support for search
  const searchInput = document.getElementById("global-search")
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        window.performSearch()
      }
    })
  }
  }

  // Initial render
  render()

  // Subscribe to state changes
  store.addObserver(() => {
    render()
  })
}
