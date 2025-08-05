/**
 * Toast Notification System for Best on Click
 * Provides elegant toast notifications with RTL support
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.defaultDuration = 5000;
        this.maxToasts = 5;
        this.init();
    }

    /**
     * Initialize toast container
     */
    init() {
        // Create toast container if it doesn't exist
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(this.container);
        }

        // Add CSS styles if not already added
        if (!document.getElementById('toast-styles')) {
            this.addStyles();
        }
    }

    /**
     * Add CSS styles for toasts
     */
    addStyles() {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                min-width: 300px;
                max-width: 400px;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 12px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 14px;
                line-height: 1.4;
                direction: rtl;
                text-align: right;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease-in-out;
                position: relative;
                overflow: hidden;
            }

            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }

            .toast.hide {
                transform: translateX(100%);
                opacity: 0;
            }

            .toast-success {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border-left: 4px solid #047857;
            }

            .toast-error {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                border-left: 4px solid #b91c1c;
            }

            .toast-warning {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
                border-left: 4px solid #b45309;
            }

            .toast-info {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                border-left: 4px solid #1d4ed8;
            }

            .toast-icon {
                font-size: 20px;
                flex-shrink: 0;
            }

            .toast-content {
                flex: 1;
            }

            .toast-title {
                font-weight: 600;
                margin-bottom: 4px;
            }

            .toast-message {
                opacity: 0.9;
            }

            .toast-close {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                font-size: 18px;
                opacity: 0.7;
                transition: opacity 0.2s;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .toast-close:hover {
                opacity: 1;
            }

            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                transition: width linear;
            }

            @media (max-width: 640px) {
                #toast-container {
                    right: 8px;
                    left: 8px;
                    top: 8px;
                }
                
                .toast {
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show a toast notification
     */
    show(message, type = 'info', options = {}) {
        const {
            title = '',
            duration = this.defaultDuration,
            persistent = false,
            action = null
        } = options;

        // Remove oldest toast if we have too many
        if (this.toasts.size >= this.maxToasts) {
            const oldestId = this.toasts.keys().next().value;
            this.hide(oldestId);
        }

        const toastId = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const toast = this.createToastElement(toastId, message, type, title, action);

        this.container.appendChild(toast);
        this.toasts.set(toastId, {
            element: toast,
            timer: null,
            type,
            message,
            title
        });

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-hide if not persistent
        if (!persistent && duration > 0) {
            this.setAutoHide(toastId, duration);
        }

        return toastId;
    }

    /**
     * Create toast DOM element
     */
    createToastElement(id, message, type, title, action) {
        const toast = document.createElement('div');
        toast.id = id;
        toast.className = `toast toast-${type}`;

        const icon = this.getIcon(type);
        
        let actionButton = '';
        if (action) {
            actionButton = `<button class="toast-action" onclick="${action.callback}">${action.text}</button>`;
        }

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            ${actionButton}
            <button class="toast-close" onclick="toastManager.hide('${id}')">&times;</button>
            <div class="toast-progress"></div>
        `;

        return toast;
    }

    /**
     * Get icon for toast type
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Set auto-hide timer
     */
    setAutoHide(toastId, duration) {
        const toastData = this.toasts.get(toastId);
        if (!toastData) return;

        const progressBar = toastData.element.querySelector('.toast-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transitionDuration = duration + 'ms';
            
            requestAnimationFrame(() => {
                progressBar.style.width = '0%';
            });
        }

        toastData.timer = setTimeout(() => {
            this.hide(toastId);
        }, duration);
    }

    /**
     * Hide a specific toast
     */
    hide(toastId) {
        const toastData = this.toasts.get(toastId);
        if (!toastData) return;

        const { element, timer } = toastData;

        // Clear timer
        if (timer) {
            clearTimeout(timer);
        }

        // Animate out
        element.classList.remove('show');
        element.classList.add('hide');

        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(toastId);
        }, 300);
    }

    /**
     * Hide all toasts
     */
    hideAll() {
        for (const toastId of this.toasts.keys()) {
            this.hide(toastId);
        }
    }

    /**
     * Show success toast
     */
    success(message, options = {}) {
        return this.show(message, 'success', {
            title: 'نجح العملية',
            ...options
        });
    }

    /**
     * Show error toast
     */
    error(message, options = {}) {
        return this.show(message, 'error', {
            title: 'خطأ',
            persistent: true,
            ...options
        });
    }

    /**
     * Show warning toast
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', {
            title: 'تحذير',
            ...options
        });
    }

    /**
     * Show info toast
     */
    info(message, options = {}) {
        return this.show(message, 'info', {
            title: 'معلومات',
            ...options
        });
    }

    /**
     * Show loading toast
     */
    loading(message = 'جاري التحميل...', options = {}) {
        return this.show(message, 'info', {
            title: 'يرجى الانتظار',
            persistent: true,
            ...options
        });
    }

    /**
     * Show achievement notification
     */
    achievement(message, options = {}) {
        return this.show(message, 'success', {
            title: '🎉 إنجاز جديد!',
            duration: 8000,
            ...options
        });
    }

    /**
     * Show performance alert
     */
    performanceAlert(message, options = {}) {
        return this.show(message, 'warning', {
            title: '⚠️ تنبيه الأداء',
            persistent: true,
            ...options
        });
    }

    /**
     * Show review notification
     */
    reviewNotification(message, options = {}) {
        return this.show(message, 'info', {
            title: '💬 مراجعة جديدة',
            duration: 6000,
            ...options
        });
    }

    /**
     * Show smart recommendation
     */
    smartRecommendation(message, options = {}) {
        return this.show(message, 'info', {
            title: '💡 توصية ذكية',
            duration: 10000,
            ...options
        });
    }

    /**
     * Update existing toast
     */
    update(toastId, message, type, options = {}) {
        const toastData = this.toasts.get(toastId);
        if (!toastData) return;

        const { element } = toastData;
        const messageEl = element.querySelector('.toast-message');
        const titleEl = element.querySelector('.toast-title');

        if (messageEl) {
            messageEl.textContent = message;
        }

        if (options.title && titleEl) {
            titleEl.textContent = options.title;
        }

        // Update type if changed
        if (type && type !== toastData.type) {
            element.className = `toast toast-${type} show`;
            const iconEl = element.querySelector('.toast-icon');
            if (iconEl) {
                iconEl.textContent = this.getIcon(type);
            }
            toastData.type = type;
        }

        // Reset timer if duration specified
        if (options.duration) {
            if (toastData.timer) {
                clearTimeout(toastData.timer);
            }
            this.setAutoHide(toastId, options.duration);
        }
    }

    /**
     * Get toast count by type
     */
    getCount(type = null) {
        if (!type) {
            return this.toasts.size;
        }
        
        let count = 0;
        for (const toastData of this.toasts.values()) {
            if (toastData.type === type) {
                count++;
            }
        }
        return count;
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead() {
        for (const toastId of this.toasts.keys()) {
            const toastData = this.toasts.get(toastId);
            if (toastData && toastData.element) {
                toastData.element.classList.add('read');
            }
        }
        
        // Dispatch event for notification management
        window.dispatchEvent(new CustomEvent('notificationsMarkedAsRead'));
    }

    /**
     * Clear all notifications
     */
    clearAllNotifications() {
        this.hideAll();
        window.dispatchEvent(new CustomEvent('notificationsCleared'));
    }

    /**
     * Get notification statistics
     */
    getNotificationStats() {
        const stats = {
            total: this.toasts.size,
            byType: {
                success: 0,
                error: 0,
                warning: 0,
                info: 0
            },
            unread: 0
        };

        for (const toastData of this.toasts.values()) {
            if (stats.byType[toastData.type] !== undefined) {
                stats.byType[toastData.type]++;
            }
            
            if (!toastData.element.classList.contains('read')) {
                stats.unread++;
            }
        }

        return stats;
    }
}

// Create singleton instance
const toastManager = new ToastManager();

// Global access
window.toastManager = toastManager;

// Convenience functions
export function showToast(message, type = 'info', options = {}) {
    return toastManager.show(message, type, options);
}

export function showSuccess(message, options = {}) {
    return toastManager.success(message, options);
}

export function showError(message, options = {}) {
    return toastManager.error(message, options);
}

export function showWarning(message, options = {}) {
    return toastManager.warning(message, options);
}

export function showInfo(message, options = {}) {
    return toastManager.info(message, options);
}

export function showLoading(message, options = {}) {
    return toastManager.loading(message, options);
}

export function hideToast(toastId) {
    return toastManager.hide(toastId);
}

export function hideAllToasts() {
    return toastManager.hideAll();
}

// Smart notification functions
export function showAchievement(message, options = {}) {
    return toastManager.achievement(message, options);
}

export function showPerformanceAlert(message, options = {}) {
    return toastManager.performanceAlert(message, options);
}

export function showReviewNotification(message, options = {}) {
    return toastManager.reviewNotification(message, options);
}

export function showSmartRecommendation(message, options = {}) {
    return toastManager.smartRecommendation(message, options);
}

// Notification management functions
export function markAllNotificationsAsRead() {
    return toastManager.markAllAsRead();
}

export function clearAllNotifications() {
    return toastManager.clearAllNotifications();
}

export function getNotificationStats() {
    return toastManager.getNotificationStats();
}

export { toastManager };
export default toastManager;