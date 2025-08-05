/**
 * Advanced Analytics System
 * Provides deep insights and predictive analytics for stores
 */

class AdvancedAnalytics {
    constructor() {
        this.data = {
            userBehavior: [],
            conversionFunnels: {},
            cohortAnalysis: {},
            predictiveModels: {},
            realTimeMetrics: {}
        };
        
        this.init();
    }

    init() {
        this.startRealTimeTracking();
        this.initializeEventTracking();
        this.setupPeriodicAnalysis();
    }

    // Real-time metrics tracking
    startRealTimeTracking() {
        this.realTimeInterval = setInterval(() => {
            this.updateRealTimeMetrics();
        }, 5000); // Update every 5 seconds
    }

    updateRealTimeMetrics() {
        this.data.realTimeMetrics = {
            timestamp: new Date(),
            activeUsers: this.getActiveUsersCount(),
            currentPageViews: this.getCurrentPageViews(),
            conversionRate: this.calculateRealTimeConversionRate(),
            averageSessionDuration: this.getAverageSessionDuration(),
            bounceRate: this.calculateBounceRate()
        };

        // Broadcast real-time updates
        this.broadcastRealTimeUpdate(this.data.realTimeMetrics);
    }

    // User behavior tracking
    trackUserBehavior(action, details = {}) {
        const behaviorEvent = {
            timestamp: new Date(),
            sessionId: this.getSessionId(),
            userId: this.getUserId(),
            action: action,
            details: details,
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };

        this.data.userBehavior.push(behaviorEvent);
        this.analyzeUserBehavior(behaviorEvent);
    }

    analyzeUserBehavior(event) {
        // Analyze patterns in user behavior
        const patterns = this.detectBehaviorPatterns(event);
        
        if (patterns.length > 0) {
            this.triggerBehaviorInsights(patterns);
        }
    }

    detectBehaviorPatterns(event) {
        const patterns = [];
        const recentBehavior = this.getRecentUserBehavior(event.sessionId, 10);

        // Pattern 1: Rapid clicking (potential frustration)
        const clickEvents = recentBehavior.filter(e => e.action === 'click');
        if (clickEvents.length > 5 && this.getTimeSpan(clickEvents) < 10000) {
            patterns.push({
                type: 'rapid_clicking',
                severity: 'medium',
                suggestion: 'المستخدم قد يواجه صعوبة في التنقل'
            });
        }

        // Pattern 2: Long time on product page without action
        if (event.action === 'page_view' && event.page.includes('/product/')) {
            const timeOnPage = this.getTimeOnCurrentPage();
            if (timeOnPage > 120000 && !this.hasRecentPurchaseIntent(event.sessionId)) {
                patterns.push({
                    type: 'hesitant_buyer',
                    severity: 'low',
                    suggestion: 'عرض خصم أو مساعدة للمستخدم المتردد'
                });
            }
        }

        // Pattern 3: Cart abandonment
        if (event.action === 'add_to_cart') {
            setTimeout(() => {
                if (!this.hasCompletedPurchase(event.sessionId)) {
                    patterns.push({
                        type: 'cart_abandonment',
                        severity: 'high',
                        suggestion: 'إرسال تذكير بالسلة المتروكة'
                    });
                }
            }, 300000); // Check after 5 minutes
        }

        return patterns;
    }

    // Conversion funnel analysis
    analyzeConversionFunnel(storeId) {
        const funnelSteps = [
            'page_view',
            'product_view',
            'add_to_cart',
            'checkout_start',
            'payment_info',
            'purchase_complete'
        ];

        const funnelData = {};
        
        funnelSteps.forEach((step, index) => {
            const stepEvents = this.getEventsByType(step, storeId);
            const previousStepEvents = index > 0 ? this.getEventsByType(funnelSteps[index - 1], storeId) : null;
            
            funnelData[step] = {
                count: stepEvents.length,
                conversionRate: previousStepEvents ? (stepEvents.length / previousStepEvents.length) * 100 : 100,
                dropOffRate: previousStepEvents ? ((previousStepEvents.length - stepEvents.length) / previousStepEvents.length) * 100 : 0
            };
        });

        this.data.conversionFunnels[storeId] = funnelData;
        return funnelData;
    }

    // Cohort analysis
    performCohortAnalysis(storeId, timeframe = 'monthly') {
        const cohorts = this.groupUsersByCohort(storeId, timeframe);
        const cohortAnalysis = {};

        Object.keys(cohorts).forEach(cohortPeriod => {
            const cohortUsers = cohorts[cohortPeriod];
            cohortAnalysis[cohortPeriod] = this.analyzeCohortBehavior(cohortUsers, cohortPeriod);
        });

        this.data.cohortAnalysis[storeId] = cohortAnalysis;
        return cohortAnalysis;
    }

