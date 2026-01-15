/**
 * Smart Inventory Management System
 * AI-powered inventory optimization and management
 */

class SmartInventory {
    constructor() {
        this.inventory = new Map();
        this.predictions = new Map();
        this.alerts = [];
        this.settings = {
            lowStockThreshold: 10,
            reorderPoint: 5,
            maxStockLevel: 1000,
            demandForecastDays: 30,
            seasonalityFactor: 1.2
        };
        
        this.init();
    }

    init() {
        this.loadInventoryData();
        this.startInventoryMonitoring();
        this.initializePredictiveModels();
    }

    // Core inventory management
    addProduct(productId, initialStock, productData = {}) {
        const product = {
            id: productId,
            currentStock: initialStock,
            reservedStock: 0,
            availableStock: initialStock,
            reorderPoint: productData.reorderPoint || this.settings.reorderPoint,
            maxStock: productData.maxStock || this.settings.maxStockLevel,
            cost: productData.cost || 0,
            price: productData.price || 0,
            supplier: productData.supplier || '',
            category: productData.category || '',
            sku: productData.sku || productId,
            lastUpdated: new Date(),
            history: [],
            salesHistory: [],
            demandPattern: {},
            seasonality: {},
            leadTime: productData.leadTime || 7, // days
            minOrderQuantity: productData.minOrderQuantity || 1,
            maxOrderQuantity: productData.maxOrderQuantity || 1000
        };

        this.inventory.set(productId, product);
        this.updateInventoryHistory(productId, 'added', initialStock);
        return product;
    }

    updateStock(productId, quantity, type = 'adjustment', reason = '') {
        const product = this.inventory.get(productId);
        if (!product) {
            throw new Error(`Product ${productId} not found in inventory`);
        }

        const oldStock = product.currentStock;
        
        switch (type) {
            case 'sale':
                product.currentStock -= quantity;
                product.salesHistory.push({
                    date: new Date(),
                    quantity: quantity,
                    price: product.price
                });
                break;
            case 'restock':
                product.currentStock += quantity;
                break;
            case 'adjustment':
                product.currentStock = quantity;
                break;
            case 'return':
                product.currentStock += quantity;
                break;
            case 'damage':
                product.currentStock -= quantity;
                break;
            default:
                throw new Error(`Unknown stock update type: ${type}`);
        }

        product.availableStock = product.currentStock - product.reservedStock;
        product.lastUpdated = new Date();

        this.updateInventoryHistory(productId, type, quantity, reason);
        this.checkStockLevels(productId);
        this.updateDemandPattern(productId);
        
        return product;
    }

    reserveStock(productId, quantity) {
        const product = this.inventory.get(productId);
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        if (product.availableStock < quantity) {
            throw new Error(`Insufficient stock. Available: ${product.availableStock}, Requested: ${quantity}`);
        }

        product.reservedStock += quantity;
        product.availableStock = product.currentStock - product.reservedStock;
        
        return {
            reservationId: this.generateReservationId(),
            productId: productId,
            quantity: quantity,
            timestamp: new Date()
        };
    }

    releaseReservation(productId, quantity) {
        const product = this.inventory.get(productId);
        if (!product) return false;

        product.reservedStock = Math.max(0, product.reservedStock - quantity);
        product.availableStock = product.currentStock - product.reservedStock;
        
        return true;
    }

    // Predictive analytics
    predictDemand(productId, days = 30) {
        const product = this.inventory.get(productId);
        if (!product || product.salesHistory.length < 7) {
            return { prediction: 0, confidence: 0 };
        }

        const salesData = this.prepareSalesData(product.salesHistory, days);
        const trend = this.calculateTrend(salesData);
        const seasonality = this.detectSeasonality(product.salesHistory);
        const baselineDemand = this.calculateBaselineDemand(salesData);

        const prediction = this.applyPredictionModel(baselineDemand, trend, seasonality, days);
        const confidence = this.calculatePredictionConfidence(salesData, prediction);

        this.predictions.set(productId, {
            productId: productId,
            predictedDemand: prediction,
            confidence: confidence,
            forecastPeriod: days,
            generatedAt: new Date(),
            factors: {
                baseline: baselineDemand,
                trend: trend,
                seasonality: seasonality
            }
        });

        return { prediction, confidence };
    }

