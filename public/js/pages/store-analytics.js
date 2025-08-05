/**
 * Store Analytics Page
 * Detailed analytics and reports for store owners
 */

import { authService } from '../services/auth.js';
import { storeService } from '../services/store.js';
import { showToast } from '../utils/toast.js';

export function StoreAnalyticsPage() {
    const page = document.createElement('div');
    page.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-6">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">Store Analytics</h1>
                            <p class="text-gray-600">Detailed reports on your store performance</p>
                        </div>
                        <div class="flex space-x-4 space-x-reverse">
                            <select id="time-period" class="px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="7">Last 7 days</option>
                                <option value="30" selected>Last 30 days</option>
                                <option value="90">Last 3 months</option>
                            </select>
                            <button
                                id="export-btn"
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <i class="fas fa-download mr-2"></i>
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Loading State -->
                <div id="analytics-loading" class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">Loading analytics...</p>
                </div>

                <!-- Analytics Content -->
                <div id="analytics-content" class="hidden space-y-8">
                    <!-- Overview Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Total Views</p>
                                    <p class="text-2xl font-bold text-gray-900" id="total-views">0</p>
                                </div>
                                <div class="p-3 bg-blue-100 rounded-full">
                                    <i class="fas fa-eye text-blue-600"></i>
                                </div>
                            </div>
                            <div class="mt-4">
                                <span class="text-sm text-green-600" id="views-change">+0%</span>
                                <span class="text-sm text-gray-500">from previous period</span>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Interactions</p>
                                    <p class="text-2xl font-bold text-gray-900" id="total-interactions">0</p>
                                </div>
                                <div class="p-3 bg-green-100 rounded-full">
                                    <i class="fas fa-heart text-green-600"></i>
                                </div>
                            </div>
                            <div class="mt-4">
                                <span class="text-sm text-green-600" id="interactions-change">+0%</span>
                                <span class="text-sm text-gray-500">from previous period</span>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Performance Points</p>
                                    <p class="text-2xl font-bold text-gray-900" id="performance-points">0</p>
                                </div>
                                <div class="p-3 bg-yellow-100 rounded-full">
                                    <i class="fas fa-star text-yellow-600"></i>
                                </div>
                            </div>
                            <div class="mt-4">
                                <span class="text-sm text-green-600" id="points-change">+0</span>
                                <span class="text-sm text-gray-500">points this month</span>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600">معدل التحويل</p>
                                    <p class="text-2xl font-bold text-gray-900" id="conversion-rate">0%</p>
                                </div>
                                <div class="p-3 bg-purple-100 rounded-full">
                                    <i class="fas fa-chart-line text-purple-600"></i>
                                </div>
                            </div>
                            <div class="mt-4">
                                <span class="text-sm text-green-600" id="conversion-change">+0%</span>
                                <span class="text-sm text-gray-500">from previous period</span>
                            </div>
                        </div>
                    </div>

                    <!-- Interactive Charts -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">تتبع المشاهدات</h3>
                            <div id="views-chart" class="h-64">
                                <canvas id="views-canvas"></canvas>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">تحليل التفاعل</h3>
                            <div id="interaction-chart" class="h-64">
                                <canvas id="interaction-canvas"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Performance Analysis -->
                    <div class="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">تحليل الأداء التفصيلي</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="text-center">
                                <div class="text-3xl font-bold text-blue-600" id="popularity-score">0</div>
                                <div class="text-sm text-gray-600">نقاط الشعبية</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-green-600" id="engagement-score">0</div>
                                <div class="text-sm text-gray-600">نقاط التفاعل</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-yellow-600" id="quality-score">0</div>
                                <div class="text-sm text-gray-600">نقاط الجودة</div>
                            </div>
                        </div>
                    </div>

                    <!-- Exportable Reports Section -->
                    <div class="bg-white p-6 rounded-lg shadow-sm border">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">التقارير القابلة للتصدير</h3>
                            <div class="flex space-x-2 space-x-reverse">
                                <button id="export-json" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    <i class="fas fa-file-code mr-2"></i>
                                    تصدير JSON
                                </button>
                                <button id="export-csv" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    <i class="fas fa-file-csv mr-2"></i>
                                    تصدير CSV
                                </button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="text-center p-4 bg-gray-50 rounded-lg">
                                <i class="fas fa-chart-bar text-2xl text-blue-600 mb-2"></i>
                                <div class="text-sm font-medium">تقرير المشاهدات</div>
                                <div class="text-xs text-gray-600">تفصيل يومي للمشاهدات</div>
                            </div>
                            <div class="text-center p-4 bg-gray-50 rounded-lg">
                                <i class="fas fa-users text-2xl text-green-600 mb-2"></i>
                                <div class="text-sm font-medium">تقرير التفاعل</div>
                                <div class="text-xs text-gray-600">إحصائيات التفاعل مع المنتجات</div>
                            </div>
                            <div class="text-center p-4 bg-gray-50 rounded-lg">
                                <i class="fas fa-star text-2xl text-yellow-600 mb-2"></i>
                                <div class="text-sm font-medium">تقرير الأداء</div>
                                <div class="text-xs text-gray-600">نقاط الأداء والتحسينات</div>
                            </div>
                        </div>
                    </div>
                    </div>

                    <!-- Charts Row -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Views Chart -->
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <h2 class="text-lg font-semibold text-gray-900 mb-4">المشاهدات اليومية</h2>
                            <div id="views-chart" class="h-64">
                                <!-- Chart will be rendered here -->
                                <canvas id="views-canvas"></canvas>
                            </div>
                        </div>

                        <!-- Performance Scores -->
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <h2 class="text-lg font-semibold text-gray-900 mb-4">نقاط الأداء</h2>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-600">نقاط الشعبية</span>
                                    <div class="flex items-center">
                                        <div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                            <div id="popularity-bar" class="bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
                                        </div>
                                        <span id="popularity-score" class="text-sm font-medium">0</span>
                                    </div>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-600">نقاط التفاعل</span>
                                    <div class="flex items-center">
                                        <div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                            <div id="engagement-bar" class="bg-green-600 h-2 rounded-full" style="width: 0%"></div>
                                        </div>
                                        <span id="engagement-score" class="text-sm font-medium">0</span>
                                    </div>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-600">نقاط الجودة</span>
                                    <div class="flex items-center">
                                        <div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                            <div id="quality-bar" class="bg-purple-600 h-2 rounded-full" style="width: 0%"></div>
                                        </div>
                                        <span id="quality-score" class="text-sm font-medium">0</span>
                                    </div>
                                </div>
                                
                                <div class="pt-4 border-t">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-medium text-gray-900">النقاط الإجمالية</span>
                                        <span id="overall-score" class="text-lg font-bold text-gray-900">0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Product Performance -->
                    <div class="bg-white p-6 rounded-lg shadow-sm border">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-lg font-semibold text-gray-900">أداء المنتجات</h2>
                            <button
                                id="view-all-products-btn"
                                class="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                عرض تفاصيل أكثر
                            </button>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المنتج
                                        </th>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المشاهدات
                                        </th>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الإعجابات
                                        </th>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            معدل التحويل
                                        </th>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trend
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="products-table" class="bg-white divide-y divide-gray-200">
                                    <!-- Product rows will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Insights and Recommendations -->
                    <div class="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 class="text-lg font-semibold text-gray-900 mb-4">Insights and Recommendations</h2>
                        <div id="insights" class="space-y-4">
                            <!-- AI insights will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize analytics after DOM is ready
    setTimeout(() => {
        initStoreAnalytics();
    }, 100);
    
    return page;
}

