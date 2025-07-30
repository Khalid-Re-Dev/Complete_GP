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
    if (path.startsWith("/store-dashboard") || path.startsWith("/products-management")) {
      const { isAuthenticated, user } = store.getState()
      if (!isAuthenticated) {
        location.hash = "/login"
        return
      }
      if (user.role !== 'store_owner' && user.role !== 'admin') {
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
      pageContainer.appendChild(routeHandler(params))
      pageContainer.classList.add("page-enter")
      setTimeout(() => pageContainer.classList.remove("page-enter"), 500)
    }
  }

  // Listen for hash changes to navigate
  window.addEventListener("hashchange", navigate)

  // Initial navigation
  navigate()
}
