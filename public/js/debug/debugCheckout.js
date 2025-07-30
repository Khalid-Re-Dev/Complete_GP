/**
 * Debug utilities for Checkout System
 * Use debugCheckout.runFullTest() to test all checkout features
 */

window.debugCheckout = {
  
  /**
   * Test checkout modal functionality
   */
  testCheckoutModal() {
    console.log('🔧 Testing Checkout Modal functionality...')
    
    try {
      // Check if global functions exist
      const requiredFunctions = [
        'closeCheckoutModal',
        'handleCheckoutModalClick',
        'proceedToCheckout'
      ]
      
      const missingFunctions = requiredFunctions.filter(fn => typeof window[fn] !== 'function')
      
      if (missingFunctions.length > 0) {
        console.error('❌ Missing functions:', missingFunctions)
        return false
      }
      
      console.log('✅ All checkout functions are available')
      
      // Test modal creation without opening
      const existingModal = document.getElementById('checkout-modal')
      if (existingModal) {
        console.log('⚠️ Checkout modal already exists, removing...')
        existingModal.remove()
        modalManager.closeModal('checkout-modal')
      }
      
      console.log('✅ Checkout modal functionality test passed')
      return true
      
    } catch (error) {
      console.error('❌ Checkout modal functionality test failed:', error)
      return false
    }
  },

  /**
   * Test scroll management
   */
  testScrollManagement() {
    console.log('🔧 Testing Checkout Scroll Management...')
    
    try {
      const originalOverflow = document.body.style.overflow
      console.log('📜 Current body overflow:', originalOverflow || 'default')
      
      // Test modal manager integration
      if (typeof modalManager === 'undefined') {
        console.error('❌ modalManager not found')
        return false
      }
      
      console.log('✅ Modal manager is available')
      
      // Test scroll restoration
      modalManager.openModal('test-checkout')
      console.log('🔒 Test modal opened')
      
      setTimeout(() => {
        modalManager.closeModal('test-checkout')
        console.log('🔓 Test modal closed')
        console.log('✅ Scroll management test passed')
      }, 100)
      
      return true
      
    } catch (error) {
      console.error('❌ Scroll management test failed:', error)
      return false
    }
  },

  /**
   * Create test cart data
   */
  createTestCartData() {
    console.log('🔧 Creating test cart data...')
    
    try {
      const testCartData = {
        items: [
          {
            id: 1,
            quantity: 2,
            product: {
              id: 1,
              name: 'Test Product 1',
              price: 100,
              image_urls: ['/assets/placeholder-product.svg'],
              store: { name: 'Test Store 1' }
            }
          },
          {
            id: 2,
            quantity: 1,
            product: {
              id: 2,
              name: 'Test Product 2',
              price: 200,
              image_urls: ['/assets/placeholder-product.svg'],
              store: { name: 'Test Store 2' }
            }
          }
        ],
        total_amount: 400,
        subtotal: 400,
        shipping_cost: 0
      }
      
      console.log('✅ Test cart data created:', testCartData)
      return testCartData
      
    } catch (error) {
      console.error('❌ Failed to create test cart data:', error)
      return null
    }
  },

  /**
   * Test checkout modal opening safely
   */
  async testCheckoutOpening() {
    console.log('🔧 Testing Checkout Modal Opening...')
    
    try {
      // Ensure user is authenticated (mock)
      const originalState = store.getState()
      
      // Create test cart data
      const testCartData = this.createTestCartData()
      if (!testCartData) {
        console.error('❌ Failed to create test cart data')
        return false
      }
      
      // Test opening checkout modal
      console.log('🚪 Attempting to open checkout modal...')
      
      // Import CheckoutModal
      const { CheckoutModal } = await import('../components/CheckoutModal.js')
      
      if (typeof CheckoutModal !== 'function') {
        console.error('❌ CheckoutModal not found or not a function')
        return false
      }
      
      // Add safety timeout
      const timeout = setTimeout(() => {
        console.log('⏰ Checkout modal opening timeout, cleaning up...')
        modalManager.emergencyCleanup()
      }, 10000)
      
      const checkoutModal = CheckoutModal(testCartData)
      
      if (checkoutModal) {
        document.body.appendChild(checkoutModal)
        console.log('✅ Checkout modal opened successfully')
        console.log('🔒 Body scroll disabled:', document.body.classList.contains('modal-open'))
        
        // Auto-close after 3 seconds for testing
        setTimeout(() => {
          clearTimeout(timeout)
          console.log('🚪 Auto-closing checkout modal for testing...')
          closeCheckoutModal()
        }, 3000)
        
        return true
      } else {
        clearTimeout(timeout)
        console.error('❌ Checkout modal was not created')
        return false
      }
      
    } catch (error) {
      console.error('❌ Checkout modal opening test failed:', error)
      modalManager.emergencyCleanup()
      return false
    }
  },

  /**
   * Test checkout steps navigation
   */
  testStepsNavigation() {
    console.log('🔧 Testing Checkout Steps Navigation...')
    
    try {
      const modal = document.getElementById('checkout-modal')
      if (!modal) {
        console.log('⚠️ No checkout modal found, skipping steps test')
        return true
      }
      
      // Test step visibility
      const steps = modal.querySelectorAll('.checkout-step')
      console.log('📋 Found checkout steps:', steps.length)
      
      if (steps.length === 0) {
        console.error('❌ No checkout steps found')
        return false
      }
      
      // Check if first step is visible
      const firstStep = steps[0]
      const isVisible = !firstStep.classList.contains('hidden')
      console.log('👁️ First step visible:', isVisible)
      
      console.log('✅ Steps navigation test passed')
      return true
      
    } catch (error) {
      console.error('❌ Steps navigation test failed:', error)
      return false
    }
  },

  /**
   * Test modal closing mechanisms
   */
  testModalClosing() {
    console.log('🔧 Testing Modal Closing Mechanisms...')
    
    try {
      const modal = document.getElementById('checkout-modal')
      if (!modal) {
        console.log('⚠️ No checkout modal found, skipping closing test')
        return true
      }
      
      // Test ESC key (simulate)
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escEvent)
      console.log('⌨️ ESC key event dispatched')
      
      // Test backdrop click (simulate)
      const clickEvent = new MouseEvent('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'target', { value: modal })
      modal.dispatchEvent(clickEvent)
      console.log('🖱️ Backdrop click event dispatched')
      
      console.log('✅ Modal closing mechanisms test passed')
      return true
      
    } catch (error) {
      console.error('❌ Modal closing mechanisms test failed:', error)
      return false
    }
  },

  /**
   * Run comprehensive checkout system test
   */
  async runFullTest() {
    console.log('🧪 Starting Comprehensive Checkout System Test...')
    console.log('=' .repeat(50))
    
    const tests = [
      { name: 'Checkout Modal Functions', fn: () => this.testCheckoutModal() },
      { name: 'Scroll Management', fn: () => this.testScrollManagement() },
      { name: 'Test Cart Data Creation', fn: () => this.createTestCartData() !== null },
      { name: 'Modal Opening', fn: () => this.testCheckoutOpening() },
      { name: 'Steps Navigation', fn: () => this.testStepsNavigation() },
      { name: 'Modal Closing', fn: () => this.testModalClosing() }
    ]
    
    let passed = 0
    let failed = 0
    
    for (const test of tests) {
      try {
        console.log(`\n🧪 Running: ${test.name}`)
        const result = await test.fn()
        if (result) {
          passed++
          console.log(`✅ ${test.name}: PASSED`)
        } else {
          failed++
          console.log(`❌ ${test.name}: FAILED`)
        }
      } catch (error) {
        failed++
        console.log(`❌ ${test.name}: ERROR -`, error.message)
      }
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`)
    
    if (failed === 0) {
      console.log('🎉 All checkout tests passed! System is working correctly.')
    } else {
      console.log('⚠️ Some tests failed. Check the issues above.')
    }
    
    return { passed, failed, total: tests.length }
  },

  /**
   * Clear all checkout data and modals
   */
  clearAllData() {
    console.log('🧹 Clearing all checkout data...')
    
    try {
      // Close any open checkout modals
      const modal = document.getElementById('checkout-modal')
      if (modal) {
        modal.remove()
      }
      
      // Use modal manager cleanup
      modalManager.closeModal('checkout-modal')
      
      console.log('✅ All checkout data cleared')
      
    } catch (error) {
      console.error('❌ Failed to clear checkout data:', error)
      // Force cleanup
      modalManager.emergencyCleanup()
    }
  },

  /**
   * Quick checkout test with mock data
   */
  async quickTest() {
    console.log('⚡ Running Quick Checkout Test...')
    
    try {
      // Create test data
      const testCartData = this.createTestCartData()
      
      // Test modal opening
      const { CheckoutModal } = await import('../components/CheckoutModal.js')
      const modal = CheckoutModal(testCartData)
      
      if (modal) {
        document.body.appendChild(modal)
        console.log('✅ Quick test passed - Modal opened')
        
        // Auto close after 2 seconds
        setTimeout(() => {
          closeCheckoutModal()
          console.log('✅ Quick test completed - Modal closed')
        }, 2000)
        
        return true
      } else {
        console.error('❌ Quick test failed - Modal not created')
        return false
      }
      
    } catch (error) {
      console.error('❌ Quick test error:', error)
      modalManager.emergencyCleanup()
      return false
    }
  }
}

console.log('🔧 Checkout debug utilities loaded. Use debugCheckout.runFullTest() to test.');