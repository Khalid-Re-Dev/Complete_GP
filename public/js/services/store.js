/**
 * Store Service
 * Handles all store-related API calls
 */

import { apiService } from './api.js';

class StoreService {
    constructor() {
        this.baseUrl = '/api/stores';
    }

    // Store Application Methods
    async submitApplication(formData) {
        try {
            console.log('🔄 Submitting store application...');
            console.log('📋 Form data keys:', Array.from(formData.keys()));
            
            const response = await fetch(`http://localhost:8000/api/stores/applications/create/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: formData
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                let errorData;
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    try {
                        errorData = await response.json();
                    } catch (parseError) {
                        console.error('❌ Failed to parse error response as JSON:', parseError);
                        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
                    }
                } else {
                    const textResponse = await response.text();
                    console.error('❌ Non-JSON error response:', textResponse);
                    errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
                }
                
                console.error('❌ Application submission failed:', errorData);
                throw new Error(errorData.detail || errorData.message || 'Failed to submit application');
            }

            let result;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    result = await response.json();
                } catch (parseError) {
                    console.error('❌ Failed to parse success response as JSON:', parseError);
                    // If we can't parse JSON but got a successful status, assume success
                    result = { success: true, message: 'Application submitted successfully' };
                }
            } else {
                const textResponse = await response.text();
                console.log('📄 Non-JSON success response:', textResponse);
                result = { success: true, message: 'Application submitted successfully' };
            }
            
            console.log('✅ Application submitted successfully:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error submitting store application:', error);
            throw error;
        }
    }

    async getMyApplication() {
        try {
            const response = await apiService.get(`${this.baseUrl}/applications/my/`);
            return response;
        } catch (error) {
            if (error.message.includes('404')) {
                return null; // No application found
            }
            throw error;
        }
    }

    // Check user store status
    async checkUserStoreStatus(userId = null) {
        try {
            const response = await apiService.get(`${this.baseUrl}/user-stores/`);
            return {
                hasStore: response.stores && response.stores.length > 0,
                stores: response.stores || [],
                needsStoreCreation: !response.stores || response.stores.length === 0,
                primaryStore: response.stores && response.stores.length > 0 ? response.stores[0] : null
            };
        } catch (error) {
            console.warn('Error checking store status, assuming no store:', error);
            return { 
                hasStore: false, 
                stores: [], 
                needsStoreCreation: true,
                primaryStore: null
            };
        }
    }

    // Store Dashboard Methods
    async getDashboardData() {
        try {
            console.log('🔄 Fetching store dashboard data...');
            const response = await apiService.get(`${this.baseUrl}/dashboard/`);
            console.log('✅ Dashboard data received:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting dashboard data:', error);
            throw error;
        }
    }

    async getStoreAnalytics(period = 30) {
        try {
            console.log('🔄 Fetching store analytics for period:', period);
            const response = await apiService.get(`${this.baseUrl}/analytics/?days=${period}`);
            console.log('✅ Analytics data received:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting store analytics:', error);
            throw error;
        }
    }

    async getProductAnalytics() {
        try {
            return await apiService.get(`${this.baseUrl}/analytics/products/`);
        } catch (error) {
            console.error('Error getting product analytics:', error);
            throw error;
        }
    }

    async getAnalyticsReport(days = 30) {
        try {
            console.log('🔄 Fetching analytics report for days:', days);
            const response = await apiService.get(`${this.baseUrl}/analytics/report/?days=${days}`);
            console.log('✅ Analytics report received:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting analytics report:', error);
            throw error;
        }
    }

    // Store Management Methods
    async getMyStore() {
        try {
            console.log('🔄 Fetching user store...');
            const response = await apiService.get(`${this.baseUrl}/my-store/`);
            console.log('✅ Store data received:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting store:', error);
            throw error;
        }
    }

    async updateStore(storeData) {
        try {
            console.log('🔄 Updating store data:', storeData);
            const response = await apiService.put(`${this.baseUrl}/my-store/`, storeData);
            console.log('✅ Store updated successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Error updating store:', error);
            throw error;
        }
    }

    async getProductPerformanceReport(days = 30) {
        try {
            return await apiService.get(`${this.baseUrl}/analytics/products/report/?days=${days}`);
        } catch (error) {
            console.error('Error getting product performance report:', error);
            throw error;
        }
    }

    // Notification Methods
    async getNotifications() {
        try {
            return await apiService.get(`${this.baseUrl}/notifications/`);
        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    }

    async markNotificationRead(notificationId) {
        try {
            return await apiService.post(`${this.baseUrl}/notifications/${notificationId}/read/`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllNotificationsRead() {
        try {
            return await apiService.post(`${this.baseUrl}/notifications/read-all/`);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Feedback Methods
    async getStoreFeedback() {
        try {
            return await apiService.get(`${this.baseUrl}/feedback/`);
        } catch (error) {
            console.error('Error getting store feedback:', error);
            throw error;
        }
    }

    async respondToFeedback(feedbackId, response) {
        try {
            return await apiService.patch(`${this.baseUrl}/feedback/${feedbackId}/respond/`, {
                owner_response: response
            });
        } catch (error) {
            console.error('Error responding to feedback:', error);
            throw error;
        }
    }

    async submitStoreFeedback(storeSlug, feedbackData) {
        try {
            return await apiService.post(`${this.baseUrl}/${storeSlug}/feedback/create/`, feedbackData);
        } catch (error) {
            console.error('Error submitting store feedback:', error);
            throw error;
        }
    }

    // Orders Management Methods
    async getStoreOrders(filters = {}) {
        try {
            console.log('🔄 Fetching store orders with filters:', filters);
            const queryParams = new URLSearchParams(filters);
            const response = await apiService.get(`${this.baseUrl}/orders/?${queryParams}`);
            console.log('✅ Store orders received:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting store orders:', error);
            throw error;
        }
    }

    async getOrderDetails(orderId) {
        try {
            console.log('🔄 Fetching order details for order:', orderId);
            const response = await apiService.get(`${this.baseUrl}/orders/${orderId}/`);
            console.log('✅ Order details received:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting order details:', error);
            throw error;
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            console.log('🔄 Updating order status:', orderId, status);
            const response = await apiService.patch(`${this.baseUrl}/orders/${orderId}/`, {
                status: status
            });
            console.log('✅ Order status updated successfully');
            return response;
        } catch (error) {
            console.error('❌ Error updating order status:', error);
            throw error;
        }
    }

    async exportOrders(filters = {}) {
        try {
            console.log('🔄 Exporting orders with filters:', filters);
            const queryParams = new URLSearchParams({
                ...filters,
                export: 'csv'
            });
            const response = await apiService.get(`${this.baseUrl}/orders/export/?${queryParams}`);
            console.log('✅ Orders exported successfully');
            return response;
        } catch (error) {
            console.error('❌ Error exporting orders:', error);
            throw error;
        }
    }

    // Analytics Tracking Methods
    async trackStoreView(storeSlug) {
        try {
            // Don't require authentication for tracking
            const response = await fetch(`${this.baseUrl}/track/store/${storeSlug}/view/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.warn('Failed to track store view');
            }
        } catch (error) {
            console.warn('Error tracking store view:', error);
        }
    }

