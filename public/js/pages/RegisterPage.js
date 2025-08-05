import { createElementFromHTML, showToast, validateEmail, validatePassword, validateRequired, clearFormErrors, displayFieldError, clearFieldError } from "../utils/helpers.js?v=2024"
import { authService } from "../services/api.js"
import store from "../state/store.js"

export default function RegisterPage() {
  const page = createElementFromHTML(`
        <div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8 card">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p class="mt-2 text-center text-sm text-muted">
                        Join Best on Click and start shopping
                    </p>
                </div>
                <form id="register-form" class="mt-8 space-y-6">
                    <div class="space-y-4">
                        <div>
                            <label for="first_name" class="block text-sm font-medium text-gray-700">First Name</label>
                            <input id="first_name" name="first_name" type="text" required class="input-field" placeholder="Enter your first name">
                        </div>
                        <div>
                            <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name</label>
                            <input id="last_name" name="last_name" type="text" required class="input-field" placeholder="Enter your last name">
                        </div>
                        <div>
                            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                            <input id="username" name="username" type="text" required class="input-field" placeholder="Choose a username">
                        </div>
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                            <input id="email" name="email" type="email" required class="input-field" placeholder="Enter your email">
                        </div>
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                            <input id="password" name="password" type="password" required class="input-field" placeholder="Create a password">
                        </div>
                        <div>
                            <label for="password_confirm" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input id="password_confirm" name="password_confirm" type="password" required class="input-field" placeholder="Confirm your password">
                        </div>
                        <div>
                            <label for="phone_number" class="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                            <input id="phone_number" name="phone_number" type="tel" class="input-field" placeholder="Enter your phone number">
                        </div>
                        <div>
                            <label for="role" class="block text-sm font-medium text-gray-700">Account Type</label>
                            <select id="role" name="role" class="input-field">
                                <option value="customer">Customer</option>
                                <option value="store_owner">Store Owner</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                            Create Account
                        </button>
                    </div>
                </form>
                <p class="text-center text-sm">
                    Already have an account? <a href="#/login" class="font-medium text-secondary hover:text-blue-600">Sign in here</a>
                </p>
            </div>
        </div>
    `)

  const form = page.querySelector("#register-form")
  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Clear previous errors
    clearFormErrors(form)

    const formData = new FormData(form)

    const userData = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      password_confirm: formData.get("password_confirm"),
      phone_number: formData.get("phone_number"),
      role: formData.get("role") || "customer"
    }

    // Client-side validation
    let hasErrors = false

    if (!validateRequired(userData.first_name)) {
      displayFieldError(form.querySelector('[name="first_name"]'), 'First name is required')
      hasErrors = true
    }

    if (!validateRequired(userData.last_name)) {
      displayFieldError(form.querySelector('[name="last_name"]'), 'Last name is required')
      hasErrors = true
    }

    if (!validateRequired(userData.username)) {
      displayFieldError(form.querySelector('[name="username"]'), 'Username is required')
      hasErrors = true
    }

    if (!validateRequired(userData.email)) {
      displayFieldError(form.querySelector('[name="email"]'), 'Email is required')
      hasErrors = true
    } else if (!validateEmail(userData.email)) {
      displayFieldError(form.querySelector('[name="email"]'), 'Please enter a valid email address')
      hasErrors = true
    }

    if (!validatePassword(userData.password)) {
      displayFieldError(form.querySelector('[name="password"]'), 'Password must be at least 6 characters long')
      hasErrors = true
    }

    // Validate password confirmation
    const passwordConfirm = formData.get("password_confirm")
    if (userData.password !== passwordConfirm) {
      displayFieldError(form.querySelector('[name="password_confirm"]'), 'Passwords do not match')
      hasErrors = true
    }

    if (hasErrors) return

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Creating Account...'
    submitBtn.disabled = true

    try {
      console.log('Sending registration data:', userData)
      const response = await authService.register(userData)
      console.log('Registration response:', response)

      if (response.tokens) {
        // Auto-login after registration - Save to authService
        console.log('💾 Saving user data to authService:', response.user);
        
        // Manually set authService state
        authService.token = response.tokens.access;
        authService.refreshToken = response.tokens.refresh;
        authService.currentUser = response.user;
        
        // Store in localStorage (both formats for compatibility)
        localStorage.setItem('authToken', response.tokens.access);
        localStorage.setItem('access_token', response.tokens.access);
        localStorage.setItem('refreshToken', response.tokens.refresh);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        // Also update store state
        store.setState({
          isAuthenticated: true,
          token: response.tokens.access,
          user: response.user,
        })

        showToast("Registration successful! Welcome to Best on Click!", "success")
        
        // Verify auth state
        console.log('🔐 Auth state after registration:', {
          isAuthenticated: authService.isAuthenticated(),
          user: authService.getCurrentUser(),
          token: !!authService.token
        });

        // Redirect based on user role
        if (response.user.role === 'store_owner') {
          // Check if store owner has a store
          console.log('🏪 Store owner registered, checking for existing store...')
          await checkStoreOwnerRedirect(response.user)
        } else {
          location.hash = "/"
        }
      } else {
        // Registration successful but requires login
        showToast("Registration successful! Please log in.", "success")
        location.hash = "/login"
      }
    } catch (error) {
      console.error('Registration error:', error)
      showToast(error.message || 'Registration failed. Please try again.', 'error')
    } finally {
      // Reset button state
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    }
  })

  // Real-time validation
  const inputs = form.querySelectorAll('input')
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      clearFieldError(input)
    })
  })

  return page
}

// Helper function to check store owner redirect
async function checkStoreOwnerRedirect(user) {
  try {
    console.log('🔍 Checking store for user:', user.username)
    
    // Wait a bit for store state to be updated
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check if user has a store
    const token = store.getState().token;
    console.log('🔑 Token available:', !!token)
    
    if (!token) {
      console.error('❌ No token available for store check');
      showToast("Welcome! Please create your store first", "info")
      location.hash = "/store/apply";
      return;
    }
    
    console.log('📡 Checking for existing store via API...')
    const response = await fetch('/api/stores/my-store/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📊 API Response status:', response.status)
    
    if (response.ok) {
      const storeData = await response.json()
      console.log('🏪 Store data received:', storeData)
      
      if (storeData && storeData.id) {
        // User has a store, redirect to dashboard
        console.log('✅ User has existing store, redirecting to dashboard')
        showToast("Welcome back! Redirecting to dashboard", "success")
        location.hash = "/dashboard"
      } else {
        // User doesn't have a store, redirect to store application
        console.log('📝 User needs to create store, redirecting to application')
        showToast("Welcome! Please create your store first", "info")
        location.hash = "/store/apply"
      }
    } else if (response.status === 404) {
      // No store found, redirect to store application
      console.log('🆕 No store found (404), redirecting to application')
      showToast("Welcome! Please create your store first", "info")
      
      // Add a longer delay to ensure state is properly set
      setTimeout(() => {
        console.log('🔄 Setting location to /store/apply')
        location.hash = "/store/apply"
      }, 1000)
    } else {
      // Other API error, redirect to store application
      console.log('⚠️ API error, redirecting to application')
      showToast("Welcome! Please create your store first", "info")
      location.hash = "/store/apply"
    }
  } catch (error) {
    console.error('💥 Error checking store:', error)
    // On error, redirect to store application to be safe
    showToast("مرحباً! يرجى إنشاء متجرك أولاً", "info")
    location.hash = "/store/apply"
  }
}
