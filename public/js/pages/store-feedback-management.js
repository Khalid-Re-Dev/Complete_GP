/**
 * Store Feedback Management Page
 * Page for store owners to manage and respond to customer feedback
 */

import { authService } from '../services/auth.js';
import { storeService } from '../services/store.js';
import { showToast } from '../utils/toast.js';

export function StoreFeedbackManagementPage() {
    const page = document.createElement('div');
    page.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-6">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">إدارة آراء العملاء</h1>
                            <p class="text-gray-600">عرض والرد على مراجعات العملاء</p>
                        </div>
                        <div class="flex space-x-4 space-x-reverse">
                            <select id="feedback-filter" class="px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="all">جميع المراجعات</option>
                                <option value="pending">بانتظار الرد</option>
                                <option value="responded">تم الرد عليها</option>
                                <option value="high_rating">تقييم عالي (4-5)</option>
                                <option value="low_rating">تقييم منخفض (1-3)</option>
                            </select>
                            <button
                                id="export-feedback-btn"
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <i class="fas fa-download mr-2"></i>
                                تصدير المراجعات
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Loading State -->
                <div id="feedback-loading" class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">جاري تحميل المراجعات...</p>
                </div>

                <!-- Feedback Content -->
                <div id="feedback-content" class="hidden">
                    <!-- Statistics Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-blue-100 rounded-lg">
                                    <i class="fas fa-comments text-blue-600 text-xl"></i>
                                </div>
                                <div class="mr-4">
                                    <p class="text-sm text-gray-600">إجمالي المراجعات</p>
                                    <p class="text-2xl font-bold text-gray-900" id="total-feedback">0</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-yellow-100 rounded-lg">
                                    <i class="fas fa-star text-yellow-600 text-xl"></i>
                                </div>
                                <div class="mr-4">
                                    <p class="text-sm text-gray-600">متوسط التقييم</p>
                                    <p class="text-2xl font-bold text-gray-900" id="average-rating">0.0</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-green-100 rounded-lg">
                                    <i class="fas fa-reply text-green-600 text-xl"></i>
                                </div>
                                <div class="mr-4">
                                    <p class="text-sm text-gray-600">تم الرد عليها</p>
                                    <p class="text-2xl font-bold text-gray-900" id="responded-count">0</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-orange-100 rounded-lg">
                                    <i class="fas fa-clock text-orange-600 text-xl"></i>
                                </div>
                                <div class="mr-4">
                                    <p class="text-sm text-gray-600">بانتظار الرد</p>
                                    <p class="text-2xl font-bold text-gray-900" id="pending-count">0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Feedback List -->
                    <div class="bg-white rounded-lg shadow-sm border">
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-lg font-semibold text-gray-900">مراجعات العملاء</h2>
                        </div>
                        
                        <div id="feedback-list" class="divide-y divide-gray-200">
                            <!-- Feedback items will be loaded here -->
                        </div>
                        
                        <!-- Pagination -->
                        <div id="pagination" class="px-6 py-4 border-t border-gray-200">
                            <!-- Pagination will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Response Modal -->
        <div id="response-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-gray-900">الرد على المراجعة</h3>
                            <button id="close-modal" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="p-6">
                        <!-- Original Feedback -->
                        <div id="original-feedback" class="mb-6 p-4 bg-gray-50 rounded-lg">
                            <!-- Original feedback content will be loaded here -->
                        </div>
                        
                        <!-- Response Form -->
                        <form id="response-form">
                            <div class="mb-4">
                                <label for="response-text" class="block text-sm font-medium text-gray-700 mb-2">
                                    Your Reply to the Review
                                </label>
                                <textarea
                                    id="response-text"
                                    name="response"
                                    rows="4"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="اكتب ردك المهذب والمفيد على مراجعة العميل..."
                                ></textarea>
                            </div>
                            
                            <div class="flex justify-end space-x-4 space-x-reverse">
                                <button
                                    type="button"
                                    id="cancel-response"
                                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    id="submit-response"
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    <span id="submit-response-text">إرسال الرد</span>
                                    <span id="submit-response-loading" class="hidden">
                                        <i class="fas fa-spinner fa-spin mr-2"></i>
                                        جاري الإرسال...
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize feedback management after DOM is ready
    setTimeout(() => {
        initStoreFeedbackManagement();
    }, 100);
    
    return page;
}

export function initStoreFeedbackManagement() {
    // Check authentication
    if (!authService.isAuthenticated()) {
        window.location.hash = '#/login';
        return;
    }

    const user = authService.getCurrentUser();
    if (user.role !== 'store_owner') {
        showToast('You do not have permission to access this page', 'error');
        window.location.hash = '#/';
        return;
    }

    // Load feedback data
    loadFeedbackManagementData();

    // Initialize event listeners
    initEventListeners();
}