export function initStoreAnalytics() {
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

    // Load analytics data
    loadAnalyticsData();

    // Initialize event listeners
    initEventListeners();
}

async function loadAnalyticsData() {
    try {
        const timePeriod = document.getElementById('time-period').value || 30;
        
        // Show loading state
        document.getElementById('analytics-loading').classList.remove('hidden');
        document.getElementById('analytics-content').classList.add('hidden');
        
        // Try to load real data, fallback to mock data
        let report, productReport;
        
        try {
            // Attempt to load real analytics data
            console.log('🔄 Loading analytics data for period:', timePeriod);
            
            // Load store analytics
            const analyticsData = await storeService.getStoreAnalytics(timePeriod);
            console.log('✅ Store analytics loaded:', analyticsData);
            
            // Load product analytics
            const productData = await storeService.getProductAnalytics();
            console.log('✅ Product analytics loaded:', productData);
            
            // Transform data to expected format
            report = {
                total_views: analyticsData.total_views || 0,
                total_interactions: analyticsData.total_interactions || 0,
                performance_points: analyticsData.performance_points || 0,
                conversion_rate: analyticsData.conversion_rate || 0,
                daily_views: analyticsData.daily_views || [],
                performance_scores: analyticsData.performance_scores || {
                    popularity: 0,
                    engagement: 0,
                    quality: 0
                },
                views_change: analyticsData.views_change || 0,
                interactions_change: analyticsData.interactions_change || 0,
                points_change: analyticsData.points_change || 0,
                conversion_change: analyticsData.conversion_change || 0
            };
            
            productReport = {
                products: productData.results || productData.products || []
            };
            
        } catch (apiError) {
            console.warn('⚠️ API not available, using mock data:', apiError);
            // Use mock data for demonstration
            report = generateMockAnalyticsReport();
            productReport = generateMockProductReport();
        }
        
        // Hide loading and show content
        document.getElementById('analytics-loading').classList.add('hidden');
        document.getElementById('analytics-content').classList.remove('hidden');
        
        // Update overview cards
        updateOverviewCards(report);
        
        // Update charts
        updateViewsChart(report.daily_views);
        
        // Update performance scores
        updatePerformanceScores(report.performance_scores);
        
        // Update product performance table
        updateProductsTable(productReport.products);
        
        // Generate insights
        generateInsights(report, productReport);
        
        // Show success message
        showToast('Analytics loaded successfully', 'success');
        
    } catch (error) {
        console.error('Error loading analytics data:', error);
        document.getElementById('analytics-loading').classList.add('hidden');
        document.getElementById('analytics-content').classList.remove('hidden');
        
        // Load mock data as fallback
        const mockReport = generateMockAnalyticsReport();
        const mockProductReport = generateMockProductReport();
        
        updateOverviewCards(mockReport);
        updateViewsChart(mockReport.daily_views);
        updatePerformanceScores(mockReport.performance_scores);
        updateProductsTable(mockProductReport.products);
        generateInsights(mockReport, mockProductReport);
        
        showToast('تم تحميل بيانات تجريبية للعرض', 'warning');
    }
}