    analyzeCohortBehavior(users, cohortPeriod) {
        return {
            totalUsers: users.length,
            retentionRates: this.calculateRetentionRates(users, cohortPeriod),
            averageOrderValue: this.calculateAverageOrderValue(users),
            lifetimeValue: this.calculateCustomerLifetimeValue(users),
            churnRate: this.calculateChurnRate(users)
        };
    }

    // Predictive analytics
    generatePredictiveInsights(storeId) {
        const historicalData = this.getHistoricalData(storeId);
        const predictions = {};

        // Predict sales for next month
        predictions.salesForecast = this.predictSales(historicalData);
        
        // Predict customer churn
        predictions.churnPrediction = this.predictCustomerChurn(historicalData);
        
        // Predict optimal pricing
        predictions.pricingOptimization = this.predictOptimalPricing(historicalData);
        
        // Predict inventory needs
        predictions.inventoryForecast = this.predictInventoryNeeds(historicalData);

        this.data.predictiveModels[storeId] = predictions;
        return predictions;
    }

    predictSales(historicalData) {
        // Simple linear regression for sales prediction
        const salesData = historicalData.sales || [];
        if (salesData.length < 3) return null;

        const trend = this.calculateTrend(salesData);
        const seasonality = this.detectSeasonality(salesData);
        
        return {
            nextMonth: this.extrapolateSales(salesData, trend, seasonality, 1),
            nextQuarter: this.extrapolateSales(salesData, trend, seasonality, 3),
            confidence: this.calculatePredictionConfidence(salesData, trend)
        };
    }

    predictCustomerChurn(historicalData) {
        const customers = historicalData.customers || [];
        const churnIndicators = [];

        customers.forEach(customer => {
            const riskScore = this.calculateChurnRiskScore(customer);
            if (riskScore > 0.7) {
                churnIndicators.push({
                    customerId: customer.id,
                    riskScore: riskScore,
                    reasons: this.identifyChurnReasons(customer),
                    recommendations: this.generateRetentionRecommendations(customer)
                });
            }
        });

        return churnIndicators;
    }

    // Advanced segmentation
    performAdvancedSegmentation(storeId) {
        const customers = this.getCustomerData(storeId);
        const segments = {
            champions: [],
            loyalCustomers: [],
            potentialLoyalists: [],
            newCustomers: [],
            promisers: [],
            needsAttention: [],
            aboutToSleep: [],
            atRisk: [],
            cannotLoseThemm: [],
            hibernating: [],
            lost: []
        };

        customers.forEach(customer => {
            const rfmScore = this.calculateRFMScore(customer);
            const segment = this.assignRFMSegment(rfmScore);
            segments[segment].push(customer);
        });

        return segments;
    }

    calculateRFMScore(customer) {
        const recency = this.calculateRecency(customer.lastPurchaseDate);
        const frequency = customer.totalOrders;
        const monetary = customer.totalSpent;

        return {
            recency: this.scoreRecency(recency),
            frequency: this.scoreFrequency(frequency),
            monetary: this.scoreMonetary(monetary),
            combined: this.combineRFMScores(recency, frequency, monetary)
        };
    }

    // A/B testing framework
    setupABTest(testName, variants, trafficSplit = 0.5) {
        const test = {
            name: testName,
            variants: variants,
            trafficSplit: trafficSplit,
            startDate: new Date(),
            participants: {},
            results: {}
        };

        this.activeABTests = this.activeABTests || {};
        this.activeABTests[testName] = test;

        return test;
    }

    assignUserToVariant(testName, userId) {
        const test = this.activeABTests[testName];
        if (!test) return null;

        // Consistent assignment based on user ID
        const hash = this.hashUserId(userId);
        const variant = hash < test.trafficSplit ? 'A' : 'B';
        
        test.participants[userId] = {
            variant: variant,
            assignedAt: new Date()
        };

        return variant;
    }

    trackABTestConversion(testName, userId, conversionType, value = 1) {
        const test = this.activeABTests[testName];
        if (!test || !test.participants[userId]) return;

        const variant = test.participants[userId].variant;
        
        if (!test.results[variant]) {
            test.results[variant] = {};
        }
        
        if (!test.results[variant][conversionType]) {
            test.results[variant][conversionType] = [];
        }

        test.results[variant][conversionType].push({
            userId: userId,
            value: value,
            timestamp: new Date()
        });
    }

