import { createElementFromHTML, showToast, formatCurrency } from "../utils/helpers.js"
import { cartService, promotionsService } from "../services/api.js"
import store from "../state/store.js"
import modalManager from "../utils/modalManager.js"

/**
 * Creates a checkout modal with order placement and QR code generation
 * @param {object} cartData - The cart data
 * @returns {HTMLElement} The checkout modal element
 */
export function CheckoutModal(cartData) {
  const { isAuthenticated, user } = store.getState()
  
  if (!isAuthenticated) {
    showToast('Please login to proceed with checkout', 'warning')
    location.hash = '/login'
    return null
  }

  const modal = createElementFromHTML(`
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-overlay" id="checkout-modal" onclick="handleCheckoutModalClick(event)">
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden modal-content checkout-dialog" onclick="event.stopPropagation()">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-primary/90 text-white">
          <div>
            <h2 class="text-2xl font-bold flex items-center gap-3">
              <i class="fa-solid fa-shopping-cart"></i>
              Checkout
            </h2>
            <p class="text-primary-light mt-1">Complete your order and get your QR code</p>
          </div>
          <button class="text-white hover:text-gray-200 transition-colors text-2xl" onclick="closeCheckoutModal()">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          <!-- Order Summary (Left Side) -->
          <div class="lg:w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-list-check text-secondary"></i>
              Order Summary
            </h3>

            <!-- Cart Items -->
            <div class="space-y-4 mb-6">
              ${cartData.items.map(item => `
                <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img src="${item.product.image_urls?.[0] || '/images/placeholder.jpg'}" 
                       alt="${item.product.name}"
                       class="w-16 h-16 object-cover rounded-lg border border-gray-200">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 line-clamp-2">${item.product.name}</h4>
                    <p class="text-sm text-gray-600">${item.product.category?.name || 'Uncategorized'}</p>
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-sm text-gray-500">Qty: ${item.quantity}</span>
                      <span class="font-bold text-secondary">${formatCurrency(item.total_price || (item.price_when_added * item.quantity))}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Order Totals -->
            <div class="border-t border-gray-200 pt-4 space-y-3">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal (${cartData.total_items} items)</span>
                <span class="font-semibold">${formatCurrency(cartData.total_price)}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span class="text-green-600 font-semibold">Free</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Tax</span>
                <span class="font-semibold">${formatCurrency(cartData.total_price * 0.1)}</span>
              </div>
              <div class="border-t border-gray-200 pt-3">
                <div class="flex justify-between items-center">
                  <span class="text-xl font-bold text-gray-800">Total</span>
                  <span class="text-2xl font-bold text-secondary">${formatCurrency(cartData.total_price * 1.1)}</span>
                </div>
              </div>
            </div>

            <!-- Store Breakdown -->
            <div class="mt-6">
              <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <i class="fa-solid fa-store text-secondary"></i>
                Stores in Your Order
              </h4>
              <div class="space-y-2">
                ${getStoreBreakdown(cartData.items).map(store => `
                  <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <span class="font-medium text-gray-800">${store.name}</span>
                      <span class="text-sm text-gray-600 ml-2">(${store.itemCount} items)</span>
                    </div>
                    <span class="font-bold text-secondary">${formatCurrency(store.total)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Checkout Form & QR Generation (Right Side) -->
          <div class="lg:w-1/2 p-6 overflow-y-auto">
            <div id="checkout-steps">
              <!-- Step 1: Customer Information -->
              <div id="step-customer-info" class="checkout-step">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <i class="fa-solid fa-user text-secondary"></i>
                  Customer Information
                </h3>

                <form id="customer-form" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input type="text" name="first_name" value="${user.first_name || ''}" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary" required>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input type="text" name="last_name" value="${user.last_name || ''}" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary" required>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" name="email" value="${user.email || ''}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary" required>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" name="phone" value="${user.phone_number || ''}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary" required>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                    <textarea name="address" rows="3" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none" 
                              placeholder="Enter your full delivery address..." required></textarea>
                  </div>

                  <div class="flex gap-3 pt-4">
                    <button type="button" class="btn btn-outline flex-1" onclick="closeCheckoutModal()">
                      Cancel
                    </button>
                    <button type="submit" class="btn btn-primary flex-1">
                      Continue to Payment
                      <i class="fa-solid fa-arrow-right ml-2"></i>
                    </button>
                  </div>
                </form>
              </div>

              <!-- Step 2: Payment & Order Confirmation -->
              <div id="step-payment" class="checkout-step hidden">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <i class="fa-solid fa-credit-card text-secondary"></i>
                  Payment & Confirmation
                </h3>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div class="flex items-center gap-3">
                    <i class="fa-solid fa-info-circle text-blue-600 text-xl"></i>
                    <div>
                      <h4 class="font-semibold text-blue-800">Payment on Delivery</h4>
                      <p class="text-sm text-blue-700 mt-1">You'll pay when you collect your items from the stores using your QR code.</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                    <input type="radio" id="payment-cod" name="payment_method" value="cod" checked 
                           class="w-4 h-4 text-secondary focus:ring-secondary">
                    <label for="payment-cod" class="flex-1">
                      <div class="font-semibold text-gray-800">Cash on Delivery</div>
                      <div class="text-sm text-gray-600">Pay when you collect your items</div>
                    </label>
                    <i class="fa-solid fa-money-bill-wave text-green-600 text-xl"></i>
                  </div>
                </div>

                <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 class="font-semibold text-gray-800 mb-2">Order Instructions</h4>
                  <ol class="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Complete your order to receive a QR code</li>
                    <li>Visit each store listed in your order</li>
                    <li>Show your QR code to the store owner</li>
                    <li>Pay for and collect your items</li>
                  </ol>
                </div>

                <div class="flex gap-3 pt-6">
                  <button type="button" class="btn btn-outline flex-1" onclick="showStep('step-customer-info')">
                    <i class="fa-solid fa-arrow-left mr-2"></i>
                    Back
                  </button>
                  <button type="button" class="btn btn-primary flex-1" onclick="processOrder()" id="place-order-btn">
                    <i class="fa-solid fa-shopping-cart mr-2"></i>
                    Place Order
                  </button>
                </div>
              </div>

              <!-- Step 3: QR Code Display -->
              <div id="step-qr-code" class="checkout-step hidden">
                <div class="text-center">
                  <div class="mb-6">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i class="fa-solid fa-check text-green-600 text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h3>
                    <p class="text-gray-600">Your order has been confirmed. Use the QR code below to collect your items.</p>
                  </div>

                  <!-- QR Code Display -->
                  <div id="qr-code-container" class="bg-white border-2 border-gray-200 rounded-xl p-8 mb-6">
                    <!-- QR code will be inserted here -->
                  </div>

                  <!-- Order Details -->
                  <div id="order-details" class="text-left bg-gray-50 rounded-lg p-6 mb-6">
                    <!-- Order details will be inserted here -->
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-3">
                    <button type="button" class="btn btn-outline flex-1" onclick="downloadQR()">
                      <i class="fa-solid fa-download mr-2"></i>
                      Download QR
                    </button>
                    <button type="button" class="btn btn-secondary flex-1" onclick="shareOrder()">
                      <i class="fa-solid fa-share mr-2"></i>
                      Share Order
                    </button>
                    <button type="button" class="btn btn-primary flex-1" onclick="closeCheckoutModal()">
                      <i class="fa-solid fa-check mr-2"></i>
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `)

  // Initialize the checkout modal
  initializeCheckoutModal(modal, cartData)
  
  // Use modal manager for proper scroll management
  modalManager.openModal('checkout-modal')
  
  // Add entrance animation
  setTimeout(() => {
    modal.classList.add('modal-enter')
  }, 10)

  return modal
}

function initializeCheckoutModal(modal, cartData) {
  let currentStep = 'step-customer-info'
  let orderData = null
  
  // Add ESC key support
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeCheckoutModal()
      document.removeEventListener('keydown', handleEscape)
    }
  }
  document.addEventListener('keydown', handleEscape)

  // Initialize customer form
  const customerForm = modal.querySelector('#customer-form')
  if (customerForm) {
    customerForm.addEventListener('submit', (e) => {
      e.preventDefault()
      handleCustomerFormSubmit(e.target)
    })
  }

  function handleCustomerFormSubmit(form) {
    const formData = new FormData(form)
    const customerData = Object.fromEntries(formData.entries())

    // Validate form
    if (!customerData.first_name || !customerData.last_name || !customerData.email || !customerData.phone || !customerData.address) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    // Store customer data and proceed to payment
    orderData = {
      customer: customerData,
      cart: cartData,
      payment_method: 'cod'
    }

    showStep('step-payment')
  }

  window.showStep = function(stepId) {
    // Hide all steps
    modal.querySelectorAll('.checkout-step').forEach(step => {
      step.classList.add('hidden')
    })

    // Show target step
    const targetStep = modal.querySelector(`#${stepId}`)
    if (targetStep) {
      targetStep.classList.remove('hidden')
      currentStep = stepId
    }
  }

  window.processOrder = async function() {
    const placeOrderBtn = modal.querySelector('#place-order-btn')
    const originalText = placeOrderBtn.innerHTML

    try {
      // Show loading state
      placeOrderBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Processing...'
      placeOrderBtn.disabled = true

      // Generate QR code for the order
      const qrData = {
        cart_items: cartData.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.price_when_added,
          store_id: item.product.store?.id || 1
        })),
        customer_info: orderData.customer,
        total_amount: cartData.total_price * 1.1, // Including tax
        order_date: new Date().toISOString()
      }

      const response = await promotionsService.generateUserQR(qrData)

      if (response && response.qr_code_uuid) {
        // Clear the cart
        await cartService.clearCart()
        
        // Show QR code step
        displayQRCode(response, qrData)
        showStep('step-qr-code')
        
        showToast('Order placed successfully!', 'success')
      } else {
        throw new Error('Failed to generate QR code')
      }

    } catch (error) {
      console.error('Failed to process order:', error)
      showToast(error.message || 'Failed to process order', 'error')
    } finally {
      placeOrderBtn.innerHTML = originalText
      placeOrderBtn.disabled = false
    }
  }

  function displayQRCode(qrResponse, orderData) {
    const qrContainer = modal.querySelector('#qr-code-container')
    const orderDetailsContainer = modal.querySelector('#order-details')

    // Generate QR code using a QR code library or service
    // For now, we'll create a placeholder QR code
    qrContainer.innerHTML = `
      <div class="text-center">
        <div class="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg">
          <div class="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg mb-4">
            <div class="text-center">
              <i class="fa-solid fa-qrcode text-6xl text-gray-400 mb-2"></i>
              <p class="text-sm text-gray-600">QR Code</p>
              <p class="text-xs text-gray-500 font-mono">${qrResponse.qr_code_uuid}</p>
            </div>
          </div>
        </div>
        <p class="text-sm text-gray-600 mt-4">Show this QR code at each store to collect your items</p>
      </div>
    `

    // Display order details
    const storeBreakdown = getStoreBreakdown(orderData.cart_items)
    orderDetailsContainer.innerHTML = `
      <h4 class="font-semibold text-gray-800 mb-3">Order Details</h4>
      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-gray-600">Order ID:</span>
          <span class="font-mono text-sm">${qrResponse.qr_code_uuid.substring(0, 8).toUpperCase()}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Order Date:</span>
          <span>${new Date().toLocaleDateString()}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Total Amount:</span>
          <span class="font-bold text-secondary">${formatCurrency(orderData.total_amount)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Payment Method:</span>
          <span>Cash on Delivery</span>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-200">
        <h5 class="font-semibold text-gray-800 mb-2">Stores to Visit:</h5>
        <div class="space-y-2">
          ${storeBreakdown.map(store => `
            <div class="flex justify-between items-center p-2 bg-white rounded border">
              <span class="font-medium">${store.name}</span>
              <span class="text-sm text-gray-600">${store.itemCount} items - ${formatCurrency(store.total)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `

    // Store QR data globally for download/share functions
    window.currentQRData = {
      uuid: qrResponse.qr_code_uuid,
      orderData: orderData
    }
  }

  window.downloadQR = function() {
    if (window.currentQRData) {
      // Create a simple text file with order details
      const orderInfo = `
Order ID: ${window.currentQRData.uuid.substring(0, 8).toUpperCase()}
QR Code: ${window.currentQRData.uuid}
Date: ${new Date().toLocaleDateString()}
Total: ${formatCurrency(window.currentQRData.orderData.total_amount)}

Show this QR code at the stores to collect your items.
      `.trim()

      const blob = new Blob([orderInfo], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `order-${window.currentQRData.uuid.substring(0, 8)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast('Order details downloaded!', 'success')
    }
  }

  window.shareOrder = function() {
    if (window.currentQRData && navigator.share) {
      navigator.share({
        title: 'My Order - Best on Click',
        text: `Order ID: ${window.currentQRData.uuid.substring(0, 8).toUpperCase()}`,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      const orderText = `Order ID: ${window.currentQRData.uuid.substring(0, 8).toUpperCase()}\nQR Code: ${window.currentQRData.uuid}`
      navigator.clipboard.writeText(orderText)
      showToast('Order details copied to clipboard!', 'success')
    }
  }
}

function getStoreBreakdown(cartItems) {
  const storeMap = new Map()

  cartItems.forEach(item => {
    const storeName = item.product.store?.name || 'Unknown Store'
    const storeId = item.product.store?.id || 0

    if (!storeMap.has(storeId)) {
      storeMap.set(storeId, {
        id: storeId,
        name: storeName,
        itemCount: 0,
        total: 0
      })
    }

    const store = storeMap.get(storeId)
    store.itemCount += item.quantity
    store.total += item.total_price || (item.price_when_added * item.quantity)
  })

  return Array.from(storeMap.values())
}

// Handle modal backdrop click
window.handleCheckoutModalClick = function(event) {
  // Only close if clicking the backdrop (not the modal content)
  if (event.target.id === 'checkout-modal' || event.target.classList.contains('modal-overlay')) {
    closeCheckoutModal()
  }
}

window.closeCheckoutModal = function() {
  try {
    console.log('🚪 Closing checkout modal...')
    
    const modal = document.getElementById('checkout-modal')
    if (modal) {
      // Add closing animation
      modal.classList.add('modal-exit')
      
      // Remove after animation
      setTimeout(() => {
        modal.remove()
        console.log('✅ Checkout modal removed')
      }, 300)
    }
    
    // Use modal manager to restore scroll properly
    modalManager.closeModal('checkout-modal')
    
    // Refresh cart if order was completed
    if (window.cart) {
      window.cart.loadCart()
    }
    
    console.log('✅ Checkout modal cleanup completed')
    
  } catch (error) {
    console.error('❌ Error closing checkout modal:', error)
    // Force restore body scroll even on error
    modalManager.closeModal('checkout-modal')
    
    // Force remove modal on error
    const modal = document.getElementById('checkout-modal')
    if (modal) modal.remove()
  }
}

// Prevent modal from closing when clicking inside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('checkout-modal')
  if (modal && e.target === modal) {
    // Only close if clicking the backdrop, not the modal content
    if (e.target.classList.contains('backdrop-blur-sm')) {
      closeCheckoutModal()
    }
  }
})