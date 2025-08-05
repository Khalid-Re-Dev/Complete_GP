/**
 * Store Feedback Page
 * Page for customers to leave feedback and for store owners to manage feedback
 */

import { authService } from '../services/auth.js';
import { storeService } from '../services/store.js';
import { showToast } from '../utils/toast.js';

export function StoreFeedbackPage(storeSlug) {
    return `
        <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Header -->
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">
                        آراء العملاء
                    </h1>
                    <p class="text-lg text-gray-600" id="store-name">
                        جاري التحميل...
                    </p>
                </div>

                <!-- Loading State -->
                <div id="feedback-loading" class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">جاري تحميل الآراء...</p>
                </div>

                <!-- Feedback Content -->
                <div id="feedback-content" class="hidden">
                    <!-- Feedback Form (for customers) -->
                    <div id="feedback-form-section" class="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <h2 class="text-xl font-semibold text-gray-900 mb-4">
                            شاركنا رأيك في هذا المتجر
                        </h2>
                        
                        <form id="feedback-form" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="rating" class="block text-sm font-medium text-gray-700 mb-2">
                                        التقييم العام *
                                    </label>
                                    <div class="flex items-center space-x-2 space-x-reverse">
                                        <div id="rating-stars" class="flex space-x-1 space-x-reverse">
                                            ${[1,2,3,4,5].map(i => `
                                                <button
                                                    type="button"
                                                    class="rating-star text-2xl text-gray-300 hover:text-yellow-400 transition-colors"
                                                    data-rating="${i}"
                                                >
                                                    <i class="far fa-star"></i>
                                                </button>
                                            `).join('')}
                                        </div>
                                        <span id="rating-text" class="text-sm text-gray-600 mr-2">اختر التقييم</span>
                                    </div>
                                    <input type="hidden" id="rating" name="rating" required>
                                </div>
                                
                                <div>
                                    <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                                        عنوان المراجعة *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="اكتب عنواناً مختصراً لمراجعتك"
                                    >
                                </div>
                            </div>
                            
                            <!-- Detailed Ratings -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        جودة الخدمة
                                    </label>
                                    <div class="flex items-center space-x-1 space-x-reverse">
                                        <div class="service-rating flex space-x-1 space-x-reverse">
                                            ${[1,2,3,4,5].map(i => `
                                                <button
                                                    type="button"
                                                    class="rating-star text-lg text-gray-300 hover:text-yellow-400 transition-colors"
                                                    data-rating="${i}"
                                                    data-type="service"
                                                >
                                                    <i class="far fa-star"></i>
                                                </button>
                                            `).join('')}
                                        </div>
                                    </div>
                                    <input type="hidden" id="service_rating" name="service_rating">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        سرعة التوصيل
                                    </label>
                                    <div class="flex items-center space-x-1 space-x-reverse">
                                        <div class="delivery-rating flex space-x-1 space-x-reverse">
                                            ${[1,2,3,4,5].map(i => `
                                                <button
                                                    type="button"
                                                    class="rating-star text-lg text-gray-300 hover:text-yellow-400 transition-colors"
                                                    data-rating="${i}"
                                                    data-type="delivery"
                                                >
                                                    <i class="far fa-star"></i>
                                                </button>
                                            `).join('')}
                                        </div>
                                    </div>
                                    <input type="hidden" id="delivery_rating" name="delivery_rating">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        جودة المنتجات
                                    </label>
                                    <div class="flex items-center space-x-1 space-x-reverse">
                                        <div class="quality-rating flex space-x-1 space-x-reverse">
                                            ${[1,2,3,4,5].map(i => `
                                                <button
                                                    type="button"
                                                    class="rating-star text-lg text-gray-300 hover:text-yellow-400 transition-colors"
                                                    data-rating="${i}"
                                                    data-type="quality"
                                                >
                                                    <i class="far fa-star"></i>
                                                </button>
                                            `).join('')}
                                        </div>
                                    </div>
                                    <input type="hidden" id="product_quality_rating" name="product_quality_rating">
                                </div>
                            </div>
                            
                            <div>
                                <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
                                    تعليقك *
                                </label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    rows="4"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="شاركنا تجربتك مع هذا المتجر..."
                                ></textarea>
                            </div>
                            
                            <div class="flex justify-center">
                                <button
                                    type="submit"
                                    id="submit-feedback-btn"
                                    class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                >
                                    <span id="submit-feedback-text">إرسال المراجعة</span>
                                    <span id="submit-feedback-loading" class="hidden">
                                        <i class="fas fa-spinner fa-spin mr-2"></i>
                                        جاري الإرسال...
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Feedback List -->
                    <div class="bg-white rounded-lg shadow-sm border p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-semibold text-gray-900">
                                آراء العملاء
                            </h2>
                            <div class="flex items-center space-x-4 space-x-reverse">
                                <select id="sort-feedback" class="px-3 py-2 border border-gray-300 rounded-md text-sm">
                                    <option value="newest">الأحدث أولاً</option>
                                    <option value="oldest">الأقدم أولاً</option>
                                    <option value="highest">أعلى تقييم</option>
                                    <option value="lowest">أقل تقييم</option>
                                </select>
                                <div class="flex items-center space-x-2 space-x-reverse">
                                    <span class="text-sm text-gray-600">التقييم:</span>
                                    <select id="filter-rating" class="px-3 py-2 border border-gray-300 rounded-md text-sm">
                                        <option value="">جميع التقييمات</option>
                                        <option value="5">5 نجوم</option>
                                        <option value="4">4 نجوم</option>
                                        <option value="3">3 نجوم</option>
                                        <option value="2">2 نجوم</option>
                                        <option value="1">1 نجمة</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div id="feedback-list" class="space-y-6">
                            <!-- Feedback items will be loaded here -->
                        </div>
                        
                        <!-- Load More Button -->
                        <div id="load-more-container" class="text-center mt-8 hidden">
                            <button
                                id="load-more-btn"
                                class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                تحميل المزيد
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function initStoreFeedback(storeSlug) {
    // Load feedback data
    loadFeedbackData(storeSlug);
    
    // Initialize rating system
    initRatingSystem();
    
    // Initialize form
    const form = document.getElementById('feedback-form');
    if (form) {
        form.addEventListener('submit', (e) => handleFeedbackSubmit(e, storeSlug));
    }
    
    // Initialize filters
    initFilters();
}

async function loadFeedbackData(storeSlug) {
    try {
        // This would typically load from store service
        // For now, we'll simulate the data
        const mockData = {
            store_name: 'متجر الإلكترونيات المتقدمة',
            feedback: [
                {
                    id: 1,
                    customer_name: 'أحمد محمد',
                    rating: 5,
                    service_rating: 5,
                    delivery_rating: 4,
                    product_quality_rating: 5,
                    title: 'تجربة ممتازة',
                    comment: 'خدمة عملاء ممتازة ومنتجات عالية الجودة. أنصح بالتعامل مع هذا المتجر.',
                    created_at: '2024-01-15T10:30:00Z',
                    is_verified: true,
                    owner_response: 'شكراً لك على هذه المراجعة الرائعة! نسعد بخدمتك دائماً.',
                    responded_at: '2024-01-16T09:15:00Z'
                },
                {
                    id: 2,
                    customer_name: 'فاطمة علي',
                    rating: 4,
                    service_rating: 4,
                    delivery_rating: 3,
                    product_quality_rating: 5,
                    title: 'منتجات جيدة',
                    comment: 'المنتجات ممتازة لكن التوصيل كان بطيء قليلاً.',
                    created_at: '2024-01-10T14:20:00Z',
                    is_verified: true,
                    owner_response: null,
                    responded_at: null
                }
            ]
        };
        
        // Hide loading and show content
        document.getElementById('feedback-loading').classList.add('hidden');
        document.getElementById('feedback-content').classList.remove('hidden');
        
        // Update store name
        document.getElementById('store-name').textContent = `متجر: ${mockData.store_name}`;
        
        // Load feedback list
        displayFeedbackList(mockData.feedback);
        
        // Check if user can leave feedback
        checkFeedbackPermissions();
        
    } catch (error) {
        console.error('Error loading feedback data:', error);
        showToast('حدث خطأ أثناء تحميل الآراء', 'error');
    }
}

function initRatingSystem() {
    // Main rating
    const mainRatingStars = document.querySelectorAll('#rating-stars .rating-star');
    mainRatingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            setRating('rating', rating, '#rating-stars');
            updateRatingText(rating);
        });
        
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            highlightStars('#rating-stars', rating);
        });
    });
    
    document.getElementById('rating-stars').addEventListener('mouseleave', () => {
        const currentRating = parseInt(document.getElementById('rating').value) || 0;
        highlightStars('#rating-stars', currentRating);
    });
    
    // Detailed ratings
    ['service', 'delivery', 'quality'].forEach(type => {
        const stars = document.querySelectorAll(`.${type}-rating .rating-star`);
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                const fieldName = type === 'quality' ? 'product_quality_rating' : `${type}_rating`;
                setRating(fieldName, rating, `.${type}-rating`);
            });
            
            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                highlightStars(`.${type}-rating`, rating);
            });
        });
        
        document.querySelector(`.${type}-rating`).addEventListener('mouseleave', () => {
            const fieldName = type === 'quality' ? 'product_quality_rating' : `${type}_rating`;
            const currentRating = parseInt(document.getElementById(fieldName).value) || 0;
            highlightStars(`.${type}-rating`, currentRating);
        });
    });
}

function setRating(fieldName, rating, containerSelector) {
    document.getElementById(fieldName).value = rating;
    highlightStars(containerSelector, rating);
}

function highlightStars(containerSelector, rating) {
    const stars = document.querySelectorAll(`${containerSelector} .rating-star`);
    stars.forEach((star, index) => {
        const starIcon = star.querySelector('i');
        if (index < rating) {
            starIcon.className = 'fas fa-star';
            star.classList.remove('text-gray-300');
            star.classList.add('text-yellow-400');
        } else {
            starIcon.className = 'far fa-star';
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        }
    });
}

function updateRatingText(rating) {
    const texts = {
        1: 'سيء جداً',
        2: 'سيء',
        3: 'متوسط',
        4: 'جيد',
        5: 'ممتاز'
    };
    document.getElementById('rating-text').textContent = texts[rating] || 'اختر التقييم';
}

function checkFeedbackPermissions() {
    const user = authService.getCurrentUser();
    const feedbackFormSection = document.getElementById('feedback-form-section');
    
    if (!authService.isAuthenticated()) {
        feedbackFormSection.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-sign-in-alt text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">تسجيل الدخول مطلوب</h3>
                <p class="text-gray-600 mb-4">يجب تسجيل الدخول لترك مراجعة</p>
                <a href="#/login" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    تسجيل الدخول
                </a>
            </div>
        `;
    } else if (user.role === 'store_owner') {
        feedbackFormSection.style.display = 'none';
    }
}

