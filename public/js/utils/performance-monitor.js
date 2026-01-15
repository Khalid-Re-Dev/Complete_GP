/**
 * Performance Monitor Utility
 * Monitors system performance and provides insights
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            apiResponseTimes: [],
            errorCount: 0,
            userInteractions: 0,
            memoryUsage: 0
        };
        
        this.thresholds = {
            slowPageLoad: 3000, // 3 seconds
            slowApiResponse: 2000, // 2 seconds
            highErrorRate: 0.05, // 5%
            lowEngagement: 10 // 10 interactions per minute
        };
        
        this.init();
    }

    init() {
        this.monitorPageLoad();
        this.monitorApiCalls();
        this.monitorErrors();
        this.monitorUserInteractions();
        this.monitorMemoryUsage();
        this.startPeriodicReporting();
    }

    monitorPageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.metrics.pageLoadTime = loadTime;
            
            if (loadTime > this.thresholds.slowPageLoad) {
                this.reportPerformanceIssue('slow_page_load', {
                    loadTime: loadTime,
                    threshold: this.thresholds.slowPageLoad
                });
            }
        });
    }

    monitorApiCalls() {
        // Intercept fetch calls
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            
            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                
                this.metrics.apiResponseTimes.push({
                    url: args[0],
                    responseTime: responseTime,
                    status: response.status,
                    timestamp: new Date()
                });
                
                if (responseTime > this.thresholds.slowApiResponse) {
                    this.reportPerformanceIssue('slow_api_response', {
                        url: args[0],
                        responseTime: responseTime,
                        threshold: this.thresholds.slowApiResponse
                    });
                }
                
                return response;
            } catch (error) {
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                
                this.metrics.errorCount++;
                this.reportPerformanceIssue('api_error', {
                    url: args[0],
                    error: error.message,
                    responseTime: responseTime
                });
                
                throw error;
            }
        };
    }

    monitorErrors() {
        window.addEventListener('error', (event) => {
            this.metrics.errorCount++;
            this.reportPerformanceIssue('javascript_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.errorCount++;
            this.reportPerformanceIssue('unhandled_promise_rejection', {
                reason: event.reason
            });
        });
    }

    monitorUserInteractions() {
        const interactionEvents = ['click', 'scroll', 'keypress', 'touchstart'];
        
        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.metrics.userInteractions++;
            }, { passive: true });
        });
    }

    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
            }, 30000); // Check every 30 seconds
        }
    }

    startPeriodicReporting() {
        setInterval(() => {
            this.generatePerformanceReport();
        }, 60000); // Report every minute
    }

    reportPerformanceIssue(type, details) {
        console.warn(`Performance Issue: ${type}`, details);
        
        // Send to analytics if available
        if (window.gtag) {
            window.gtag('event', 'performance_issue', {
                issue_type: type,
                details: JSON.stringify(details)
            });
        }
        
        // Show user notification for critical issues
        if (type === 'slow_page_load' || type === 'slow_api_response') {
            this.showPerformanceNotification(type, details);
        }
    }

    showPerformanceNotification(type, details) {
        const messages = {
            slow_page_load: 'الصفحة تحمل ببطء. يرجى التحقق من اتصال الإنترنت.',
            slow_api_response: 'الخدمة تستجيب ببطء. نعمل على حل المشكلة.'
        };

        if (window.showWarning) {
            window.showWarning(messages[type] || 'مشكلة في الأداء');
        }
    }

    generatePerformanceReport() {
        const report = {
            timestamp: new Date(),
            pageLoadTime: this.metrics.pageLoadTime,
            averageApiResponseTime: this.getAverageApiResponseTime(),
            errorRate: this.getErrorRate(),
            userEngagement: this.getUserEngagementRate(),
            memoryUsage: this.metrics.memoryUsage,
            recommendations: this.generateRecommendations()
        };

        console.log('Performance Report:', report);
        return report;
    }

    getAverageApiResponseTime() {
        if (this.metrics.apiResponseTimes.length === 0) return 0;
        
        const total = this.metrics.apiResponseTimes.reduce((sum, call) => sum + call.responseTime, 0);
        return total / this.metrics.apiResponseTimes.length;
    }

    getErrorRate() {
        const totalRequests = this.metrics.apiResponseTimes.length;
        if (totalRequests === 0) return 0;
        
        return this.metrics.errorCount / totalRequests;
    }

    getUserEngagementRate() {
        const timeElapsed = (Date.now() - performance.timing.navigationStart) / 1000 / 60; // minutes
        return this.metrics.userInteractions / timeElapsed;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.pageLoadTime > this.thresholds.slowPageLoad) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: 'تحسين سرعة تحميل الصفحة',
                actions: ['ضغط الصور', 'تقليل حجم JavaScript', 'استخدام CDN']
            });
        }

        if (this.getAverageApiResponseTime() > this.thresholds.slowApiResponse) {
            recommendations.push({
                type: 'api',
                priority: 'medium',
                message: 'تحسين سرعة استجابة API',
                actions: ['تحسين قاعدة البيانات', 'إضافة cache', 'تحسين الخوارزميات']
            });
        }

        if (this.getErrorRate() > this.thresholds.highErrorRate) {
            recommendations.push({
                type: 'reliability',
                priority: 'high',
                message: 'تقليل معدل الأخطاء',
                actions: ['مراجعة الكود', 'إضافة معالجة أخطاء', 'تحسين الاختبارات']
            });
        }

        if (this.getUserEngagementRate() < this.thresholds.lowEngagement) {
            recommendations.push({
                type: 'engagement',
                priority: 'medium',
                message: 'تحسين تفاعل المستخدمين',
                actions: ['تحسين واجهة المستخدم', 'إضافة ميزات تفاعلية', 'تحسين المحتوى']
            });
        }

        return recommendations;
    }

    // Public methods for external use
    getMetrics() {
        return { ...this.metrics };
    }

    getReport() {
        return this.generatePerformanceReport();
    }

    reset() {
        this.metrics = {
            pageLoadTime: 0,
            apiResponseTimes: [],
            errorCount: 0,
            userInteractions: 0,
            memoryUsage: 0
        };
    }
}

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor();

// Export for use in other modules
export { performanceMonitor, PerformanceMonitor };

// Make available globally for console testing
window.performanceMonitor = performanceMonitor;