    calculateOptimalReorderPoint(productId) {
        const product = this.inventory.get(productId);
        if (!product) return null;

        const demandPrediction = this.predictDemand(productId, product.leadTime);
        const safetyStock = this.calculateSafetyStock(productId);
        const leadTimeDemand = demandPrediction.prediction;

        const optimalReorderPoint = leadTimeDemand + safetyStock;
        
        return {
            reorderPoint: Math.ceil(optimalReorderPoint),
            leadTimeDemand: leadTimeDemand,
            safetyStock: safetyStock,
            confidence: demandPrediction.confidence
        };
    }

    calculateOptimalOrderQuantity(productId) {
        const product = this.inventory.get(productId);
        if (!product) return null;

        // Economic Order Quantity (EOQ) calculation
        const annualDemand = this.calculateAnnualDemand(productId);
        const orderingCost = this.getOrderingCost(productId);
        const holdingCost = this.getHoldingCost(productId);

        if (annualDemand === 0 || holdingCost === 0) {
            return { quantity: product.minOrderQuantity, method: 'minimum' };
        }

        const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
        const adjustedEOQ = Math.max(
            product.minOrderQuantity,
            Math.min(product.maxOrderQuantity, Math.ceil(eoq))
        );

        return {
            quantity: adjustedEOQ,
            eoq: eoq,
            annualDemand: annualDemand,
            orderingCost: orderingCost,
            holdingCost: holdingCost,
            method: 'eoq'
        };
    }

    // Automated reordering
    generateReorderRecommendations() {
        const recommendations = [];

        this.inventory.forEach((product, productId) => {
            if (product.availableStock <= product.reorderPoint) {
                const optimalQuantity = this.calculateOptimalOrderQuantity(productId);
                const demandForecast = this.predictDemand(productId);
                
                recommendations.push({
                    productId: productId,
                    productName: product.name || productId,
                    currentStock: product.currentStock,
                    availableStock: product.availableStock,
                    reorderPoint: product.reorderPoint,
                    recommendedQuantity: optimalQuantity.quantity,
                    urgency: this.calculateUrgency(product),
                    estimatedStockoutDate: this.estimateStockoutDate(productId),
                    supplier: product.supplier,
                    estimatedCost: optimalQuantity.quantity * product.cost,
                    demandForecast: demandForecast,
                    reason: this.generateReorderReason(product, optimalQuantity)
                });
            }
        });

        return recommendations.sort((a, b) => b.urgency - a.urgency);
    }

    autoReorder(productId, options = {}) {
        const product = this.inventory.get(productId);
        if (!product) return null;

        const orderQuantity = this.calculateOptimalOrderQuantity(productId);
        const reorderData = {
            productId: productId,
            quantity: orderQuantity.quantity,
            supplier: product.supplier,
            estimatedCost: orderQuantity.quantity * product.cost,
            expectedDelivery: this.calculateExpectedDelivery(product.leadTime),
            orderDate: new Date(),
            status: 'pending',
            autoGenerated: true
        };

        // In a real system, this would integrate with supplier APIs
        if (options.simulate) {
            return this.simulateReorder(reorderData);
        }

        return this.createPurchaseOrder(reorderData);
    }

