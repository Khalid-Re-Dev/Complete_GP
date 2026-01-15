/**
 * Advanced Dashboard
 * Comprehensive business intelligence dashboard
 */

import { performanceMonitor } from '../utils/performance-monitor.js';
import { advancedAnalytics } from '../utils/advanced-analytics.js';
import { smartInventory } from '../utils/smart-inventory.js';
import { smartCRM } from '../utils/smart-crm.js';
import { showSuccess, showWarning, showError, showInfo } from '../utils/toast.js';

class AdvancedDashboard {
    constructor() {
        this.refreshInterval = null;
        this.widgets = new Map();
        this.filters = {
            timeframe: '30d',
            storeId: null,
            segment: 'all'
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadDashboardData();
            this.setupEventListeners();
            this.initializeWidgets();
            this.startRealTimeUpdates();
            
            showSuccess('تم تحميل لوحة التحكم المتقدمة بنجاح');
        } catch (error) {
            console.error('Error initializing advanced dashboard:', error);
            showError('خطأ في تحميل لوحة التحكم');
        }
    }

    async loadDashboardData() {
        // Show loading state
        this.showLoadingState();

        try {
            // Load data from all systems
            const [
                performanceData,
                analyticsData,
                inventoryData,
                crmData
            ] = await Promise.all([
                this.loadPerformanceData(),
                this.loadAnalyticsData(),
                this.loadInventoryData(),
                this.loadCRMData()
            ]);

            // Update dashboard with loaded data
            this.updateDashboard({
                performance: performanceData,
                analytics: analyticsData,
                inventory: inventoryData,
                crm: crmData
            });

            this.hideLoadingState();
        } catch (error) {
            this.hideLoadingState();
            throw error;
        }
    }

    async loadPerformanceData() {
        const report = performanceMonitor.getReport();
        return {
            pageLoadTime: report.pageLoadTime,
            apiResponseTime: report.averageApiResponseTime,
            errorRate: report.errorRate,
            userEngagement: report.userEngagement,
            recommendations: report.recommendations
        };
    }

    async loadAnalyticsData() {
        const dashboard = advancedAnalytics.generateRealTimeDashboard();
        return {
            realTimeMetrics: dashboard.metrics,
            alerts: dashboard.alerts,
            trends: dashboard.trends,
            recommendations: dashboard.recommendations
        };
    }

    async loadInventoryData() {
        const report = smartInventory.generateInventoryReport();
        const reorderRecommendations = smartInventory.generateReorderRecommendations();
        const insights = smartInventory.generateSmartInsights();
        
        return {
            summary: report.summary,
            topProducts: report.topProducts,
            slowMovers: report.slowMovers,
            alerts: report.stockAlerts,
            reorderRecommendations: reorderRecommendations,
            insights: insights
        };
    }

    async loadCRMData() {
        const report = smartCRM.generateCRMReport();
        return {
            customerMetrics: report.customerMetrics,
            segmentAnalysis: report.segmentAnalysis,
            campaignPerformance: report.campaignPerformance,
            insights: report.insights
        };
    }