    async trackProductView(productId, viewDuration = 0) {
        try {
            // Don't require authentication for tracking
            const response = await fetch(`${this.baseUrl}/track/product/${productId}/view/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    view_duration: viewDuration
                })
            });

            if (!response.ok) {
                console.warn('Failed to track product view');
            }
        } catch (error) {
            console.warn('Error tracking product view:', error);
        }
    }

    // Store Management Methods
    async getStoreInfo() {
        try {
            const dashboardData = await this.getDashboardData();
            return dashboardData.store_info;
        } catch (error) {
            console.error('Error getting store info:', error);
            throw error;
        }
    }

    async updateStoreInfo(storeData) {
        try {
            // This would typically be in the products API
            return await apiService.patch('/api/products/stores/my/', storeData);
        } catch (error) {
            console.error('Error updating store info:', error);
            throw error;
        }
    }

    // Utility Methods
    formatAnalyticsData(data) {
        return {
            ...data,
            total_views: data.total_views || 0,
            unique_visitors: data.unique_visitors || 0,
            total_likes: data.total_likes || 0,
            total_comments: data.total_comments || 0,
            average_rating: data.average_rating || 0,
            overall_score: data.overall_score || 0,
            popularity_score: data.popularity_score || 0,
            engagement_score: data.engagement_score || 0,
            quality_score: data.quality_score || 0
        };
    }

    formatNotification(notification) {
        return {
            ...notification,
            created_at: new Date(notification.created_at),
            read_at: notification.read_at ? new Date(notification.read_at) : null
        };
    }

    formatFeedback(feedback) {
        return {
            ...feedback,
            created_at: new Date(feedback.created_at),
            updated_at: new Date(feedback.updated_at),
            responded_at: feedback.responded_at ? new Date(feedback.responded_at) : null
        };
    }

    // Performance Metrics Helpers
    calculateGrowthRate(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }

    getPerformanceTrend(data) {
        if (!data || data.length < 2) return 'stable';
        
        const recent = data.slice(-7); // Last 7 days
        const previous = data.slice(-14, -7); // Previous 7 days
        
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
        
        const change = this.calculateGrowthRate(recentAvg, previousAvg);
        
        if (change > 10) return 'improving';
        if (change < -10) return 'declining';
        return 'stable';
    }

    getPerformanceColor(score) {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    }

    getPerformanceIcon(trend) {
        switch (trend) {
            case 'improving':
                return 'fas fa-arrow-up text-green-600';
            case 'declining':
                return 'fas fa-arrow-down text-red-600';
            default:
                return 'fas fa-minus text-gray-600';
        }
    }

    // Data Export Methods
    async exportAnalyticsData(format = 'json', days = 30) {
        try {
            const report = await this.getAnalyticsReport(days);
            
            if (format === 'csv') {
                return this.convertToCSV(report);
            }
            
            return report;
        } catch (error) {
            console.error('Error exporting analytics data:', error);
            throw error;
        }
    }

    convertToCSV(data) {
        // Simple CSV conversion for analytics data
        const headers = ['Date', 'Views', 'Unique Visitors', 'Engagement'];
        const rows = Object.entries(data.daily_views || {}).map(([date, views]) => [
            date,
            views,
            Math.round(views * 0.7), // Estimated unique visitors
            Math.round(views * 0.1)   // Estimated engagement
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        return csvContent;
    }

    // Real-time Updates (if WebSocket is available)
    subscribeToUpdates(callback) {
        // This would implement WebSocket connection for real-time updates
        // For now, we'll use polling
        this.updateInterval = setInterval(async () => {
            try {
                const data = await this.getDashboardData();
                callback(data);
            } catch (error) {
                console.warn('Error getting real-time updates:', error);
            }
        }, 30000); // Update every 30 seconds
    }

    unsubscribeFromUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

export const storeService = new StoreService();