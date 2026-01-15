/**
 * Countdown Timer Utility
 * Creates and manages countdown timers for promotions
 */

export class CountdownTimer {
  constructor(endDate, container, options = {}) {
    this.endDate = new Date(endDate);
    this.container = container;
    this.options = {
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      onComplete: null,
      onUpdate: null,
      ...options
    };
    
    this.interval = null;
    this.isActive = false;
  }

  /**
   * Start the countdown timer
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.update(); // Initial update
    
    this.interval = setInterval(() => {
      this.update();
    }, 1000);
  }

  /**
   * Stop the countdown timer
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isActive = false;
  }

  /**
   * Update the countdown display
   */
  update() {
    const now = new Date().getTime();
    const distance = this.endDate.getTime() - now;

    if (distance < 0) {
      this.handleComplete();
      return;
    }

    const timeLeft = this.calculateTimeLeft(distance);
    this.render(timeLeft);

    if (this.options.onUpdate) {
      this.options.onUpdate(timeLeft, distance);
    }
  }

  /**
   * Calculate time left in days, hours, minutes, seconds
   */
  calculateTimeLeft(distance) {
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }

  /**
   * Render the countdown timer
   */
  render(timeLeft) {
    if (!this.container) return;

    const { days, hours, minutes, seconds } = timeLeft;
    
    let html = '<div class="countdown-timer">';
    
    if (this.options.showDays && days > 0) {
      html += `
        <div class="countdown-item">
          <div class="countdown-number">${days.toString().padStart(2, '0')}</div>
          <div class="countdown-label">Days</div>
        </div>
      `;
    }
    
    if (this.options.showHours) {
      html += `
        <div class="countdown-item">
          <div class="countdown-number">${hours.toString().padStart(2, '0')}</div>
          <div class="countdown-label">Hours</div>
        </div>
      `;
    }
    
    if (this.options.showMinutes) {
      html += `
        <div class="countdown-item">
          <div class="countdown-number">${minutes.toString().padStart(2, '0')}</div>
          <div class="countdown-label">Min</div>
        </div>
      `;
    }
    
    if (this.options.showSeconds) {
      html += `
        <div class="countdown-item">
          <div class="countdown-number">${seconds.toString().padStart(2, '0')}</div>
          <div class="countdown-label">Sec</div>
        </div>
      `;
    }
    
    html += '</div>';
    
    this.container.innerHTML = html;
  }

  /**
   * Handle countdown completion
   */
  handleComplete() {
    this.stop();
    
    if (this.container) {
      this.container.innerHTML = `
        <div class="text-center py-4">
          <div class="text-red-500 text-xl font-bold mb-2">
            <i class="fa-solid fa-clock-o mr-2"></i>
            Offer Expired
          </div>
          <p class="text-gray-600">This promotion has ended</p>
        </div>
      `;
    }

    if (this.options.onComplete) {
      this.options.onComplete();
    }
  }

  /**
   * Check if countdown is still valid
   */
  isValid() {
    return new Date().getTime() < this.endDate.getTime();
  }

  /**
   * Get remaining time in milliseconds
   */
  getRemainingTime() {
    return Math.max(0, this.endDate.getTime() - new Date().getTime());
  }

  /**
   * Format time for display
   */
  static formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Create a simple countdown text
   */
  static createSimpleCountdown(endDate) {
    const now = new Date().getTime();
    const distance = new Date(endDate).getTime() - now;
    
    if (distance < 0) {
      return 'Expired';
    }
    
    return CountdownTimer.formatTime(distance);
  }
}

/**
 * Create multiple countdown timers for promotions
 */
export function createPromotionCountdowns(promotions) {
  const timers = [];
  
  promotions.forEach((promotion, index) => {
    if (promotion.end_date) {
      const containerId = `countdown-${promotion.id || index}`;
      const container = document.getElementById(containerId);
      
      if (container) {
        const timer = new CountdownTimer(promotion.end_date, container, {
          onComplete: () => {
            console.log(`Promotion "${promotion.name}" has expired`);
            // Optionally refresh promotions or hide expired ones
          }
        });
        
        timer.start();
        timers.push(timer);
      }
    }
  });
  
  return timers;
}

/**
 * Cleanup all countdown timers
 */
export function cleanupCountdowns(timers) {
  if (Array.isArray(timers)) {
    timers.forEach(timer => {
      if (timer && typeof timer.stop === 'function') {
        timer.stop();
      }
    });
  }
}