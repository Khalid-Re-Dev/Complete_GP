/**
 * Local Image Generator
 * Generate beautiful local images for products and categories
 */

/**
 * Generate a product image with gradient background
 * @param {string} productName - Product name
 * @param {string} category - Product category
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Data URL of generated image
 */
export function generateProductImage(productName, category = 'default', width = 400, height = 400) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  // Category-based gradients
  const gradients = {
    'electronics': ['#667eea', '#764ba2'],
    'phones': ['#f093fb', '#f5576c'],
    'computers': ['#4facfe', '#00f2fe'],
    'clothing': ['#fa709a', '#fee140'],
    'fashion': ['#a8edea', '#fed6e3'],
    'home': ['#ffecd2', '#fcb69f'],
    'sports': ['#ff9a9e', '#fecfef'],
    'books': ['#a18cd1', '#fbc2eb'],
    'beauty': ['#ffecd2', '#fcb69f'],
    'gadgets': ['#667eea', '#764ba2'],
    'outdoor': ['#89f7fe', '#66a6ff'],
    'default': ['#e0e7ff', '#c7d2fe']
  }
  
  const categoryKey = category.toLowerCase()
  const colors = gradients[categoryKey] || gradients.default
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, colors[0])
  gradient.addColorStop(1, colors[1])
  
  // Fill background
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // Add subtle pattern
  ctx.globalAlpha = 0.1
  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 50 + 10,
      0,
      Math.PI * 2
    )
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }
  ctx.globalAlpha = 1
  
  // Add product name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Add shadow for text
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  
  // Wrap text
  const maxWidth = width * 0.8
  const words = productName.split(' ')
  let lines = []
  let currentLine = words[0]
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const testLine = currentLine + ' ' + word
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  lines.push(currentLine)
  
  // Draw lines
  const lineHeight = 30
  const startY = height / 2 - (lines.length - 1) * lineHeight / 2
  
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight)
  })
  
  // Add category badge
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(10, 10, ctx.measureText(category).width + 20, 30)
  
  ctx.fillStyle = '#ffffff'
  ctx.font = '14px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(category.toUpperCase(), 20, 30)
  
  return canvas.toDataURL('image/png')
}

/**
 * Generate a category icon
 * @param {string} categoryName - Category name
 * @param {string} icon - Icon class or emoji
 * @param {number} size - Icon size
 * @returns {string} Data URL of generated icon
 */
export function generateCategoryIcon(categoryName, icon = '📦', size = 100) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  
  // Background circle
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
  gradient.addColorStop(0, '#f8fafc')
  gradient.addColorStop(1, '#e2e8f0')
  
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2)
  ctx.fill()
  
  // Border
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 2
  ctx.stroke()
  
  // Icon/Emoji
  ctx.font = `${size * 0.4}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#475569'
  ctx.fillText(icon, size/2, size/2)
  
  return canvas.toDataURL('image/png')
}

/**
 * Generate a store logo
 * @param {string} storeName - Store name
 * @param {number} size - Logo size
 * @returns {string} Data URL of generated logo
 */
export function generateStoreLogo(storeName, size = 100) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  
  // Background
  const colors = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b']
  const color = colors[storeName.length % colors.length]
  
  ctx.fillStyle = color
  ctx.fillRect(0, 0, size, size)
  
  // Store initials
  const initials = storeName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
  
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${size * 0.3}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, size/2, size/2)
  
  return canvas.toDataURL('image/png')
}

/**
 * Pre-generate common images
 */
export function preGenerateImages() {
  const commonCategories = [
    'Electronics', 'Phones', 'Computers', 'Clothing', 'Fashion',
    'Home', 'Sports', 'Books', 'Beauty', 'Gadgets', 'Outdoor'
  ]
  
  const images = {}
  
  commonCategories.forEach(category => {
    images[category.toLowerCase()] = generateCategoryIcon(category, getCategoryEmoji(category))
  })
  
  return images
}

/**
 * Get emoji for category
 * @param {string} category - Category name
 * @returns {string} Emoji
 */
function getCategoryEmoji(category) {
  const emojiMap = {
    'electronics': '⚡',
    'phones': '📱',
    'computers': '💻',
    'clothing': '👕',
    'fashion': '👗',
    'home': '🏠',
    'sports': '⚽',
    'books': '📚',
    'beauty': '💄',
    'gadgets': '🔧',
    'outdoor': '🏕️',
    'default': '📦'
  }
  
  return emojiMap[category.toLowerCase()] || emojiMap.default
}