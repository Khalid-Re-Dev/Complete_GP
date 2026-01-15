/**
 * Store Owner Dashboard Page
 * Comprehensive dashboard for store owners to manage their store and view analytics
 */

import { authService } from '../services/auth.js';
import { storeService } from '../services/store.js';
import { showToast } from '../utils/toast.js';

export function StoreDashboardPage() {
    const page = document.createElement('div');
    page.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Dashboard Header -->
            <div class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-6">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">Store Dashboard</h1>
                            <p class="text-gray-600" id="store-name">Loading...</p>
                        </div>
                        <div class="flex space-x-4 space-x-reverse">
                            <button
                                id="add-product-btn"
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <i class="fas fa-plus mr-2"></i>
                                Add Product
                            </button>
                            <a
                                href="#/store/products"
                                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                            >
                                <i class="fas fa-box mr-2"></i>
                                Manage Products
                            </a>
                            <a
                                href="#/store/analytics"
                                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
                            >
                                <i class="fas fa-chart-line mr-2"></i>
                                Analytics
                            </a>
                            <button
                                id="view-store-btn"
                                class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <i class="fas fa-eye mr-2"></i>
                                View Store
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Loading State -->
                <div id="dashboard-loading" class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">Loading store data...</p>
                </div>

                <!-- Dashboard Content -->
                <div id="dashboard-content" class="hidden">
                    <!-- Quick Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-blue-100 rounded-lg">
                                    <i class="fas fa-eye text-blue-600 text-xl"></i>
                                </div>
                                <div class="mr-4">
                                    <p class="text-sm text-gray-600">Total Views</p>
                                    <p class="text-2xl font-bold text-gray-900" id="total-views">0</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-green-100 rounded-lg">
                                    <i class="fas fa-box text-green-600 text-xl"></i>
                                </div>
                                <div class="mr-4">
                                    <p class="text-sm text-gray-600">Active Products</p>
                                    <p class="text-2xl font-bold text-gray-900" id="active-products">0</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-yellow-100 rounded-lg">
                                    <i class="fas fa-star text-yellow-600 text-xl"></i>
                                </div>
                                <div class="mr-4">
                                    <p class="text-sm text-gray-600">Average Rating</p>
                                    <p class="text-2xl font-bold text-gray-900" id="average-rating">0.0</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-purple-100 rounded-lg">
                                    <i class="fas fa-chart-line text-purple-600 text-xl"></i>
                                </div>
                                <div class="mr-4">
                                    <p class="text-sm text-gray-600">Performance Score</p>
                                    <p class="text-2xl font-bold text-gray-900" id="overall-score">0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Content Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Left Column -->
                        <div class="lg:col-span-2 space-y-8">
                            <!-- Performance Chart -->
                            <div class="bg-white p-6 rounded-lg shadow-sm border">
                                <h2 class="text-lg font-semibold text-gray-900 mb-4">Store Performance</h2>
                                <div class="grid grid-cols-3 gap-4 mb-6">
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-blue-600" id="popularity-score">0</div>
                                        <div class="text-sm text-gray-600">Popularity Points</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-green-600" id="engagement-score">0</div>
                                        <div class="text-sm text-gray-600">Engagement Points</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-purple-600" id="quality-score">0</div>
                                        <div class="text-sm text-gray-600">Quality Points</div>
                                    </div>
                                </div>
                                <div class="text-center">
                                    <button
                                        id="view-analytics-btn"
                                        class="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        View Detailed Analytics
                                    </button>
                                </div>
                            </div>

                            <!-- Top Products -->
                            <div class="bg-white p-6 rounded-lg shadow-sm border">
                                <div class="flex justify-between items-center mb-4">
                                    <h2 class="text-lg font-semibold text-gray-900">Top Products</h2>
                                    <a href="#/store/products" class="text-blue-600 hover:text-blue-800 text-sm">
                                        View All
                                    </a>
                                </div>
                                <div id="top-products" class="space-y-4">
                                    <!-- Products will be loaded here -->
                                </div>
                            </div>
                        </div>

                        <!-- Right Column -->
                        <div class="space-y-8">
                            <!-- Notifications -->
                            <div class="bg-white p-6 rounded-lg shadow-sm border">
                                <div class="flex justify-between items-center mb-4">
                                    <h2 class="text-lg font-semibold text-gray-900">الإشعارات</h2>
                                    <button
                                        id="mark-all-read-btn"
                                        class="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        تحديد الكل كمقروء
                                    </button>
                                </div>
                                <div id="notifications" class="space-y-3">
                                    <!-- Notifications will be loaded here -->
                                </div>
                            </div>

                            <!-- Recent Feedback -->
                            <div class="bg-white p-6 rounded-lg shadow-sm border">
                                <div class="flex justify-between items-center mb-4">
                                    <h2 class="text-lg font-semibold text-gray-900">آراء العملاء</h2>
                                    <a href="#/store/feedback" class="text-blue-600 hover:text-blue-800 text-sm">
                                        عرض الكل
                                    </a>
                                </div>
                                <div id="recent-feedback" class="space-y-4">
                                    <!-- Feedback will be loaded here -->
                                </div>
                            </div>

                            <!-- Quick Actions -->
                            <div class="bg-white p-6 rounded-lg shadow-sm border">
                                <h2 class="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h2>
                                <div class="space-y-3">
                                    <button
                                        id="manage-products-btn"
                                        class="w-full text-right px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <i class="fas fa-box text-gray-600 mr-3"></i>
                                        Manage Products
                                    </button>
                                    <button
                                        id="view-orders-btn"
                                        class="w-full text-right px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <i class="fas fa-shopping-cart text-gray-600 mr-3"></i>
                                        View Orders
                                    </button>
                                    <button
                                        id="store-settings-btn"
                                        class="w-full text-right px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <i class="fas fa-cog text-gray-600 mr-3"></i>
                                        Store Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize the page after DOM is ready
    setTimeout(() => {
        initStoreDashboard();
    }, 100);
    
    return page;
}

