/**
 * Image Handler Utility
 * Handles broken images and provides fallbacks
 */

/**
 * Create a fallback image URL
 * @param {string} text - Text to display in fallback image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} bgColor - Background color (hex without #)
 * @param {string} textColor - Text color (hex without #)
 * @returns {string} Fallback image URL
 */
export function createFallbackImage(text = 'No Image', width = 400, height = 400, bgColor = 'f3f4f6', textColor = '9ca3af') {
  // Use a simple data URL for fallback
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  // Background
  ctx.fillStyle = `#${bgColor}`
  ctx.fillRect(0, 0, width, height)
  
  // Text
  ctx.fillStyle = `#${textColor}`
  ctx.font = `${Math.min(width, height) / 10}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Wrap text if too long
  const maxWidth = width * 0.8
  const words = text.split(' ')
  let lines = []
  let currentLine = words[0]
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width_test = ctx.measureText(currentLine + ' ' + word).width
    if (width_test > maxWidth && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine += ' ' + word
    }
  }
  lines.push(currentLine)
  
  // Draw lines
  const lineHeight = Math.min(width, height) / 8
  const startY = height / 2 - (lines.length - 1) * lineHeight / 2
  
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight)
  })
  
  return canvas.toDataURL()
}

/**
 * Handle image loading errors
 * @param {HTMLImageElement} img - Image element
 * @param {string} fallbackText - Text for fallback image
 */
export function handleImageError(img, fallbackText = 'Image Not Available') {
  if (img.dataset.fallbackApplied) return // Prevent infinite loop
  
  img.dataset.fallbackApplied = 'true'
  img.src = createFallbackImage(fallbackText, 400, 400)
  img.alt = fallbackText
}

/**
 * Setup image error handling for all images in a container
 * @param {HTMLElement} container - Container element
 */
export function setupImageErrorHandling(container = document) {
  const images = container.querySelectorAll('img')
  
  images.forEach(img => {
    if (img.dataset.errorHandlerSetup) return
    
    img.dataset.errorHandlerSetup = 'true'
    
    img.addEventListener('error', () => {
      const fallbackText = img.alt || img.dataset.fallbackText || 'Image Not Available'
      handleImageError(img, fallbackText)
    })
    
    // Also handle loading timeout
    const timeout = setTimeout(() => {
      if (!img.complete) {
        const fallbackText = img.alt || img.dataset.fallbackText || 'Loading Timeout'
        handleImageError(img, fallbackText)
      }
    }, 10000) // 10 second timeout
    
    img.addEventListener('load', () => {
      clearTimeout(timeout)
    })
  })
}

/**
 * Clean and validate image URL
 * @param {string} url - Image URL
 * @returns {string} Cleaned URL or fallback
 */
export function cleanImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return createFallbackImage('No Image')
  }
  
  // Remove any localhost media prefix that might be incorrectly added
  url = url.replace(/^http:\/\/localhost:\d+\/media\/https?:\/\//, 'https://')
  
  // Block problematic external image services that cause CORS issues
  const blockedDomains = [
    'via.placeholder.com',
    'dummyimage.com', 
    'picsum.photos',
    'placeholder.com'
  ]
  
  try {
    const urlObj = new URL(url)
    
    // If it's a blocked domain, return fallback immediately
    if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
      console.warn(`🚫 Blocked external image: ${urlObj.hostname}`)
      return createFallbackImage('External Image Blocked')
    }
    
    return url
  } catch {
    return createFallbackImage('Invalid URL')
  }
}

/**
 * Create a placeholder image with specific styling
 * @param {string} text - Text to display
 * @param {string} category - Category for color coding
 * @returns {string} Image URL
 */
export function createCategoryPlaceholder(text, category = 'default') {
  const colorMap = {
    'electronics': { bg: '3b82f6', text: 'ffffff' },
    'clothing': { bg: 'ec4899', text: 'ffffff' },
    'home': { bg: '10b981', text: 'ffffff' },
    'sports': { bg: 'f59e0b', text: 'ffffff' },
    'books': { bg: '8b5cf6', text: 'ffffff' },
    'beauty': { bg: 'ef4444', text: 'ffffff' },
    'default': { bg: 'f3f4f6', text: '6b7280' }
  }
  
  const colors = colorMap[category.toLowerCase()] || colorMap.default
  return createFallbackImage(text, 400, 400, colors.bg, colors.text)
}

// Auto-setup for all images when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupImageErrorHandling()
  })
} else {
  setupImageErrorHandling()
}

// Setup for dynamically added images
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) { // Element node
        if (node.tagName === 'IMG') {
          setupImageErrorHandling(node.parentElement)
        } else if (node.querySelectorAll) {
          setupImageErrorHandling(node)
        }
      }
    })
  })
})

observer.observe(document.body, {
  childList: true,
  subtree: true
})