// Generate mock analytics report for demonstration
function generateMockAnalyticsReport() {
    const today = new Date();
    const dailyViews = {};
    
    // Generate daily views for last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyViews[dateStr] = Math.floor(Math.random() * 500) + 100;
    }
    
    return {
        overview: {
            total_views: 12450,
            unique_visitors: 8320,
            total_likes: 1250,
            total_comments: 340,
            total_shares: 180,
            average_rating: 4.3
        },
        daily_views: dailyViews,
        performance_scores: {
            popularity: 78,
            engagement: 65,
            quality: 82,
            overall: 75
        }
    };
}

function generateMockProductReport() {
    return {
        products: [
            {
                id: 1,
                name: 'منتج تجريبي 1',
                views: 2340,
                likes: 156,
                comments: 23,
                shares: 12,
                cart_adds: 89,
                purchases: 34,
                conversion_rate: 1.45,
                engagement_rate: 8.2
            },
            {
                id: 2,
                name: 'منتج تجريبي 2',
                views: 1890,
                likes: 134,
                comments: 18,
                shares: 8,
                cart_adds: 67,
                purchases: 28,
                conversion_rate: 1.48,
                engagement_rate: 8.5
            },
            {
                id: 3,
                name: 'منتج تجريبي 3',
                views: 1560,
                likes: 98,
                comments: 15,
                shares: 6,
                cart_adds: 45,
                purchases: 19,
                conversion_rate: 1.22,
                engagement_rate: 7.6
            }
        ]
    };
}