async function handleFeedbackSubmit(event, storeSlug) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-feedback-btn');
    const submitText = document.getElementById('submit-feedback-text');
    const submitLoading = document.getElementById('submit-feedback-loading');
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitLoading.classList.remove('hidden');
    
    try {
        const formData = new FormData(event.target);
        const feedbackData = {
            rating: parseInt(formData.get('rating')),
            service_rating: parseInt(formData.get('service_rating')) || null,
            delivery_rating: parseInt(formData.get('delivery_rating')) || null,
            product_quality_rating: parseInt(formData.get('product_quality_rating')) || null,
            title: formData.get('title'),
            comment: formData.get('comment')
        };
        
        // Validate required fields
        if (!feedbackData.rating || !feedbackData.title || !feedbackData.comment) {
            throw new Error('يرجى ملء جميع الحقول المطلوبة');
        }
        
        // Submit feedback
        await storeService.submitStoreFeedback(storeSlug, feedbackData);
        
        showToast('تم إرسال مراجعتك بنجاح! شكراً لك على وقتك.', 'success');
        
        // Reset form
        event.target.reset();
        resetRatings();
        
        // Reload feedback list
        setTimeout(() => {
            loadFeedbackData(storeSlug);
        }, 1000);
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showToast(error.message || 'حدث خطأ أثناء إرسال المراجعة. حاول مرة أخرى.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
    }
}