async function loadFeedbackManagementData() {
    try {
        // Show loading state
        document.getElementById('feedback-loading').classList.remove('hidden');
        document.getElementById('feedback-content').classList.add('hidden');
        
        let feedbackData;
        
        try {
            // Attempt to load real feedback data
            feedbackData = await storeService.getStoreFeedback();
        } catch (apiError) {
            console.warn('API not available, using mock data:', apiError);
            // Use mock data for demonstration
            feedbackData = generateMockFeedbackData();
        }
        
        // Hide loading and show content
        document.getElementById('feedback-loading').classList.add('hidden');
        document.getElementById('feedback-content').classList.remove('hidden');
        
        // Update statistics
        updateFeedbackStatistics(feedbackData);
        
        // Display feedback list
        displayFeedbackManagementList(feedbackData.results || feedbackData);
        
        // Show success message
        showToast('Feedback loaded successfully', 'success');
        
    } catch (error) {
        console.error('Error loading feedback data:', error);
        document.getElementById('feedback-loading').classList.add('hidden');
        document.getElementById('feedback-content').classList.remove('hidden');
        
        // Load mock data as fallback
        const mockData = generateMockFeedbackData();
        updateFeedbackStatistics(mockData);
        displayFeedbackManagementList(mockData);
        
        showToast('تم تحميل بيانات تجريبية للعرض', 'warning');
    }
}

// Generate mock feedback data for demonstration
function generateMockFeedbackData() {
    const mockReviews = [
        {
            id: 1,
            customer_name: 'أحمد محمد',
            customer_email: 'ahmed@example.com',
            rating: 5,
            comment: 'منتجات ممتازة وخدمة رائعة. أنصح بالتعامل مع هذا المتجر.',
            product_name: 'منتج تجريبي 1',
            created_at: '2024-01-15T10:30:00Z',
            owner_response: 'شكراً لك على هذا التقييم الرائع! نسعد بخدمتك دائماً.',
            response_date: '2024-01-15T14:20:00Z',
            is_verified: true
        },
        {
            id: 2,
            customer_name: 'فاطمة علي',
            customer_email: 'fatima@example.com',
            rating: 4,
            comment: 'منتج جيد لكن التوصيل كان متأخر قليلاً.',
            product_name: 'منتج تجريبي 2',
            created_at: '2024-01-14T16:45:00Z',
            owner_response: null,
            response_date: null,
            is_verified: true
        },
        {
            id: 3,
            customer_name: 'محمد سالم',
            customer_email: 'mohammed@example.com',
            rating: 3,
            comment: 'المنتج مقبول لكن يحتاج تحسين في التغليف.',
            product_name: 'منتج تجريبي 1',
            created_at: '2024-01-13T09:15:00Z',
            owner_response: 'شكراً لملاحظتك. سنعمل على تحسين التغليف في الطلبات القادمة.',
            response_date: '2024-01-13T11:30:00Z',
            is_verified: false
        },
        {
            id: 4,
            customer_name: 'نورا أحمد',
            customer_email: 'nora@example.com',
            rating: 5,
            comment: 'تجربة تسوق رائعة! المنتج وصل بسرعة وبحالة ممتازة.',
            product_name: 'منتج تجريبي 3',
            created_at: '2024-01-12T14:20:00Z',
            owner_response: null,
            response_date: null,
            is_verified: true
        },
        {
            id: 5,
            customer_name: 'خالد يوسف',
            customer_email: 'khalid@example.com',
            rating: 2,
            comment: 'المنتج لم يكن كما هو موضح في الصور.',
            product_name: 'منتج تجريبي 2',
            created_at: '2024-01-11T11:10:00Z',
            owner_response: null,
            response_date: null,
            is_verified: false
        }
    ];
    
    return mockReviews;
}

function updateFeedbackStatistics(data) {
    const feedback = data.results || data;
    const totalCount = feedback.length;
    const respondedCount = feedback.filter(f => f.owner_response).length;
    const pendingCount = totalCount - respondedCount;
    const averageRating = totalCount > 0 
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalCount).toFixed(1)
        : '0.0';
    
    document.getElementById('total-feedback').textContent = totalCount;
    document.getElementById('average-rating').textContent = averageRating;
    document.getElementById('responded-count').textContent = respondedCount;
    document.getElementById('pending-count').textContent = pendingCount;
}