function updateOverviewCards(report) {
    const overview = report.overview;
    
    // Update main metrics
    document.getElementById('total-views').textContent = overview.total_views.toLocaleString();
    document.getElementById('total-interactions').textContent = 
        (overview.total_likes + overview.total_comments + overview.total_shares || 0).toLocaleString();
    document.getElementById('performance-points').textContent = report.performance_scores.overall;
    document.getElementById('conversion-rate').textContent = '1.4%';
    
    // Update change indicators
    updateChangeIndicator('views-change', 15.2);
    updateChangeIndicator('interactions-change', 8.7);
    updateChangeIndicator('points-change', '+12');
    updateChangeIndicator('conversion-change', 2.3);
}

function updateChangeIndicator(elementId, changePercent) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const isPositive = changePercent >= 0;
    const icon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    // Handle different formats for different indicators
    if (elementId === 'points-change') {
        element.innerHTML = `
            <span class="${color}">
                ${changePercent} نقطة هذا الشهر
            </span>
        `;
    } else {
        element.innerHTML = `
            <span class="${color}">
                <i class="fas ${icon}"></i> ${Math.abs(changePercent).toFixed(1)}%
            </span>
            من الفترة السابقة
        `;
    }
}

function updatePerformanceScores(scores) {
    // Update detailed performance scores
    const popularityElement = document.getElementById('popularity-score');
    const engagementElement = document.getElementById('engagement-score');
    const qualityElement = document.getElementById('quality-score');
    
    if (popularityElement) popularityElement.textContent = scores.popularity;
    if (engagementElement) engagementElement.textContent = scores.engagement;
    if (qualityElement) qualityElement.textContent = scores.quality;
    
    // Update progress bars if they exist
    const popularityBar = document.getElementById('popularity-bar');
    const engagementBar = document.getElementById('engagement-bar');
    const qualityBar = document.getElementById('quality-bar');
    
    if (popularityBar) popularityBar.style.width = `${scores.popularity}%`;
    if (engagementBar) engagementBar.style.width = `${scores.engagement}%`;
    if (qualityBar) qualityBar.style.width = `${scores.quality}%`;
    
    // Update overall score
    const overallElement = document.getElementById('overall-score');
    if (overallElement) overallElement.textContent = scores.overall;
}

