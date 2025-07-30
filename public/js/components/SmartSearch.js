import { createElementFromHTML, showToast, debounce } from "../utils/helpers.js"
import { productService } from "../services/api.js"
import { trackSearch } from "../services/behaviorTracker.js"

/**
 * Smart Search System with AI-powered suggestions
 * Provides intelligent search with autocomplete, spell correction, and semantic search
 */

let searchCache = new Map()
let searchHistory = []
let popularSearches = []
let currentSearchQuery = ''
let searchSuggestions = []

/**
 * Initialize Smart Search System
 */
export function initSmartSearch() {
  loadSearchHistory()
  loadPopularSearches()
  setupSearchEventListeners()
  console.log('Smart Search System Initialized')
}

/**
 * Enhanced search with AI suggestions
 */
async function performSmartSearch(query, options = {}) {
  if (!query || query.trim().length < 2) {
    return { results: [], suggestions: [], correctedQuery: null }
  }

  const trimmedQuery = query.trim().toLowerCase()
  currentSearchQuery = trimmedQuery

  try {
    // Check cache first
    const cacheKey = `${trimmedQuery}_${JSON.stringify(options)}`
    if (searchCache.has(cacheKey)) {
      return searchCache.get(cacheKey)
    }

    // Track search behavior
    trackSearch(trimmedQuery, options)

    // Get search suggestions from AI
    const suggestions = await getSearchSuggestions(trimmedQuery)

    // Perform the actual search
    const searchParams = new URLSearchParams({
      search: trimmedQuery,
      ...options
    })

    const searchResults = await productService.getProducts(searchParams.toString())

    // Check for spell correction if no results
    let correctedQuery = null
    if (searchResults.results.length === 0) {
      correctedQuery = await getSpellCorrection(trimmedQuery)
      if (correctedQuery && correctedQuery !== trimmedQuery) {
        const correctedParams = new URLSearchParams({
          search: correctedQuery,
          ...options
        })
        const correctedResults = await productService.getProducts(correctedParams.toString())
        if (correctedResults.results.length > 0) {
          searchResults.results = correctedResults.results
          searchResults.count = correctedResults.count
        }
      }
    }

    const result = {
      results: searchResults.results || [],
      count: searchResults.count || 0,
      suggestions: suggestions,
      correctedQuery: correctedQuery,
      query: trimmedQuery
    }

    // Cache the result
    searchCache.set(cacheKey, result)

    // Add to search history
    addToSearchHistory(trimmedQuery, result.count)

    return result

  } catch (error) {
    console.error('Smart search failed:', error)
    return {
      results: [],
      count: 0,
      suggestions: [],
      correctedQuery: null,
      query: trimmedQuery,
      error: error.message
    }
  }
}

/**
 * Get AI-powered search suggestions
 */
async function getSearchSuggestions(query) {
  try {
    // This would typically call the AI suggestions API
    // For now, we'll generate intelligent suggestions based on the query
    const suggestions = []

    // Add category-based suggestions
    const categories = await getCategorySuggestions(query)
    suggestions.push(...categories)

    // Add brand-based suggestions
    const brands = await getBrandSuggestions(query)
    suggestions.push(...brands)

    // Add popular search suggestions
    const popular = getPopularSearchSuggestions(query)
    suggestions.push(...popular)

    // Add semantic suggestions
    const semantic = getSemanticSuggestions(query)
    suggestions.push(...semantic)

    // Remove duplicates and limit to 8 suggestions
    return [...new Set(suggestions)].slice(0, 8)

  } catch (error) {
    console.error('Failed to get search suggestions:', error)
    return []
  }
}

/**
 * Get category-based suggestions
 */
async function getCategorySuggestions(query) {
  try {
    const categories = await productService.getCategories()
    return categories
      .filter(cat => cat.name.toLowerCase().includes(query))
      .map(cat => ({
        type: 'category',
        text: cat.name,
        icon: 'fa-tags',
        action: () => navigateToCategory(cat.name)
      }))
      .slice(0, 3)
  } catch (error) {
    return []
  }
}

/**
 * Get brand-based suggestions
 */
async function getBrandSuggestions(query) {
  try {
    const brands = await productService.getBrands()
    return brands
      .filter(brand => brand.name.toLowerCase().includes(query))
      .map(brand => ({
        type: 'brand',
        text: brand.name,
        icon: 'fa-certificate',
        action: () => navigateToBrand(brand.name)
      }))
      .slice(0, 3)
  } catch (error) {
    return []
  }
}

/**
 * Get popular search suggestions
 */
function getPopularSearchSuggestions(query) {
  return popularSearches
    .filter(search => search.toLowerCase().includes(query))
    .map(search => ({
      type: 'popular',
      text: search,
      icon: 'fa-fire',
      action: () => performSearch(search)
    }))
    .slice(0, 2)
}

