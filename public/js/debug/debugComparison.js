/**
 * Debug utilities for Product Comparison System
 * Use debugComparison.runFullTest() to test all comparison features
 */

window.debugComparison = {
  
  /**
   * Test comparison system connectivity
   */
  async testAPIConnectivity() {
    console.log('🔧 Testing Comparison API connectivity...')
    
    try {
      // Test if comparison service is available
      if (typeof comparisonService === 'undefined') {
        console.error('❌ comparisonService not found')
        return false
      }
      
      console.log('✅ comparisonService is available')
      return true
      
    } catch (error) {
      console.error('❌ API connectivity test failed:', error)
      return false
    }
  },

  /**
   * Test comparison modal functionality
   */
  testModalFunctionality() {
    console.log('🔧 Testing Comparison Modal functionality...')
    
    try {
      // Check if global functions exist
      const requiredFunctions = [
        'openComparisonModal',
        'closeComparisonModal',
        'handleModalClick'
      ]
      
      const missingFunctions = requiredFunctions.filter(fn => typeof window[fn] !== 'function')
      
      if (missingFunctions.length > 0) {
        console.error('❌ Missing functions:', missingFunctions)
        return false
      }
      
      console.log('✅ All modal functions are available')
      
      // Test modal creation without opening
      const existingModal = document.getElementById('comparison-modal')
      if (existingModal) {
        console.log('⚠️ Modal already exists, removing...')
        existingModal.remove()
        document.body.style.overflow = ''
      }
      
      console.log('✅ Modal functionality test passed')
      return true
      
    } catch (error) {
      console.error('❌ Modal functionality test failed:', error)
      return false
    }
  },

  /**
   * Test comparison data management
   */
  testDataManagement() {
    console.log('🔧 Testing Comparison Data Management...')
    
    try {
      // Check localStorage
      const savedComparisons = localStorage.getItem('comparisonProducts')
      console.log('📦 Saved comparisons:', savedComparisons ? JSON.parse(savedComparisons).length : 0)
      
      // Check comparison badge
      const badge = document.querySelector('.comparison-badge')
      if (badge) {
        console.log('🏷️ Comparison badge found, count:', badge.textContent)
      } else {
        console.log('⚠️ Comparison badge not found')
      }
      
      console.log('✅ Data management test passed')
      return true
      
    } catch (error) {
      console.error('❌ Data management test failed:', error)
      return false
    }
  },

  /**
   * Test scroll functionality
   */
  testScrollFunctionality() {
    console.log('🔧 Testing Scroll Functionality...')
    
    try {
      const originalOverflow = document.body.style.overflow
      console.log('📜 Current body overflow:', originalOverflow || 'default')
      
      // Test scroll restoration
      document.body.style.overflow = 'hidden'
      console.log('🔒 Set overflow to hidden')
      
      setTimeout(() => {
        document.body.style.overflow = ''
        console.log('🔓 Restored overflow to default')
        console.log('✅ Scroll functionality test passed')
      }, 100)
      
      return true
      
    } catch (error) {
      console.error('❌ Scroll functionality test failed:', error)
      return false
    }
  },

  /**
   * Add test products for comparison
   */
  async addTestProducts() {
    console.log('🔧 Adding test products for comparison...')
    
    try {
      // Clear existing comparisons
      localStorage.removeItem('comparisonProducts')
      
      // Create mock products
      const testProducts = [
        {
          id: 1,
          name: 'Test Product 1',
          price: 100,
          image: '/assets/placeholder-product.svg',
          category: { name: 'Electronics' },
          brand: 'Test Brand',
          average_rating: 4.5,
          total_reviews: 10,
          in_stock: true
        },
        {
          id: 2,
          name: 'Test Product 2',
          price: 200,
          image: '/assets/placeholder-product.svg',
          category: { name: 'Electronics' },
          brand: 'Test Brand',
          average_rating: 4.0,
          total_reviews: 5,
          in_stock: true
        }
      ]
      
      // Save to localStorage
      localStorage.setItem('comparisonProducts', JSON.stringify(testProducts))
      
      // Update badge
      const badge = document.querySelector('.comparison-badge')
      if (badge) {
        badge.textContent = testProducts.length
        badge.style.display = 'flex'
      }
      
      console.log('✅ Test products added:', testProducts.length)
      return true
      
    } catch (error) {
      console.error('❌ Failed to add test products:', error)
      return false
    }
  },

  /**
   * Test modal opening safely
   */
  testModalOpening() {
    console.log('🔧 Testing Modal Opening...')
    
    try {
      // Ensure we have test products
      const savedComparisons = localStorage.getItem('comparisonProducts')
      if (!savedComparisons || JSON.parse(savedComparisons).length < 2) {
        console.log('📦 Adding test products first...')
        this.addTestProducts()
      }
      
      // Test opening modal
      console.log('🚪 Attempting to open comparison modal...')
      
      if (typeof window.openComparisonModal === 'function') {
        // Add safety timeout
        const timeout = setTimeout(() => {
          console.log('⏰ Modal opening timeout, restoring scroll...')
          document.body.style.overflow = ''
          const modal = document.getElementById('comparison-modal')
          if (modal) modal.remove()
        }, 5000)
        
        window.openComparisonModal()
        
        // Check if modal was created
        setTimeout(() => {
          clearTimeout(timeout)
          const modal = document.getElementById('comparison-modal')
          if (modal) {
            console.log('✅ Modal opened successfully')
            console.log('🔒 Body scroll disabled:', document.body.style.overflow === 'hidden')
            
            // Auto-close after 2 seconds for testing
            setTimeout(() => {
              console.log('🚪 Auto-closing modal for testing...')
              window.closeComparisonModal()
            }, 2000)
            
          } else {
            console.error('❌ Modal was not created')
          }
        }, 500)
        
        return true
      } else {
        console.error('❌ openComparisonModal function not found')
        return false
      }
      
    } catch (error) {
      console.error('❌ Modal opening test failed:', error)
      document.body.style.overflow = ''
      return false
    }
  },

  /**
   * Test data mapping and field consistency
   */
  testDataMapping() {
    console.log('🔧 Testing Data Mapping and Field Consistency...')
    
    try {
      const comparisonProducts = JSON.parse(localStorage.getItem('comparisonProducts') || '[]')
      
      if (comparisonProducts.length === 0) {
        console.log('⚠️ No comparison products found, adding test products first...')
        this.addTestProducts()
        return this.testDataMapping()
      }
      
      console.log('📊 Found comparison products:', comparisonProducts.length)
      
      comparisonProducts.forEach((product, index) => {
        console.log(`\n🔍 Product ${index + 1}: ${product.name}`)
        console.log('📋 Raw product data:', product)
        
        // Check rating fields
        const rating = product.average_rating || product.rating || 0
        const reviews = product.total_reviews || product.reviews_count || 0
        const stock = product.stock_quantity || product.stock || 0
        const discount = product.discount_percentage || 0
        
        console.log('🌟 Rating mapping:', {
          average_rating: product.average_rating,
          rating: product.rating,
          final_rating: rating
        })
        
        console.log('📊 Reviews mapping:', {
          total_reviews: product.total_reviews,
          reviews_count: product.reviews_count,
          final_reviews: reviews
        })
        
        console.log('📦 Stock mapping:', {
          stock_quantity: product.stock_quantity,
          stock: product.stock,
          final_stock: stock
        })
        
        console.log('💰 Pricing mapping:', {
          price: product.price,
          discount_percentage: discount,
          final_price: product.price * (1 - discount / 100)
        })
        
        // Validate data
        if (rating === 0 && reviews === 0) {
          console.log('⚠️ Warning: Product has no rating or reviews data')
        } else {
          console.log('✅ Product has valid rating/reviews data')
        }
      })
      
      console.log('✅ Data mapping test completed')
      return true
      
    } catch (error) {
      console.error('❌ Data mapping test failed:', error)
      return false
    }
  },

  /**
   * Test Remove and Clear buttons functionality
   */
  testRemoveAndClearButtons() {
    console.log('🔧 Testing Remove and Clear Buttons...')
    
    try {
      // Ensure we have test products
      if (JSON.parse(localStorage.getItem('comparisonProducts') || '[]').length === 0) {
        console.log('⚠️ No products found, adding test products first...')
        this.addTestProducts()
      }
      
      const comparisonProducts = JSON.parse(localStorage.getItem('comparisonProducts') || '[]')
      console.log('📊 Starting with products:', comparisonProducts.length)
      
      if (comparisonProducts.length === 0) {
        console.log('❌ No products to test with')
        return false
      }
      
      // Test removeFromComparison function
      console.log('\n🗑️ Testing removeFromComparison...')
      const firstProduct = comparisonProducts[0]
      console.log('🎯 Removing product:', firstProduct.name, 'ID:', firstProduct.id)
      
      if (typeof window.removeFromComparison === 'function') {
        const result = window.removeFromComparison(firstProduct.id)
        console.log('✅ removeFromComparison function exists and executed:', result)
        
        // Check if product was actually removed
        const updatedProducts = JSON.parse(localStorage.getItem('comparisonProducts') || '[]')
        const wasRemoved = !updatedProducts.some(p => p.id === firstProduct.id)
        console.log('🔍 Product actually removed:', wasRemoved ? '✅' : '❌')
        
        if (!wasRemoved) {
          console.log('❌ Product was not removed from storage')
          return false
        }
      } else {
        console.log('❌ removeFromComparison function not found')
        return false
      }
      
      // Test clearComparisons function
      console.log('\n🗑️ Testing clearComparisons...')
      if (typeof window.clearComparisons === 'function') {
        const result = window.clearComparisons()
        console.log('✅ clearComparisons function exists and executed:', result)
        
        // Check if all products were cleared
        const clearedProducts = JSON.parse(localStorage.getItem('comparisonProducts') || '[]')
        const allCleared = clearedProducts.length === 0
        console.log('🔍 All products cleared:', allCleared ? '✅' : '❌')
        
        if (!allCleared) {
          console.log('❌ Products were not cleared from storage')
          return false
        }
      } else {
        console.log('❌ clearComparisons function not found')
        return false
      }
      
      // Test confirmClearComparisons function
      console.log('\n🤔 Testing confirmClearComparisons...')
      if (typeof window.confirmClearComparisons === 'function') {
        console.log('✅ confirmClearComparisons function exists')
      } else {
        console.log('❌ confirmClearComparisons function not found')
        return false
      }
      
      console.log('✅ Remove and Clear buttons test completed successfully')
      return true
      
    } catch (error) {
      console.error('❌ Remove and Clear buttons test failed:', error)
      return false
    }
  },

  /**
   * Test Comparison Criteria buttons functionality
   */
  testCriteriaButtons() {
    console.log('🔧 Testing Comparison Criteria Buttons...')
    
    try {
      // Ensure we have test products and modal is open
      if (JSON.parse(localStorage.getItem('comparisonProducts') || '[]').length === 0) {
        console.log('⚠️ No products found, adding test products first...')
        this.addTestProducts()
      }
      
      // Open modal for testing
      if (typeof window.openComparisonModal === 'function') {
        window.openComparisonModal()
        console.log('✅ Comparison modal opened')
      } else {
        console.log('❌ openComparisonModal function not found')
        return false
      }
      
      // Wait for modal to be ready
      setTimeout(() => {
        const modal = document.getElementById('comparison-modal')
        if (!modal) {
          console.log('❌ Comparison modal not found')
          return false
        }
        
        // Test criteria buttons
        const criteriaButtons = modal.querySelectorAll('.comparison-criteria')
        console.log(`📊 Found ${criteriaButtons.length} criteria buttons`)
        
        if (criteriaButtons.length === 0) {
          console.log('❌ No criteria buttons found')
          return false
        }
        
        // Test each criteria button
        const criteriaToTest = ['all', 'basic', 'pricing', 'ratings']
        
        criteriaToTest.forEach((criteria, index) => {
          setTimeout(() => {
            console.log(`\n🎯 Testing criteria: ${criteria}`)
            
            // Find button for this criteria
            const button = Array.from(criteriaButtons).find(btn => btn.dataset.criteria === criteria)
            
            if (button) {
              console.log(`✅ Found button for ${criteria}`)
              
              // Test filterComparisonRows function
              if (typeof window.filterComparisonRows === 'function') {
                window.filterComparisonRows(modal, criteria)
                console.log(`✅ filterComparisonRows executed for ${criteria}`)
                
                // Check if filtering worked
                const visibleRows = modal.querySelectorAll('.comparison-row:not([style*="display: none"]):not(.hidden)')
                const hiddenRows = modal.querySelectorAll('.comparison-row[style*="display: none"], .comparison-row.hidden')
                
                console.log(`📊 Visible rows: ${visibleRows.length}, Hidden rows: ${hiddenRows.length}`)
                
                // Check button state
                const isActive = button.classList.contains('active') && button.classList.contains('btn-primary')
                console.log(`🎨 Button active state: ${isActive ? '✅' : '❌'}`)
                
              } else {
                console.log('❌ filterComparisonRows function not found')
                return false
              }
            } else {
              console.log(`❌ Button not found for criteria: ${criteria}`)
            }
          }, index * 1000) // Stagger tests
        })
        
        console.log('✅ Criteria buttons test completed')
        return true
        
      }, 500)
      
    } catch (error) {
      console.error('❌ Criteria buttons test failed:', error)
      return false
    }
  },

  /**
   * Test Backend Integration for Comparison Criteria
   */
  testBackendIntegration() {
    console.log('🔧 Testing Backend Integration for Comparison Criteria...')
    
    try {
      // Test mapBackendDataForComparison function
      console.log('\n🗺️ Testing mapBackendDataForComparison...')
      
      if (typeof window.mapBackendDataForComparison === 'function') {
        console.log('✅ mapBackendDataForComparison function exists')
        
        // Test with mock backend data
        const mockBackendData = {
          id: 1,
          name: 'Test Product',
          title: 'Alternative Title',
          description: 'Test description',
          sku: 'TEST-001',
          category: { name: 'Electronics' },
          brand: { name: 'TestBrand' },
          price: 100,
          discount_percentage: 20,
          rating: 4.5,
          reviews_count: 150,
          stock: 25,
          in_stock: true,
          store: { name: 'Test Store' },
          image_urls: ['test-image.jpg'],
          specifications: {
            weight: '1kg',
            dimensions: '10x10x5cm',
            color: 'Black',
            material: 'Plastic'
          }
        }
        
        console.log('📊 Testing with mock data:', mockBackendData)
        
        const mappedData = window.mapBackendDataForComparison(mockBackendData)
        console.log('✅ Mapped data result:', mappedData)
        
        // Verify mapping worked correctly
        const expectedMappings = [
          { field: 'name', expected: 'Test Product' },
          { field: 'category', expected: 'Electronics' },
          { field: 'brand', expected: 'TestBrand' },
          { field: 'price', expected: 100 },
          { field: 'discount_percentage', expected: 20 },
          { field: 'final_price', expected: 80 }, // 100 - 20%
          { field: 'average_rating', expected: 4.5 },
          { field: 'total_reviews', expected: 150 },
          { field: 'stock_quantity', expected: 25 },
          { field: 'in_stock', expected: true }
        ]
        
        let mappingSuccess = true
        expectedMappings.forEach(({ field, expected }) => {
          const actual = mappedData[field]
          if (actual === expected) {
            console.log(`✅ ${field}: ${actual} (correct)`)
          } else {
            console.log(`❌ ${field}: expected ${expected}, got ${actual}`)
            mappingSuccess = false
          }
        })
        
        if (mappingSuccess) {
          console.log('✅ All field mappings successful')
        } else {
          console.log('❌ Some field mappings failed')
          return false
        }
        
      } else {
        console.log('❌ mapBackendDataForComparison function not found')
        return false
      }
      
      // Test refreshComparisonData function
      console.log('\n🔄 Testing refreshComparisonData...')
      
      if (typeof window.refreshComparisonData === 'function') {
        console.log('✅ refreshComparisonData function exists')
        
        // Note: We won't actually call it as it makes API requests
        console.log('ℹ️ Function exists and ready for API integration')
        
      } else {
        console.log('❌ refreshComparisonData function not found')
        return false
      }
      
      // Test criteria backend field mapping
      console.log('\n📋 Testing criteria backend field mapping...')
      
      // Add test products to check criteria
      if (JSON.parse(localStorage.getItem('comparisonProducts') || '[]').length === 0) {
        this.addTestProducts()
      }
      
      // Open modal to test criteria
      if (typeof window.openComparisonModal === 'function') {
        window.openComparisonModal()
        
        setTimeout(() => {
          const modal = document.getElementById('comparison-modal')
          if (modal) {
            // Test each criteria button with backend integration
            const criteriaToTest = ['basic', 'pricing', 'ratings', 'availability']
            
            criteriaToTest.forEach((criteria, index) => {
              setTimeout(() => {
                console.log(`\n🎯 Testing ${criteria} criteria with backend fields...`)
                
                if (typeof window.filterComparisonRows === 'function') {
                  window.filterComparisonRows(modal, criteria)
                  
                  // Check if rows are properly filtered
                  const visibleRows = modal.querySelectorAll(`.comparison-row[data-criteria="${criteria}"]:not([style*="display: none"]):not(.hidden)`)
                  const hiddenRows = modal.querySelectorAll(`.comparison-row:not([data-criteria="${criteria}"])[style*="display: none"], .comparison-row:not([data-criteria="${criteria}"]).hidden`)
                  
                  console.log(`📊 ${criteria} - Visible rows: ${visibleRows.length}, Hidden rows: ${hiddenRows.length}`)
                  
                  // Check if backend fields are being used
                  visibleRows.forEach(row => {
                    const cells = row.querySelectorAll('td')
                    cells.forEach(cell => {
                      if (cell.textContent.trim() !== 'N/A' && cell.textContent.trim() !== '') {
                        console.log(`✅ ${criteria} - Data found: ${cell.textContent.trim()}`)
                      }
                    })
                  })
                  
                } else {
                  console.log('❌ filterComparisonRows function not found')
                }
              }, index * 500)
            })
          }
        }, 1000)
      }
      
      console.log('✅ Backend integration test completed')
      return true
      
    } catch (error) {
      console.error('❌ Backend integration test failed:', error)
      return false
    }
  },

  /**
   * Test Dialog functionality specifically
   */
  testDialogFunctionality() {
    console.log('🔧 Testing Comparison Dialog Functionality...')
    
    try {
      const modal = document.getElementById('comparison-modal')
      if (!modal) {
        console.log('⚠️ No comparison modal found, skipping dialog test')
        return true
      }
      
      // Test dialog classes
      const hasDialogClass = modal.querySelector('.comparison-dialog')
      const hasOverlayClass = modal.classList.contains('modal-overlay')
      
      console.log('🎨 Dialog class found:', hasDialogClass ? '✅' : '❌')
      console.log('🌟 Overlay class found:', hasOverlayClass ? '✅' : '❌')
      
      // Test backdrop click functionality
      if (typeof handleComparisonModalClick === 'function') {
        console.log('🖱️ Backdrop click handler found: ✅')
      } else {
        console.log('🖱️ Backdrop click handler found: ❌')
      }
      
      // Test ESC key functionality
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escEvent)
      console.log('⌨️ ESC key event dispatched')
      
      console.log('✅ Dialog functionality test completed')
      return true
      
    } catch (error) {
      console.error('❌ Dialog functionality test failed:', error)
      return false
    }
  },

  /**
   * Run comprehensive comparison system test
   */
  async runFullTest() {
    console.log('🧪 Starting Comprehensive Comparison System Test...')
    console.log('=' .repeat(50))
    
    const tests = [
      { name: 'API Connectivity', fn: () => this.testAPIConnectivity() },
      { name: 'Modal Functionality', fn: () => this.testModalFunctionality() },
      { name: 'Data Management', fn: () => this.testDataManagement() },
      { name: 'Data Mapping', fn: () => this.testDataMapping() },
      { name: 'Remove & Clear Buttons', fn: () => this.testRemoveAndClearButtons() },
      { name: 'Criteria Buttons', fn: () => this.testCriteriaButtons() },
      { name: 'Backend Integration', fn: () => this.testBackendIntegration() },
      { name: 'Scroll Functionality', fn: () => this.testScrollFunctionality() },
      { name: 'Dialog Functionality', fn: () => this.testDialogFunctionality() },
      { name: 'Test Products', fn: () => this.addTestProducts() },
      { name: 'Modal Opening', fn: () => this.testModalOpening() }
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
      console.log('🎉 All comparison tests passed! System is working correctly.')
    } else {
      console.log('⚠️ Some tests failed. Check the issues above.')
    }
    
    return { passed, failed, total: tests.length }
  },

  /**
   * Clear all comparison data
   */
  clearAllData() {
    console.log('🧹 Clearing all comparison data...')
    
    try {
      // Clear localStorage
      localStorage.removeItem('comparisonProducts')
      
      // Clear badge
      const badge = document.querySelector('.comparison-badge')
      if (badge) {
        badge.textContent = '0'
        badge.style.display = 'none'
      }
      
      // Close any open modals
      const modal = document.getElementById('comparison-modal')
      if (modal) {
        modal.remove()
      }
      
      // Restore scroll
      document.body.style.overflow = ''
      
      console.log('✅ All comparison data cleared')
      
    } catch (error) {
      console.error('❌ Failed to clear data:', error)
    }
  }
}

console.log('🔧 Comparison debug utilities loaded. Use debugComparison.runFullTest() to test.');