import HomePage from "./pages/HomePage.js"
import LoginPage from "./pages/LoginPage.js"
import RegisterPage from "./pages/RegisterPage.js"
import ProductListPage from "./pages/ProductListPage.js"
import ProductDetailPage from "./pages/ProductDetailPage.js"
import CartPage from "./pages/CartPage.js"
import DashboardPage from "./pages/DashboardPage.js"
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard.js"
import SuperAdminDashboard from "./pages/SuperAdminDashboard.js"
import ProductManagementPage from "./pages/ProductManagementPage.js"
import ProductFormPage from "./pages/ProductFormPage.js"
import AboutPage from "./pages/AboutPage.js"
import ContactPage from "./pages/ContactPage.js"
import ReportsPage from "./pages/ReportsPage.js"
import PromotionsPage from "./pages/PromotionsPage.js"
import NotFoundPage from "./pages/NotFoundPage.js"
import { StoreApplicationPage, initStoreApplicationPage } from "./pages/store-application.js"
import { StoreDashboardPage, initStoreDashboard } from "./pages/store-dashboard.js"
import { StoreAnalyticsPage, initStoreAnalytics } from "./pages/store-analytics.js"
import { StoreFeedbackPage, initStoreFeedback } from "./pages/store-feedback.js"
import { StoreFeedbackManagementPage, initStoreFeedbackManagement } from "./pages/store-feedback-management.js"
import { ProductsManagementPage, initProductsManagementPage } from "./pages/products-management.js"
import { StoreOrdersPage, initStoreOrders } from "./pages/store-orders.js"
import store from "./state/store.js"

// Define the routes and their corresponding page components
const routes = {
  "/": HomePage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/products": ProductListPage,
  "/products/:id": ProductDetailPage,
  "/cart": CartPage,
  "/dashboard": DashboardPage,
  "/store-dashboard": StoreOwnerDashboard,
  "/super-admin": SuperAdminDashboard,
  "/products-management": ProductManagementPage,
  "/products/add": () => ProductFormPage(),
  "/products/edit/:id": (params) => ProductFormPage(params.id),
  "/about": AboutPage,
  "/contact": ContactPage,
  "/reports": ReportsPage,
  "/promotions": PromotionsPage,
  "/store/apply": StoreApplicationPage,
  "/store/dashboard": StoreDashboardPage,
  "/store/analytics": StoreAnalyticsPage,
  "/store/feedback": StoreFeedbackManagementPage,
  "/store/products": ProductsManagementPage,
  "/store/orders": StoreOrdersPage,
  "/stores/:slug/feedback": (params) => StoreFeedbackPage(params.slug),
  // Add more routes as needed
}

/**
 * A simple client-side router.
 * It parses the URL hash and renders the corresponding page.
 */
export const router = () => {
  const pageContainer = document.getElementById("page-container")

  const navigate = () => {
    // Get the path from the URL hash, or default to '/'
    const path = location.hash.slice(1).toLowerCase() || "/"

    // Handle dynamic routes like /products/:id
    let routeHandler = routes[path]
    let params = null

    if (!routeHandler) {
      const dynamicRoute = Object.keys(routes).find((route) => {
        const routeParts = route.split("/")
        const pathParts = path.split("/")
        if (routeParts.length !== pathParts.length) return false

        const potentialParams = {}
        const match = routeParts.every((part, i) => {
          if (part.startsWith(":")) {
            potentialParams[part.slice(1)] = pathParts[i]
            return true
          }
          return part === pathParts[i]
        })

        if (match) {
          params = potentialParams
          return true
        }
        return false
      })

      routeHandler = dynamicRoute ? routes[dynamicRoute] : NotFoundPage
    }

    // Protect dashboard routes
    if (path.startsWith("/dashboard") && !store.getState().isAuthenticated) {
      location.hash = "/login"
      return
    }

    // Protect store owner routes
    if (path.startsWith("/store-dashboard") || path.startsWith("/products-management") || path.startsWith("/store/")) {
      const { isAuthenticated, user } = store.getState()
      console.log(`🔐 Checking auth for ${path}:`, { isAuthenticated, userRole: user?.role })
      
      if (!isAuthenticated) {
        console.log(`❌ Not authenticated, redirecting to login`)
        console.trace('🔍 Login redirect called from:')
        location.hash = "/login"
        return
      }
      
      if (path.startsWith("/store/apply")) {
        // Store application is open to all authenticated users
        console.log(`✅ Store application access granted`)
      } else if (user.role !== 'store_owner' && user.role !== 'admin') {
        console.log(`❌ Insufficient permissions, redirecting to dashboard`)
        location.hash = "/dashboard"
        return
      }
    }

    // Protect super admin routes
    if (path.startsWith("/super-admin")) {
      const { isAuthenticated, user } = store.getState()
      if (!isAuthenticated) {
        location.hash = "/login"
        return
      }
      if (user.role !== 'admin') {
        location.hash = "/dashboard"
        return
      }
    }

    // Render the page
    if (pageContainer) {
      pageContainer.innerHTML = "" // Clear previous content
      
      try {
        console.log(`🔄 Loading route: ${path}`)
        const pageElement = routeHandler(params)
        console.log(`📄 Route handler result:`, pageElement)
        console.log(`🔍 Element type:`, typeof pageElement)
        console.log(`🏷️ Node type:`, pageElement?.nodeType)
        
        if (pageElement && pageElement.nodeType === Node.ELEMENT_NODE) {
          console.log(`✅ Valid DOM element, appending to container`)
          pageContainer.appendChild(pageElement)
          pageContainer.classList.add("page-enter")
          setTimeout(() => pageContainer.classList.remove("page-enter"), 500)
        } else {
          console.error('❌ Route handler returned invalid element:', pageElement)
          console.error('Expected DOM element, got:', typeof pageElement)
          pageContainer.innerHTML = '<div class="error-page"><h2>خطأ في تحميل الصفحة</h2><p>حدث خطأ أثناء تحميل الصفحة المطلوبة.</p></div>'
        }
      } catch (error) {
        console.error('Error rendering page:', error)
        pageContainer.innerHTML = '<div class="error-page"><h2>خطأ في تحميل الصفحة</h2><p>حدث خطأ أثناء تحميل الصفحة المطلوبة.</p></div>'
      }
      
      // Initialize page-specific functionality (only for pages that don't auto-initialize)
      setTimeout(() => {
        if (path === "/store/dashboard") {
          initStoreDashboard()
        } else if (path === "/store/orders") {
          initStoreOrders()
        } else if (path.includes("/stores/") && path.includes("/feedback")) {
          const storeSlug = path.split('/')[2]
          initStoreFeedback(storeSlug)
        }
        // Note: store/apply, store/analytics, and store/feedback auto-initialize
      }, 100)
    }
  }

  // Listen for hash changes to navigate
  window.addEventListener("hashchange", navigate)

  // Initial navigation
  navigate()
}