/**
 * Get semantic suggestions based on query context
 */
function getSemanticSuggestions(query) {
  const semanticMap = {
    'phone': ['smartphone', 'mobile', 'iphone', 'android'],
    'laptop': ['computer', 'notebook', 'macbook', 'gaming laptop'],
    'shoes': ['sneakers', 'boots', 'sandals', 'running shoes'],
    'dress': ['clothing', 'fashion', 'women dress', 'party dress'],
    'watch': ['smartwatch', 'timepiece', 'wristwatch', 'digital watch'],
    'book': ['novel', 'textbook', 'ebook', 'literature'],
    'headphones': ['earphones', 'audio', 'wireless headphones', 'bluetooth'],
    'camera': ['photography', 'digital camera', 'lens', 'dslr']
  }

  const suggestions = []
  for (const [key, values] of Object.entries(semanticMap)) {
    if (query.includes(key) || values.some(v => query.includes(v))) {
      suggestions.push(...values.filter(v => v !== query).map(v => ({
        type: 'semantic',
        text: v,
        icon: 'fa-lightbulb',
        action: () => performSearch(v)
      })))
    }
  }

  return suggestions.slice(0, 2)
}

/**
 * Get spell correction suggestions
 */
async function getSpellCorrection(query) {
  // Simple spell correction logic
  // In a real app, this would use a proper spell-checking service
  const commonMisspellings = {
    'phon': 'phone',
    'labtop': 'laptop',
    'compter': 'computer',
    'shooes': 'shoes',
    'watche': 'watch',
    'headfones': 'headphones',
    'camra': 'camera'
  }

  for (const [wrong, correct] of Object.entries(commonMisspellings)) {
    if (query.includes(wrong)) {
      return query.replace(wrong, correct)
    }
  }

  return null
}

/**
 * Create search suggestions dropdown
 */
function createSearchSuggestions(suggestions, query) {
  if (!suggestions || suggestions.length === 0) {
    return null
  }

  const dropdown = createElementFromHTML(`
    <div class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div class="p-3 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-600">Search Suggestions</span>
          <span class="text-xs text-gray-400">${suggestions.length} suggestions</span>
        </div>
      </div>
      
      <div class="py-2">
        ${suggestions.map((suggestion, index) => `
          <div class="suggestion-item px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
               onclick="selectSuggestion('${suggestion.text}', '${suggestion.type}')"
               data-index="${index}">
            <div class="w-8 h-8 bg-${getSuggestionColor(suggestion.type)}-100 rounded-full flex items-center justify-center">
              <i class="fa-solid ${suggestion.icon} text-${getSuggestionColor(suggestion.type)}-600 text-sm"></i>
            </div>
            <div class="flex-1">
              <div class="font-medium text-gray-800">${highlightQuery(suggestion.text, query)}</div>
              <div class="text-xs text-gray-500 capitalize">${suggestion.type} suggestion</div>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square text-gray-400 text-xs"></i>
          </div>
        `).join('')}
      </div>

      ${searchHistory.length > 0 ? `
        <div class="border-t border-gray-100 p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">Recent Searches</span>
            <button class="text-xs text-gray-400 hover:text-gray-600" onclick="clearSearchHistory()">
              Clear
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            ${searchHistory.slice(0, 5).map(search => `
              <button class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                      onclick="selectSuggestion('${search.query}', 'history')">
                <i class="fa-solid fa-clock-rotate-left mr-1 text-xs"></i>
                ${search.query}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `)

  // Add keyboard navigation
  setupKeyboardNavigation(dropdown)

  return dropdown
}

/**
 * Get suggestion color based on type
 */
function getSuggestionColor(type) {
  const colors = {
    'category': 'blue',
    'brand': 'green',
    'popular': 'red',
    'semantic': 'purple',
    'history': 'gray'
  }
  return colors[type] || 'gray'
}

/**
 * Highlight query in suggestion text
 */
function highlightQuery(text, query) {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

/**
 * Setup keyboard navigation for suggestions
 */
function setupKeyboardNavigation(dropdown) {
  let selectedIndex = -1
  const suggestions = dropdown.querySelectorAll('.suggestion-item')

  document.addEventListener('keydown', function handleKeydown(e) {
    if (!dropdown.parentNode) {
      document.removeEventListener('keydown', handleKeydown)
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1)
        updateSelection()
        break
      
      case 'ArrowUp':
        e.preventDefault()
        selectedIndex = Math.max(selectedIndex - 1, -1)
        updateSelection()
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          suggestions[selectedIndex].click()
        }
        break
      
      case 'Escape':
        dropdown.remove()
        break
    }
  })

  function updateSelection() {
    suggestions.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500')
      } else {
        item.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500')
      }
    })
  }
}

