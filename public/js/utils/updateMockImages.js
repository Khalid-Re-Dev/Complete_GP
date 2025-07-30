/**
 * Update Mock Data Images
 * Replace external image URLs with local fallbacks
 */

import { createCategoryPlaceholder } from './imageHandler.js'

/**
 * Update product images to use local fallbacks
 * @param {Array} products - Array of products
 * @returns {Array} Updated products with local images
 */
export function updateProductImages(products) {
  return products.map(product => {
    const categoryName = product.category || 'default'
    const fallbackImage = createCategoryPlaceholder(product.name, categoryName)
    
    return {
      ...product,
      image_urls: [fallbackImage],
      images: product.images ? product.images.map(img => ({
        ...img,
        image: fallbackImage
      })) : []
    }
  })
}

/**
 * Update store logos to use local fallbacks
 * @param {Array} stores - Array of stores
 * @returns {Array} Updated stores with local logos
 */
export function updateStoreLogos(stores) {
  return stores.map(store => {
    const fallbackLogo = createCategoryPlaceholder(store.name, 'store')
    
    return {
      ...store,
      logo: fallbackLogo
    }
  })
}

/**
 * Update category images to use local fallbacks
 * @param {Array} categories - Array of categories
 * @returns {Array} Updated categories with local images
 */
export function updateCategoryImages(categories) {
  return categories.map(category => {
    const fallbackImage = createCategoryPlaceholder(category.name, category.slug)
    
    return {
      ...category,
      image: fallbackImage,
      icon: fallbackImage
    }
  })
}