function resetRatings() {
    // Reset all rating inputs
    ['rating', 'service_rating', 'delivery_rating', 'product_quality_rating'].forEach(fieldName => {
        document.getElementById(fieldName).value = '';
    });
    
    // Reset all star displays
    const allStars = document.querySelectorAll('.rating-star');
    allStars.forEach(star => {
        const starIcon = star.querySelector('i');
        starIcon.className = 'far fa-star';
        star.classList.remove('text-yellow-400');
        star.classList.add('text-gray-300');
    });
    
    // Reset rating text
    document.getElementById('rating-text').textContent = 'اختر التقييم';
}

function displayFeedbackList(feedbackList) {
    const container = document.getElementById('feedback-list');
    
    if (!feedbackList || feedbackList.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-comments text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">لا توجد مراجعات بعد</h3>
                <p class="text-gray-600">كن أول من يترك مراجعة لهذا المتجر</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = feedbackList.map(feedback => `
        <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-blue-600"></i>
                    </div>
                    <div>
                        <h3 class="font-medium text-gray-900">${feedback.customer_name}</h3>
                        <div class="flex items-center mt-1">
                            ${generateStars(feedback.rating)}
                            <span class="text-sm text-gray-500 mr-2">${formatDate(feedback.created_at)}</span>
                            ${feedback.is_verified ? `
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    <i class="fas fa-check-circle mr-1"></i>
                                    مراجعة موثقة
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-gray-900">${feedback.rating}.0</div>
                    <div class="text-xs text-gray-500">من 5</div>
                </div>
            </div>
            
            <h4 class="font-medium text-gray-900 mb-2">${feedback.title}</h4>
            <p class="text-gray-700 mb-4">${feedback.comment}</p>
            
            ${feedback.service_rating || feedback.delivery_rating || feedback.product_quality_rating ? `
                <div class="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    ${feedback.service_rating ? `
                        <div class="text-center">
                            <div class="text-sm text-gray-600">الخدمة</div>
                            <div class="flex justify-center mt-1">
                                ${generateStars(feedback.service_rating, 'text-xs')}
                            </div>
                        </div>
                    ` : ''}
                    ${feedback.delivery_rating ? `
                        <div class="text-center">
                            <div class="text-sm text-gray-600">التوصيل</div>
                            <div class="flex justify-center mt-1">
                                ${generateStars(feedback.delivery_rating, 'text-xs')}
                            </div>
                        </div>
                    ` : ''}
                    ${feedback.product_quality_rating ? `
                        <div class="text-center">
                            <div class="text-sm text-gray-600">الجودة</div>
                            <div class="flex justify-center mt-1">
                                ${generateStars(feedback.product_quality_rating, 'text-xs')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
            
            ${feedback.owner_response ? `
                <div class="mt-4 p-4 bg-blue-50 rounded-lg border-r-4 border-blue-400">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-store text-blue-600 mr-2"></i>
                        <span class="font-medium text-blue-900">رد المتجر</span>
                        <span class="text-sm text-blue-600 mr-2">${formatDate(feedback.responded_at)}</span>
                    </div>
                    <p class="text-blue-800">${feedback.owner_response}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function initFilters() {
    const sortSelect = document.getElementById('sort-feedback');
    const filterSelect = document.getElementById('filter-rating');
    
    sortSelect.addEventListener('change', applyFilters);
    filterSelect.addEventListener('change', applyFilters);
}

function applyFilters() {
    // This would filter and sort the feedback list
    // For now, we'll just reload the data
    console.log('Applying filters...');
}

function generateStars(rating, sizeClass = '') {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += `<i class="fas fa-star text-yellow-400 ${sizeClass}"></i>`;
    }
    
    // Half star
    if (hasHalfStar) {
        stars += `<i class="fas fa-star-half-alt text-yellow-400 ${sizeClass}"></i>`;
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += `<i class="far fa-star text-yellow-400 ${sizeClass}"></i>`;
    }
    
    return stars;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}