/**
 * Setup search event listeners
 */
function setupSearchEventListeners() {
  // Debounced search function
  const debouncedSearch = debounce(async (query, inputElement) => {
    if (query.length < 2) {
      hideSuggestions()
      return
    }

    try {
      const suggestions = await getSearchSuggestions(query)
      showSuggestions(suggestions, query, inputElement)
    } catch (error) {
      console.error('Failed to get suggestions:', error)
    }
  }, 300)

  // Global search input handler
  document.addEventListener('input', (e) => {
    if (e.target.matches('#global-search, #search-input, .search-input')) {
      const query = e.target.value.trim()
      if (query.length >= 2) {
        debouncedSearch(query, e.target)
      } else {
        hideSuggestions()
      }
    }
  })

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container, .search-suggestions')) {
      hideSuggestions()
    }
  })
}

/**
 * Show search suggestions
 */
function showSuggestions(suggestions, query, inputElement) {
  hideSuggestions() // Remove any existing suggestions

  if (!suggestions || suggestions.length === 0) return

  const dropdown = createSearchSuggestions(suggestions, query)
  if (dropdown) {
    const container = inputElement.closest('.relative') || inputElement.parentNode
    container.style.position = 'relative'
    container.appendChild(dropdown)
  }
}

/**
 * Hide search suggestions
 */
function hideSuggestions() {
  const existingSuggestions = document.querySelectorAll('.search-suggestions, [class*="suggestion"]')
  existingSuggestions.forEach(el => {
    if (el.classList.contains('absolute') && el.classList.contains('bg-white')) {
      el.remove()
    }
  })
}

/**
 * Select a suggestion
 */
window.selectSuggestion = function(text, type) {
  // Update search input
  const searchInputs = document.querySelectorAll('#global-search, #search-input, .search-input')
  searchInputs.forEach(input => {
    input.value = text
  })

  // Hide suggestions
  hideSuggestions()

  // Perform search
  performSearch(text)

  // Track suggestion selection
  trackSearch(text, { suggestion_type: type, suggestion_selected: true })
}

/**
 * Perform search and navigate
 */
function performSearch(query) {
  const encodedQuery = encodeURIComponent(query)
  location.hash = `/products?search=${encodedQuery}`
}

/**
 * Navigate to category
 */
function navigateToCategory(categoryName) {
  const encodedCategory = encodeURIComponent(categoryName)
  location.hash = `/products?category=${encodedCategory}`
}

/**
 * Navigate to brand
 */
function navigateToBrand(brandName) {
  const encodedBrand = encodeURIComponent(brandName)
  location.hash = `/products?brand=${encodedBrand}`
}

/**
 * Add to search history
 */
function addToSearchHistory(query, resultCount) {
  // Remove existing entry if it exists
  searchHistory = searchHistory.filter(item => item.query !== query)
  
  // Add to beginning
  searchHistory.unshift({
    query: query,
    timestamp: Date.now(),
    resultCount: resultCount
  })

  // Keep only last 10 searches
  searchHistory = searchHistory.slice(0, 10)

  // Save to localStorage
  saveSearchHistory()
}

/**
 * Load search history from localStorage
 */
function loadSearchHistory() {
  try {
    const saved = localStorage.getItem('search_history')
    if (saved) {
      searchHistory = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load search history:', error)
    searchHistory = []
  }
}

/**
 * Save search history to localStorage
 */
function saveSearchHistory() {
  try {
    localStorage.setItem('search_history', JSON.stringify(searchHistory))
  } catch (error) {
    console.error('Failed to save search history:', error)
  }
}

/**
 * Clear search history
 */
window.clearSearchHistory = function() {
  searchHistory = []
  saveSearchHistory()
  hideSuggestions()
  showToast('Search history cleared', 'success')
}

/**
 * Load popular searches (would typically come from analytics)
 */
function loadPopularSearches() {
  // Mock popular searches - in real app, this would come from analytics
  popularSearches = [
    'smartphone',
    'laptop',
    'headphones',
    'shoes',
    'watch',
    'camera',
    'book',
    'dress'
  ]
}

/**
 * Get search analytics
 */
function getSearchAnalytics() {
  return {
    totalSearches: searchHistory.length,
    recentSearches: searchHistory.slice(0, 5),
    popularSearches: popularSearches,
    cacheSize: searchCache.size
  }
}

/**
 * Clear search cache
 */
function clearSearchCache() {
  searchCache.clear()
  console.log('Search cache cleared')
}

// Export functions for use in other components
export {
  performSmartSearch,
  createSearchSuggestions,
  getSearchAnalytics,
  clearSearchCache
}