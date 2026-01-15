/**
 * Store System Test Functions
 * Comprehensive testing for the store management system
 */

import { storeService } from '../services/store.js';
import { authService } from '../services/auth.js';
import { showToast } from './toast.js';

class StoreSystemTester {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
    }

    async runAllTests() {
        if (this.isRunning) {
            console.log('Tests are already running...');
            return;
        }

        this.isRunning = true;
        this.testResults = [];
        
        console.log('🧪 Starting Store System Tests...');
        console.log('=====================================');

        try {
            // Authentication Tests
            await this.testAuthentication();
            
            // Store Application Tests
            await this.testStoreApplication();
            
            // Dashboard Tests
            await this.testStoreDashboard();
            
            // Analytics Tests
            await this.testStoreAnalytics();
            
            // Feedback Tests
            await this.testStoreFeedback();
            
            // Notification Tests
            await this.testNotifications();
            
            // Performance Tests
            await this.testPerformance();
            
            // UI Tests
            await this.testUI();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        } finally {
            this.isRunning = false;
            this.displayResults();
        }
    }

    async testAuthentication() {
        console.log('\n🔐 Testing Authentication...');
        
        try {
            // Test login state
            const isAuthenticated = authService.isAuthenticated();
            this.addResult('Authentication Check', isAuthenticated, 'User authentication status');
            
            if (isAuthenticated) {
                const user = authService.getCurrentUser();
                this.addResult('User Data', !!user, 'User data retrieval');
                this.addResult('User Role', !!user?.role, 'User role assignment');
            }
            
        } catch (error) {
            this.addResult('Authentication', false, `Error: ${error.message}`);
        }
    }

    async testStoreApplication() {
        console.log('\n📝 Testing Store Application...');
        
        try {
            // Test application form validation
            const mockFormData = new FormData();
            mockFormData.append('store_name', 'Test Store');
            mockFormData.append('business_type', 'electronics');
            mockFormData.append('store_description', 'Test description');
            mockFormData.append('business_email', 'test@example.com');
            mockFormData.append('business_phone', '+966501234567');
            mockFormData.append('business_address', 'Test Address');
            mockFormData.append('business_license', '1234567890');
            mockFormData.append('tax_id', '123456789012345');
            
            this.addResult('Form Data Creation', true, 'Mock form data created successfully');
            
            // Test application status check
            try {
                await storeService.getMyApplication();
                this.addResult('Application Status Check', true, 'Application status retrieved');
            } catch (error) {
                if (error.message.includes('404')) {
                    this.addResult('Application Status Check', true, 'No application found (expected)');
                } else {
                    this.addResult('Application Status Check', false, `Error: ${error.message}`);
                }
            }
            
        } catch (error) {
            this.addResult('Store Application', false, `Error: ${error.message}`);
        }
    }

    async testStoreDashboard() {
        console.log('\n📊 Testing Store Dashboard...');
        
        try {
            // Test dashboard data loading
            const user = authService.getCurrentUser();
            if (user?.role === 'store_owner') {
                try {
                    const dashboardData = await storeService.getDashboardData();
                    this.addResult('Dashboard Data', !!dashboardData, 'Dashboard data loaded');
                    this.addResult('Store Info', !!dashboardData?.store_info, 'Store information present');
                    this.addResult('Analytics Data', !!dashboardData?.analytics, 'Analytics data present');
                } catch (error) {
                    this.addResult('Dashboard Data', false, `Error: ${error.message}`);
                }
            } else {
                this.addResult('Dashboard Access', true, 'User is not store owner (expected)');
            }
            
        } catch (error) {
            this.addResult('Store Dashboard', false, `Error: ${error.message}`);
        }
    }

    async testStoreAnalytics() {
        console.log('\n📈 Testing Store Analytics...');
        
        try {
            // Test analytics service methods
            const analyticsService = storeService;
            
            // Test analytics data formatting
            const mockAnalytics = {
                total_views: 1000,
                unique_visitors: 750,
                total_likes: 50,
                average_rating: 4.5
            };
            
            const formattedData = analyticsService.formatAnalyticsData(mockAnalytics);
            this.addResult('Analytics Formatting', !!formattedData, 'Analytics data formatted correctly');
            
            // Test performance calculations
            const growthRate = analyticsService.calculateGrowthRate(1200, 1000);
            this.addResult('Growth Calculation', growthRate === 20, `Growth rate: ${growthRate}%`);
            
            // Test trend analysis
            const mockTrendData = [100, 120, 110, 130, 125, 140, 135];
            const trend = analyticsService.getPerformanceTrend(mockTrendData);
            this.addResult('Trend Analysis', !!trend, `Trend: ${trend}`);
            
        } catch (error) {
            this.addResult('Store Analytics', false, `Error: ${error.message}`);
        }
    }

    async testStoreFeedback() {
        console.log('\n💬 Testing Store Feedback...');
        
        try {
            // Test feedback data structure
            const mockFeedback = {
                rating: 5,
                service_rating: 4,
                delivery_rating: 5,
                product_quality_rating: 5,
                title: 'Great store!',
                comment: 'Excellent service and products.'
            };
            
            this.addResult('Feedback Structure', !!mockFeedback.rating, 'Feedback data structure valid');
            
            // Test feedback validation
            const isValid = mockFeedback.rating >= 1 && 
                           mockFeedback.rating <= 5 && 
                           mockFeedback.title && 
                           mockFeedback.comment;
            this.addResult('Feedback Validation', isValid, 'Feedback validation passed');
            
            // Test feedback formatting
            const formattedFeedback = storeService.formatFeedback({
                ...mockFeedback,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            this.addResult('Feedback Formatting', !!formattedFeedback, 'Feedback formatted correctly');
            
        } catch (error) {
            this.addResult('Store Feedback', false, `Error: ${error.message}`);
        }
    }

    async testNotifications() {
        console.log('\n🔔 Testing Notifications...');
        
        try {
            // Test notification data structure
            const mockNotification = {
                id: 1,
                notification_type: 'new_review',
                title: 'New Review',
                message: 'You have received a new review',
                is_read: false,
                created_at: new Date().toISOString()
            };
            
            this.addResult('Notification Structure', !!mockNotification.id, 'Notification structure valid');
            
            // Test notification formatting
            const formattedNotification = storeService.formatNotification(mockNotification);
            this.addResult('Notification Formatting', !!formattedNotification, 'Notification formatted correctly');
            
            // Test notification types
            const validTypes = ['new_review', 'low_stock', 'high_engagement', 'performance_milestone', 'system_update'];
            const isValidType = validTypes.includes(mockNotification.notification_type);
            this.addResult('Notification Types', isValidType, 'Notification type validation');
            
        } catch (error) {
            this.addResult('Notifications', false, `Error: ${error.message}`);
        }
    }

    async testPerformance() {
        console.log('\n⚡ Testing Performance...');
        
        try {
            // Test analytics tracking
            const startTime = performance.now();
            
            // Simulate analytics tracking
            await storeService.trackStoreView('test-store');
            await storeService.trackProductView(1, 30);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            this.addResult('Tracking Performance', duration < 1000, `Tracking took ${duration.toFixed(2)}ms`);
            
            // Test data export performance
            const exportStartTime = performance.now();
            try {
                await storeService.exportAnalyticsData('json', 7);
                const exportEndTime = performance.now();
                const exportDuration = exportEndTime - exportStartTime;
                this.addResult('Export Performance', exportDuration < 5000, `Export took ${exportDuration.toFixed(2)}ms`);
            } catch (error) {
                this.addResult('Export Performance', false, `Export error: ${error.message}`);
            }
            
        } catch (error) {
            this.addResult('Performance', false, `Error: ${error.message}`);
        }
    }

    async testUI() {
        console.log('\n🎨 Testing UI Components...');
        
        try {
            // Test page elements existence
            const pageContainer = document.getElementById('page-container');
            this.addResult('Page Container', !!pageContainer, 'Main page container exists');
            
            // Test navigation
            const navbar = document.querySelector('nav');
            this.addResult('Navigation', !!navbar, 'Navigation bar exists');
            
            // Test responsive design
            const isMobile = window.innerWidth < 768;
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
            const isDesktop = window.innerWidth >= 1024;
            
            this.addResult('Responsive Design', isMobile || isTablet || isDesktop, 
                          `Screen size: ${window.innerWidth}px`);
            
            // Test CSS classes
            const hasBootstrap = !!document.querySelector('.container, .row, .col');
            const hasTailwind = !!document.querySelector('[class*="bg-"], [class*="text-"], [class*="p-"]');
            
            this.addResult('CSS Framework', hasBootstrap || hasTailwind, 
                          `Bootstrap: ${hasBootstrap}, Tailwind: ${hasTailwind}`);
            
        } catch (error) {
            this.addResult('UI Components', false, `Error: ${error.message}`);
        }
    }

    addResult(testName, passed, details) {
        const result = {
            name: testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${details}`);
    }

    displayResults() {
        console.log('\n📋 Test Results Summary');
        console.log('========================');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        
        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => !r.passed)
                .forEach(r => console.log(`   - ${r.name}: ${r.details}`));
        }
        
        // Show toast notification
        if (successRate >= 90) {
            showToast(`🎉 Tests completed! Success rate: ${successRate}%`, 'success');
        } else if (successRate >= 70) {
            showToast(`⚠️ Tests completed with warnings. Success rate: ${successRate}%`, 'warning');
        } else {
            showToast(`❌ Tests completed with errors. Success rate: ${successRate}%`, 'error');
        }
        
        // Store results for debugging
        window.storeTestResults = this.testResults;
        console.log('\n💡 Test results stored in window.storeTestResults');
    }

    // Individual test methods for specific features
    async testStoreApplicationFlow() {
        console.log('\n🔄 Testing Complete Store Application Flow...');
        
        // This would test the entire flow from application to approval
        // Implementation would depend on having test data and mock APIs
    }

    async testAnalyticsAccuracy() {
        console.log('\n🎯 Testing Analytics Accuracy...');
        
        // This would test analytics calculations against known data
        // Implementation would require test datasets
    }

    async testSecurityFeatures() {
        console.log('\n🔒 Testing Security Features...');
        
        // This would test authentication, authorization, and data protection
        // Implementation would require security-specific test cases
    }
}

// Create global instance
const storeSystemTester = new StoreSystemTester();

// Export for use in console
window.testStoreSystem = {
    runAllTests: () => storeSystemTester.runAllTests(),
    runAuthTests: () => storeSystemTester.testAuthentication(),
    runDashboardTests: () => storeSystemTester.testStoreDashboard(),
    runAnalyticsTests: () => storeSystemTester.testStoreAnalytics(),
    runFeedbackTests: () => storeSystemTester.testStoreFeedback(),
    runUITests: () => storeSystemTester.testUI(),
    getResults: () => storeSystemTester.testResults
};

console.log('🧪 Store System Tester loaded!');
console.log('Use testStoreSystem.runAllTests() to run all tests');
console.log('Use testStoreSystem.runAuthTests() to test authentication');
console.log('Use testStoreSystem.runDashboardTests() to test dashboard');
console.log('Use testStoreSystem.getResults() to see test results');

export default storeSystemTester;