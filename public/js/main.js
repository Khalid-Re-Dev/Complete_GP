import { renderNavbar } from "./components/Navbar.js"
import { renderFooter } from "./components/Footer.js"
import { router } from "./router.js"
import store from "./state/store.js"
import { initBehaviorTracker } from "./services/behaviorTracker.js"
import { initProductComparison } from "./components/ProductComparison.js"
import { initSmartSearch } from "./components/SmartSearch.js"
import personalizationService from "./services/personalizationService.js"
import "./components/Cart.js"
import "./components/Auth.js"
import "./utils/imageUtils.js"
import "./utils/modalManager.js"
import { setupImageErrorHandling } from "./utils/imageHandler.js"

/**
 * Main application entry point.
 * This function initializes the entire application.
 */
function main() {
  // Initialize the application state from localStorage
  store.initState()

  // Render static components like Navbar and Footer
  const navbarContainer = document.getElementById("navbar-container")
  const footerContainer = document.getElementById("footer-container")

  renderNavbar(navbarContainer)
  renderFooter(footerContainer)

  // Listen for state changes to re-render the navbar (e.g., on login/logout)
  store.addObserver(renderNavbar)

  // Initialize the client-side router
  router()

  // Initialize the user behavior tracker
  initBehaviorTracker()

  // Initialize product comparison system
  initProductComparison()

  // Initialize smart search system
  initSmartSearch()

  // Initialize personalization service (already initialized as singleton)
  console.log("Personalization service initialized")

  // Make personalization service globally available
  window.personalizationService = personalizationService

  // Setup image error handling
  setupImageErrorHandling()

  // Load test functions in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('192.168')) {
    import('./utils/testFunctions.js').then(testModule => {
      console.log('🧪 Test functions loaded. Use testFunctions.runAllTests() to test all features.')
    }).catch(error => {
      console.log('Test functions not loaded:', error.message)
    })
    
    // Load comparison debug utilities
    import('./debug/debugComparison.js').then(() => {
      console.log('🔧 Comparison debug loaded. Use debugComparison.runFullTest() to test comparison.')
    }).catch(error => {
      console.log('Debug comparison not loaded:', error.message)
    })
    
    // Load checkout debug utilities
    import('./debug/debugCheckout.js').then(() => {
      console.log('🛒 Checkout debug loaded. Use debugCheckout.runFullTest() to test checkout.')
    }).catch(error => {
      console.log('Debug checkout not loaded:', error.message)
    })
    
    // Load reports debug utilities
    import('./utils/debugReports.js').then(() => {
      console.log('📊 Reports debug loaded. Use debugReports.runFullTest() to test reports.')
    }).catch(error => {
      console.log('Debug reports not loaded:', error.message)
    })
    
    // Load recommendations debug utilities
    import('./utils/debugRecommendations.js').then(() => {
      console.log('🎯 Recommendations debug loaded. Use debugRecommendations.runFullTest() to test recommendations.')
    }).catch(error => {
      console.log('Debug recommendations not loaded:', error.message)
    })
    
    // Load store system test utilities
    import('./utils/testStoreSystem.js').then(() => {
      console.log('🏪 Store system tester loaded. Use testStoreSystem.runAllTests() to test store features.')
    }).catch(error => {
      console.log('Store system tester not loaded:', error.message)
    })
    
    // Load modal test utilities
    import('./debug/modalTest.js').then(() => {
      console.log('🧪 Modal test utilities loaded. Use modalTest.runAllTests() to test modal.')
    }).catch(error => {
      console.log('Modal test utilities not loaded:', error.message)
    })
  }

  console.log("Best on Click App Initialized")
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  // Don't show toast for common errors that are handled elsewhere
  if (!event.error.message.includes('Failed to fetch') && 
      !event.error.message.includes('NetworkError')) {
    // Only log to console for debugging
  }
})

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // Prevent the default browser behavior
  event.preventDefault()
})

// Run the main function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", main)
