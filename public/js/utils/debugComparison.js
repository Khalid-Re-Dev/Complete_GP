/**
 * Debug utilities for Product Comparison
 */

// Debug function to test comparison functionality
window.debugComparison = {
  // Test adding products to comparison
  addTestProducts: function() {
    console.log('🧪 Adding test products to comparison...')
    
    const testProducts = [
      {
        id: 1,
        name: 'Test Product 1',
        price: 99.99,
        image: '/images/placeholder.jpg',
        category: { name: 'Electronics' },
        brand: 'Test Brand',
        description: 'Test description 1',
        average_rating: 4.5,
        total_reviews: 100,
        in_stock: true,
        stock_quantity: 50
      },
      {
        id: 2,
        name: 'Test Product 2',
        price: 149.99,
        image: '/images/placeholder.jpg',
        category: { name: 'Electronics' },
        brand: 'Test Brand 2',
        description: 'Test description 2',
        average_rating: 4.2,
        total_reviews: 85,
        in_stock: true,
        stock_quantity: 30
      }
    ]
    
    testProducts.forEach(product => {
      if (typeof window.addToComparison === 'function') {
        window.addToComparison(product)
      } else {
        console.error('addToComparison function not found')
      }
    })
    
    console.log('✅ Test products added')
  },

  // Test opening comparison modal
  testModal: function() {
    console.log('🧪 Testing comparison modal...')
    
    if (typeof window.openComparisonModal === 'function') {
      window.openComparisonModal()
      console.log('✅ Modal opened successfully')
    } else {
      console.error('❌ openComparisonModal function not found')
    }
  },

  // Check comparison state
  checkState: function() {
    console.log('🔍 Checking comparison state...')
    console.log('Comparison products:', window.comparisonProducts || 'Not found')
    console.log('Available functions:', {
      addToComparison: typeof window.addToComparison,
      removeFromComparison: typeof window.removeFromComparison,
      openComparisonModal: typeof window.openComparisonModal,
      closeComparisonModal: typeof window.closeComparisonModal
    })
  },

  // Clear all comparisons
  clearAll: function() {
    console.log('🧹 Clearing all comparisons...')
    if (typeof window.clearComparisons === 'function') {
      window.clearComparisons()
      console.log('✅ Comparisons cleared')
    } else {
      console.error('❌ clearComparisons function not found')
    }
  },

  // Full test sequence
  runFullTest: function() {
    console.log('🚀 Running full comparison test...')
    
    // Step 1: Check initial state
    this.checkState()
    
    // Step 2: Add test products
    this.addTestProducts()
    
    // Step 3: Wait a bit then open modal
    setTimeout(() => {
      this.testModal()
      
      // Step 4: Test closing after 3 seconds
      setTimeout(() => {
        if (typeof window.closeComparisonModal === 'function') {
          window.closeComparisonModal()
          console.log('✅ Modal closed successfully')
        }
      }, 3000)
    }, 1000)
  }
}

// Auto-run debug if in development
if (window.location.hostname.includes('192.168') || window.location.hostname === 'localhost') {
  console.log('🔧 Comparison debug utilities loaded. Use debugComparison.runFullTest() to test.')
}