    initializeWidgets() {
        // Performance Overview Widget
        this.createWidget('performance-overview', {
            title: 'نظرة عامة على الأداء',
            type: 'metrics',
            size: 'large',
            refreshInterval: 30000,
            render: this.renderPerformanceOverview.bind(this)
        });

        // Real-time Analytics Widget
        this.createWidget('realtime-analytics', {
            title: 'التحليلات المباشرة',
            type: 'chart',
            size: 'large',
            refreshInterval: 5000,
            render: this.renderRealTimeAnalytics.bind(this)
        });

        // Inventory Status Widget
        this.createWidget('inventory-status', {
            title: 'حالة المخزون',
            type: 'status',
            size: 'medium',
            refreshInterval: 60000,
            render: this.renderInventoryStatus.bind(this)
        });

        // Customer Insights Widget
        this.createWidget('customer-insights', {
            title: 'رؤى العملاء',
            type: 'insights',
            size: 'medium',
            refreshInterval: 300000,
            render: this.renderCustomerInsights.bind(this)
        });

        // Alerts & Notifications Widget
        this.createWidget('alerts-notifications', {
            title: 'التنبيهات والإشعارات',
            type: 'alerts',
            size: 'medium',
            refreshInterval: 10000,
            render: this.renderAlertsNotifications.bind(this)
        });

        // Business Intelligence Widget
        this.createWidget('business-intelligence', {
            title: 'ذكاء الأعمال',
            type: 'intelligence',
            size: 'large',
            refreshInterval: 600000,
            render: this.renderBusinessIntelligence.bind(this)
        });

        // Quick Actions Widget
        this.createWidget('quick-actions', {
            title: 'إجراءات سريعة',
            type: 'actions',
            size: 'small',
            refreshInterval: 0,
            render: this.renderQuickActions.bind(this)
        });

        // Revenue Analytics Widget
        this.createWidget('revenue-analytics', {
            title: 'تحليلات الإيرادات',
            type: 'revenue',
            size: 'large',
            refreshInterval: 300000,
            render: this.renderRevenueAnalytics.bind(this)
        });
    }

    createWidget(id, config) {
        const widget = {
            id: id,
            config: config,
            container: document.getElementById(id),
            lastUpdate: null,
            data: null
        };

        this.widgets.set(id, widget);
        
        if (widget.container) {
            this.renderWidget(widget);
            
            if (config.refreshInterval > 0) {
                setInterval(() => {
                    this.refreshWidget(id);
                }, config.refreshInterval);
            }
        }
    }

    renderWidget(widget) {
        if (!widget.container) return;

        widget.container.innerHTML = `
            <div class="widget-header">
                <h3 class="widget-title">${widget.config.title}</h3>
                <div class="widget-controls">
                    <button class="widget-refresh" onclick="advancedDashboard.refreshWidget('${widget.id}')">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="widget-settings" onclick="advancedDashboard.showWidgetSettings('${widget.id}')">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content" id="${widget.id}-content">
                <div class="widget-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>جاري التحميل...</span>
                </div>
            </div>
        `;

        // Render widget content
        widget.config.render(widget);
    }

