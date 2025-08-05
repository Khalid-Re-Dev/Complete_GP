/**
 * Store Management System
 * Complete interface for managing store applications, notifications, and analytics
 */

import { apiService } from '../utils/api-service.js';
import { showSuccess, showWarning, showError, showInfo } from '../utils/toast.js';

class StoreManagement {
    constructor() {
        this.currentView = 'applications';
        this.applications = [];
        this.notifications = [];
        this.analytics = [];
        this.filters = {
            status: 'all',
            dateRange: '30d',
            search: ''
        };
        
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.setupNavigation();
            await this.loadInitialData();
            this.renderCurrentView();
            
            showSuccess('تم تحميل نظام إدارة المتاجر بنجاح');
        } catch (error) {
            console.error('Error initializing store management:', error);
            showError('خطأ في تحميل نظام إدارة المتاجر');
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Filter controls
        document.getElementById('status-filter')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('date-filter')?.addEventListener('change', (e) => {
            this.filters.dateRange = e.target.value;
            this.applyFilters();
        });

        document.getElementById('search-input')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.applyFilters();
        });

        // Action buttons
        document.getElementById('add-application-btn')?.addEventListener('click', () => {
            this.showAddApplicationModal();
        });

        document.getElementById('add-notification-btn')?.addEventListener('click', () => {
            this.showAddNotificationModal();
        });

        document.getElementById('refresh-btn')?.addEventListener('click', () => {
            this.refreshData();
        });
    }

    setupNavigation() {
        const navHTML = `
            <div class="navigation-tabs">
                <button class="nav-btn active" data-view="applications">
                    <i class="fas fa-file-alt"></i>
                    طلبات المتاجر
                </button>
                <button class="nav-btn" data-view="notifications">
                    <i class="fas fa-bell"></i>
                    الإشعارات
                </button>
                <button class="nav-btn" data-view="analytics">
                    <i class="fas fa-chart-bar"></i>
                    التحليلات
                </button>
            </div>
        `;
        
        document.getElementById('navigation-container')?.insertAdjacentHTML('beforeend', navHTML);
    }

    async loadInitialData() {
        try {
            const [applicationsData, notificationsData, analyticsData] = await Promise.all([
                this.loadApplications(),
                this.loadNotifications(),
                this.loadAnalytics()
            ]);

            this.applications = applicationsData;
            this.notifications = notificationsData;
            this.analytics = analyticsData;
        } catch (error) {
            console.error('Error loading initial data:', error);
            // Load mock data if API fails
            this.loadMockData();
        }
    }

    async loadApplications() {
        try {
            const response = await apiService.get('/api/store-applications/');
            return response.data || [];
        } catch (error) {
            console.error('Error loading applications:', error);
            return this.getMockApplications();
        }
    }

    async loadNotifications() {
        try {
            const response = await apiService.get('/api/store-notifications/');
            return response.data || [];
        } catch (error) {
            console.error('Error loading notifications:', error);
            return this.getMockNotifications();
        }
    }

    async loadAnalytics() {
        try {
            const response = await apiService.get('/api/store-analytics/');
            return response.data || [];
        } catch (error) {
            console.error('Error loading analytics:', error);
            return this.getMockAnalytics();
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
        
        // Render view
        this.renderCurrentView();
    }

    renderCurrentView() {
        const container = document.getElementById('main-content');
        if (!container) return;

        switch (this.currentView) {
            case 'applications':
                this.renderApplicationsView(container);
                break;
            case 'notifications':
                this.renderNotificationsView(container);
                break;
            case 'analytics':
                this.renderAnalyticsView(container);
                break;
            default:
                this.renderApplicationsView(container);
        }
    }

    renderApplicationsView(container) {
        container.innerHTML = `
            <div class="view-header">
                <div class="view-title">
                    <h2>إدارة طلبات المتاجر</h2>
                    <p>إدارة وموافقة طلبات إنشاء المتاجر الجديدة</p>
                </div>
                <div class="view-actions">
                    <button id="add-application-btn" class="btn btn-primary">
                        <i class="fas fa-plus"></i>
                        إضافة طلب جديد
                    </button>
                    <button id="refresh-btn" class="btn btn-secondary">
                        <i class="fas fa-sync-alt"></i>
                        تحديث
                    </button>
                </div>
            </div>

            <div class="filters-section">
                <div class="filter-group">
                    <label for="status-filter">الحالة:</label>
                    <select id="status-filter" class="form-control">
                        <option value="all">جميع الحالات</option>
                        <option value="pending">قيد المراجعة</option>
                        <option value="approved">موافق عليه</option>
                        <option value="rejected">مرفوض</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="date-filter">الفترة الزمنية:</label>
                    <select id="date-filter" class="form-control">
                        <option value="7d">آخر 7 أيام</option>
                        <option value="30d" selected>آخر 30 يوم</option>
                        <option value="90d">آخر 90 يوم</option>
                        <option value="all">جميع الفترات</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="search-input">البحث:</label>
                    <input type="text" id="search-input" class="form-control" placeholder="البحث في الطلبات...">
                </div>
            </div>

            <div class="applications-grid" id="applications-grid">
                ${this.renderApplicationsList()}
            </div>
        `;

        this.setupApplicationsEventListeners();
    }

    renderApplicationsList() {
        const filteredApplications = this.getFilteredApplications();
        
        if (filteredApplications.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>لا توجد طلبات</h3>
                    <p>لم يتم العثور على طلبات تطابق المعايير المحددة</p>
                </div>
            `;
        }

        return filteredApplications.map(app => `
            <div class="application-card" data-id="${app.id}">
                <div class="card-header">
                    <div class="application-info">
                        <h3>${app.store_name}</h3>
                        <p class="applicant-name">المتقدم: ${app.applicant_name}</p>
                    </div>
                    <div class="application-status">
                        <span class="status-badge status-${app.status}">${this.getStatusText(app.status)}</span>
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="application-details">
                        <div class="detail-row">
                            <span class="label">نوع النشاط:</span>
                            <span class="value">${app.business_type}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">البريد الإلكتروني:</span>
                            <span class="value">${app.business_email}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">رقم الهاتف:</span>
                            <span class="value">${app.business_phone}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">تاريخ التقديم:</span>
                            <span class="value">${this.formatDate(app.created_at)}</span>
                        </div>
                    </div>
                    
                    ${app.review_notes ? `
                        <div class="review-notes">
                            <h4>ملاحظات المراجعة:</h4>
                            <p>${app.review_notes}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="card-actions">
                    <button class="btn btn-info btn-sm" onclick="storeManagement.viewApplication('${app.id}')">
                        <i class="fas fa-eye"></i>
                        عرض التفاصيل
                    </button>
                    
                    ${app.status === 'pending' ? `
                        <button class="btn btn-success btn-sm" onclick="storeManagement.approveApplication('${app.id}')">
                            <i class="fas fa-check"></i>
                            موافقة
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="storeManagement.rejectApplication('${app.id}')">
                            <i class="fas fa-times"></i>
                            رفض
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-warning btn-sm" onclick="storeManagement.editApplication('${app.id}')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderNotificationsView(container) {
        container.innerHTML = `
            <div class="view-header">
                <div class="view-title">
                    <h2>إدارة الإشعارات</h2>
                    <p>إدارة إشعارات المتاجر والعملاء</p>
                </div>
                <div class="view-actions">
                    <button id="add-notification-btn" class="btn btn-primary">
                        <i class="fas fa-plus"></i>
                        إضافة إشعار جديد
                    </button>
                </div>
            </div>

            <div class="notifications-grid" id="notifications-grid">
                ${this.renderNotificationsList()}
            </div>
        `;

        this.setupNotificationsEventListeners();
    }

    renderNotificationsList() {
        const filteredNotifications = this.getFilteredNotifications();
        
        if (filteredNotifications.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <h3>لا توجد إشعارات</h3>
                    <p>لم يتم العثور على إشعارات</p>
                </div>
            `;
        }

        return filteredNotifications.map(notification => `
            <div class="notification-card" data-id="${notification.id}">
                <div class="card-header">
                    <div class="notification-info">
                        <h3>${notification.title}</h3>
                        <p class="store-name">المتجر: ${notification.store_name}</p>
                    </div>
                    <div class="notification-status">
                        <span class="type-badge type-${notification.type}">${this.getNotificationTypeText(notification.type)}</span>
                        ${notification.is_important ? '<span class="important-badge">مهم</span>' : ''}
                    </div>
                </div>
                
                <div class="card-body">
                    <p class="notification-message">${notification.message}</p>
                    
                    <div class="notification-details">
                        <div class="detail-row">
                            <span class="label">تاريخ الإنشاء:</span>
                            <span class="value">${this.formatDate(notification.created_at)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">حالة القراءة:</span>
                            <span class="value">${notification.is_read ? 'مقروء' : 'غير مقروء'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn btn-info btn-sm" onclick="storeManagement.viewNotification('${notification.id}')">
                        <i class="fas fa-eye"></i>
                        عرض
                    </button>
                    
                    ${!notification.is_read ? `
                        <button class="btn btn-success btn-sm" onclick="storeManagement.markAsRead('${notification.id}')">
                            <i class="fas fa-check"></i>
                            تحديد كمقروء
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-warning btn-sm" onclick="storeManagement.editNotification('${notification.id}')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    
                    <button class="btn btn-danger btn-sm" onclick="storeManagement.deleteNotification('${notification.id}')">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderAnalyticsView(container) {
        container.innerHTML = `
            <div class="view-header">
                <div class="view-title">
                    <h2>تحليلات المتاجر</h2>
                    <p>مراقبة أداء المتاجر والمقاييس المهمة</p>
                </div>
                <div class="view-actions">
                    <button class="btn btn-primary" onclick="storeManagement.generateReport()">
                        <i class="fas fa-file-export"></i>
                        تصدير تقرير
                    </button>
                </div>
            </div>

            <div class="analytics-dashboard">
                ${this.renderAnalyticsSummary()}
                ${this.renderAnalyticsCharts()}
                ${this.renderAnalyticsTable()}
            </div>
        `;
    }

    renderAnalyticsSummary() {
        const summary = this.calculateAnalyticsSummary();
        
        return `
            <div class="analytics-summary">
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-store"></i>
                    </div>
                    <div class="summary-content">
                        <h3>${summary.totalStores}</h3>
                        <p>إجمالي المتاجر</p>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-eye"></i>
                    </div>
                    <div class="summary-content">
                        <h3>${summary.totalViews.toLocaleString()}</h3>
                        <p>إجمالي المشاهدات</p>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="summary-content">
                        <h3>${summary.totalOrders.toLocaleString()}</h3>
                        <p>إجمالي الطلبات</p>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="summary-content">
                        <h3>${summary.totalRevenue.toLocaleString()} ر.س</h3>
                        <p>إجمالي الإيرادات</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderAnalyticsCharts() {
        return `
            <div class="analytics-charts">
                <div class="chart-container">
                    <h3>أداء المتاجر الشهري</h3>
                    <canvas id="monthly-performance-chart" width="400" height="200"></canvas>
                </div>
                
                <div class="chart-container">
                    <h3>توزيع أنواع المتاجر</h3>
                    <canvas id="store-types-chart" width="400" height="200"></canvas>
                </div>
            </div>
        `;
    }

    renderAnalyticsTable() {
        const topStores = this.getTopPerformingStores();
        
        return `
            <div class="analytics-table">
                <h3>أفضل المتاجر أداءً</h3>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>اسم المتجر</th>
                                <th>المشاهدات</th>
                                <th>الطلبات</th>
                                <th>الإيرادات</th>
                                <th>التقييم</th>
                                <th>نقاط الجودة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topStores.map(store => `
                                <tr>
                                    <td>${store.name}</td>
                                    <td>${store.total_views.toLocaleString()}</td>
                                    <td>${store.total_orders.toLocaleString()}</td>
                                    <td>${store.total_revenue.toLocaleString()} ر.س</td>
                                    <td>
                                        <div class="rating">
                                            ${this.renderStars(store.average_rating)}
                                            <span>${store.average_rating.toFixed(1)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="quality-score">
                                            <div class="score-bar">
                                                <div class="score-fill" style="width: ${store.quality_score}%"></div>
                                            </div>
                                            <span>${store.quality_score}/100</span>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Modal functions
    showAddApplicationModal() {
        const modal = this.createModal('add-application', 'إضافة طلب متجر جديد', this.getApplicationForm());
        document.body.appendChild(modal);
        
        // Setup form submission
        document.getElementById('application-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitApplication(e.target);
        });
    }

    showAddNotificationModal() {
        const modal = this.createModal('add-notification', 'إضافة إشعار جديد', this.getNotificationForm());
        document.body.appendChild(modal);
        
        // Setup form submission
        document.getElementById('notification-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitNotification(e.target);
        });
    }

    getApplicationForm() {
        return `
            <form id="application-form" class="modal-form">
                <div class="form-section">
                    <h4>معلومات المتقدم</h4>
                    <div class="form-group">
                        <label for="applicant_name">اسم المتقدم *</label>
                        <input type="text" id="applicant_name" name="applicant_name" required class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="status">الحالة</label>
                        <select id="status" name="status" class="form-control">
                            <option value="pending">قيد المراجعة</option>
                            <option value="approved">موافق عليه</option>
                            <option value="rejected">مرفوض</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="review_notes">ملاحظات المراجعة</label>
                        <textarea id="review_notes" name="review_notes" class="form-control" rows="3"></textarea>
                    </div>
                </div>

                <div class="form-section">
                    <h4>تفاصيل المتجر</h4>
                    <div class="form-group">
                        <label for="store_name">اسم المتجر *</label>
                        <input type="text" id="store_name" name="store_name" required class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="store_description">وصف المتجر</label>
                        <textarea id="store_description" name="store_description" class="form-control" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="business_type">نوع النشاط *</label>
                        <select id="business_type" name="business_type" required class="form-control">
                            <option value="">اختر نوع النشاط</option>
                            <option value="electronics">إلكترونيات</option>
                            <option value="clothing">ملابس</option>
                            <option value="books">كتب</option>
                            <option value="home">منزل وحديقة</option>
                            <option value="sports">رياضة</option>
                            <option value="beauty">جمال وعناية</option>
                            <option value="food">طعام ومشروبات</option>
                            <option value="other">أخرى</option>
                        </select>
                    </div>
                </div>

                <div class="form-section">
                    <h4>معلومات الاتصال</h4>
                    <div class="form-group">
                        <label for="business_email">البريد الإلكتروني للنشاط *</label>
                        <input type="email" id="business_email" name="business_email" required class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="business_phone">هاتف النشاط *</label>
                        <input type="tel" id="business_phone" name="business_phone" required class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="business_address">عنوان النشاط</label>
                        <textarea id="business_address" name="business_address" class="form-control" rows="2"></textarea>
                    </div>
                </div>

                <div class="form-section">
                    <h4>المعلومات القانونية</h4>
                    <div class="form-group">
                        <label for="business_license">رقم الرخصة التجارية</label>
                        <input type="text" id="business_license" name="business_license" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="tax_id">الرقم الضريبي</label>
                        <input type="text" id="tax_id" name="tax_id" class="form-control">
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        حفظ الطلب
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </form>
        `;
    }

    getNotificationForm() {
        return `
            <form id="notification-form" class="modal-form">
                <div class="form-section">
                    <h4>معلومات الإشعار</h4>
                    <div class="form-group">
                        <label for="store_id">المتجر *</label>
                        <select id="store_id" name="store_id" required class="form-control">
                            <option value="">اختر المتجر</option>
                            ${this.getStoreOptions()}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="notification_type">نوع الإشعار *</label>
                        <select id="notification_type" name="notification_type" required class="form-control">
                            <option value="info">معلومات</option>
                            <option value="warning">تحذير</option>
                            <option value="success">نجاح</option>
                            <option value="error">خطأ</option>
                            <option value="promotion">عرض ترويجي</option>
                            <option value="update">تحديث</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="title">العنوان *</label>
                        <input type="text" id="title" name="title" required class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="message">الرسالة *</label>
                        <textarea id="message" name="message" required class="form-control" rows="4"></textarea>
                    </div>
                </div>

                <div class="form-section">
                    <h4>الكائنات المرتبطة</h4>
                    <div class="form-group">
                        <label for="related_product">المنتج المرتبط</label>
                        <input type="text" id="related_product" name="related_product" class="form-control" placeholder="معرف المنتج (اختياري)">
                    </div>
                </div>

                <div class="form-section">
                    <h4>الحالة</h4>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="is_read" name="is_read">
                            <span class="checkmark"></span>
                            مقروء
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="is_important" name="is_important">
                            <span class="checkmark"></span>
                            مهم
                        </label>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        حفظ الإشعار
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </form>
        `;
    }

    // Data submission functions
    async submitApplication(form) {
        try {
            const formData = new FormData(form);
            const applicationData = Object.fromEntries(formData.entries());
            
            showInfo('جاري حفظ الطلب...');
            
            // In a real application, this would be an API call
            const response = await this.saveApplication(applicationData);
            
            if (response.success) {
                showSuccess('تم حفظ الطلب بنجاح');
                form.closest('.modal').remove();
                await this.refreshData();
            } else {
                showError('خطأ في حفظ الطلب');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            showError('خطأ في حفظ الطلب');
        }
    }

    async submitNotification(form) {
        try {
            const formData = new FormData(form);
            const notificationData = Object.fromEntries(formData.entries());
            
            // Convert checkboxes to boolean
            notificationData.is_read = form.querySelector('#is_read').checked;
            notificationData.is_important = form.querySelector('#is_important').checked;
            
            showInfo('جاري حفظ الإشعار...');
            
            // In a real application, this would be an API call
            const response = await this.saveNotification(notificationData);
            
            if (response.success) {
                showSuccess('تم حفظ الإشعار بنجاح');
                form.closest('.modal').remove();
                await this.refreshData();
            } else {
                showError('خطأ في حفظ الإشعار');
            }
        } catch (error) {
            console.error('Error submitting notification:', error);
            showError('خطأ في حفظ الإشعار');
        }
    }

    // API simulation functions
    async saveApplication(data) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const newApplication = {
                    id: Date.now().toString(),
                    ...data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                this.applications.unshift(newApplication);
                resolve({ success: true, data: newApplication });
            }, 1000);
        });
    }

    async saveNotification(data) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const newNotification = {
                    id: Date.now().toString(),
                    ...data,
                    store_name: this.getStoreName(data.store_id),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                this.notifications.unshift(newNotification);
                resolve({ success: true, data: newNotification });
            }, 1000);
        });
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

    getStatusText(status) {
        const statusTexts = {
            pending: 'قيد المراجعة',
            approved: 'موافق عليه',
            rejected: 'مرفوض'
        };
        return statusTexts[status] || status;
    }

    getNotificationTypeText(type) {
        const typeTexts = {
            info: 'معلومات',
            warning: 'تحذير',
            success: 'نجاح',
            error: 'خطأ',
            promotion: 'عرض ترويجي',
            update: 'تحديث'
        };
        return typeTexts[type] || type;
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

    getFilteredApplications() {
        return this.applications.filter(app => {
            const matchesStatus = this.filters.status === 'all' || app.status === this.filters.status;
            const matchesSearch = !this.filters.search || 
                app.store_name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                app.applicant_name.toLowerCase().includes(this.filters.search.toLowerCase());
            
            return matchesStatus && matchesSearch;
        });
    }

    getFilteredNotifications() {
        return this.notifications.filter(notification => {
            const matchesSearch = !this.filters.search || 
                notification.title.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                notification.message.toLowerCase().includes(this.filters.search.toLowerCase());
            
            return matchesSearch;
        });
    }

    // Mock data functions
    getMockApplications() {
        return [
            {
                id: '1',
                applicant_name: 'أحمد محمد',
                status: 'pending',
                store_name: 'متجر الإلكترونيات الحديثة',
                store_description: 'متجر متخصص في بيع الأجهزة الإلكترونية والهواتف الذكية',
                business_type: 'electronics',
                business_email: 'info@electronics-store.com',
                business_phone: '0501234567',
                business_address: 'الرياض، حي النخيل',
                business_license: 'CR123456789',
                tax_id: 'TAX987654321',
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                applicant_name: 'فاطمة أحمد',
                status: 'approved',
                store_name: 'بوتيك الأزياء العصرية',
                store_description: 'متجر أزياء نسائية عصرية وأنيقة',
                business_type: 'clothing',
                business_email: 'info@fashion-boutique.com',
                business_phone: '0507654321',
                business_address: 'جدة، حي الزهراء',
                business_license: 'CR987654321',
                tax_id: 'TAX123456789',
                review_notes: 'تم الموافقة على الطلب بعد مراجعة الوثائق',
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    getMockNotifications() {
        return [
            {
                id: '1',
                store_id: '1',
                store_name: 'متجر الإلكترونيات الحديثة',
                type: 'info',
                title: 'تحديث في سياسة الإرجاع',
                message: 'تم تحديث سياسة الإرجاع لتشمل فترة 30 يوم بدلاً من 14 يوم',
                related_product: null,
                is_read: false,
                is_important: true,
                created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                store_id: '2',
                store_name: 'بوتيك الأزياء العصرية',
                type: 'promotion',
                title: 'عرض خاص - خصم 50%',
                message: 'عرض خاص على جميع الفساتين الصيفية بخصم يصل إلى 50%',
                related_product: 'dress_001',
                is_read: true,
                is_important: false,
                created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    getMockAnalytics() {
        return [
            {
                id: '1',
                store_id: '1',
                store_name: 'متجر الإلكترونيات الحديثة',
                total_products: 150,
                active_products: 145,
                out_of_stock_products: 5,
                total_views: 15420,
                unique_visitors: 8750,
                total_likes: 342,
                total_comments: 89,
                total_shares: 156,
                total_orders: 234,
                total_revenue: 125000,
                average_rating: 4.5,
                total_reviews: 67,
                popularity_score: 85,
                engagement_score: 78,
                quality_score: 92,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: '2',
                store_id: '2',
                store_name: 'بوتيك الأزياء العصرية',
                total_products: 89,
                active_products: 87,
                out_of_stock_products: 2,
                total_views: 9850,
                unique_visitors: 5420,
                total_likes: 298,
                total_comments: 145,
                total_shares: 203,
                total_orders: 156,
                total_revenue: 78500,
                average_rating: 4.8,
                total_reviews: 43,
                popularity_score: 79,
                engagement_score: 88,
                quality_score: 95,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
    }

    loadMockData() {
        this.applications = this.getMockApplications();
        this.notifications = this.getMockNotifications();
        this.analytics = this.getMockAnalytics();
    }

    // Additional utility functions
    setupApplicationsEventListeners() {
        // Re-setup event listeners after rendering
        this.setupEventListeners();
    }

    setupNotificationsEventListeners() {
        // Re-setup event listeners after rendering
        this.setupEventListeners();
    }

    async refreshData() {
        showInfo('جاري تحديث البيانات...');
        await this.loadInitialData();
        this.renderCurrentView();
        showSuccess('تم تحديث البيانات بنجاح');
    }

    applyFilters() {
        this.renderCurrentView();
    }

    // Action handlers
    async viewApplication(id) {
        const application = this.applications.find(app => app.id === id);
        if (!application) return;

        const modal = this.createModal('view-application', 'تفاصيل الطلب', this.getApplicationDetails(application));
        document.body.appendChild(modal);
    }

    async approveApplication(id) {
        if (confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) {
            const application = this.applications.find(app => app.id === id);
            if (application) {
                application.status = 'approved';
                application.updated_at = new Date().toISOString();
                this.renderCurrentView();
                showSuccess('تم الموافقة على الطلب بنجاح');
            }
        }
    }

    async rejectApplication(id) {
        const reason = prompt('سبب الرفض (اختياري):');
        if (reason !== null) {
            const application = this.applications.find(app => app.id === id);
            if (application) {
                application.status = 'rejected';
                application.review_notes = reason;
                application.updated_at = new Date().toISOString();
                this.renderCurrentView();
                showSuccess('تم رفض الطلب');
            }
        }
    }

    async editApplication(id) {
        const application = this.applications.find(app => app.id === id);
        if (!application) return;

        const modal = this.createModal('edit-application', 'تعديل الطلب', this.getApplicationForm(application));
        document.body.appendChild(modal);
        
        // Fill form with existing data
        this.fillApplicationForm(application);
    }

    getApplicationDetails(application) {
        return `
            <div class="application-details-view">
                <div class="details-section">
                    <h4>معلومات المتقدم</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>اسم المتقدم:</label>
                            <span>${application.applicant_name}</span>
                        </div>
                        <div class="detail-item">
                            <label>الحالة:</label>
                            <span class="status-badge status-${application.status}">${this.getStatusText(application.status)}</span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h4>تفاصيل المتجر</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>اسم المتجر:</label>
                            <span>${application.store_name}</span>
                        </div>
                        <div class="detail-item">
                            <label>نوع النشاط:</label>
                            <span>${application.business_type}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>وصف المتجر:</label>
                            <span>${application.store_description || 'غير محدد'}</span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h4>معلومات الاتصال</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>البريد الإلكتروني:</label>
                            <span>${application.business_email}</span>
                        </div>
                        <div class="detail-item">
                            <label>رقم الهاتف:</label>
                            <span>${application.business_phone}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>العنوان:</label>
                            <span>${application.business_address || 'غير محدد'}</span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h4>المعلومات القانونية</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>رقم الرخصة التجارية:</label>
                            <span>${application.business_license || 'غير محدد'}</span>
                        </div>
                        <div class="detail-item">
                            <label>الرقم الضريبي:</label>
                            <span>${application.tax_id || 'غير محدد'}</span>
                        </div>
                    </div>
                </div>

                ${application.review_notes ? `
                    <div class="details-section">
                        <h4>ملاحظات المراجعة</h4>
                        <p>${application.review_notes}</p>
                    </div>
                ` : ''}

                <div class="details-section">
                    <h4>التواريخ</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>تاريخ التقديم:</label>
                            <span>${this.formatDate(application.created_at)}</span>
                        </div>
                        <div class="detail-item">
                            <label>آخر تحديث:</label>
                            <span>${this.formatDate(application.updated_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    calculateAnalyticsSummary() {
        return {
            totalStores: this.analytics.length,
            totalViews: this.analytics.reduce((sum, store) => sum + store.total_views, 0),
            totalOrders: this.analytics.reduce((sum, store) => sum + store.total_orders, 0),
            totalRevenue: this.analytics.reduce((sum, store) => sum + store.total_revenue, 0)
        };
    }

    getTopPerformingStores() {
        return this.analytics
            .sort((a, b) => b.total_revenue - a.total_revenue)
            .slice(0, 10);
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    getStoreOptions() {
        // Mock store options - in real app, this would come from API
        return `
            <option value="1">متجر الإلكترونيات الحديثة</option>
            <option value="2">بوتيك الأزياء العصرية</option>
            <option value="3">مكتبة الكتب الرقمية</option>
        `;
    }

    getStoreName(storeId) {
        const storeNames = {
            '1': 'متجر الإلكترونيات الحديثة',
            '2': 'بوتيك الأزياء العصرية',
            '3': 'مكتبة الكتب الرقمية'
        };
        return storeNames[storeId] || 'متجر غير معروف';
    }

    fillApplicationForm(application) {
        // Fill form fields with existing data
        Object.keys(application).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = application[key] || '';
            }
        });
    }

    // Additional action handlers
    async viewNotification(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        const modal = this.createModal('view-notification', 'تفاصيل الإشعار', this.getNotificationDetails(notification));
        document.body.appendChild(modal);
    }

    async markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.is_read = true;
            notification.updated_at = new Date().toISOString();
            this.renderCurrentView();
            showSuccess('تم تحديد الإشعار كمقروء');
        }
    }

    async editNotification(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        const modal = this.createModal('edit-notification', 'تعديل الإشعار', this.getNotificationForm(notification));
        document.body.appendChild(modal);
        
        // Fill form with existing data
        this.fillNotificationForm(notification);
    }

    async deleteNotification(id) {
        if (confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
            this.notifications = this.notifications.filter(n => n.id !== id);
            this.renderCurrentView();
            showSuccess('تم حذف الإشعار بنجاح');
        }
    }

    getNotificationDetails(notification) {
        return `
            <div class="notification-details-view">
                <div class="details-section">
                    <h4>معلومات الإشعار</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>المتجر:</label>
                            <span>${notification.store_name}</span>
                        </div>
                        <div class="detail-item">
                            <label>النوع:</label>
                            <span class="type-badge type-${notification.type}">${this.getNotificationTypeText(notification.type)}</span>
                        </div>
                        <div class="detail-item">
                            <label>العنوان:</label>
                            <span>${notification.title}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>الرسالة:</label>
                            <span>${notification.message}</span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h4>الحالة</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>حالة القراءة:</label>
                            <span class="${notification.is_read ? 'text-success' : 'text-warning'}">
                                ${notification.is_read ? 'مقروء' : 'غير مقروء'}
                            </span>
                        </div>
                        <div class="detail-item">
                            <label>مهم:</label>
                            <span class="${notification.is_important ? 'text-danger' : 'text-muted'}">
                                ${notification.is_important ? 'نعم' : 'لا'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h4>التواريخ</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>تاريخ الإنشاء:</label>
                            <span>${this.formatDate(notification.created_at)}</span>
                        </div>
                        <div class="detail-item">
                            <label>آخر تحديث:</label>
                            <span>${this.formatDate(notification.updated_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    fillNotificationForm(notification) {
        // Fill form fields with existing data
        Object.keys(notification).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = notification[key];
                } else {
                    field.value = notification[key] || '';
                }
            }
        });
    }

    async generateReport() {
        showInfo('جاري إنشاء التقرير...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.calculateAnalyticsSummary(),
            applications: this.applications,
            notifications: this.notifications,
            analytics: this.analytics
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `store-management-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showSuccess('تم تصدير التقرير بنجاح');
    }
}

// Initialize store management system
const storeManagement = new StoreManagement();

// Export for use in other modules
export { storeManagement, StoreManagement };

// Make available globally
window.storeManagement = storeManagement;