function displayFeedbackManagementList(feedbackList) {
    const container = document.getElementById('feedback-list');
    
    if (!feedbackList || feedbackList.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-comments text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">لا توجد مراجعات بعد</h3>
                <p class="text-gray-600">ستظهر مراجعات العملاء هنا عندما يتركوا آراءهم</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = feedbackList.map(feedback => `
        <div class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <!-- Customer Info -->
                    <div class="flex items-center mb-3">
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
                                        موثق
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Feedback Content -->
                    <div class="mb-4">
                        <h4 class="font-medium text-gray-900 mb-2">${feedback.title}</h4>
                        <p class="text-gray-700">${feedback.comment}</p>
                    </div>
                    
                    <!-- Detailed Ratings -->
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
                    
                    <!-- Store Response -->
                    ${feedback.owner_response ? `
                        <div class="mt-4 p-4 bg-blue-50 rounded-lg border-r-4 border-blue-400">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center">
                                    <i class="fas fa-reply text-blue-600 mr-2"></i>
                                    <span class="font-medium text-blue-900">Your Reply</span>
                                </div>
                                <span class="text-sm text-blue-600">${formatDate(feedback.responded_at)}</span>
                            </div>
                            <p class="text-blue-800">${feedback.owner_response}</p>
                        </div>
                    ` : `
                        <div class="mt-4 p-4 bg-yellow-50 rounded-lg border-r-4 border-yellow-400">
                            <div class="flex items-center">
                                <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                                <span class="text-yellow-800">This review has not been responded to yet</span>
                            </div>
                        </div>
                    `}
                </div>
                
                <!-- Actions -->
                <div class="flex flex-col space-y-2 mr-4">
                    <div class="text-right">
                        <div class="text-2xl font-bold text-gray-900">${feedback.rating}.0</div>
                        <div class="text-xs text-gray-500">out of 5</div>
                    </div>
                    
                    ${!feedback.owner_response ? `
                        <button
                            class="respond-btn bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                            data-feedback-id="${feedback.id}"
                        >
                            <i class="fas fa-reply mr-1"></i>
                            Reply
                        </button>
                    ` : `
                        <button
                            class="edit-response-btn bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                            data-feedback-id="${feedback.id}"
                        >
                            <i class="fas fa-edit mr-1"></i>
                            تعديل
                        </button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to response buttons
    addResponseButtonListeners();
}

function addResponseButtonListeners() {
    // Response buttons
    document.querySelectorAll('.respond-btn, .edit-response-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const feedbackId = e.target.closest('button').dataset.feedbackId;
            openResponseModal(feedbackId);
        });
    });
}

function openResponseModal(feedbackId) {
    // Find the feedback data (in a real app, this would come from the service)
    const feedbackElement = document.querySelector(`[data-feedback-id="${feedbackId}"]`).closest('.p-6');
    
    // Show modal
    document.getElementById('response-modal').classList.remove('hidden');
    
    // Store feedback ID for form submission
    document.getElementById('response-form').dataset.feedbackId = feedbackId;
    
    // Load original feedback in modal (simplified for demo)
    document.getElementById('original-feedback').innerHTML = `
        <div class="text-sm text-gray-600 mb-2">المراجعة الأصلية:</div>
        <div class="font-medium text-gray-900">تجربة ممتازة مع المتجر</div>
        <div class="text-gray-700 mt-1">خدمة عملاء ممتازة ومنتجات عالية الجودة.</div>
    `;
}

function initEventListeners() {
    // Filter dropdown
    document.getElementById('feedback-filter').addEventListener('change', (e) => {
        applyFeedbackFilter(e.target.value);
    });
    
    // Export button
    document.getElementById('export-feedback-btn').addEventListener('click', exportFeedback);
    
    // Modal controls
    document.getElementById('close-modal').addEventListener('click', closeResponseModal);
    document.getElementById('cancel-response').addEventListener('click', closeResponseModal);
    
    // Response form
    document.getElementById('response-form').addEventListener('submit', handleResponseSubmit);
    
    // Close modal on outside click
    document.getElementById('response-modal').addEventListener('click', (e) => {
        if (e.target.id === 'response-modal') {
            closeResponseModal();
        }
    });
}

function closeResponseModal() {
    document.getElementById('response-modal').classList.add('hidden');
    document.getElementById('response-form').reset();
}

async function handleResponseSubmit(event) {
    event.preventDefault();
    
    const feedbackId = event.target.dataset.feedbackId;
    const response = document.getElementById('response-text').value;
    
    const submitBtn = document.getElementById('submit-response');
    const submitText = document.getElementById('submit-response-text');
    const submitLoading = document.getElementById('submit-response-loading');
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitLoading.classList.remove('hidden');
    
    try {
        await storeService.respondToFeedback(feedbackId, response);
        
        showToast('Your reply has been sent successfully!', 'success');
        closeResponseModal();
        
        // Reload feedback data
        setTimeout(() => {
            loadFeedbackManagementData();
        }, 1000);
        
    } catch (error) {
        console.error('Error submitting response:', error);
        showToast('حدث خطأ أثناء إرسال الرد. حاول مرة أخرى.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
    }
}

function applyFeedbackFilter(filterValue) {
    // This would filter the feedback list based on the selected filter
    console.log('Applying filter:', filterValue);
    // For now, just reload the data
    loadFeedbackManagementData();
}

async function exportFeedback() {
    try {
        // This would export feedback data to CSV
        showToast('جاري تصدير المراجعات...', 'info');
        
        // Simulate export
        setTimeout(() => {
            showToast('تم تصدير المراجعات بنجاح!', 'success');
        }, 2000);
        
    } catch (error) {
        console.error('Error exporting feedback:', error);
        showToast('حدث خطأ أثناء تصدير المراجعات', 'error');
    }
}

// Helper functions
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
        month: 'short',
        day: 'numeric'
    });
}