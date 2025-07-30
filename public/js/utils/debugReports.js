/**
 * Debug utilities for Reports functionality
 */

window.debugReports = {
  // Test all report types
  testAllReports: async function() {
    console.log('🧪 Testing all report types...')
    
    const reportTypes = [
      { type: 'sales', params: { period: 30 } },
      { type: 'products', params: { metric: 'views' } },
      { type: 'customers', params: { metric: 'activity' } },
      { type: 'inventory', params: { type: 'current' } },
      { type: 'financial', params: { period: 'monthly' } }
    ]
    
    for (const report of reportTypes) {
      try {
        console.log(`Testing ${report.type} report...`)
        
        // Simulate button click
        const button = document.querySelector(`#generate-${report.type}-report`)
        if (button) {
          button.click()
          await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
          console.log(`✅ ${report.type} report test completed`)
        } else {
          console.warn(`⚠️ Button not found for ${report.type} report`)
        }
      } catch (error) {
        console.error(`❌ ${report.type} report test failed:`, error)
      }
    }
    
    console.log('🎉 All report tests completed!')
  },

  // Test specific report type
  testReport: async function(type) {
    console.log(`🧪 Testing ${type} report...`)
    
    const button = document.querySelector(`#generate-${type}-report`)
    if (button) {
      button.click()
      console.log(`✅ ${type} report button clicked`)
    } else {
      console.error(`❌ Button not found for ${type} report`)
    }
  },

  // Check reports page state
  checkReportsState: function() {
    console.log('🔍 Checking reports page state...')
    
    const reportButtons = [
      'generate-sales-report',
      'generate-products-report',
      'generate-customer-report',
      'generate-inventory-report',
      'generate-financial-report'
    ]
    
    console.log('Available report buttons:')
    reportButtons.forEach(buttonId => {
      const button = document.querySelector(`#${buttonId}`)
      console.log(`- ${buttonId}: ${button ? '✅ Found' : '❌ Missing'}`)
    })
    
    // Check if reportsPageInstance exists
    console.log('Reports page instance:', window.reportsPageInstance ? '✅ Available' : '❌ Missing')
    
    // Check recent reports container
    const recentReportsContainer = document.querySelector('#recent-reports-container')
    console.log('Recent reports container:', recentReportsContainer ? '✅ Found' : '❌ Missing')
  },

  // Test recent reports loading
  testRecentReports: function() {
    console.log('🧪 Testing recent reports loading...')
    
    if (window.reportsPageInstance && window.reportsPageInstance.loadRecentReports) {
      window.reportsPageInstance.loadRecentReports()
      console.log('✅ Recent reports loading triggered')
    } else {
      console.error('❌ Recent reports loading function not available')
    }
  },

  // Test API connectivity
  testAPIConnectivity: async function() {
    console.log('🧪 Testing API connectivity...')
    
    try {
      const response = await fetch(`${window.API_BASE_URL}/reports/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        console.log('✅ API is accessible')
        const data = await response.json()
        console.log('📊 Available reports:', data.length)
      } else {
        console.error('❌ API returned error:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ API connection failed:', error.message)
    }
  },

  // Check if user has proper permissions
  checkPermissions: function() {
    console.log('🔍 Checking user permissions...')
    
    const user = window.store?.getState()?.user
    if (user) {
      console.log('Current user:', user)
      console.log('User role:', user.role)
      console.log('Can access reports:', user.role === 'store_owner' || user.role === 'super_admin' ? '✅ Yes' : '❌ No')
    } else {
      console.log('❌ No user logged in')
    }
  },

  // Full reports test sequence
  runFullTest: async function() {
    console.log('🚀 Running full reports test sequence...')
    
    // Step 1: Check permissions
    this.checkPermissions()
    
    // Step 2: Check page state
    this.checkReportsState()
    
    // Step 3: Test API connectivity
    await this.testAPIConnectivity()
    
    // Step 4: Test recent reports
    this.testRecentReports()
    
    // Step 5: Wait and test one report
    setTimeout(() => {
      this.testReport('sales')
    }, 3000)
    
    console.log('📊 Full test sequence initiated!')
  }
}

// Auto-load debug utilities in development
if (window.location.hostname.includes('192.168') || window.location.hostname === 'localhost') {
  console.log('📊 Reports debug utilities loaded. Use debugReports.runFullTest() to test reports.')
}