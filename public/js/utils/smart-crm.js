/**
 * Smart Customer Relationship Management System
 * AI-powered customer insights and relationship management
 */

class SmartCRM {
    constructor() {
        this.customers = new Map();
        this.interactions = new Map();
        this.segments = new Map();
        this.campaigns = new Map();
        this.automations = new Map();
        
        this.settings = {
            loyaltyThreshold: 5, // orders
            highValueThreshold: 1000, // SAR
            churnRiskThreshold: 0.7,
            engagementScoreThreshold: 60
        };
        
        this.init();
    }

    init() {
        this.loadCustomerData();
        this.initializeSegmentation();
        this.startAutomatedProcesses();
        this.setupEventTracking();
    }

    // Customer management
    addCustomer(customerId, customerData) {
        const customer = {
            id: customerId,
            email: customerData.email,
            name: customerData.name,
            phone: customerData.phone || '',
            address: customerData.address || {},
            registrationDate: customerData.registrationDate || new Date(),
            lastActivity: new Date(),
            
            // Purchase behavior
            totalOrders: 0,
            totalSpent: 0,
            averageOrderValue: 0,
            lastOrderDate: null,
            firstOrderDate: null,
            
            // Engagement metrics
            emailOpens: 0,
            emailClicks: 0,
            websiteVisits: 0,
            pageViews: 0,
            sessionDuration: 0,
            
            // Preferences
            preferences: {
                categories: [],
                brands: [],
                priceRange: { min: 0, max: 0 },
                communicationChannel: 'email',
                frequency: 'weekly'
            },
            
            // Scores and classifications
            loyaltyScore: 0,
            engagementScore: 0,
            churnRisk: 0,
            lifetimeValue: 0,
            segment: 'new',
            
            // Interaction history
            interactions: [],
            orders: [],
            reviews: [],
            supportTickets: [],
            
            // Metadata
            tags: [],
            notes: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.customers.set(customerId, customer);
        this.calculateCustomerScores(customerId);
        this.assignCustomerSegment(customerId);
        
        return customer;
    }

    updateCustomer(customerId, updates) {
        const customer = this.customers.get(customerId);
        if (!customer) {
            throw new Error(`Customer ${customerId} not found`);
        }

        Object.assign(customer, updates);
        customer.updatedAt = new Date();
        customer.lastActivity = new Date();

        this.calculateCustomerScores(customerId);
        this.assignCustomerSegment(customerId);
        
        return customer;
    }

    // Interaction tracking
    trackInteraction(customerId, interactionData) {
        const customer = this.customers.get(customerId);
        if (!customer) return null;

        const interaction = {
            id: this.generateInteractionId(),
            customerId: customerId,
            type: interactionData.type, // email, call, chat, visit, purchase, etc.
            channel: interactionData.channel, // website, email, phone, social, etc.
            timestamp: new Date(),
            duration: interactionData.duration || 0,
            outcome: interactionData.outcome || 'completed',
            details: interactionData.details || {},
            value: interactionData.value || 0,
            tags: interactionData.tags || []
        };

        customer.interactions.push(interaction);
        customer.lastActivity = new Date();
        
        // Update engagement metrics
        this.updateEngagementMetrics(customerId, interaction);
        
        // Store interaction separately for analysis
        this.interactions.set(interaction.id, interaction);
        
        return interaction;
    }

    updateEngagementMetrics(customerId, interaction) {
        const customer = this.customers.get(customerId);
        if (!customer) return;

        switch (interaction.type) {
            case 'email_open':
                customer.emailOpens++;
                break;
            case 'email_click':
                customer.emailClicks++;
                break;
            case 'website_visit':
                customer.websiteVisits++;
                customer.sessionDuration += interaction.duration || 0;
                break;
            case 'page_view':
                customer.pageViews++;
                break;
            case 'purchase':
                this.updatePurchaseMetrics(customerId, interaction);
                break;
        }

        this.calculateCustomerScores(customerId);
    }

    updatePurchaseMetrics(customerId, purchaseData) {
        const customer = this.customers.get(customerId);
        if (!customer) return;

        const orderValue = purchaseData.value || 0;
        
        customer.totalOrders++;
        customer.totalSpent += orderValue;
        customer.averageOrderValue = customer.totalSpent / customer.totalOrders;
        customer.lastOrderDate = new Date();
        
        if (!customer.firstOrderDate) {
            customer.firstOrderDate = new Date();
        }

        // Add to orders history
        customer.orders.push({
            id: purchaseData.orderId || this.generateOrderId(),
            date: new Date(),
            value: orderValue,
            items: purchaseData.items || [],
            status: 'completed'
        });

        this.calculateCustomerScores(customerId);
        this.assignCustomerSegment(customerId);
    }

    // Customer scoring and segmentation
    calculateCustomerScores(customerId) {
        const customer = this.customers.get(customerId);
        if (!customer) return;

        // Calculate loyalty score (0-100)
        customer.loyaltyScore = this.calculateLoyaltyScore(customer);
        
        // Calculate engagement score (0-100)
        customer.engagementScore = this.calculateEngagementScore(customer);
        
        // Calculate churn risk (0-1)
        customer.churnRisk = this.calculateChurnRisk(customer);
        
        // Calculate lifetime value
        customer.lifetimeValue = this.calculateLifetimeValue(customer);
    }

    calculateLoyaltyScore(customer) {
        let score = 0;
        
        // Order frequency (40% weight)
        const daysSinceRegistration = (Date.now() - customer.registrationDate.getTime()) / (1000 * 60 * 60 * 24);
        const orderFrequency = customer.totalOrders / Math.max(daysSinceRegistration / 30, 1); // orders per month
        score += Math.min(orderFrequency * 10, 40);
        
        // Total spent (30% weight)
        const spentScore = Math.min(customer.totalSpent / 100, 30); // 1 point per 100 SAR, max 30
        score += spentScore;
        
        // Recency (20% weight)
        if (customer.lastOrderDate) {
            const daysSinceLastOrder = (Date.now() - customer.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
            const recencyScore = Math.max(20 - (daysSinceLastOrder / 7), 0); // lose 1 point per week
            score += recencyScore;
        }
        
        // Engagement (10% weight)
        const engagementScore = (customer.emailOpens + customer.emailClicks + customer.websiteVisits) / 10;
        score += Math.min(engagementScore, 10);
        
        return Math.min(Math.round(score), 100);
    }

    calculateEngagementScore(customer) {
        let score = 0;
        
        // Website engagement (40% weight)
        const avgSessionDuration = customer.websiteVisits > 0 ? customer.sessionDuration / customer.websiteVisits : 0;
        score += Math.min(avgSessionDuration / 60, 20); // 1 point per minute, max 20
        score += Math.min(customer.pageViews / 10, 20); // 1 point per 10 page views, max 20
        
        // Email engagement (30% weight)
        const emailEngagement = customer.emailOpens > 0 ? (customer.emailClicks / customer.emailOpens) * 100 : 0;
        score += Math.min(emailEngagement * 0.3, 30);
        
        // Purchase engagement (30% weight)
        const purchaseEngagement = customer.totalOrders * 5; // 5 points per order
        score += Math.min(purchaseEngagement, 30);
        
        return Math.min(Math.round(score), 100);
    }

    calculateChurnRisk(customer) {
        let riskFactors = 0;
        let totalFactors = 0;
        
        // Recency factor
        if (customer.lastOrderDate) {
            const daysSinceLastOrder = (Date.now() - customer.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
            const expectedOrderInterval = this.calculateExpectedOrderInterval(customer);
            
            if (daysSinceLastOrder > expectedOrderInterval * 2) {
                riskFactors += 0.4;
            } else if (daysSinceLastOrder > expectedOrderInterval * 1.5) {
                riskFactors += 0.2;
            }
        } else {
            riskFactors += 0.3; // Never purchased
        }
        totalFactors += 0.4;
        
        // Engagement factor
        const recentEngagement = this.getRecentEngagement(customer.id, 30); // last 30 days
        if (recentEngagement < 5) {
            riskFactors += 0.3;
        } else if (recentEngagement < 10) {
            riskFactors += 0.1;
        }
        totalFactors += 0.3;
        
        // Order trend factor
        const orderTrend = this.calculateOrderTrend(customer);
        if (orderTrend < -0.2) {
            riskFactors += 0.2;
        } else if (orderTrend < 0) {
            riskFactors += 0.1;
        }
        totalFactors += 0.2;
        
        // Support issues factor
        const recentIssues = customer.supportTickets.filter(ticket => 
            (Date.now() - ticket.date.getTime()) < (30 * 24 * 60 * 60 * 1000)
        ).length;
        if (recentIssues > 2) {
            riskFactors += 0.1;
        }
        totalFactors += 0.1;
        
        return totalFactors > 0 ? riskFactors / totalFactors : 0;
    }

    calculateLifetimeValue(customer) {
        if (customer.totalOrders === 0) return 0;
        
        const avgOrderValue = customer.averageOrderValue;
        const orderFrequency = this.calculateOrderFrequency(customer);
        const customerLifespan = this.estimateCustomerLifespan(customer);
        
        return avgOrderValue * orderFrequency * customerLifespan;
    }

    // Customer segmentation
    assignCustomerSegment(customerId) {
        const customer = this.customers.get(customerId);
        if (!customer) return;

        const segments = this.performRFMSegmentation(customer);
        customer.segment = segments.primary;
        customer.secondarySegments = segments.secondary;
        
        // Add to segment map
        if (!this.segments.has(customer.segment)) {
            this.segments.set(customer.segment, new Set());
        }
        this.segments.get(customer.segment).add(customerId);
    }

    performRFMSegmentation(customer) {
        const recency = this.calculateRecencyScore(customer);
        const frequency = this.calculateFrequencyScore(customer);
        const monetary = this.calculateMonetaryScore(customer);
        
        // RFM scoring (1-5 scale)
        const rScore = this.scoreToRFMScale(recency, 'recency');
        const fScore = this.scoreToRFMScale(frequency, 'frequency');
        const mScore = this.scoreToRFMScale(monetary, 'monetary');
        
        const rfmScore = `${rScore}${fScore}${mScore}`;
        
        return {
            primary: this.mapRFMToSegment(rScore, fScore, mScore),
            secondary: this.getSecondarySegments(customer),
            rfmScore: rfmScore,
            scores: { recency: rScore, frequency: fScore, monetary: mScore }
        };
    }

    mapRFMToSegment(r, f, m) {
        // Champions: High value, frequent, recent customers
        if (r >= 4 && f >= 4 && m >= 4) return 'champions';
        
        // Loyal customers: High frequency, good monetary value
        if (f >= 4 && m >= 3) return 'loyal_customers';
        
        // Potential loyalists: Recent customers with good frequency
        if (r >= 3 && f >= 2 && f <= 3) return 'potential_loyalists';
        
        // New customers: Recent but low frequency
        if (r >= 4 && f <= 2) return 'new_customers';
        
        // Promising: Recent customers with potential
        if (r >= 3 && f <= 2 && m >= 2) return 'promising';
        
        // Need attention: Above average recency, frequency, and monetary
        if (r >= 2 && f >= 2 && m >= 2) return 'need_attention';
        
        // About to sleep: Below average recency and frequency
        if (r <= 2 && f >= 2) return 'about_to_sleep';
        
        // At risk: Good monetary value but low recency and frequency
        if (r <= 2 && f <= 2 && m >= 3) return 'at_risk';
        
        // Cannot lose them: High monetary value but very low recency and frequency
        if (r <= 1 && f <= 1 && m >= 4) return 'cannot_lose_them';
        
        // Hibernating: Low recency, frequency, and monetary
        if (r <= 2 && f <= 2 && m <= 2) return 'hibernating';
        
        // Lost: Lowest recency, frequency, and monetary
        return 'lost';
    }

    // Campaign management
    createCampaign(campaignData) {
        const campaign = {
            id: this.generateCampaignId(),
            name: campaignData.name,
            type: campaignData.type, // email, sms, push, etc.
            objective: campaignData.objective, // retention, acquisition, upsell, etc.
            targetSegments: campaignData.targetSegments || [],
            targetCustomers: campaignData.targetCustomers || [],
            content: campaignData.content,
            schedule: campaignData.schedule,
            budget: campaignData.budget || 0,
            status: 'draft',
            metrics: {
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                converted: 0,
                revenue: 0
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.campaigns.set(campaign.id, campaign);
        return campaign;
    }

    launchCampaign(campaignId) {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign) {
            throw new Error(`Campaign ${campaignId} not found`);
        }

        campaign.status = 'active';
        campaign.launchedAt = new Date();
        
        // Get target audience
        const targetCustomers = this.getTargetAudience(campaign);
        
        // Execute campaign
        this.executeCampaign(campaign, targetCustomers);
        
        return campaign;
    }

    getTargetAudience(campaign) {
        let targetCustomers = new Set();
        
        // Add customers from target segments
        campaign.targetSegments.forEach(segment => {
            const segmentCustomers = this.segments.get(segment);
            if (segmentCustomers) {
                segmentCustomers.forEach(customerId => targetCustomers.add(customerId));
            }
        });
        
        // Add specific target customers
        campaign.targetCustomers.forEach(customerId => targetCustomers.add(customerId));
        
        return Array.from(targetCustomers);
    }

    // Automated workflows
    createAutomation(automationData) {
        const automation = {
            id: this.generateAutomationId(),
            name: automationData.name,
            trigger: automationData.trigger, // event that starts the automation
            conditions: automationData.conditions || [],
            actions: automationData.actions || [],
            isActive: true,
            createdAt: new Date(),
            stats: {
                triggered: 0,
                completed: 0,
                failed: 0
            }
        };

        this.automations.set(automation.id, automation);
        return automation;
    }

    triggerAutomation(trigger, customerId, eventData = {}) {
        this.automations.forEach(automation => {
            if (automation.isActive && automation.trigger === trigger) {
                this.executeAutomation(automation, customerId, eventData);
            }
        });
    }

    executeAutomation(automation, customerId, eventData) {
        const customer = this.customers.get(customerId);
        if (!customer) return;

        automation.stats.triggered++;

        try {
            // Check conditions
            const conditionsMet = this.checkAutomationConditions(automation.conditions, customer, eventData);
            
            if (conditionsMet) {
                // Execute actions
                automation.actions.forEach(action => {
                    this.executeAutomationAction(action, customer, eventData);
                });
                
                automation.stats.completed++;
            }
        } catch (error) {
            console.error('Automation execution failed:', error);
            automation.stats.failed++;
        }
    }

    executeAutomationAction(action, customer, eventData) {
        switch (action.type) {
            case 'send_email':
                this.sendAutomatedEmail(customer, action.template, action.data);
                break;
            case 'add_tag':
                this.addCustomerTag(customer.id, action.tag);
                break;
            case 'update_segment':
                this.assignCustomerSegment(customer.id);
                break;
            case 'create_task':
                this.createFollowUpTask(customer.id, action.task);
                break;
            case 'send_discount':
                this.sendDiscountCode(customer, action.discount);
                break;
            default:
                console.warn(`Unknown automation action: ${action.type}`);
        }
    }

    // Analytics and insights
    generateCustomerInsights(customerId) {
        const customer = this.customers.get(customerId);
        if (!customer) return null;

        return {
            customer: customer,
            behaviorAnalysis: this.analyzeCustomerBehavior(customerId),
            predictiveInsights: this.generatePredictiveInsights(customerId),
            recommendations: this.generateCustomerRecommendations(customerId),
            nextBestActions: this.getNextBestActions(customerId)
        };
    }

    analyzeCustomerBehavior(customerId) {
        const customer = this.customers.get(customerId);
        if (!customer) return null;

        return {
            purchasePattern: this.analyzePurchasePattern(customer),
            engagementPattern: this.analyzeEngagementPattern(customer),
            preferenceAnalysis: this.analyzeCustomerPreferences(customer),
            seasonalBehavior: this.analyzeSeasonalBehavior(customer)
        };
    }

    generatePredictiveInsights(customerId) {
        const customer = this.customers.get(customerId);
        if (!customer) return null;

        return {
            churnProbability: customer.churnRisk,
            nextPurchaseProbability: this.predictNextPurchase(customer),
            lifetimeValuePrediction: this.predictLifetimeValue(customer),
            optimalContactTime: this.predictOptimalContactTime(customer),
            productRecommendations: this.generateProductRecommendations(customer)
        };
    }

    // Reporting
    generateCRMReport(timeframe = 'monthly') {
        const report = {
            timestamp: new Date(),
            timeframe: timeframe,
            customerMetrics: this.getCustomerMetrics(),
            segmentAnalysis: this.getSegmentAnalysis(),
            campaignPerformance: this.getCampaignPerformance(),
            automationStats: this.getAutomationStats(),
            insights: this.generateCRMInsights()
        };

        return report;
    }

    getCustomerMetrics() {
        let totalCustomers = this.customers.size;
        let activeCustomers = 0;
        let newCustomers = 0;
        let churnedCustomers = 0;
        let totalRevenue = 0;
        let totalOrders = 0;

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        this.customers.forEach(customer => {
            totalRevenue += customer.totalSpent;
            totalOrders += customer.totalOrders;

            if (customer.lastActivity > thirtyDaysAgo) {
                activeCustomers++;
            }

            if (customer.registrationDate > thirtyDaysAgo) {
                newCustomers++;
            }

            if (customer.churnRisk > this.settings.churnRiskThreshold) {
                churnedCustomers++;
            }
        });

        return {
            totalCustomers,
            activeCustomers,
            newCustomers,
            churnedCustomers,
            totalRevenue,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            customerLifetimeValue: totalCustomers > 0 ? totalRevenue / totalCustomers : 0
        };
    }

    // Helper methods
    generateInteractionId() {
        return 'int_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateOrderId() {
        return 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateCampaignId() {
        return 'camp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateAutomationId() {
        return 'auto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupEventTracking() {
        // Listen for customer events
        window.addEventListener('customerEvent', (event) => {
            const { customerId, type, data } = event.detail;
            this.trackInteraction(customerId, { type, ...data });
        });

        // Listen for purchase events
        window.addEventListener('purchaseCompleted', (event) => {
            const { customerId, orderData } = event.detail;
            this.updatePurchaseMetrics(customerId, orderData);
            this.triggerAutomation('purchase_completed', customerId, orderData);
        });
    }

    startAutomatedProcesses() {
        // Run customer scoring every hour
        setInterval(() => {
            this.customers.forEach((customer, customerId) => {
                this.calculateCustomerScores(customerId);
            });
        }, 3600000);

        // Check for churn risk daily
        setInterval(() => {
            this.identifyChurnRisks();
        }, 86400000);

        // Update segments weekly
        setInterval(() => {
            this.updateAllSegments();
        }, 604800000);
    }

    loadCustomerData() {
        // Load from localStorage or API
        const savedData = localStorage.getItem('smartCRMData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                data.customers.forEach(customer => {
                    this.customers.set(customer.id, customer);
                });
            } catch (error) {
                console.error('Error loading CRM data:', error);
            }
        }
    }

    saveCustomerData() {
        const data = {
            customers: Array.from(this.customers.values()),
            segments: Object.fromEntries(this.segments),
            campaigns: Array.from(this.campaigns.values()),
            automations: Array.from(this.automations.values()),
            timestamp: new Date()
        };
        
        localStorage.setItem('smartCRMData', JSON.stringify(data));
    }
}

// Initialize smart CRM system
const smartCRM = new SmartCRM();

// Export for use in other modules
export { smartCRM, SmartCRM };

// Make available globally for console testing
window.smartCRM = smartCRM;

// Auto-save CRM data every 10 minutes
setInterval(() => {
    smartCRM.saveCustomerData();
}, 600000);