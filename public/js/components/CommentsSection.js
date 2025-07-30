import { createElementFromHTML, showToast, formatCurrency } from "../utils/helpers.js"
import { commentService } from "../services/api.js"
import store from "../state/store.js"

/**
 * Creates a comprehensive comments and ratings section for products
 * @param {number} productId - The product ID
 * @param {object} product - The product object
 * @returns {HTMLElement} The comments section element
 */
export function CommentsSection(productId, product) {
  const { isAuthenticated, user } = store.getState()
  
  const section = createElementFromHTML(`
    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <!-- Header -->
      <div class="border-b border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-primary flex items-center gap-3">
              <i class="fa-solid fa-comments text-secondary"></i>
              Reviews & Ratings
            </h2>
            <p class="text-gray-600 mt-1">Share your experience with this product</p>
          </div>
          <div class="text-right">
            <div class="flex items-center gap-2 mb-1">
              <div class="flex text-yellow-400 text-lg">
                ${Array.from({length: 5}, (_, i) => `
                  <i class="fa-solid fa-star ${i < Math.floor(product.average_rating || 0) ? '' : 'text-gray-300'}"></i>
                `).join('')}
              </div>
              <span class="text-xl font-bold text-gray-800">${(product.average_rating || 0).toFixed(1)}</span>
            </div>
            <p class="text-sm text-gray-500">${product.total_reviews || 0} reviews</p>
          </div>
        </div>

        <!-- Rating Distribution -->
        <div id="rating-distribution" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Will be populated by loadRatingDistribution -->
        </div>
      </div>

      <!-- Write Review Section -->
      ${isAuthenticated ? `
        <div class="border-b border-gray-100 p-6 bg-gray-50">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
              ${user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Write a Review</h3>
              <p class="text-sm text-gray-600">Share your thoughts about this product</p>
            </div>
          </div>

          <form id="review-form" class="space-y-4">
            <!-- Star Rating Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <div class="flex items-center gap-1" id="star-rating-input">
                ${Array.from({length: 5}, (_, i) => `
                  <button type="button" class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="${i + 1}">
                    <i class="fa-solid fa-star"></i>
                  </button>
                `).join('')}
              </div>
              <input type="hidden" id="rating-value" name="rating" required>
            </div>

            <!-- Review Text -->
            <div>
              <label for="review-text" class="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea 
                id="review-text" 
                name="text" 
                rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary resize-none"
                placeholder="Tell others about your experience with this product..."
                required
                maxlength="1000"></textarea>
              <div class="flex justify-between items-center mt-1">
                <span class="text-xs text-gray-500">Minimum 10 characters</span>
                <span class="text-xs text-gray-500" id="char-count">0/1000</span>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex gap-3">
              <button type="submit" class="btn btn-primary flex items-center gap-2" id="submit-review">
                <i class="fa-solid fa-paper-plane"></i>
                Submit Review
              </button>
              <button type="button" class="btn btn-outline" id="cancel-review">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ` : `
        <div class="border-b border-gray-100 p-6 bg-gray-50 text-center">
          <div class="max-w-md mx-auto">
            <i class="fa-solid fa-user-lock text-4xl text-gray-400 mb-3"></i>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Login to Write a Review</h3>
            <p class="text-gray-600 mb-4">Share your experience and help other customers make informed decisions</p>
            <a href="#/login" class="btn btn-primary">
              <i class="fa-solid fa-sign-in-alt mr-2"></i>
              Login to Review
            </a>
          </div>
        </div>
      `}

      <!-- Comments List -->
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-800">Customer Reviews</h3>
          <div class="flex items-center gap-3">
            <label for="sort-comments" class="text-sm font-medium text-gray-600">Sort by:</label>
            <select id="sort-comments" class="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-secondary">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        <div id="comments-container">
          <!-- Loading state -->
          <div class="flex justify-center py-8">
            <div class="text-center">
              <div class="loader w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-3"></div>
              <p class="text-gray-500">Loading reviews...</p>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div id="load-more-container" class="text-center mt-6" style="display: none;">
          <button id="load-more-btn" class="btn btn-outline">
            <i class="fa-solid fa-chevron-down mr-2"></i>
            Load More Reviews
          </button>
        </div>
      </div>
    </div>
  `)

  // Initialize the comments section
  initializeCommentsSection(section, productId, product)

  return section
}

function initializeCommentsSection(section, productId, product) {
  let currentPage = 1
  let currentSort = 'newest'
  let allComments = []
  let hasMoreComments = false

  // Initialize star rating input
  initializeStarRating(section)

  // Initialize character counter
  initializeCharacterCounter(section)

  // Initialize form submission
  initializeReviewForm(section, productId)

  // Initialize comments sorting
  initializeCommentsSorting(section)

  // Load initial comments
  loadComments()

  // Load rating distribution
  loadRatingDistribution()

  function initializeStarRating(container) {
    const starButtons = container.querySelectorAll('.star-btn')
    const ratingInput = container.querySelector('#rating-value')
    let selectedRating = 0

    starButtons.forEach((btn, index) => {
      btn.addEventListener('mouseenter', () => {
        highlightStars(index + 1)
      })

      btn.addEventListener('mouseleave', () => {
        highlightStars(selectedRating)
      })

      btn.addEventListener('click', () => {
        selectedRating = index + 1
        ratingInput.value = selectedRating
        highlightStars(selectedRating)
      })
    })

    function highlightStars(rating) {
      starButtons.forEach((btn, index) => {
        if (index < rating) {
          btn.classList.remove('text-gray-300')
          btn.classList.add('text-yellow-400')
        } else {
          btn.classList.remove('text-yellow-400')
          btn.classList.add('text-gray-300')
        }
      })
    }
  }

  function initializeCharacterCounter(container) {
    const textarea = container.querySelector('#review-text')
    const charCount = container.querySelector('#char-count')

    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        const count = textarea.value.length
        charCount.textContent = `${count}/1000`
        
        if (count < 10) {
          charCount.classList.add('text-red-500')
          charCount.classList.remove('text-gray-500')
        } else {
          charCount.classList.remove('text-red-500')
          charCount.classList.add('text-gray-500')
        }
      })
    }
  }

  function initializeReviewForm(container, productId) {
    const form = container.querySelector('#review-form')
    const cancelBtn = container.querySelector('#cancel-review')

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault()
        await submitReview(form, productId)
      })
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        form.reset()
        const ratingInput = form.querySelector('#rating-value')
        ratingInput.value = ''
        initializeStarRating(container) // Reset star display
      })
    }
  }

  function initializeCommentsSorting(container) {
    const sortSelect = container.querySelector('#sort-comments')
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value
        currentPage = 1
        loadComments(true)
      })
    }
  }

  async function submitReview(form, productId) {
    const submitBtn = form.querySelector('#submit-review')
    const originalText = submitBtn.innerHTML

    try {
      // Show loading state
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Submitting...'
      submitBtn.disabled = true

      const formData = new FormData(form)
      const reviewData = {
        product: productId,
        rating: parseInt(formData.get('rating')),
        text: formData.get('text').trim()
      }

      // Validate
      if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Please select a rating')
      }

      if (reviewData.text.length < 10) {
        throw new Error('Review must be at least 10 characters long')
      }

      const response = await commentService.createComment(reviewData)

      if (response) {
        showToast('Review submitted successfully!', 'success')
        form.reset()
        form.querySelector('#rating-value').value = ''
        initializeStarRating(section) // Reset stars
        
        // Reload comments to show the new review
        currentPage = 1
        await loadComments(true)
        
        // Update product rating display if needed
        updateProductRating()
      }

    } catch (error) {
      console.error('Failed to submit review:', error)
      showToast(error.message || 'Failed to submit review', 'error')
    } finally {
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    }
  }

  async function loadComments(reset = false) {
    const container = section.querySelector('#comments-container')
    const loadMoreContainer = section.querySelector('#load-more-container')

    try {
      if (reset) {
        container.innerHTML = `
          <div class="flex justify-center py-8">
            <div class="text-center">
              <div class="loader w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-3"></div>
              <p class="text-gray-500">Loading reviews...</p>
            </div>
          </div>
        `
        allComments = []
        currentPage = 1
      }

      const params = new URLSearchParams({
        page: currentPage,
        ordering: getSortingParam(currentSort),
        page_size: 5
      })

      const response = await commentService.getComments(productId)
      const comments = response.results || response

      if (reset) {
        allComments = comments
      } else {
        allComments = [...allComments, ...comments]
      }

      hasMoreComments = response.next !== null

      renderComments(allComments)
      
      // Show/hide load more button
      if (hasMoreComments) {
        loadMoreContainer.style.display = 'block'
        const loadMoreBtn = loadMoreContainer.querySelector('#load-more-btn')
        loadMoreBtn.onclick = () => {
          currentPage++
          loadComments()
        }
      } else {
        loadMoreContainer.style.display = 'none'
      }

    } catch (error) {
      console.error('Failed to load comments:', error)
      container.innerHTML = `
        <div class="text-center py-8">
          <div class="text-red-500 text-4xl mb-3">
            <i class="fa-solid fa-exclamation-triangle"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Failed to Load Reviews</h3>
          <p class="text-gray-600 mb-4">There was an error loading the reviews. Please try again.</p>
          <button class="btn btn-outline" onclick="location.reload()">
            <i class="fa-solid fa-refresh mr-2"></i>
            Retry
          </button>
        </div>
      `
    }
  }

  function renderComments(comments) {
    const container = section.querySelector('#comments-container')

    if (!comments || comments.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-gray-400 text-5xl mb-4">
            <i class="fa-solid fa-comments"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
          <p class="text-gray-600 mb-4">Be the first to share your experience with this product!</p>
          ${store.getState().isAuthenticated ? '' : `
            <a href="#/login" class="btn btn-primary">
              <i class="fa-solid fa-sign-in-alt mr-2"></i>
              Login to Review
            </a>
          `}
        </div>
      `
      return
    }

    container.innerHTML = comments.map(comment => createCommentCard(comment)).join('')
  }

  function createCommentCard(comment) {
    const { isAuthenticated, user } = store.getState()
    const isOwner = isAuthenticated && user && user.id === comment.user.id
    const createdDate = new Date(comment.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return `
      <div class="border border-gray-200 rounded-lg p-6 mb-4 hover:shadow-md transition-shadow">
        <!-- Comment Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
              ${comment.user.first_name ? comment.user.first_name.charAt(0).toUpperCase() : comment.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-semibold text-gray-800">
                  ${comment.user.first_name && comment.user.last_name 
                    ? `${comment.user.first_name} ${comment.user.last_name}` 
                    : comment.user.username}
                </h4>
                ${comment.is_verified_purchase ? `
                  <span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    <i class="fa-solid fa-check-circle mr-1"></i>
                    Verified Purchase
                  </span>
                ` : ''}
              </div>
              <div class="flex items-center gap-2 mt-1">
                <div class="flex text-yellow-400 text-sm">
                  ${Array.from({length: 5}, (_, i) => `
                    <i class="fa-solid fa-star ${i < comment.rating ? '' : 'text-gray-300'}"></i>
                  `).join('')}
                </div>
                <span class="text-sm text-gray-500">${createdDate}</span>
              </div>
            </div>
          </div>
          
          ${isOwner ? `
            <div class="flex items-center gap-2">
              <button class="text-gray-400 hover:text-secondary transition-colors" onclick="editComment(${comment.id})" title="Edit">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button class="text-gray-400 hover:text-red-500 transition-colors" onclick="deleteComment(${comment.id})" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Comment Text -->
        <div class="mb-4">
          <p class="text-gray-700 leading-relaxed">${comment.text}</p>
        </div>

        <!-- Comment Actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            ${isAuthenticated ? `
              <button class="flex items-center gap-2 text-gray-500 hover:text-secondary transition-colors" onclick="markHelpful(${comment.id}, true)">
                <i class="fa-solid fa-thumbs-up"></i>
                <span>Helpful (${comment.helpful_votes || 0})</span>
              </button>
            ` : `
              <span class="flex items-center gap-2 text-gray-500">
                <i class="fa-solid fa-thumbs-up"></i>
                <span>Helpful (${comment.helpful_votes || 0})</span>
              </span>
            `}
          </div>

          <!-- Sentiment Analysis Badge -->
          ${comment.sentiment_analysis ? `
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">AI Analysis:</span>
              <span class="px-2 py-1 rounded-full text-xs font-medium ${getSentimentBadgeClass(comment.sentiment_analysis.sentiment)}">
                ${getSentimentIcon(comment.sentiment_analysis.sentiment)} ${comment.sentiment_analysis.sentiment}
              </span>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  function getSortingParam(sort) {
    switch (sort) {
      case 'oldest': return 'created_at'
      case 'highest': return '-rating'
      case 'lowest': return 'rating'
      case 'helpful': return '-helpful_votes'
      default: return '-created_at' // newest
    }
  }

  function getSentimentBadgeClass(sentiment) {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function getSentimentIcon(sentiment) {
    switch (sentiment) {
      case 'positive': return '😊'
      case 'negative': return '😞'
      default: return '😐'
    }
  }

  async function loadRatingDistribution() {
    // This would typically come from a separate API endpoint
    // For now, we'll create a mock distribution based on the average rating
    const container = section.querySelector('#rating-distribution')
    const avgRating = product.average_rating || 0
    const totalReviews = product.total_reviews || 0

    // Mock distribution - in real app, this would come from backend
    const distribution = generateMockDistribution(avgRating, totalReviews)

    container.innerHTML = `
      <div>
        <h4 class="font-semibold text-gray-800 mb-3">Rating Breakdown</h4>
        <div class="space-y-2">
          ${[5, 4, 3, 2, 1].map(rating => {
            const count = distribution[rating] || 0
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
            return `
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-600 w-8">${rating}★</span>
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div class="bg-yellow-400 h-2 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
                </div>
                <span class="text-sm text-gray-500 w-8">${count}</span>
              </div>
            `
          }).join('')}
        </div>
      </div>
      <div>
        <h4 class="font-semibold text-gray-800 mb-3">Review Summary</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Average Rating:</span>
            <span class="font-medium">${avgRating.toFixed(1)}/5.0</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Total Reviews:</span>
            <span class="font-medium">${totalReviews}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Recommendation Rate:</span>
            <span class="font-medium text-green-600">${Math.round((avgRating / 5) * 100)}%</span>
          </div>
        </div>
      </div>
    `
  }

  function generateMockDistribution(avgRating, totalReviews) {
    if (totalReviews === 0) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    // Simple mock distribution based on average rating
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    const primaryRating = Math.round(avgRating)
    
    // Distribute reviews around the primary rating
    distribution[primaryRating] = Math.floor(totalReviews * 0.4)
    distribution[Math.min(5, primaryRating + 1)] = Math.floor(totalReviews * 0.25)
    distribution[Math.max(1, primaryRating - 1)] = Math.floor(totalReviews * 0.25)
    
    // Fill remaining
    const remaining = totalReviews - Object.values(distribution).reduce((a, b) => a + b, 0)
    distribution[primaryRating] += remaining

    return distribution
  }

  function updateProductRating() {
    // This would typically trigger a refresh of the product data
    // For now, we'll just show a success message
    console.log('Product rating updated')
  }

  // Global functions for comment interactions
  window.markHelpful = async function(commentId, isHelpful) {
    try {
      await commentService.markHelpful(commentId, isHelpful)
      showToast('Thank you for your feedback!', 'success')
      // Reload comments to show updated helpful count
      loadComments(true)
    } catch (error) {
      console.error('Failed to mark comment as helpful:', error)
      showToast('Failed to submit feedback', 'error')
    }
  }

  window.editComment = function(commentId) {
    showToast('Edit comment feature coming soon!', 'info')
  }

  window.deleteComment = async function(commentId) {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await commentService.deleteComment(commentId)
        showToast('Review deleted successfully', 'success')
        loadComments(true)
      } catch (error) {
        console.error('Failed to delete comment:', error)
        showToast('Failed to delete review', 'error')
      }
    }
  }
}