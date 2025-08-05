import { behaviorService } from "./api.js"
import { debounce } from "../utils/helpers.js?v=2024"
import store from "../state/store.js"

/**
 * Enhanced User Behavior Tracking System
 * Tracks comprehensive user interactions for AI-powered recommendations
 */

let sessionId = null
let sessionStartTime = Date.now()
let pageStartTime = Date.now()
let scrollDepth = 0
let timeOnPage = 0

/**
 * Initialize session tracking
 */
function initSession() {
  sessionId = localStorage.getItem('behavior_session_id')
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11)
    localStorage.setItem('behavior_session_id', sessionId)
  }
  
  sessionStartTime = Date.now()
  
  // Track session start
  logBehavior('SESSION_START', {
    session_id: sessionId,
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`
  })
}

/**
 * Logs a user behavior event to the backend with enhanced metadata.
 * @param {string} action_type - The type of action (e.g., 'VIEW', 'CLICK', 'SEARCH').
 * @param {object} metadata - Additional data about the event.
 */
const logBehavior = (action_type, metadata = {}) => {
  const { isAuthenticated, user } = store.getState()
  
  const payload = {
    action_type,
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    page_url: window.location.hash || '#/',
    user_id: isAuthenticated ? user?.id : null,
    metadata: {
      ...metadata,
      time_on_page: Date.now() - pageStartTime,
      scroll_depth: scrollDepth,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      referrer: document.referrer
    }
  }
  
  // Send to backend
  behaviorService.log(payload).catch((err) => {
    console.warn("Behavior tracking failed (non-critical):", err.message)
    // Store failed events in localStorage for retry
    storeFailedEvent(payload)
  })
  
  // Also store in localStorage for offline analysis
  storeLocalBehavior(payload)
}

/**
 * Store failed events for retry
 */
function storeFailedEvent(payload) {
  try {
    const failedEvents = JSON.parse(localStorage.getItem('failed_behavior_events') || '[]')
    failedEvents.push(payload)
    
    // Keep only last 50 failed events
    if (failedEvents.length > 50) {
      failedEvents.splice(0, failedEvents.length - 50)
    }
    
    localStorage.setItem('failed_behavior_events', JSON.stringify(failedEvents))
  } catch (error) {
    console.error('Failed to store failed event:', error)
  }
}

/**
 * Store behavior locally for analysis
 */
function storeLocalBehavior(payload) {
  try {
    const localBehaviors = JSON.parse(localStorage.getItem('user_behaviors') || '[]')
    localBehaviors.push(payload)
    
    // Keep only last 100 behaviors
    if (localBehaviors.length > 100) {
      localBehaviors.splice(0, localBehaviors.length - 100)
    }
    
    localStorage.setItem('user_behaviors', JSON.stringify(localBehaviors))
  } catch (error) {
    console.error('Failed to store local behavior:', error)
  }
}

/**
 * Retry failed events
 */
async function retryFailedEvents() {
  try {
    // Temporarily disabled to avoid API errors
    console.log('Behavior tracking retry disabled temporarily')
    return;
  } catch (error) {
    console.error('Failed to retry events:', error)
  }
}

// Debounced functions for performance
const debouncedLogSearch = debounce((query, filters = {}) => {
  if (query.length > 2) {
    logBehavior("SEARCH", {
      query,
      query_length: query.length,
      filters: filters,
      search_type: 'product_search'
    })
  }
}, 500)

const debouncedLogScroll = debounce((depth) => {
  scrollDepth = Math.max(scrollDepth, depth)
  logBehavior("SCROLL", {
    scroll_depth: depth,
    max_scroll_depth: scrollDepth
  })
}, 1000)

const debouncedLogResize = debounce(() => {
  logBehavior("VIEWPORT_CHANGE", {
    new_size: `${window.innerWidth}x${window.innerHeight}`
  })
}, 500)

/**
 * Track product interactions
 */
function trackProductView(product, source = 'direct') {
  logBehavior("PRODUCT_VIEW", {
    product_id: product.id,
    product_name: product.name,
    product_category: product.category?.name,
    product_price: product.price,
    product_rating: product.average_rating,
    source: source,
    view_duration: 0
  })
  
  // Update personalization service if available
  if (window.personalizationService) {
    window.personalizationService.trackInteraction('product_view', {
      productId: product.id,
      category: product.category?.name,
      brand: product.brand,
      price: product.price
    })
  }
}

function trackProductClick(product, position = null, source = 'listing') {
  logBehavior("PRODUCT_CLICK", {
    product_id: product.id,
    product_name: product.name,
    product_category: product.category?.name,
    product_price: product.price,
    click_position: position,
    source: source
  })
}

function trackAddToCart(product, quantity = 1, source = 'product_page') {
  logBehavior("ADD_TO_CART", {
    product_id: product.id,
    product_name: product.name,
    product_category: product.category?.name,
    product_price: product.price,
    quantity: quantity,
    source: source,
    cart_value: product.price * quantity
  })
}

function trackAddToWishlist(product, source = 'product_page') {
  logBehavior("ADD_TO_WISHLIST", {
    product_id: product.id,
    product_name: product.name,
    product_category: product.category?.name,
    product_price: product.price,
    source: source
  })
}

function trackSearch(query, filters = {}, resultsCount = 0) {
  debouncedLogSearch(query, {
    ...filters,
    results_count: resultsCount,
    has_filters: Object.keys(filters).length > 0
  })
}

function trackFilter(filterType, filterValue, resultsCount = 0) {
  logBehavior("FILTER_APPLY", {
    filter_type: filterType,
    filter_value: filterValue,
    results_count: resultsCount
  })
}

function trackSort(sortType, resultsCount = 0) {
  logBehavior("SORT_APPLY", {
    sort_type: sortType,
    results_count: resultsCount
  })
}

function trackCheckout(cartData, step = 'start') {
  logBehavior("CHECKOUT", {
    step: step,
    cart_items_count: cartData.total_items,
    cart_value: cartData.total_price,
    unique_stores: new Set(cartData.items.map(item => item.product.store?.id)).size
  })
}

function trackOrderComplete(orderData) {
  logBehavior("ORDER_COMPLETE", {
    order_id: orderData.id,
    order_value: orderData.total_amount,
    items_count: orderData.items_count,
    payment_method: orderData.payment_method,
    stores_count: orderData.stores_count
  })
}

function trackRecommendationClick(product, algorithm, position, source = 'similar_products') {
  logBehavior("RECOMMENDATION_CLICK", {
    product_id: product.id,
    product_name: product.name,
    algorithm: algorithm,
    position: position,
    source: source,
    recommendation_score: product.score
  })
}

function trackCommentSubmit(productId, rating, commentLength) {
  logBehavior("COMMENT_SUBMIT", {
    product_id: productId,
    rating: rating,
    comment_length: commentLength,
    engagement_type: 'review'
  })
}

/**
 * Track page performance metrics
 */
function trackPagePerformance() {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0]
    if (navigation) {
      logBehavior("PAGE_PERFORMANCE", {
        load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_paint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        first_contentful_paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      })
    }
  }
}

/**
 * Track scroll behavior
 */
function trackScrollBehavior() {
  const calculateScrollDepth = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    return documentHeight > 0 ? Math.round((scrollTop / documentHeight) * 100) : 0
  }

  window.addEventListener('scroll', () => {
    const depth = calculateScrollDepth()
    debouncedLogScroll(depth)
  })
}

/**
 * Track user engagement patterns
 */
function trackEngagementPatterns() {
  let mouseMovements = 0
  let clicks = 0
  let keystrokes = 0
  
  const trackEngagement = debounce(() => {
    logBehavior("ENGAGEMENT_PATTERN", {
      mouse_movements: mouseMovements,
      clicks: clicks,
      keystrokes: keystrokes,
      time_active: Date.now() - pageStartTime,
      engagement_score: (mouseMovements + clicks * 2 + keystrokes) / ((Date.now() - pageStartTime) / 1000)
    })
    
    // Reset counters
    mouseMovements = 0
    clicks = 0
    keystrokes = 0
  }, 30000) // Track every 30 seconds

  document.addEventListener('mousemove', () => {
    mouseMovements++
    trackEngagement()
  })

  document.addEventListener('click', () => {
    clicks++
    trackEngagement()
  })

  document.addEventListener('keydown', () => {
    keystrokes++
    trackEngagement()
  })
}

/**
 * Initializes comprehensive user behavior tracking across the site.
 */
function initBehaviorTracker() {
  // Initialize session
  initSession()
  
  // Track page views on hash change
  window.addEventListener("hashchange", () => {
    // Log previous page exit
    logBehavior("PAGE_EXIT", {
      page: window.location.hash,
      time_on_page: Date.now() - pageStartTime
    })
    
    // Reset page timer
    pageStartTime = Date.now()
    scrollDepth = 0
    
    // Log new page view
    logBehavior("PAGE_VIEW", {
      page: location.hash || "#/",
      previous_page: document.referrer
    })
    
    // Track page performance
    setTimeout(trackPagePerformance, 1000)
  })

  // Track initial page view
  logBehavior("PAGE_VIEW", {
    page: location.hash || "#/",
    is_initial_load: true
  })

  // Track clicks on specific elements
  document.body.addEventListener("click", (e) => {
    const productCard = e.target.closest("[data-product-id]")
    if (productCard) {
      const productId = productCard.dataset.productId
      logBehavior("PRODUCT_CARD_CLICK", {
        product_id: productId,
        click_target: e.target.tagName.toLowerCase(),
        card_position: Array.from(productCard.parentNode.children).indexOf(productCard)
      })
    }

    // Track button clicks
    const button = e.target.closest('button')
    if (button) {
      logBehavior("BUTTON_CLICK", {
        button_text: button.textContent?.trim().substring(0, 50),
        button_class: button.className,
        button_id: button.id
      })
    }

    // Track link clicks
    const link = e.target.closest('a')
    if (link) {
      logBehavior("LINK_CLICK", {
        link_text: link.textContent?.trim().substring(0, 50),
        link_href: link.href,
        is_external: !link.href.includes(window.location.origin)
      })
    }
  })

  // Track scroll behavior
  trackScrollBehavior()

  // Track engagement patterns
  trackEngagementPatterns()

  // Track viewport changes
  window.addEventListener('resize', debouncedLogResize)

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    logBehavior("VISIBILITY_CHANGE", {
      is_visible: !document.hidden,
      time_on_page: Date.now() - pageStartTime
    })
  })

  // Track before page unload
  window.addEventListener('beforeunload', () => {
    logBehavior("SESSION_END", {
      session_duration: Date.now() - sessionStartTime,
      total_time_on_page: Date.now() - pageStartTime,
      final_scroll_depth: scrollDepth
    })
  })

  // Retry failed events on page load
  retryFailedEvents()

  // Set up periodic retry of failed events
  setInterval(retryFailedEvents, 60000) // Retry every minute

  console.log("Enhanced Behavior Tracker Initialized")
}

// Export tracking functions for use in other components
export {
  logBehavior,
  trackProductView,
  trackProductClick,
  trackAddToCart,
  trackAddToWishlist,
  trackSearch,
  trackFilter,
  trackSort,
  trackCheckout,
  trackOrderComplete,
  trackRecommendationClick,
  trackCommentSubmit,
  initBehaviorTracker
}