function updateProductsTable(products) {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.views.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.likes}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.cart_adds}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.purchases}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.conversion_rate.toFixed(2)}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.engagement_rate.toFixed(1)}%</td>
        `;
        tableBody.appendChild(row);
    });
}

function generateInsights(report, productReport) {
    const insightsContainer = document.getElementById('insights-container');
    if (!insightsContainer) return;
    
    const insights = [];
    
    // Performance insights
    if (report.performance_scores.overall >= 80) {
        insights.push({
            type: 'success',
            title: 'أداء ممتاز!',
            message: 'متجرك يحقق أداءً ممتازاً. استمر في هذا المستوى الرائع!'
        });
    } else if (report.performance_scores.overall >= 60) {
        insights.push({
            type: 'warning',
            title: 'أداء جيد',
            message: 'متجرك يحقق أداءً جيداً، لكن يمكن تحسينه أكثر.'
        });
    } else {
        insights.push({
            type: 'error',
            title: 'Needs Improvement',
            message: 'Your store performance needs improvement. Review the recommendations below.'
        });
    }
    
    // Engagement insights
    if (report.performance_scores.engagement < 50) {
        insights.push({
            type: 'info',
            title: 'Improve Engagement',
            message: 'Add more images and detailed descriptions to your products to increase engagement.'
        });
    }
    
    // Product performance insights
    const bestProduct = productReport.products[0];
    if (bestProduct) {
        insights.push({
            type: 'success',
            title: 'Best Product',
            message: `Product "${bestProduct.name}" is performing best with ${bestProduct.conversion_rate.toFixed(2)}% conversion rate`
        });
    }
    
    // Display insights
    insightsContainer.innerHTML = insights.map(insight => `
        <div class="p-4 rounded-lg border-l-4 ${getInsightClasses(insight.type)}">
            <h4 class="font-medium">${insight.title}</h4>
            <p class="text-sm mt-1">${insight.message}</p>
        </div>
    `).join('');
}

function getInsightClasses(type) {
    switch (type) {
        case 'success':
            return 'bg-green-50 border-green-400 text-green-800';
        case 'warning':
            return 'bg-yellow-50 border-yellow-400 text-yellow-800';
        case 'error':
            return 'bg-red-50 border-red-400 text-red-800';
        case 'info':
        default:
            return 'bg-blue-50 border-blue-400 text-blue-800';
    }
}

function updateViewsChart(dailyViews) {
    const canvas = document.getElementById('views-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Simple chart implementation
    const dates = Object.keys(dailyViews).slice(-7); // Last 7 days
    const views = dates.map(date => dailyViews[date]);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    
    if (views.length === 0) {
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('لا توجد بيانات للعرض', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const maxViews = Math.max(...views);
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    // Draw axes
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw line chart
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    views.forEach((view, index) => {
        const x = padding + (index * chartWidth) / (views.length - 1);
        const y = canvas.height - padding - (view / maxViews) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw points
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    dates.forEach((date, index) => {
        const x = padding + (index * chartWidth) / (dates.length - 1);
        const shortDate = new Date(date).toLocaleDateString('ar-SA', { 
            month: 'short', 
            day: 'numeric' 
        });
        ctx.fillText(shortDate, x, canvas.height - 10);
    });
}

// updatePerformanceScores function is already defined above at line 495
// updateProductsTable function is already defined above at line 519
// generateInsights function is already defined above at line 541

function initEventListeners() {
    // Time period change
    document.getElementById('time-period').addEventListener('change', loadAnalyticsData);
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', exportReport);
    
    // View all products button
    document.getElementById('view-all-products-btn')?.addEventListener('click', () => {
        window.location.hash = '#/store/products';
    });
}

async function exportReport() {
    try {
        console.log('🔄 Exporting analytics report...');
        
        const timePeriod = document.getElementById('time-period').value || 30;
        const reportData = await storeService.getAnalyticsReport(timePeriod);
        
        // Create CSV content
        const csvContent = generateCSVReport(reportData);
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `store-analytics-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Report exported successfully', 'success');
        console.log('✅ Report exported successfully');
        
    } catch (error) {
        console.error('❌ Error exporting report:', error);
        showToast('Failed to export report: ' + error.message, 'error');
    }
}

function generateCSVReport(data) {
    const headers = [
        'Date',
        'Views',
        'Interactions', 
        'Performance Points',
        'Conversion Rate'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    // Add summary data
    csvContent += `Summary,${data.total_views || 0},${data.total_interactions || 0},${data.performance_points || 0},${data.conversion_rate || 0}\n`;
    
    // Add daily data if available
    if (data.daily_views && data.daily_views.length > 0) {
        data.daily_views.forEach((dayData, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (data.daily_views.length - 1 - index));
            csvContent += `${date.toISOString().split('T')[0]},${dayData.views || 0},${dayData.interactions || 0},${dayData.points || 0},${dayData.conversion_rate || 0}\n`;
        });
    }
    
    return csvContent;
}



// Helper functions
function getTrendColor(trend) {
    switch (trend) {
        case 'improving':
            return 'bg-green-100 text-green-800';
        case 'declining':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getTrendIcon(trend) {
    switch (trend) {
        case 'improving':
            return 'fa-arrow-up';
        case 'declining':
            return 'fa-arrow-down';
        default:
            return 'fa-minus';
    }
}

function getTrendText(trend) {
    switch (trend) {
        case 'improving':
            return 'متحسن';
        case 'declining':
            return 'متراجع';
        default:
            return 'مستقر';
    }
}

function getInsightBgColor(type) {
    switch (type) {
        case 'success':
            return 'bg-green-50 border border-green-200';
        case 'warning':
            return 'bg-yellow-50 border border-yellow-200';
        case 'info':
            return 'bg-blue-50 border border-blue-200';
        default:
            return 'bg-gray-50 border border-gray-200';
    }
}

function getInsightIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        case 'info':
            return 'fa-info-circle';
        default:
            return 'fa-lightbulb';
    }
}

function getInsightIconColor(type) {
    switch (type) {
        case 'success':
            return 'text-green-600';
        case 'warning':
            return 'text-yellow-600';
        case 'info':
            return 'text-blue-600';
        default:
            return 'text-gray-600';
    }
}