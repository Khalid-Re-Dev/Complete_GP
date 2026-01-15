/**
 * Image utilities for handling product images and placeholders
 */

// Base64 encoded SVG placeholder
const PLACEHOLDER_SVG_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPgogIDxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNWU3ZWIiIHJ4PSI4Ii8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjE1IiBmaWxsPSIjZDFkNWRiIi8+CiAgPHJlY3QgeD0iMTMwIiB5PSI3MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgiIGZpbGw9IiNkMWQ1ZGIiIHJ4PSI0Ii8+CiAgPHJlY3QgeD0iMTMwIiB5PSI4NSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjgiIGZpbGw9IiNkMWQ1ZGIiIHJ4PSI0Ii8+CiAgPHRleHQgeD0iMTUwIiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';

/**
 * Get product image URL with fallback
 * @param {Object} product - Product object
 * @param {number} index - Image index (default: 0)
 * @returns {string} Image URL
 */
function getProductImageUrl(product, index = 0) {
  // Try different image sources
  if (product.images && product.images.length > index) {
    return product.images[index].image || product.images[index].url;
  }
  
  if (product.image_urls && product.image_urls.length > index) {
    return product.image_urls[index];
  }
  
  if (product.image) {
    return product.image;
  }
  
  // Return SVG placeholder as fallback
  return '/assets/placeholder-product.svg';
}

/**
 * Get error handler for image loading
 * @returns {string} JavaScript code for onerror handler
 */
function getImageErrorHandler() {
  return `this.onerror=null; this.src='${PLACEHOLDER_SVG_BASE64}';`;
}

/**
 * Create image element with proper error handling
 * @param {Object} options - Image options
 * @param {string} options.src - Image source
 * @param {string} options.alt - Alt text
 * @param {string} options.className - CSS classes
 * @param {Object} options.product - Product object (for fallback)
 * @returns {string} HTML img element
 */
function createImageElement(options) {
  const {
    src,
    alt = '',
    className = '',
    product = null
  } = options;
  
  const imageUrl = src || (product ? getProductImageUrl(product) : PLACEHOLDER_SVG_BASE64);
  const errorHandler = getImageErrorHandler();
  
  return `<img src="${imageUrl}" 
               alt="${alt}" 
               class="${className}"
               onerror="${errorHandler}">`;
}

/**
 * Handle image load error (for use in event handlers)
 * @param {HTMLImageElement} img - Image element
 */
function handleImageError(img) {
  if (img.src !== PLACEHOLDER_SVG_BASE64) {
    img.onerror = null;
    img.src = PLACEHOLDER_SVG_BASE64;
  }
}

// Export for use in other modules
window.ImageUtils = {
  getProductImageUrl,
  getImageErrorHandler,
  createImageElement,
  handleImageError,
  PLACEHOLDER_SVG_BASE64
};

console.log('🖼️ Image utilities loaded');