export function initStoreDashboard() {
    // Check if user is authenticated and is store owner
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

    // Load dashboard data
    loadDashboardData();

    // Initialize event listeners
    initEventListeners();
}

async function loadDashboardData() {
    try {
        const dashboardData = await storeService.getDashboardData();
        
        // Hide loading and show content
        document.getElementById('dashboard-loading').classList.add('hidden');
        document.getElementById('dashboard-content').classList.remove('hidden');
        
        // Update store name
        document.getElementById('store-name').textContent = dashboardData.store_info.name;
        
        // Update quick stats
        const analytics = dashboardData.analytics;
        document.getElementById('total-views').textContent = analytics.total_views.toLocaleString();
        document.getElementById('active-products').textContent = analytics.active_products;
        document.getElementById('average-rating').textContent = analytics.average_rating.toFixed(1);
        document.getElementById('overall-score').textContent = Math.round(analytics.overall_score);
        
        // Update performance scores
        document.getElementById('popularity-score').textContent = Math.round(analytics.popularity_score);
        document.getElementById('engagement-score').textContent = Math.round(analytics.engagement_score);
        document.getElementById('quality-score').textContent = Math.round(analytics.quality_score);
        
        // Load top products
        loadTopProducts(dashboardData.top_products);
        
        // Load notifications
        loadNotifications(dashboardData.recent_notifications);
        
        // Load recent feedback
        loadRecentFeedback(dashboardData.recent_feedback);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Check if error is due to no store found
        if (error.message && error.message.includes('404')) {
            // User doesn't have a store, show setup message
            showStoreSetupRequired();
        } else {
            showToast('Error loading store data', 'error');
        }
    }
}

function loadTopProducts(products) {
    const container = document.getElementById('top-products');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-box text-4xl mb-4"></i>
                <p>No products yet</p>
                <button class="mt-2 text-blue-600 hover:text-blue-800" onclick="location.hash='/store/products'">
                    Add New Product
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.slice(0, 5).map(product => `
        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <img
                src="${product.image_urls && product.image_urls[0] ? product.image_urls[0] : '/placeholder.jpg'}"
                alt="${product.name}"
                class="w-12 h-12 object-cover rounded-lg ml-3"
            >
            <div class="flex-1">
                <h3 class="font-medium text-gray-900 text-sm">${product.name}</h3>
                <div class="flex items-center mt-1">
                    <span class="text-xs text-gray-500">${product.view_count} مشاهدة</span>
                    <span class="mx-2 text-gray-300">•</span>
                    <div class="flex items-center">
                        <i class="fas fa-star text-yellow-400 text-xs"></i>
                        <span class="text-xs text-gray-500 mr-1">${product.average_rating.toFixed(1)}</span>
                    </div>
                </div>
            </div>
            <div class="text-right">
                <p class="font-medium text-gray-900">${product.price} ر.س</p>
            </div>
        </div>
    `).join('');
}

