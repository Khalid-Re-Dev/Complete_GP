/**
 * Advanced Reports System
 * Comprehensive reporting and analytics with AI insights
 */

import { apiService } from '../utils/api-service.js';
import { showSuccess, showWarning, showError, showInfo } from '../utils/toast.js';

class AdvancedReports {
    constructor() {
        this.reports = [];
        this.templates = [];
        this.scheduledReports = [];
        this.currentReport = null;
        this.filters = {
            dateRange: '30d',
            reportType: 'all',
            status: 'all',
            store: 'all'
        };
        
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadInitialData();
            this.renderReportsInterface();
            
            showSuccess('تم تحميل نظام التقارير المتقدم بنجاح');
        } catch (error) {
            console.error('Error initializing advanced reports:', error);
            showError('خطأ في تحميل نظام التقارير');
        }
    }

    setupEventListeners() {
        // Report generation buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="generate-report"]')) {
                const reportType = e.target.dataset.reportType;
                this.generateReport(reportType);
            }
            
            if (e.target.matches('[data-action="schedule-report"]')) {
                this.showScheduleReportModal();
            }
            
            if (e.target.matches('[data-action="export-report"]')) {
                const reportId = e.target.dataset.reportId;
                this.exportReport(reportId);
            }
            
            if (e.target.matches('[data-action="view-report"]')) {
                const reportId = e.target.dataset.reportId;
                this.viewReport(reportId);
            }
        });

        // Filter changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('.report-filter')) {
                this.updateFilters();
            }
        });
    }

    async loadInitialData() {
        try {
            const [reportsData, templatesData, scheduledData] = await Promise.all([
                this.loadReports(),
                this.loadReportTemplates(),
                this.loadScheduledReports()
            ]);

            this.reports = reportsData;
            this.templates = templatesData;
            this.scheduledReports = scheduledData;
        } catch (error) {
            console.error('Error loading reports data:', error);
            this.loadMockData();
        }
    }

    renderReportsInterface() {
        const container = document.getElementById('reports-container');
        if (!container) return;

        container.innerHTML = `
            <div class="reports-dashboard">
                ${this.renderReportsHeader()}
                ${this.renderQuickActions()}
                ${this.renderReportsFilters()}
                ${this.renderReportsGrid()}
                ${this.renderScheduledReports()}
                ${this.renderReportTemplates()}
            </div>
        `;

        this.setupReportCharts();
    }

    renderReportsHeader() {
        return `
            <div class="reports-header">
                <div class="header-content">
                    <h1>
                        <i class="fas fa-chart-bar"></i>
                        نظام التقارير المتقدم
                    </h1>
                    <p>تقارير شاملة ورؤى ذكية مدعومة بالذكاء الاصطناعي</p>
                </div>
                
                <div class="header-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${this.reports.length}</h3>
                            <p>إجمالي التقارير</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${this.scheduledReports.length}</h3>
                            <p>التقارير المجدولة</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-download"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${this.getDownloadCount()}</h3>
                            <p>مرات التحميل</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuickActions() {
        return `
            <div class="quick-actions-section">
                <h3>إجراءات سريعة</h3>
                <div class="quick-actions-grid">
                    <button class="action-btn primary" data-action="generate-report" data-report-type="sales">
                        <i class="fas fa-shopping-cart"></i>
                        <span>تقرير المبيعات</span>
                    </button>
                    
                    <button class="action-btn success" data-action="generate-report" data-report-type="inventory">
                        <i class="fas fa-boxes"></i>
                        <span>تقرير المخزون</span>
                    </button>
                    
                    <button class="action-btn info" data-action="generate-report" data-report-type="customers">
                        <i class="fas fa-users"></i>
                        <span>تقرير العملاء</span>
                    </button>
                    
                    <button class="action-btn warning" data-action="generate-report" data-report-type="performance">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>تقرير الأداء</span>
                    </button>
                    
                    <button class="action-btn secondary" data-action="generate-report" data-report-type="financial">
                        <i class="fas fa-dollar-sign"></i>
                        <span>التقرير المالي</span>
                    </button>
                    
                    <button class="action-btn danger" data-action="schedule-report">
                        <i class="fas fa-calendar-alt"></i>
                        <span>جدولة تقرير</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderReportsFilters() {
        return `
            <div class="reports-filters">
                <div class="filter-group">
                    <label for="date-range-filter">الفترة الزمنية:</label>
                    <select id="date-range-filter" class="form-control report-filter">
                        <option value="7d">آخر 7 أيام</option>
                        <option value="30d" selected>آخر 30 يوم</option>
                        <option value="90d">آخر 90 يوم</option>
                        <option value="1y">آخر سنة</option>
                        <option value="custom">فترة مخصصة</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="report-type-filter">نوع التقرير:</label>
                    <select id="report-type-filter" class="form-control report-filter">
                        <option value="all">جميع الأنواع</option>
                        <option value="sales">المبيعات</option>
                        <option value="inventory">المخزون</option>
                        <option value="customers">العملاء</option>
                        <option value="performance">الأداء</option>
                        <option value="financial">المالي</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="status-filter">الحالة:</label>
                    <select id="status-filter" class="form-control report-filter">
                        <option value="all">جميع الحالات</option>
                        <option value="completed">مكتمل</option>
                        <option value="processing">قيد المعالجة</option>
                        <option value="failed">فشل</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="store-filter">المتجر:</label>
                    <select id="store-filter" class="form-control report-filter">
                        <option value="all">جميع المتاجر</option>
                        ${this.getStoreOptions()}
                    </select>
                </div>
            </div>
        `;
    }

    renderReportsGrid() {
        const filteredReports = this.getFilteredReports();
        
        return `
            <div class="reports-section">
                <div class="section-header">
                    <h3>التقارير المتاحة</h3>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="advancedReports.refreshReports()">
                            <i class="fas fa-sync-alt"></i>
                            تحديث
                        </button>
                    </div>
                </div>
                
                <div class="reports-grid">
                    ${filteredReports.length > 0 ? 
                        filteredReports.map(report => this.renderReportCard(report)).join('') :
                        this.renderEmptyState('لا توجد تقارير متاحة')
                    }
                </div>
            </div>
        `;
    }

    renderReportCard(report) {
        return `
            <div class="report-card" data-report-id="${report.id}">
                <div class="report-header">
                    <div class="report-info">
                        <h4>${report.title}</h4>
                        <p class="report-type">${this.getReportTypeText(report.type)}</p>
                    </div>
                    <div class="report-status">
                        <span class="status-badge status-${report.status}">
                            ${this.getStatusText(report.status)}
                        </span>
                    </div>
                </div>
                
                <div class="report-body">
                    <div class="report-details">
                        <div class="detail-row">
                            <span class="label">تاريخ الإنشاء:</span>
                            <span class="value">${this.formatDate(report.created_at)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">الفترة:</span>
                            <span class="value">${report.date_range}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">الحجم:</span>
                            <span class="value">${report.file_size || 'غير محدد'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">مرات التحميل:</span>
                            <span class="value">${report.download_count || 0}</span>
                        </div>
                    </div>
                    
                    ${report.summary ? `
                        <div class="report-summary">
                            <h5>ملخص التقرير:</h5>
                            <p>${report.summary}</p>
                        </div>
                    ` : ''}
                    
                    ${report.ai_insights ? `
                        <div class="ai-insights">
                            <h5><i class="fas fa-brain"></i> رؤى ذكية:</h5>
                            <ul>
                                ${report.ai_insights.map(insight => `<li>${insight}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <div class="report-actions">
                    ${report.status === 'completed' ? `
                        <button class="btn btn-primary btn-sm" data-action="view-report" data-report-id="${report.id}">
                            <i class="fas fa-eye"></i>
                            عرض
                        </button>
                        <button class="btn btn-success btn-sm" data-action="export-report" data-report-id="${report.id}">
                            <i class="fas fa-download"></i>
                            تحميل
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-info btn-sm" onclick="advancedReports.shareReport('${report.id}')">
                        <i class="fas fa-share"></i>
                        مشاركة
                    </button>
                    
                    <button class="btn btn-warning btn-sm" onclick="advancedReports.duplicateReport('${report.id}')">
                        <i class="fas fa-copy"></i>
                        نسخ
                    </button>
                    
                    <button class="btn btn-danger btn-sm" onclick="advancedReports.deleteReport('${report.id}')">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
        `;
    }

    renderScheduledReports() {
        return `
            <div class="scheduled-reports-section">
                <div class="section-header">
                    <h3>التقارير المجدولة</h3>
                    <div class="section-actions">
                        <button class="btn btn-primary" data-action="schedule-report">
                            <i class="fas fa-plus"></i>
                            إضافة جدولة
                        </button>
                    </div>
                </div>
                
                <div class="scheduled-reports-list">
                    ${this.scheduledReports.length > 0 ? 
                        this.scheduledReports.map(schedule => this.renderScheduledReportCard(schedule)).join('') :
                        this.renderEmptyState('لا توجد تقارير مجدولة')
                    }
                </div>
            </div>
        `;
    }

    renderScheduledReportCard(schedule) {
        return `
            <div class="scheduled-report-card">
                <div class="schedule-info">
                    <h4>${schedule.name}</h4>
                    <p class="schedule-type">${this.getReportTypeText(schedule.report_type)}</p>
                </div>
                
                <div class="schedule-details">
                    <div class="detail-item">
                        <span class="label">التكرار:</span>
                        <span class="value">${this.getFrequencyText(schedule.frequency)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">التشغيل التالي:</span>
                        <span class="value">${this.formatDate(schedule.next_run)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">الحالة:</span>
                        <span class="status-badge status-${schedule.status}">
                            ${schedule.is_active ? 'نشط' : 'متوقف'}
                        </span>
                    </div>
                </div>
                
                <div class="schedule-actions">
                    <button class="btn btn-sm ${schedule.is_active ? 'btn-warning' : 'btn-success'}" 
                            onclick="advancedReports.toggleSchedule('${schedule.id}')">
                        <i class="fas fa-${schedule.is_active ? 'pause' : 'play'}"></i>
                        ${schedule.is_active ? 'إيقاف' : 'تشغيل'}
                    </button>
                    
                    <button class="btn btn-info btn-sm" onclick="advancedReports.editSchedule('${schedule.id}')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    
                    <button class="btn btn-danger btn-sm" onclick="advancedReports.deleteSchedule('${schedule.id}')">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
        `;
    }

    renderReportTemplates() {
        return `
            <div class="report-templates-section">
                <div class="section-header">
                    <h3>قوالب التقارير</h3>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="advancedReports.createTemplate()">
                            <i class="fas fa-plus"></i>
                            إنشاء قالب
                        </button>
                    </div>
                </div>
                
                <div class="templates-grid">
                    ${this.templates.map(template => this.renderTemplateCard(template)).join('')}
                </div>
            </div>
        `;
    }

    renderTemplateCard(template) {
        return `
            <div class="template-card">
                <div class="template-header">
                    <h4>${template.name}</h4>
                    <span class="template-type">${this.getReportTypeText(template.type)}</span>
                </div>
                
                <div class="template-body">
                    <p>${template.description}</p>
                    
                    <div class="template-features">
                        <h5>الميزات المتضمنة:</h5>
                        <ul>
                            ${template.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="template-actions">
                    <button class="btn btn-primary btn-sm" onclick="advancedReports.useTemplate('${template.id}')">
                        <i class="fas fa-play"></i>
                        استخدام القالب
                    </button>
                    
                    <button class="btn btn-info btn-sm" onclick="advancedReports.previewTemplate('${template.id}')">
                        <i class="fas fa-eye"></i>
                        معاينة
                    </button>
                    
                    <button class="btn btn-warning btn-sm" onclick="advancedReports.editTemplate('${template.id}')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                </div>
            </div>
        `;
    }

    // Report generation functions
    async generateReport(type) {
        try {
            showInfo(`جاري إنشاء تقرير ${this.getReportTypeText(type)}...`);
            
            const reportData = await this.createReport(type);
            
            if (reportData.success) {
                showSuccess('تم إنشاء التقرير بنجاح');
                await this.refreshReports();
                
                // Show report preview
                this.showReportPreview(reportData.report);
            } else {
                showError('فشل في إنشاء التقرير');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            showError('خطأ في إنشاء التقرير');
        }
    }

    async createReport(type) {
        // Simulate report generation
        return new Promise((resolve) => {
            setTimeout(() => {
                const report = {
                    id: Date.now().toString(),
                    title: `تقرير ${this.getReportTypeText(type)} - ${new Date().toLocaleDateString('ar-SA')}`,
                    type: type,
                    status: 'completed',
                    created_at: new Date().toISOString(),
                    date_range: this.filters.dateRange,
                    file_size: '2.5 MB',
                    download_count: 0,
                    summary: this.generateReportSummary(type),
                    ai_insights: this.generateAIInsights(type),
                    data: this.generateReportData(type)
                };
                
                this.reports.unshift(report);
                resolve({ success: true, report });
            }, 2000);
        });
    }

    generateReportSummary(type) {
        const summaries = {
            sales: 'إجمالي المبيعات: 125,000 ر.س | نمو 15% مقارنة بالشهر الماضي | أفضل منتج: هاتف ذكي',
            inventory: 'إجمالي المنتجات: 1,250 | منتجات نفدت: 15 | منتجات بطيئة الحركة: 45',
            customers: 'إجمالي العملاء: 2,850 | عملاء جدد: 180 | معدل الاحتفاظ: 85%',
            performance: 'متوسط وقت التحميل: 1.2 ثانية | معدل التحويل: 3.5% | رضا العملاء: 4.2/5',
            financial: 'إجمالي الإيرادات: 125,000 ر.س | صافي الربح: 25,000 ر.س | هامش الربح: 20%'
        };
        
        return summaries[type] || 'ملخص التقرير غير متوفر';
    }

    generateAIInsights(type) {
        const insights = {
            sales: [
                'توقع زيادة المبيعات بنسبة 12% في الشهر القادم',
                'منتجات الإلكترونيات تحقق أعلى معدل ربح',
                'يُنصح بزيادة المخزون من الهواتف الذكية'
            ],
            inventory: [
                'يُتوقع نفاد مخزون 8 منتجات خلال أسبوعين',
                'منتجات الملابس الشتوية بطيئة الحركة',
                'يُنصح بتخفيض أسعار المنتجات الراكدة'
            ],
            customers: [
                'العملاء الجدد يفضلون الدفع الإلكتروني',
                'معدل العودة للشراء مرتفع في فئة 25-35 سنة',
                'يُنصح بحملة تسويقية للعملاء غير النشطين'
            ],
            performance: [
                'تحسن ملحوظ في سرعة الموقع',
                'صفحة المنتجات تحتاج تحسين',
                'معدل التحويل أعلى في الأجهزة المحمولة'
            ],
            financial: [
                'نمو مستقر في الإيرادات',
                'تكاليف الشحن مرتفعة نسبياً',
                'يُنصح بمراجعة استراتيجية التسعير'
            ]
        };
        
        return insights[type] || ['لا توجد رؤى متاحة'];
    }

    generateReportData(type) {
        // Generate mock data based on report type
        const data = {
            sales: {
                totalSales: 125000,
                ordersCount: 450,
                averageOrderValue: 278,
                topProducts: [
                    { name: 'هاتف ذكي', sales: 45000, quantity: 120 },
                    { name: 'لابتوب', sales: 35000, quantity: 50 },
                    { name: 'ساعة ذكية', sales: 25000, quantity: 200 }
                ]
            },
            inventory: {
                totalProducts: 1250,
                inStock: 1200,
                outOfStock: 15,
                lowStock: 35,
                slowMoving: 45
            },
            customers: {
                totalCustomers: 2850,
                newCustomers: 180,
                activeCustomers: 1200,
                retentionRate: 85
            },
            performance: {
                pageLoadTime: 1.2,
                conversionRate: 3.5,
                bounceRate: 45,
                customerSatisfaction: 4.2
            },
            financial: {
                totalRevenue: 125000,
                netProfit: 25000,
                profitMargin: 20,
                expenses: 100000
            }
        };
        
        return data[type] || {};
    }

    // Modal and UI functions
    showReportPreview(report) {
        const modal = this.createModal('report-preview', 'معاينة التقرير', this.getReportPreviewContent(report));
        document.body.appendChild(modal);
    }

    getReportPreviewContent(report) {
        return `
            <div class="report-preview">
                <div class="preview-header">
                    <h3>${report.title}</h3>
                    <div class="report-meta">
                        <span class="meta-item">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(report.created_at)}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-file"></i>
                            ${report.file_size}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-tag"></i>
                            ${this.getReportTypeText(report.type)}
                        </span>
                    </div>
                </div>
                
                <div class="preview-content">
                    <div class="summary-section">
                        <h4>ملخص التقرير</h4>
                        <p>${report.summary}</p>
                    </div>
                    
                    <div class="insights-section">
                        <h4><i class="fas fa-brain"></i> الرؤى الذكية</h4>
                        <ul>
                            ${report.ai_insights.map(insight => `<li>${insight}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="data-section">
                        <h4>البيانات الرئيسية</h4>
                        <div class="data-grid">
                            ${this.renderReportDataPreview(report.data, report.type)}
                        </div>
                    </div>
                </div>
                
                <div class="preview-actions">
                    <button class="btn btn-primary" onclick="advancedReports.downloadReport('${report.id}')">
                        <i class="fas fa-download"></i>
                        تحميل التقرير
                    </button>
                    <button class="btn btn-success" onclick="advancedReports.shareReport('${report.id}')">
                        <i class="fas fa-share"></i>
                        مشاركة
                    </button>
                    <button class="btn btn-info" onclick="advancedReports.scheduleReport('${report.id}')">
                        <i class="fas fa-calendar"></i>
                        جدولة
                    </button>
                </div>
            </div>
        `;
    }

    renderReportDataPreview(data, type) {
        switch (type) {
            case 'sales':
                return `
                    <div class="data-item">
                        <span class="label">إجمالي المبيعات:</span>
                        <span class="value">${data.totalSales?.toLocaleString()} ر.س</span>
                    </div>
                    <div class="data-item">
                        <span class="label">عدد الطلبات:</span>
                        <span class="value">${data.ordersCount?.toLocaleString()}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">متوسط قيمة الطلب:</span>
                        <span class="value">${data.averageOrderValue?.toLocaleString()} ر.س</span>
                    </div>
                `;
            case 'inventory':
                return `
                    <div class="data-item">
                        <span class="label">إجمالي المنتجات:</span>
                        <span class="value">${data.totalProducts?.toLocaleString()}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">متوفر:</span>
                        <span class="value">${data.inStock?.toLocaleString()}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">نفد المخزون:</span>
                        <span class="value">${data.outOfStock?.toLocaleString()}</span>
                    </div>
                `;
            case 'customers':
                return `
                    <div class="data-item">
                        <span class="label">إجمالي العملاء:</span>
                        <span class="value">${data.totalCustomers?.toLocaleString()}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">عملاء جدد:</span>
                        <span class="value">${data.newCustomers?.toLocaleString()}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">معدل الاحتفاظ:</span>
                        <span class="value">${data.retentionRate}%</span>
                    </div>
                `;
            default:
                return '<p>بيانات التقرير غير متوفرة</p>';
        }
    }

    // Utility functions
    createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = id;
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.closest('.modal').remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }

    getReportTypeText(type) {
        const types = {
            sales: 'المبيعات',
            inventory: 'المخزون',
            customers: 'العملاء',
            performance: 'الأداء',
            financial: 'المالي'
        };
        return types[type] || type;
    }

    getStatusText(status) {
        const statuses = {
            completed: 'مكتمل',
            processing: 'قيد المعالجة',
            failed: 'فشل'
        };
        return statuses[status] || status;
    }

    getFrequencyText(frequency) {
        const frequencies = {
            daily: 'يومي',
            weekly: 'أسبوعي',
            monthly: 'شهري',
            quarterly: 'ربع سنوي',
            yearly: 'سنوي'
        };
        return frequencies[frequency] || frequency;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getFilteredReports() {
        return this.reports.filter(report => {
            const matchesType = this.filters.reportType === 'all' || report.type === this.filters.reportType;
            const matchesStatus = this.filters.status === 'all' || report.status === this.filters.status;
            return matchesType && matchesStatus;
        });
    }

    getStoreOptions() {
        return `
            <option value="store1">متجر الإلكترونيات</option>
            <option value="store2">متجر الأزياء</option>
            <option value="store3">متجر الكتب</option>
        `;
    }

    getDownloadCount() {
        return this.reports.reduce((total, report) => total + (report.download_count || 0), 0);
    }

    renderEmptyState(message) {
        return `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>${message}</h3>
                <p>لا توجد عناصر للعرض حالياً</p>
            </div>
        `;
    }

    // Action handlers
    async refreshReports() {
        showInfo('جاري تحديث التقارير...');
        await this.loadInitialData();
        this.renderReportsInterface();
        showSuccess('تم تحديث التقارير بنجاح');
    }

    updateFilters() {
        this.filters.dateRange = document.getElementById('date-range-filter')?.value || '30d';
        this.filters.reportType = document.getElementById('report-type-filter')?.value || 'all';
        this.filters.status = document.getElementById('status-filter')?.value || 'all';
        this.filters.store = document.getElementById('store-filter')?.value || 'all';
        
        this.renderReportsInterface();
    }

    async downloadReport(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (!report) return;

        showInfo('جاري تحميل التقرير...');
        
        // Simulate download
        setTimeout(() => {
            const blob = new Blob([JSON.stringify(report, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.title}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            // Update download count
            report.download_count = (report.download_count || 0) + 1;
            
            showSuccess('تم تحميل التقرير بنجاح');
        }, 1000);
    }

    // Mock data functions
    loadMockData() {
        this.reports = this.getMockReports();
        this.templates = this.getMockTemplates();
        this.scheduledReports = this.getMockScheduledReports();
    }

    getMockReports() {
        return [
            {
                id: '1',
                title: 'تقرير المبيعات الشهري - يناير 2024',
                type: 'sales',
                status: 'completed',
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                date_range: '30d',
                file_size: '2.5 MB',
                download_count: 15,
                summary: 'إجمالي المبيعات: 125,000 ر.س | نمو 15% مقارنة بالشهر الماضي',
                ai_insights: [
                    'توقع زيادة المبيعات بنسبة 12% في الشهر القادم',
                    'منتجات الإلكترونيات تحقق أعلى معدل ربح'
                ]
            },
            {
                id: '2',
                title: 'تقرير المخزون الأسبوعي',
                type: 'inventory',
                status: 'completed',
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                date_range: '7d',
                file_size: '1.8 MB',
                download_count: 8,
                summary: 'إجمالي المنتجات: 1,250 | منتجات نفدت: 15',
                ai_insights: [
                    'يُتوقع نفاد مخزون 8 منتجات خلال أسبوعين',
                    'منتجات الملابس الشتوية بطيئة الحركة'
                ]
            }
        ];
    }

    getMockTemplates() {
        return [
            {
                id: '1',
                name: 'تقرير المبيعات الشامل',
                type: 'sales',
                description: 'تقرير شامل يتضمن جميع بيانات المبيعات والتحليلات',
                features: [
                    'إجمالي المبيعات والإيرادات',
                    'تحليل المنتجات الأكثر مبيعاً',
                    'مقارنة الفترات الزمنية',
                    'رؤى ذكية مدعومة بالذكاء الاصطناعي'
                ]
            },
            {
                id: '2',
                name: 'تقرير أداء المتجر',
                type: 'performance',
                description: 'تقرير مفصل عن أداء المتجر ومؤشرات الجودة',
                features: [
                    'سرعة الموقع وأوقات التحميل',
                    'معدلات التحويل والارتداد',
                    'تقييمات العملاء',
                    'توصيات التحسين'
                ]
            }
        ];
    }

    getMockScheduledReports() {
        return [
            {
                id: '1',
                name: 'تقرير المبيعات الشهري',
                report_type: 'sales',
                frequency: 'monthly',
                next_run: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                is_active: true,
                status: 'active'
            },
            {
                id: '2',
                name: 'تقرير المخزون الأسبوعي',
                report_type: 'inventory',
                frequency: 'weekly',
                next_run: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                is_active: true,
                status: 'active'
            }
        ];
    }

    // API simulation
    async loadReports() {
        return this.getMockReports();
    }

    async loadReportTemplates() {
        return this.getMockTemplates();
    }

    async loadScheduledReports() {
        return this.getMockScheduledReports();
    }

    setupReportCharts() {
        // Setup charts if needed
        console.log('Setting up report charts...');
    }
}

// Initialize advanced reports system
const advancedReports = new AdvancedReports();

// Export for use in other modules
export { advancedReports, AdvancedReports };

// Make available globally
window.advancedReports = advancedReports;