    analyzeABTestResults(testName) {
        const test = this.activeABTests[testName];
        if (!test) return null;

        const analysis = {
            testName: testName,
            duration: Date.now() - test.startDate.getTime(),
            participants: Object.keys(test.participants).length,
            variants: {}
        };

        ['A', 'B'].forEach(variant => {
            const variantParticipants = Object.values(test.participants)
                .filter(p => p.variant === variant).length;
            
            const variantResults = test.results[variant] || {};
            
            analysis.variants[variant] = {
                participants: variantParticipants,
                conversions: this.calculateVariantConversions(variantResults),
                conversionRate: this.calculateVariantConversionRate(variantResults, variantParticipants),
                averageValue: this.calculateVariantAverageValue(variantResults)
            };
        });

        analysis.significance = this.calculateStatisticalSignificance(analysis.variants);
        analysis.recommendation = this.generateABTestRecommendation(analysis);

        return analysis;
    }

    // Real-time dashboard data
    generateRealTimeDashboard(storeId) {
        return {
            timestamp: new Date(),
            metrics: this.data.realTimeMetrics,
            alerts: this.generateRealTimeAlerts(storeId),
            trends: this.calculateRealTimeTrends(storeId),
            recommendations: this.generateRealTimeRecommendations(storeId)
        };
    }

    generateRealTimeAlerts(storeId) {
        const alerts = [];
        const metrics = this.data.realTimeMetrics;

        // Traffic spike alert
        if (metrics.currentPageViews > this.getAveragePageViews() * 2) {
            alerts.push({
                type: 'traffic_spike',
                severity: 'info',
                message: 'زيادة كبيرة في عدد الزوار',
                action: 'تأكد من استقرار الخادم'
            });
        }

        // Low conversion alert
        if (metrics.conversionRate < this.getAverageConversionRate() * 0.5) {
            alerts.push({
                type: 'low_conversion',
                severity: 'warning',
                message: 'انخفاض في معدل التحويل',
                action: 'راجع صفحات المنتجات والأسعار'
            });
        }

        // High bounce rate alert
        if (metrics.bounceRate > 70) {
            alerts.push({
                type: 'high_bounce',
                severity: 'warning',
                message: 'معدل ارتداد عالي',
                action: 'حسن محتوى الصفحة الرئيسية'
            });
        }

        return alerts;
    }

    // Helper methods
    getSessionId() {
        return sessionStorage.getItem('sessionId') || this.generateSessionId();
    }

    getUserId() {
        return localStorage.getItem('userId') || 'anonymous';
    }

    generateSessionId() {
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('sessionId', sessionId);
        return sessionId;
    }

    broadcastRealTimeUpdate(metrics) {
        // Broadcast to any listening components
        window.dispatchEvent(new CustomEvent('realTimeMetricsUpdate', {
            detail: metrics
        }));
    }

    // Export methods
    exportAnalyticsData(format = 'json') {
        const exportData = {
            timestamp: new Date(),
            userBehavior: this.data.userBehavior,
            conversionFunnels: this.data.conversionFunnels,
            cohortAnalysis: this.data.cohortAnalysis,
            predictiveModels: this.data.predictiveModels,
            realTimeMetrics: this.data.realTimeMetrics
        };

        if (format === 'csv') {
            return this.convertToCSV(exportData);
        }

        return JSON.stringify(exportData, null, 2);
    }

    // Initialize event tracking
    initializeEventTracking() {
        // Track page views
        this.trackUserBehavior('page_view', {
            url: window.location.href,
            title: document.title
        });

        // Track clicks
        document.addEventListener('click', (event) => {
            this.trackUserBehavior('click', {
                element: event.target.tagName,
                className: event.target.className,
                id: event.target.id,
                text: event.target.textContent?.substring(0, 100)
            });
        });

        // Track form submissions
        document.addEventListener('submit', (event) => {
            this.trackUserBehavior('form_submit', {
                formId: event.target.id,
                formAction: event.target.action
            });
        });

        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                if (scrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                    this.trackUserBehavior('scroll_depth', {
                        depth: scrollDepth
                    });
                }
            }
        });
    }

    setupPeriodicAnalysis() {
        // Run comprehensive analysis every hour
        setInterval(() => {
            this.runPeriodicAnalysis();
        }, 3600000); // 1 hour
    }

    runPeriodicAnalysis() {
        console.log('Running periodic analytics analysis...');
        
        // Generate insights for all active stores
        const activeStores = this.getActiveStores();
        activeStores.forEach(storeId => {
            this.analyzeConversionFunnel(storeId);
            this.performCohortAnalysis(storeId);
            this.generatePredictiveInsights(storeId);
        });
    }
}

// Initialize advanced analytics
const advancedAnalytics = new AdvancedAnalytics();

// Export for use in other modules
export { advancedAnalytics, AdvancedAnalytics };

// Make available globally for console testing
window.advancedAnalytics = advancedAnalytics;