    renderPerformanceOverview(widget) {
        const data = performanceMonitor.getReport();
        const content = document.getElementById(`${widget.id}-content`);
        
        content.innerHTML = `
            <div class="performance-metrics">
                <div class="metric-card">
                    <div class="metric-value">${data.pageLoadTime.toFixed(2)}ms</div>
                    <div class="metric-label">زمن تحميل الصفحة</div>
                    <div class="metric-status ${this.getPerformanceStatus(data.pageLoadTime, 3000)}">
                        <i class="fas ${this.getPerformanceIcon(data.pageLoadTime, 3000)}"></i>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${data.averageApiResponseTime.toFixed(2)}ms</div>
                    <div class="metric-label">متوسط استجابة API</div>
                    <div class="metric-status ${this.getPerformanceStatus(data.averageApiResponseTime, 2000)}">
                        <i class="fas ${this.getPerformanceIcon(data.averageApiResponseTime, 2000)}"></i>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${(data.errorRate * 100).toFixed(2)}%</div>
                    <div class="metric-label">معدل الأخطاء</div>
                    <div class="metric-status ${this.getErrorRateStatus(data.errorRate)}">
                        <i class="fas ${this.getErrorRateIcon(data.errorRate)}"></i>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${data.userEngagement.toFixed(1)}</div>
                    <div class="metric-label">تفاعل المستخدمين</div>
                    <div class="metric-status ${this.getEngagementStatus(data.userEngagement)}">
                        <i class="fas ${this.getEngagementIcon(data.userEngagement)}"></i>
                    </div>
                </div>
            </div>
            
            <div class="performance-recommendations">
                <h4>توصيات التحسين</h4>
                <ul>
                    ${data.recommendations.map(rec => `
                        <li class="recommendation-item priority-${rec.priority}">
                            <i class="fas fa-lightbulb"></i>
                            <span>${rec.message}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    renderRealTimeAnalytics(widget) {
        const data = advancedAnalytics.generateRealTimeDashboard();
        const content = document.getElementById(`${widget.id}-content`);
        
        content.innerHTML = `
            <div class="realtime-metrics">
                <div class="metric-row">
                    <div class="metric-item">
                        <span class="metric-label">المستخدمون النشطون</span>
                        <span class="metric-value">${data.metrics.activeUsers || 0}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">مشاهدات الصفحة</span>
                        <span class="metric-value">${data.metrics.currentPageViews || 0}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">معدل التحويل</span>
                        <span class="metric-value">${(data.metrics.conversionRate || 0).toFixed(2)}%</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">معدل الارتداد</span>
                        <span class="metric-value">${(data.metrics.bounceRate || 0).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
            
            <div class="realtime-chart">
                <canvas id="realtime-chart-${widget.id}" width="400" height="200"></canvas>
            </div>
            
            <div class="realtime-alerts">
                ${data.alerts.map(alert => `
                    <div class="alert-item severity-${alert.severity}">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>${alert.message}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Render real-time chart
        this.renderRealTimeChart(`realtime-chart-${widget.id}`, data.trends);
    }

    renderInventoryStatus(widget) {
        const data = smartInventory.generateInventoryReport();
        const content = document.getElementById(`${widget.id}-content`);
        
        content.innerHTML = `
            <div class="inventory-summary">
                <div class="summary-card">
                    <div class="summary-value">${data.summary.totalProducts}</div>
                    <div class="summary-label">إجمالي المنتجات</div>
                </div>
                <div class="summary-card warning">
                    <div class="summary-value">${data.summary.lowStockItems}</div>
                    <div class="summary-label">مخزون منخفض</div>
                </div>
                <div class="summary-card danger">
                    <div class="summary-value">${data.summary.outOfStockItems}</div>
                    <div class="summary-label">نفد المخزون</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">${data.summary.totalValue.toLocaleString()} ر.س</div>
                    <div class="summary-label">قيمة المخزون</div>
                </div>
            </div>
            
            <div class="inventory-alerts">
                <h4>تنبيهات المخزون</h4>
                <div class="alerts-list">
                    ${data.alerts.slice(0, 5).map(alert => `
                        <div class="alert-item severity-${alert.severity}">
                            <i class="fas ${this.getInventoryAlertIcon(alert.type)}"></i>
                            <span>${this.getInventoryAlertMessage(alert)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="reorder-recommendations">
                <h4>توصيات إعادة الطلب</h4>
                <div class="recommendations-list">
                    ${data.reorderRecommendations.slice(0, 3).map(rec => `
                        <div class="recommendation-item">
                            <span class="product-name">${rec.productName}</span>
                            <span class="recommended-qty">${rec.recommendedQuantity} قطعة</span>
                            <span class="urgency urgency-${this.getUrgencyLevel(rec.urgency)}">
                                ${this.getUrgencyText(rec.urgency)}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCustomerInsights(widget) {
        const data = smartCRM.generateCRMReport();
        const content = document.getElementById(`${widget.id}-content`);
        
        content.innerHTML = `
            <div class="customer-metrics">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-value">${data.customerMetrics.totalCustomers}</div>
                        <div class="metric-label">إجمالي العملاء</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${data.customerMetrics.activeCustomers}</div>
                        <div class="metric-label">عملاء نشطون</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${data.customerMetrics.newCustomers}</div>
                        <div class="metric-label">عملاء جدد</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${data.customerMetrics.customerLifetimeValue.toFixed(0)} ر.س</div>
                        <div class="metric-label">قيمة العميل مدى الحياة</div>
                    </div>
                </div>
            </div>
            
            <div class="segment-analysis">
                <h4>تحليل شرائح العملاء</h4>
                <div class="segments-chart">
                    <canvas id="segments-chart-${widget.id}" width="300" height="200"></canvas>
                </div>
            </div>
            
            <div class="customer-insights-list">
                <h4>رؤى ذكية</h4>
                <div class="insights-list">
                    ${data.insights.slice(0, 3).map(insight => `
                        <div class="insight-item">
                            <i class="fas fa-brain"></i>
                            <span>${insight.message}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Render segments chart
        this.renderSegmentsChart(`segments-chart-${widget.id}`, data.segmentAnalysis);
    }

    renderAlertsNotifications(widget) {
        const performanceAlerts = performanceMonitor.getReport().recommendations;
        const analyticsAlerts = advancedAnalytics.generateRealTimeDashboard().alerts;
        const inventoryAlerts = smartInventory.generateInventoryReport().stockAlerts;
        
        const allAlerts = [
            ...performanceAlerts.map(alert => ({ ...alert, source: 'performance' })),
            ...analyticsAlerts.map(alert => ({ ...alert, source: 'analytics' })),
            ...inventoryAlerts.map(alert => ({ ...alert, source: 'inventory' }))
        ].sort((a, b) => this.getAlertPriority(b) - this.getAlertPriority(a));

        const content = document.getElementById(`${widget.id}-content`);
        
        content.innerHTML = `
            <div class="alerts-summary">
                <div class="alert-count critical">${allAlerts.filter(a => a.severity === 'critical' || a.priority === 'high').length}</div>
                <div class="alert-count warning">${allAlerts.filter(a => a.severity === 'warning' || a.priority === 'medium').length}</div>
                <div class="alert-count info">${allAlerts.filter(a => a.severity === 'info' || a.priority === 'low').length}</div>
            </div>
            
            <div class="alerts-list">
                ${allAlerts.slice(0, 10).map(alert => `
                    <div class="alert-item severity-${alert.severity || alert.priority}">
                        <div class="alert-icon">
                            <i class="fas ${this.getAlertIcon(alert)}"></i>
                        </div>
                        <div class="alert-content">
                            <div class="alert-title">${alert.title || alert.message}</div>
                            <div class="alert-source">${this.getAlertSourceText(alert.source)}</div>
                        </div>
                        <div class="alert-time">
                            ${this.formatAlertTime(alert.timestamp || new Date())}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderBusinessIntelligence(widget) {
        const content = document.getElementById(`${widget.id}-content`);
        
        // Generate comprehensive business insights
        const insights = this.generateBusinessInsights();
        
        content.innerHTML = `
            <div class="bi-overview">
                <div class="bi-score">
                    <div class="score-value">${insights.overallScore}</div>
                    <div class="score-label">نقاط الأداء العام</div>
                    <div class="score-trend ${insights.trend}">
                        <i class="fas ${insights.trend === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                        ${insights.trendPercentage}%
                    </div>
                </div>
            </div>
            
            <div class="bi-insights">
                <h4>رؤى ذكية للأعمال</h4>
                <div class="insights-grid">
                    ${insights.keyInsights.map(insight => `
                        <div class="insight-card impact-${insight.impact}">
                            <div class="insight-icon">
                                <i class="fas ${insight.icon}"></i>
                            </div>
                            <div class="insight-content">
                                <h5>${insight.title}</h5>
                                <p>${insight.description}</p>
                                <div class="insight-actions">
                                    ${insight.actions.map(action => `
                                        <button class="action-btn" onclick="advancedDashboard.executeAction('${action.id}')">
                                            ${action.label}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="bi-predictions">
                <h4>التنبؤات والتوقعات</h4>
                <div class="predictions-list">
                    ${insights.predictions.map(prediction => `
                        <div class="prediction-item">
                            <div class="prediction-metric">${prediction.metric}</div>
                            <div class="prediction-value">${prediction.value}</div>
                            <div class="prediction-confidence">ثقة: ${prediction.confidence}%</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderQuickActions(widget) {
        const content = document.getElementById(`${widget.id}-content`);
        
        content.innerHTML = `
            <div class="quick-actions-grid">
                <button class="action-btn primary" onclick="advancedDashboard.exportReport()">
                    <i class="fas fa-download"></i>
                    تصدير التقرير
                </button>
                
                <button class="action-btn secondary" onclick="advancedDashboard.refreshAllData()">
                    <i class="fas fa-sync-alt"></i>
                    تحديث البيانات
                </button>
                
                <button class="action-btn warning" onclick="advancedDashboard.runDiagnostics()">
                    <i class="fas fa-stethoscope"></i>
                    تشخيص النظام
                </button>
                
                <button class="action-btn info" onclick="advancedDashboard.showSettings()">
                    <i class="fas fa-cog"></i>
                    الإعدادات
                </button>
                
                <button class="action-btn success" onclick="advancedDashboard.generateInsights()">
                    <i class="fas fa-brain"></i>
                    توليد رؤى
                </button>
                
                <button class="action-btn danger" onclick="advancedDashboard.clearCache()">
                    <i class="fas fa-trash"></i>
                    مسح التخزين المؤقت
                </button>
            </div>
        `;
    }

    renderRevenueAnalytics(widget) {
        const content = document.getElementById(`${widget.id}-content`);
        
        // Generate revenue analytics data
        const revenueData = this.generateRevenueAnalytics();
        
        content.innerHTML = `
            <div class="revenue-overview">
                <div class="revenue-metrics">
                    <div class="metric-card">
                        <div class="metric-value">${revenueData.totalRevenue.toLocaleString()} ر.س</div>
                        <div class="metric-label">إجمالي الإيرادات</div>
                        <div class="metric-change positive">+${revenueData.revenueGrowth}%</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${revenueData.averageOrderValue.toFixed(0)} ر.س</div>
                        <div class="metric-label">متوسط قيمة الطلب</div>
                        <div class="metric-change ${revenueData.aovChange >= 0 ? 'positive' : 'negative'}">
                            ${revenueData.aovChange >= 0 ? '+' : ''}${revenueData.aovChange}%
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${revenueData.conversionRate.toFixed(2)}%</div>
                        <div class="metric-label">معدل التحويل</div>
                        <div class="metric-change ${revenueData.conversionChange >= 0 ? 'positive' : 'negative'}">
                            ${revenueData.conversionChange >= 0 ? '+' : ''}${revenueData.conversionChange}%
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="revenue-chart">
                <canvas id="revenue-chart-${widget.id}" width="600" height="300"></canvas>
            </div>
            
            <div class="revenue-insights">
                <h4>رؤى الإيرادات</h4>
                <ul>
                    ${revenueData.insights.map(insight => `
                        <li class="insight-item">
                            <i class="fas fa-lightbulb"></i>
                            ${insight}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        // Render revenue chart
        this.renderRevenueChart(`revenue-chart-${widget.id}`, revenueData.chartData);
    }

    // Chart rendering methods
    renderRealTimeChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        // Simple line chart implementation
        // In a real application, you would use Chart.js or similar library
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Draw sample trend line
        const points = data.length || 10;
        for (let i = 0; i < points; i++) {
            const x = (i / (points - 1)) * canvas.width;
            const y = canvas.height - (Math.random() * 0.5 + 0.3) * canvas.height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }

    renderSegmentsChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        // Simple pie chart implementation
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        let currentAngle = 0;
        
        Object.entries(data || {}).forEach(([segment, count], index) => {
            const sliceAngle = (count / 100) * 2 * Math.PI; // Assuming total of 100
            
            ctx.fillStyle = colors[index % colors.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            currentAngle += sliceAngle;
        });
    }

    renderRevenueChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        // Simple bar chart implementation
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = canvas.width / (data.length || 12);
        const maxValue = Math.max(...(data.map(d => d.value) || [100]));
        
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * (canvas.height - 40);
            const x = index * barWidth;
            const y = canvas.height - barHeight - 20;
            
            ctx.fillStyle = '#3B82F6';
            ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
            
            // Draw labels
            ctx.fillStyle = '#6B7280';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, canvas.height - 5);
        });
    }

    // Business intelligence methods
    generateBusinessInsights() {
        const performanceData = performanceMonitor.getReport();
        const analyticsData = advancedAnalytics.generateRealTimeDashboard();
        const inventoryData = smartInventory.generateInventoryReport();
        const crmData = smartCRM.generateCRMReport();

        // Calculate overall business score
        const overallScore = this.calculateOverallScore({
            performance: performanceData,
            analytics: analyticsData,
            inventory: inventoryData,
            crm: crmData
        });

        return {
            overallScore: overallScore,
            trend: 'up',
            trendPercentage: 12.5,
            keyInsights: [
                {
                    title: 'تحسين الأداء',
                    description: 'يمكن تحسين سرعة الموقع بنسبة 25% من خلال تحسين الصور',
                    impact: 'high',
                    icon: 'fa-rocket',
                    actions: [
                        { id: 'optimize_images', label: 'تحسين الصور' },
                        { id: 'enable_caching', label: 'تفعيل التخزين المؤقت' }
                    ]
                },
                {
                    title: 'فرصة زيادة المبيعات',
                    description: 'هناك 15% من العملاء معرضون لخطر التوقف عن الشراء',
                    impact: 'medium',
                    icon: 'fa-chart-line',
                    actions: [
                        { id: 'retention_campaign', label: 'حملة استبقاء' },
                        { id: 'personalized_offers', label: 'عروض شخصية' }
                    ]
                },
                {
                    title: 'تحسين المخزون',
                    description: 'يمكن توفير 20% من تكاليف المخزون من خلال التحسين الذكي',
                    impact: 'medium',
                    icon: 'fa-boxes',
                    actions: [
                        { id: 'auto_reorder', label: 'إعادة طلب تلقائية' },
                        { id: 'demand_forecast', label: 'توقع الطلب' }
                    ]
                }
            ],
            predictions: [
                {
                    metric: 'الإيرادات الشهر القادم',
                    value: '125,000 ر.س',
                    confidence: 85
                },
                {
                    metric: 'عدد العملاء الجدد',
                    value: '450 عميل',
                    confidence: 78
                },
                {
                    metric: 'معدل التحويل المتوقع',
                    value: '3.2%',
                    confidence: 92
                }
            ]
        };
    }

    generateRevenueAnalytics() {
        // Mock revenue data - in real app, this would come from actual sales data
        return {
            totalRevenue: 450000,
            revenueGrowth: 15.2,
            averageOrderValue: 285,
            aovChange: 8.5,
            conversionRate: 2.8,
            conversionChange: 12.3,
            chartData: [
                { label: 'يناير', value: 35000 },
                { label: 'فبراير', value: 42000 },
                { label: 'مارس', value: 38000 },
                { label: 'أبريل', value: 45000 },
                { label: 'مايو', value: 52000 },
                { label: 'يونيو', value: 48000 }
            ],
            insights: [
                'نمو الإيرادات بنسبة 15% مقارنة بالفترة السابقة',
                'زيادة متوسط قيمة الطلب بفضل استراتيجية البيع المتقاطع',
                'تحسن معدل التحويل بنسبة 12% بعد تحسين تجربة المستخدم',
                'شهر مايو حقق أعلى إيرادات بقيمة 52,000 ر.س'
            ]
        };
    }

    calculateOverallScore(data) {
        // Calculate weighted score based on different metrics
        let score = 0;
        
        // Performance score (25% weight)
        const performanceScore = this.calculatePerformanceScore(data.performance);
        score += performanceScore * 0.25;
        
        // Analytics score (25% weight)
        const analyticsScore = this.calculateAnalyticsScore(data.analytics);
        score += analyticsScore * 0.25;
        
        // Inventory score (25% weight)
        const inventoryScore = this.calculateInventoryScore(data.inventory);
        score += inventoryScore * 0.25;
        
        // CRM score (25% weight)
        const crmScore = this.calculateCRMScore(data.crm);
        score += crmScore * 0.25;
        
        return Math.round(score);
    }

    calculatePerformanceScore(data) {
        let score = 100;
        
        // Deduct points for slow performance
        if (data.pageLoadTime > 3000) score -= 20;
        if (data.averageApiResponseTime > 2000) score -= 15;
        if (data.errorRate > 0.05) score -= 25;
        if (data.userEngagement < 10) score -= 10;
        
        return Math.max(score, 0);
    }

    calculateAnalyticsScore(data) {
        let score = 80; // Base score
        
        // Add points for good metrics
        if (data.metrics.conversionRate > 3) score += 10;
        if (data.metrics.bounceRate < 40) score += 10;
        
        return Math.min(score, 100);
    }

    calculateInventoryScore(data) {
        let score = 90; // Base score
        
        // Deduct points for inventory issues
        if (data.summary.outOfStockItems > 0) score -= 20;
        if (data.summary.lowStockItems > 5) score -= 10;
        
        return Math.max(score, 0);
    }

    calculateCRMScore(data) {
        let score = 85; // Base score
        
        // Add points for good customer metrics
        const activeRate = data.customerMetrics.activeCustomers / data.customerMetrics.totalCustomers;
        if (activeRate > 0.7) score += 15;
        
        return Math.min(score, 100);
    }

    // Event handlers and utility methods
    setupEventListeners() {
        // Filter controls
        document.getElementById('timeframe-filter')?.addEventListener('change', (e) => {
            this.filters.timeframe = e.target.value;
            this.refreshAllWidgets();
        });

        document.getElementById('store-filter')?.addEventListener('change', (e) => {
            this.filters.storeId = e.target.value;
            this.refreshAllWidgets();
        });

        // Real-time updates toggle
        document.getElementById('realtime-toggle')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.startRealTimeUpdates();
            } else {
                this.stopRealTimeUpdates();
            }
        });

        // Listen for system events
        window.addEventListener('realTimeMetricsUpdate', (event) => {
            this.updateRealTimeMetrics(event.detail);
        });

        window.addEventListener('inventoryAlert', (event) => {
            this.handleInventoryAlert(event.detail);
        });
    }

    startRealTimeUpdates() {
        if (this.refreshInterval) return;
        
        this.refreshInterval = setInterval(() => {
            this.refreshWidget('realtime-analytics');
            this.refreshWidget('alerts-notifications');
        }, 5000);
    }

    stopRealTimeUpdates() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    refreshWidget(widgetId) {
        const widget = this.widgets.get(widgetId);
        if (!widget) return;

        widget.config.render(widget);
        widget.lastUpdate = new Date();
    }

    refreshAllWidgets() {
        this.widgets.forEach((widget, id) => {
            this.refreshWidget(id);
        });
    }

    // Action handlers
    async exportReport() {
        try {
            showInfo('جاري تصدير التقرير...');
            
            const reportData = {
                timestamp: new Date(),
                performance: performanceMonitor.getReport(),
                analytics: advancedAnalytics.exportAnalyticsData(),
                inventory: smartInventory.generateInventoryReport(),
                crm: smartCRM.generateCRMReport()
            };

            const blob = new Blob([JSON.stringify(reportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `business-report-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            showSuccess('تم تصدير التقرير بنجاح');
        } catch (error) {
            showError('خطأ في تصدير التقرير');
        }
    }

    async refreshAllData() {
        try {
            showInfo('جاري تحديث جميع البيانات...');
            await this.loadDashboardData();
            showSuccess('تم تحديث البيانات بنجاح');
        } catch (error) {
            showError('خطأ في تحديث البيانات');
        }
    }

    async runDiagnostics() {
        showInfo('جاري تشغيل التشخيص...');
        
        const diagnostics = {
            performance: performanceMonitor.getReport(),
            systemHealth: this.checkSystemHealth(),
            recommendations: this.generateSystemRecommendations()
        };

        console.log('System Diagnostics:', diagnostics);
        showSuccess('تم إكمال التشخيص - راجع وحدة التحكم');
    }

    checkSystemHealth() {
        return {
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 'غير متاح',
            connectionType: navigator.connection ? navigator.connection.effectiveType : 'غير متاح',
            onlineStatus: navigator.onLine,
            timestamp: new Date()
        };
    }

    generateSystemRecommendations() {
        return [
            'تحسين استخدام الذاكرة',
            'تحديث المتصفح للحصول على أفضل أداء',
            'تفعيل التخزين المؤقت للبيانات',
            'مراقبة استقرار الاتصال بالإنترنت'
        ];
    }

    showLoadingState() {
        document.getElementById('dashboard-loading')?.classList.remove('hidden');
        document.getElementById('dashboard-content')?.classList.add('hidden');
    }

    hideLoadingState() {
        document.getElementById('dashboard-loading')?.classList.add('hidden');
        document.getElementById('dashboard-content')?.classList.remove('hidden');
    }

    // Utility methods for status and formatting
    getPerformanceStatus(value, threshold) {
        return value <= threshold ? 'good' : value <= threshold * 1.5 ? 'warning' : 'poor';
    }

    getPerformanceIcon(value, threshold) {
        return value <= threshold ? 'fa-check-circle' : value <= threshold * 1.5 ? 'fa-exclamation-triangle' : 'fa-times-circle';
    }

    getErrorRateStatus(rate) {
        return rate <= 0.01 ? 'good' : rate <= 0.05 ? 'warning' : 'poor';
    }

    getErrorRateIcon(rate) {
        return rate <= 0.01 ? 'fa-check-circle' : rate <= 0.05 ? 'fa-exclamation-triangle' : 'fa-times-circle';
    }

    getEngagementStatus(engagement) {
        return engagement >= 20 ? 'good' : engagement >= 10 ? 'warning' : 'poor';
    }

    getEngagementIcon(engagement) {
        return engagement >= 20 ? 'fa-check-circle' : engagement >= 10 ? 'fa-exclamation-triangle' : 'fa-times-circle';
    }

    getInventoryAlertIcon(type) {
        const icons = {
            low_stock: 'fa-exclamation-triangle',
            reorder_needed: 'fa-shopping-cart',
            overstock: 'fa-boxes',
            dead_stock: 'fa-skull'
        };
        return icons[type] || 'fa-info-circle';
    }

    getInventoryAlertMessage(alert) {
        const messages = {
            low_stock: `مخزون منخفض: ${alert.data.productId}`,
            reorder_needed: `يحتاج إعادة طلب: ${alert.data.productId}`,
            overstock: `مخزون زائد: ${alert.data.productId}`,
            dead_stock: `مخزون راكد: ${alert.data.productId}`
        };
        return messages[alert.type] || alert.message;
    }

    getUrgencyLevel(urgency) {
        if (urgency > 0.8) return 'high';
        if (urgency > 0.5) return 'medium';
        return 'low';
    }

    getUrgencyText(urgency) {
        if (urgency > 0.8) return 'عاجل';
        if (urgency > 0.5) return 'متوسط';
        return 'منخفض';
    }

    getAlertPriority(alert) {
        const priorities = {
            critical: 4,
            high: 3,
            warning: 2,
            medium: 2,
            info: 1,
            low: 1
        };
        return priorities[alert.severity] || priorities[alert.priority] || 0;
    }

    getAlertIcon(alert) {
        const icons = {
            performance: 'fa-tachometer-alt',
            analytics: 'fa-chart-bar',
            inventory: 'fa-boxes'
        };
        return icons[alert.source] || 'fa-bell';
    }

    getAlertSourceText(source) {
        const sources = {
            performance: 'الأداء',
            analytics: 'التحليلات',
            inventory: 'المخزون'
        };
        return sources[source] || source;
    }

    formatAlertTime(timestamp) {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `${minutes} دقيقة`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)} ساعة`;
        return `${Math.floor(minutes / 1440)} يوم`;
    }

    updateDashboard(data) {
        // Update dashboard with new data
        this.dashboardData = data;
        this.refreshAllWidgets();
    }
}

// Initialize advanced dashboard
const advancedDashboard = new AdvancedDashboard();

// Export for use in other modules
export { advancedDashboard, AdvancedDashboard };

// Make available globally
window.advancedDashboard = advancedDashboard;