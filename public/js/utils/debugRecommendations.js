/**
 * Debug utilities for testing recommendation system
 */

window.debugRecommendations = {
  // Test general recommendations
  testGeneralRecommendations: async function() {
    console.log('🧪 Testing General Recommendations...')
    
    try {
      const response = await recommendationService.getGeneralRecommendations({
        limit: 5,
        session_id: 'debug_session_' + Date.now()
      })
      
      console.log('✅ General Recommendations Response:', response)
      
      if (response.recommendations && response.recommendations.length > 0) {
        console.log(`📊 Found ${response.recommendations.length} recommendations`)
        response.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. Product ID: ${rec.product_id}, Score: ${rec.score}, Algorithm: ${rec.algorithm}`)
        })
      } else {
        console.warn('⚠️ No recommendations returned')
      }
      
      return response
    } catch (error) {
      console.error('❌ General Recommendations Failed:', error.message)
      return null
    }
  },

  // Test personalized recommendations (requires authentication)
  testPersonalizedRecommendations: async function() {
    console.log('🧪 Testing Personalized Recommendations...')
    
    const isAuthenticated = localStorage.getItem('access_token')
    if (!isAuthenticated) {
      console.warn('⚠️ User not authenticated, skipping personalized test')
      return null
    }
    
    try {
      const response = await recommendationService.getPersonalizedRecommendations({
        limit: 5,
        session_id: 'debug_session_' + Date.now()
      })
      
      console.log('✅ Personalized Recommendations Response:', response)
      
      if (response.recommendations && response.recommendations.length > 0) {
        console.log(`📊 Found ${response.recommendations.length} personalized recommendations`)
        response.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. Product ID: ${rec.product_id}, Score: ${rec.score}, Algorithm: ${rec.algorithm}`)
        })
      } else {
        console.warn('⚠️ No personalized recommendations returned')
      }
      
      return response
    } catch (error) {
      console.error('❌ Personalized Recommendations Failed:', error.message)
      return null
    }
  },

  // Test interaction tracking
  testInteractionTracking: async function() {
    console.log('🧪 Testing Interaction Tracking...')
    
    try {
      const response = await recommendationService.trackInteraction({
        session_id: 'debug_session_' + Date.now(),
        product_id: 1, // Assuming product with ID 1 exists
        action: 'click',
        timestamp: new Date().toISOString()
      })
      
      console.log('✅ Interaction Tracking Response:', response)
      return response
    } catch (error) {
      console.error('❌ Interaction Tracking Failed:', error.message)
      return null
    }
  },

  // Test API connectivity
  testAPIConnectivity: async function() {
    console.log('🧪 Testing API Connectivity...')
    
    try {
      const response = await fetch(`${window.API_BASE_URL}/recommendations/general/?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        console.log('✅ API is accessible')
        const data = await response.json()
        console.log('📊 API Response:', data)
        return true
      } else {
        console.error('❌ API returned error:', response.status, response.statusText)
        return false
      }
    } catch (error) {
      console.error('❌ API connection failed:', error.message)
      return false
    }
  },

  // Check if products exist in database
  testProductsExist: async function() {
    console.log('🧪 Testing if products exist...')
    
    try {
      const response = await productService.getProducts('page_size=1')
      
      if (response.results && response.results.length > 0) {
        console.log('✅ Products found in database')
        console.log(`📊 Total products: ${response.count}`)
        console.log('📦 Sample product:', response.results[0])
        return true
      } else {
        console.warn('⚠️ No products found in database')
        return false
      }
    } catch (error) {
      console.error('❌ Failed to check products:', error.message)
      return false
    }
  },

  // Test recommendation components in UI
  testRecommendationComponents: function() {
    console.log('🧪 Testing Recommendation Components in UI...')
    
    // Check homepage recommendations
    const homeRecommendations = document.querySelector('#recommendations-section')
    if (homeRecommendations) {
      console.log('✅ Homepage recommendations section found')
    } else {
      console.warn('⚠️ Homepage recommendations section not found')
    }
    
    // Check product detail recommendations
    const productRecommendations = document.querySelector('#product-recommendations')
    if (productRecommendations) {
      console.log('✅ Product detail recommendations section found')
    } else {
      console.warn('⚠️ Product detail recommendations section not found')
    }
    
    // Check if recommendation service is loaded
    if (window.recommendationService) {
      console.log('✅ Recommendation service is loaded')
    } else {
      console.error('❌ Recommendation service not found')
    }
  },

  // Test personalization service
  testPersonalizationService: function() {
    console.log('🧪 Testing Personalization Service...')
    
    if (window.personalizationService) {
      console.log('✅ Personalization service is loaded')
      
      // Check session ID
      const sessionId = window.personalizationService.sessionId
      console.log('📊 Session ID:', sessionId)
      
      // Check user state
      const isAuthenticated = window.personalizationService.isAuthenticated
      console.log('👤 User authenticated:', isAuthenticated)
      
      return true
    } else {
      console.error('❌ Personalization service not found')
      return false
    }
  },

  // Run comprehensive test
  runFullTest: async function() {
    console.log('🚀 Running Full Recommendations Test Suite...')
    console.log('=' .repeat(50))
    
    // Test 1: API Connectivity
    console.log('\n1️⃣ Testing API Connectivity...')
    const apiConnected = await this.testAPIConnectivity()
    
    // Test 2: Products Exist
    console.log('\n2️⃣ Testing Products Database...')
    const productsExist = await this.testProductsExist()
    
    // Test 3: UI Components
    console.log('\n3️⃣ Testing UI Components...')
    this.testRecommendationComponents()
    
    // Test 4: Personalization Service
    console.log('\n4️⃣ Testing Personalization Service...')
    this.testPersonalizationService()
    
    // Test 5: General Recommendations
    console.log('\n5️⃣ Testing General Recommendations...')
    const generalRecs = await this.testGeneralRecommendations()
    
    // Test 6: Personalized Recommendations
    console.log('\n6️⃣ Testing Personalized Recommendations...')
    const personalizedRecs = await this.testPersonalizedRecommendations()
    
    // Test 7: Interaction Tracking
    console.log('\n7️⃣ Testing Interaction Tracking...')
    const trackingWorks = await this.testInteractionTracking()
    
    // Summary
    console.log('\n📋 Test Summary:')
    console.log('=' .repeat(30))
    console.log(`API Connected: ${apiConnected ? '✅' : '❌'}`)
    console.log(`Products Exist: ${productsExist ? '✅' : '❌'}`)
    console.log(`General Recommendations: ${generalRecs ? '✅' : '❌'}`)
    console.log(`Personalized Recommendations: ${personalizedRecs ? '✅' : '❌'}`)
    console.log(`Interaction Tracking: ${trackingWorks ? '✅' : '❌'}`)
    
    if (apiConnected && productsExist && generalRecs) {
      console.log('\n🎉 Recommendation system is working!')
    } else {
      console.log('\n⚠️ Recommendation system needs attention')
      
      if (!apiConnected) {
        console.log('💡 Suggestion: Check if Django server is running on port 8000')
      }
      if (!productsExist) {
        console.log('💡 Suggestion: Add some products to the database')
      }
    }
    
    console.log('=' .repeat(50))
  }
}

// Auto-load message
console.log('🔧 Recommendations debug utilities loaded. Use debugRecommendations.runFullTest() to test.')