    // Stock level monitoring
    checkStockLevels(productId = null) {
        const productsToCheck = productId ? [productId] : Array.from(this.inventory.keys());
        
        productsToCheck.forEach(id => {
            const product = this.inventory.get(id);
            if (!product) return;

            // Low stock alert
            if (product.availableStock <= this.settings.lowStockThreshold) {
                this.createAlert('low_stock', {
                    productId: id,
                    currentStock: product.availableStock,
                    threshold: this.settings.lowStockThreshold,
                    severity: product.availableStock === 0 ? 'critical' : 'warning'
                });
            }

            // Reorder point alert
            if (product.availableStock <= product.reorderPoint) {
                this.createAlert('reorder_needed', {
                    productId: id,
                    currentStock: product.availableStock,
                    reorderPoint: product.reorderPoint,
                    severity: 'high'
                });
            }

            // Overstock alert
            if (product.currentStock > product.maxStock) {
                this.createAlert('overstock', {
                    productId: id,
                    currentStock: product.currentStock,
                    maxStock: product.maxStock,
                    severity: 'medium'
                });
            }

            // Dead stock alert (no sales in 90 days)
            const daysSinceLastSale = this.getDaysSinceLastSale(id);
            if (daysSinceLastSale > 90 && product.currentStock > 0) {
                this.createAlert('dead_stock', {
                    productId: id,
                    daysSinceLastSale: daysSinceLastSale,
                    currentStock: product.currentStock,
                    severity: 'medium'
                });
            }
        });
    }

    // Analytics and reporting
    generateInventoryReport(timeframe = 'monthly') {
        const report = {
            timestamp: new Date(),
            timeframe: timeframe,
            summary: this.getInventorySummary(),
            topProducts: this.getTopPerformingProducts(),
            slowMovers: this.getSlowMovingProducts(),
            stockAlerts: this.getActiveAlerts(),
            turnoverAnalysis: this.calculateInventoryTurnover(),
            valueAnalysis: this.calculateInventoryValue(),
            recommendations: this.generateInventoryRecommendations()
        };

        return report;
    }

    getInventorySummary() {
        let totalProducts = 0;
        let totalValue = 0;
        let lowStockItems = 0;
        let outOfStockItems = 0;

        this.inventory.forEach(product => {
            totalProducts++;
            totalValue += product.currentStock * product.cost;
            
            if (product.availableStock <= this.settings.lowStockThreshold) {
                lowStockItems++;
            }
            
            if (product.availableStock === 0) {
                outOfStockItems++;
            }
        });

        return {
            totalProducts,
            totalValue,
            lowStockItems,
            outOfStockItems,
            averageValue: totalProducts > 0 ? totalValue / totalProducts : 0
        };
    }

    calculateInventoryTurnover(productId = null) {
        if (productId) {
            return this.calculateProductTurnover(productId);
        }

        const turnovers = [];
        this.inventory.forEach((product, id) => {
            const turnover = this.calculateProductTurnover(id);
            if (turnover) {
                turnovers.push({ productId: id, ...turnover });
            }
        });

        return turnovers.sort((a, b) => b.turnoverRatio - a.turnoverRatio);
    }

    calculateProductTurnover(productId) {
        const product = this.inventory.get(productId);
        if (!product || product.salesHistory.length === 0) return null;

        const salesLast12Months = this.getSalesInPeriod(productId, 365);
        const averageInventory = this.getAverageInventory(productId, 365);
        
        if (averageInventory === 0) return null;

        const turnoverRatio = salesLast12Months / averageInventory;
        const daysSalesInventory = 365 / turnoverRatio;

        return {
            turnoverRatio: turnoverRatio,
            daysSalesInventory: daysSalesInventory,
            salesLast12Months: salesLast12Months,
            averageInventory: averageInventory,
            performance: this.categorizeTurnoverPerformance(turnoverRatio)
        };
    }

    // AI-powered insights
    generateSmartInsights() {
        const insights = [];

        // Demand pattern insights
        this.inventory.forEach((product, productId) => {
            const demandPattern = this.analyzeDemandPattern(productId);
            if (demandPattern.insights.length > 0) {
                insights.push(...demandPattern.insights);
            }
        });

        // Cross-product insights
        const crossProductInsights = this.analyzeCrossProductPatterns();
        insights.push(...crossProductInsights);

        // Seasonal insights
        const seasonalInsights = this.analyzeSeasonalPatterns();
        insights.push(...seasonalInsights);

        // Optimization opportunities
        const optimizationInsights = this.identifyOptimizationOpportunities();
        insights.push(...optimizationInsights);

        return insights.sort((a, b) => b.impact - a.impact);
    }