function loadNotifications(notifications) {
    const container = document.getElementById('notifications');
    
    if (!notifications || notifications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-bell-slash text-2xl mb-2"></i>
                <p class="text-sm">لا توجد إشعارات جديدة</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notification => `
        <div class="flex items-start p-3 ${notification.is_read ? 'bg-gray-50' : 'bg-blue-50'} rounded-lg">
            <div class="flex-shrink-0">
                <i class="fas ${getNotificationIcon(notification.notification_type)} text-blue-600"></i>
            </div>
            <div class="mr-3 flex-1">
                <p class="text-sm font-medium text-gray-900">${notification.title}</p>
                <p class="text-xs text-gray-600 mt-1">${notification.message}</p>
                <p class="text-xs text-gray-400 mt-1">${formatDate(notification.created_at)}</p>
            </div>
            ${!notification.is_read ? `
                <button
                    class="text-blue-600 hover:text-blue-800 text-xs"
                    onclick="markNotificationRead(${notification.id})"
                >
                    تحديد كمقروء
                </button>
            ` : ''}
        </div>
    `).join('');
}

function loadRecentFeedback(feedback) {
    const container = document.getElementById('recent-feedback');
    
    if (!feedback || feedback.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-comments text-2xl mb-2"></i>
                <p class="text-sm">لا توجد آراء عملاء بعد</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = feedback.slice(0, 3).map(item => `
        <div class="p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-sm text-gray-900">${item.customer_name}</span>
                <div class="flex items-center">
                    ${generateStars(item.rating)}
                </div>
            </div>
            <p class="text-sm text-gray-600">${item.comment.substring(0, 100)}${item.comment.length > 100 ? '...' : ''}</p>
            <p class="text-xs text-gray-400 mt-2">${formatDate(item.created_at)}</p>
        </div>
    `).join('');
}

function initEventListeners() {
    // Add product button
    document.getElementById('add-product-btn')?.addEventListener('click', () => {
        window.location.hash = '#/store/products/add';
    });
    
    // View store button
    document.getElementById('view-store-btn')?.addEventListener('click', async () => {
        try {
            const dashboardData = await storeService.getDashboardData();
            window.location.hash = `#/stores/${dashboardData.store_info.slug}`;
        } catch (error) {
            console.error('Error getting store slug:', error);
        }
    });
    
    // View analytics button
    document.getElementById('view-analytics-btn')?.addEventListener('click', () => {
        window.location.hash = '#/store/analytics';
    });
    
    // Mark all notifications as read
    document.getElementById('mark-all-read-btn')?.addEventListener('click', markAllNotificationsRead);
    
    // Quick action buttons
    document.getElementById('manage-products-btn')?.addEventListener('click', () => {
        window.location.hash = '#/store/products';
    });
    
    document.getElementById('view-orders-btn')?.addEventListener('click', () => {
        window.location.hash = '#/store/orders';
    });
    
    document.getElementById('store-settings-btn')?.addEventListener('click', () => {
        window.location.hash = '#/store/settings';
    });
}

async function markNotificationRead(notificationId) {
    try {
        await storeService.markNotificationRead(notificationId);
        showToast('Notification marked as read', 'success');
        loadDashboardData(); // Refresh data
    } catch (error) {
        console.error('Error marking notification as read:', error);
        showToast('Error updating notification', 'error');
    }
}

async function markAllNotificationsRead() {
    try {
        await storeService.markAllNotificationsRead();
        showToast('تم تحديد جميع الإشعارات كمقروءة', 'success');
        loadDashboardData(); // Refresh data
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        showToast('حدث خطأ أثناء تحديث الإشعارات', 'error');
    }
}

function getNotificationIcon(type) {
    const icons = {
        'new_review': 'fa-star',
        'low_stock': 'fa-exclamation-triangle',
        'high_engagement': 'fa-chart-line',
        'performance_milestone': 'fa-trophy',
        'system_update': 'fa-info-circle'
    };
    return icons[type] || 'fa-bell';
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star text-yellow-400 text-xs"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt text-yellow-400 text-xs"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star text-yellow-400 text-xs"></i>';
    }
    
    return stars;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'أمس';
    } else if (diffDays < 7) {
        return `منذ ${diffDays} أيام`;
    } else {
        return date.toLocaleDateString('ar-SA');
    }
}

/**
 * Show store setup required message
 */
