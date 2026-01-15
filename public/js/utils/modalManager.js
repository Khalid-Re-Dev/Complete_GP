/**
 * Modal Manager - Centralized modal management system
 * Handles modal opening, closing, and scroll management
 */

class ModalManager {
  constructor() {
    this.openModals = new Set()
    this.originalBodyStyle = {}
    this.scrollPosition = 0
  }

  /**
   * Open a modal with proper scroll management
   */
  openModal(modalId) {
    try {
      console.log(`🚪 Opening modal: ${modalId}`)
      
      // Store original body styles if this is the first modal
      if (this.openModals.size === 0) {
        this.originalBodyStyle = {
          overflow: document.body.style.overflow,
          position: document.body.style.position,
          top: document.body.style.top,
          width: document.body.style.width
        }
        
        // Store current scroll position
        this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop
      }
      
      // Add modal to tracking
      this.openModals.add(modalId)
      
      // Apply modal-open class and styles
      document.body.classList.add('modal-open')
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${this.scrollPosition}px`
      document.body.style.width = '100%'
      
      console.log(`✅ Modal ${modalId} opened successfully`)
      
    } catch (error) {
      console.error(`❌ Error opening modal ${modalId}:`, error)
      this.restoreBodyScroll()
    }
  }

  /**
   * Close a modal with proper scroll restoration
   */
  closeModal(modalId) {
    try {
      console.log(`🚪 Closing modal: ${modalId}`)
      
      // Remove modal from tracking
      this.openModals.delete(modalId)
      
      // If no more modals are open, restore body scroll
      if (this.openModals.size === 0) {
        this.restoreBodyScroll()
      }
      
      console.log(`✅ Modal ${modalId} closed successfully`)
      
    } catch (error) {
      console.error(`❌ Error closing modal ${modalId}:`, error)
      // Force restore on error
      this.restoreBodyScroll()
    }
  }

  /**
   * Force close all modals
   */
  closeAllModals() {
    try {
      console.log('🚪 Closing all modals...')
      
      // Remove all modal elements
      const modals = document.querySelectorAll('[id*="modal"], [id*="Modal"]')
      modals.forEach(modal => {
        if (modal && modal.parentNode) {
          modal.remove()
        }
      })
      
      // Clear tracking
      this.openModals.clear()
      
      // Restore body scroll
      this.restoreBodyScroll()
      
      console.log('✅ All modals closed')
      
    } catch (error) {
      console.error('❌ Error closing all modals:', error)
      this.restoreBodyScroll()
    }
  }

  /**
   * Restore body scroll to original state
   */
  restoreBodyScroll() {
    try {
      // Remove modal-open class
      document.body.classList.remove('modal-open')
      
      // Restore original styles
      document.body.style.overflow = this.originalBodyStyle.overflow || ''
      document.body.style.position = this.originalBodyStyle.position || ''
      document.body.style.top = this.originalBodyStyle.top || ''
      document.body.style.width = this.originalBodyStyle.width || ''
      
      // Restore scroll position
      if (this.scrollPosition > 0) {
        window.scrollTo(0, this.scrollPosition)
        this.scrollPosition = 0
      }
      
      console.log('📜 Body scroll restored')
      
    } catch (error) {
      console.error('❌ Error restoring body scroll:', error)
      // Fallback: force reset all styles
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.classList.remove('modal-open')
    }
  }

  /**
   * Check if any modals are currently open
   */
  hasOpenModals() {
    return this.openModals.size > 0
  }

  /**
   * Get list of currently open modals
   */
  getOpenModals() {
    return Array.from(this.openModals)
  }

  /**
   * Emergency cleanup - use when things go wrong
   */
  emergencyCleanup() {
    console.log('🚨 Emergency modal cleanup...')
    
    try {
      // Remove all possible modal elements
      const selectors = [
        '[id*="modal"]',
        '[id*="Modal"]',
        '.modal-overlay',
        '.fixed.z-50',
        '.fixed.inset-0'
      ]
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        elements.forEach(el => {
          if (el && el.parentNode) {
            el.remove()
          }
        })
      })
      
      // Clear all tracking
      this.openModals.clear()
      
      // Force restore body
      document.body.className = document.body.className.replace(/modal-open/g, '')
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      
      // Reset scroll
      this.scrollPosition = 0
      
      console.log('✅ Emergency cleanup completed')
      
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error)
    }
  }
}

// Create global instance
window.modalManager = new ModalManager()

// Add global emergency cleanup function
window.emergencyModalCleanup = () => {
  window.modalManager.emergencyCleanup()
}

// Add keyboard shortcut for emergency cleanup (Ctrl+Shift+M)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'M') {
    console.log('🚨 Emergency modal cleanup triggered by keyboard shortcut')
    window.modalManager.emergencyCleanup()
  }
})

console.log('🔧 Modal Manager initialized. Use modalManager or emergencyModalCleanup() if needed.')

export default window.modalManager;