    analyzeDemandPattern(productId) {
        const product = this.inventory.get(productId);
        const insights = [];

        if (!product || product.salesHistory.length < 14) {
            return { insights };
        }

        // Trend analysis
        const trend = this.calculateDemandTrend(productId);
        if (Math.abs(trend) > 0.1) {
            insights.push({
                type: 'demand_trend',
                productId: productId,
                trend: trend > 0 ? 'increasing' : 'decreasing',
                magnitude: Math.abs(trend),
                impact: Math.abs(trend) * 10,
                recommendation: trend > 0 ? 
                    'زيادة مستوى المخزون لمواكبة الطلب المتزايد' : 
                    'تقليل مستوى المخزون بسبب انخفاض الطلب'
            });
        }

        // Volatility analysis
        const volatility = this.calculateDemandVolatility(productId);
        if (volatility > 0.5) {
            insights.push({
                type: 'demand_volatility',
                productId: productId,
                volatility: volatility,
                impact: volatility * 8,
                recommendation: 'زيادة مخزون الأمان بسبب تقلبات الطلب العالية'
            });
        }

        return { insights };
    }

    // Helper methods
    updateInventoryHistory(productId, action, quantity, reason = '') {
        const product = this.inventory.get(productId);
        if (!product) return;

        product.history.push({
            timestamp: new Date(),
            action: action,
            quantity: quantity,
            reason: reason,
            stockBefore: product.currentStock - (action === 'sale' || action === 'damage' ? -quantity : quantity),
            stockAfter: product.currentStock
        });

        // Keep only last 1000 history entries
        if (product.history.length > 1000) {
            product.history = product.history.slice(-1000);
        }
    }

    createAlert(type, data) {
        const alert = {
            id: this.generateAlertId(),
            type: type,
            timestamp: new Date(),
            severity: data.severity || 'medium',
            data: data,
            acknowledged: false,
            resolved: false
        };

        this.alerts.push(alert);
        
        // Trigger alert notification
        this.triggerAlertNotification(alert);
        
        return alert;
    }

    triggerAlertNotification(alert) {
        // Broadcast alert to UI components
        window.dispatchEvent(new CustomEvent('inventoryAlert', {
            detail: alert
        }));

        // Show toast notification if available
        if (window.showWarning) {
            const messages = {
                low_stock: `مخزون منخفض: ${alert.data.productId}`,
                reorder_needed: `يحتاج إعادة طلب: ${alert.data.productId}`,
                overstock: `مخزون زائد: ${alert.data.productId}`,
                dead_stock: `مخزون راكد: ${alert.data.productId}`
            };
            
            window.showWarning(messages[alert.type] || 'تنبيه مخزون');
        }
    }

    startInventoryMonitoring() {
        // Check stock levels every 5 minutes
        setInterval(() => {
            this.checkStockLevels();
        }, 300000);

        // Generate reorder recommendations every hour
        setInterval(() => {
            const recommendations = this.generateReorderRecommendations();
            if (recommendations.length > 0) {
                this.broadcastReorderRecommendations(recommendations);
            }
        }, 3600000);
    }

    loadInventoryData() {
        // Load from localStorage or API
        const savedData = localStorage.getItem('smartInventoryData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                data.inventory.forEach(item => {
                    this.inventory.set(item.id, item);
                });
            } catch (error) {
                console.error('Error loading inventory data:', error);
            }
        }
    }

    saveInventoryData() {
        const data = {
            inventory: Array.from(this.inventory.values()),
            alerts: this.alerts,
            timestamp: new Date()
        };
        
        localStorage.setItem('smartInventoryData', JSON.stringify(data));
    }

    // Utility methods
    generateReservationId() {
        return 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateAlertId() {
        return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize smart inventory system
const smartInventory = new SmartInventory();

// Export for use in other modules
export { smartInventory, SmartInventory };

// Make available globally for console testing
window.smartInventory = smartInventory;

// Auto-save inventory data every 5 minutes
setInterval(() => {
    smartInventory.saveInventoryData();
}, 300000);