function showStoreSetupRequired() {
    // Hide loading
    document.getElementById('dashboard-loading').classList.add('hidden');
    
    // Show setup message in dashboard content
    const dashboardContent = document.getElementById('dashboard-content');
    dashboardContent.innerHTML = `
        <div class="text-center py-12">
            <div class="text-blue-600 text-6xl mb-4">
                <i class="fa-solid fa-store"></i>
            </div>
            <h2 class="text-2xl font-bold mb-4">Store Setup Required</h2>
            <p class="text-gray-600 mb-6">You need to set up your store before accessing the dashboard.</p>
            <button class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors" onclick="setupStore()">
                <i class="fa-solid fa-plus mr-2"></i>
                Set Up Store
            </button>
        </div>
    `;
    dashboardContent.classList.remove('hidden');
}

/**
 * Setup store function - show dialog with options
 */
window.setupStore = function() {
    console.log('🏪 setupStore() called');
    
    // Create modal dialog
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    modal.style.zIndex = '9999';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.innerHTML = `
        <div style="
            background: white; 
            border-radius: 12px; 
            padding: 32px; 
            max-width: 400px; 
            width: 90%; 
            margin: 0 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            position: relative;
            z-index: 10000;
        ">
            <div style="text-align: center;">
                <div style="color: #2563eb; font-size: 4rem; margin-bottom: 16px;">
                    <i class="fa-solid fa-store"></i>
                </div>
                <h2 style="font-size: 1.5rem; font-weight: bold; color: #111827; margin-bottom: 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    Create Your Store
                </h2>
                <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    Welcome! To start using the dashboard, you need to create your store first.
                </p>
                
                <div style="margin-bottom: 16px;">
                    <button 
                        onclick="proceedToStoreApplication()" 
                        style="
                            width: 100%; 
                            background: #2563eb; 
                            color: white; 
                            padding: 12px 24px; 
                            border-radius: 8px; 
                            font-weight: 500; 
                            border: none; 
                            cursor: pointer;
                            font-size: 16px;
                            transition: background-color 0.2s;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        "
                        onmouseover="this.style.background='#1d4ed8'"
                        onmouseout="this.style.background='#2563eb'"
                    >
                        <i class="fa-solid fa-plus" style="margin-right: 8px;"></i>
                        Create New Store
                    </button>
                </div>
                
                <div>
                    <button 
                        onclick="closeStoreSetupModal()" 
                        style="
                            width: 100%; 
                            background: #e5e7eb; 
                            color: #374151; 
                            padding: 12px 24px; 
                            border-radius: 8px; 
                            font-weight: 500; 
                            border: none; 
                            cursor: pointer;
                            font-size: 16px;
                            transition: background-color 0.2s;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        "
                        onmouseover="this.style.background='#d1d5db'"
                        onmouseout="this.style.background='#e5e7eb'"
                    >
                        Cancel
                    </button>
                </div>
                
                <div style="margin-top: 24px; font-size: 14px; color: #9ca3af; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <p>You will be redirected to the store application form</p>
                </div>
            </div>
        </div>
    `;
    
    // Add fade-in animation
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.3s ease-in-out';
    
    // Add to page
    document.body.appendChild(modal);
    
    // Trigger fade-in
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeStoreSetupModal();
        }
    });
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Add ESC key support
    const handleEscKey = (e) => {
        if (e.key === 'Escape') {
            closeStoreSetupModal();
            document.removeEventListener('keydown', handleEscKey);
        }
    };
    document.addEventListener('keydown', handleEscKey);
    
    console.log('✅ Modal created and added to page');
}

/**
 * Proceed to store application
 */
window.proceedToStoreApplication = function() {
    console.log('🚀 Proceeding to store application');
    closeStoreSetupModal();
    showToast('Redirecting to store application...', 'info');
    
    // Add longer delay to ensure modal closes and state is stable
    setTimeout(() => {
        console.log('🔄 Navigating to store application');
        window.location.hash = '#/store/apply';
    }, 800);
}

/**
 * Close store setup modal
 */
window.closeStoreSetupModal = function() {
    console.log('❌ Closing store setup modal');
    const modal = document.querySelector('[style*="z-index: 9999"]');
    if (modal) {
        // Fade out animation
        modal.style.opacity = '0';
        
        // Remove after animation
        setTimeout(() => {
            modal.remove();
            // Restore body scroll
            document.body.style.overflow = '';
            console.log('✅ Modal removed');
        }, 300);
    }
}

// Make functions available globally for onclick handlers
window.markNotificationRead = markNotificationRead;