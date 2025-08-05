/**
 * Store Application Page
 * Page for users to apply for becoming store owners
 */

import { authService } from '../services/auth.js';
import { storeService } from '../services/store.js';
import { showToast } from '../utils/toast.js';

export function StoreApplicationPage() {
    const page = document.createElement('div');
    page.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Header -->
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">
                        Store Application
                    </h1>
                    <p class="text-lg text-gray-600">
                        Join Best on Click platform as a store owner and start selling your products
                    </p>
                </div>

                <!-- Application Status Check -->
                <div id="application-status" class="mb-8"></div>

                <!-- Application Form -->
                <div id="application-form" class="bg-white shadow-lg rounded-lg p-8">
                    <form id="store-application-form" class="space-y-6">
                        <!-- Store Information -->
                        <div class="border-b border-gray-200 pb-6">
                            <h2 class="text-xl font-semibold text-gray-900 mb-4">
                                Store Information
                            </h2>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="store_name" class="block text-sm font-medium text-gray-700 mb-2">
                                        Store Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="store_name"
                                        name="store_name"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter store name"
                                    >
                                </div>
                                
                                <div>
                                    <label for="business_type" class="block text-sm font-medium text-gray-700 mb-2">
                                        Business Type *
                                    </label>
                                    <select
                                        id="business_type"
                                        name="business_type"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select business type</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="home_garden">Home & Garden</option>
                                        <option value="sports">Sports</option>
                                        <option value="books">Books</option>
                                        <option value="beauty">Beauty & Care</option>
                                        <option value="automotive">Automotive</option>
                                        <option value="food">Food & Beverages</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="mt-6">
                                <label for="store_description" class="block text-sm font-medium text-gray-700 mb-2">
                                    Store Description *
                                </label>
                                <textarea
                                    id="store_description"
                                    name="store_description"
                                    rows="4"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Write a detailed description of your store and the products you will sell"
                                ></textarea>
                            </div>
                        </div>

                        <!-- Contact Information -->
                        <div class="border-b border-gray-200 pb-6">
                            <h2 class="text-xl font-semibold text-gray-900 mb-4">
                                Contact Information
                            </h2>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="business_email" class="block text-sm font-medium text-gray-700 mb-2">
                                        Business Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="business_email"
                                        name="business_email"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="business@example.com"
                                    >
                                </div>
                                
                                <div>
                                    <label for="business_phone" class="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        id="business_phone"
                                        name="business_phone"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="+966 50 123 4567"
                                    >
                                </div>
                            </div>
                            
                            <div class="mt-6">
                                <label for="business_address" class="block text-sm font-medium text-gray-700 mb-2">
                                    Business Address *
                                </label>
                                <textarea
                                    id="business_address"
                                    name="business_address"
                                    rows="3"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter complete business address"
                                ></textarea>
                            </div>
                        </div>

                        <!-- Legal Information -->
                        <div class="border-b border-gray-200 pb-6">
                            <h2 class="text-xl font-semibold text-gray-900 mb-4">
                                Legal Information
                            </h2>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="business_license" class="block text-sm font-medium text-gray-700 mb-2">
                                        Business License Number *
                                    </label>
                                    <input
                                        type="text"
                                        id="business_license"
                                        name="business_license"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="1234567890"
                                    >
                                </div>
                                
                                <div>
                                    <label for="tax_id" class="block text-sm font-medium text-gray-700 mb-2">
                                        Tax ID Number *
                                    </label>
                                    <input
                                        type="text"
                                        id="tax_id"
                                        name="tax_id"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="123456789012345"
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Documents Upload -->
                        <div class="border-b border-gray-200 pb-6">
                            <h2 class="text-xl font-semibold text-gray-900 mb-4">
                                Required Documents
                            </h2>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="business_license_document" class="block text-sm font-medium text-gray-700 mb-2">
                                        Business License Document
                                    </label>
                                    <input
                                        type="file"
                                        id="business_license_document"
                                        name="business_license_document"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                    <p class="text-xs text-gray-500 mt-1">
                                        PDF, JPG, PNG (Max 5MB)
                                    </p>
                                </div>
                                
                                <div>
                                    <label for="identity_document" class="block text-sm font-medium text-gray-700 mb-2">
                                        Identity Document
                                    </label>
                                    <input
                                        type="file"
                                        id="identity_document"
                                        name="identity_document"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                    <p class="text-xs text-gray-500 mt-1">
                                        PDF, JPG, PNG (Max 5MB)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Terms and Conditions -->
                        <div class="pb-6">
                            <div class="flex items-start">
                                <input
                                    type="checkbox"
                                    id="terms_accepted"
                                    name="terms_accepted"
                                    required
                                    class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                >
                                <label for="terms_accepted" class="mr-3 text-sm text-gray-700">
                                    I agree to the 
                                    <a href="#" class="text-blue-600 hover:text-blue-800 underline">
                                        Terms and Conditions
                                    </a>
                                    and
                                    <a href="#" class="text-blue-600 hover:text-blue-800 underline">
                                        Privacy Policy
                                    </a>
                                    of the platform
                                </label>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <div class="flex justify-center mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                id="submit-btn"
                                class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors min-w-[200px]"
                                style="display: block !important; visibility: visible !important;"
                            >
                                <span id="submit-text">Submit Application</span>
                                <span id="submit-loading" class="hidden">
                                    <i class="fas fa-spinner fa-spin mr-2"></i>
                                    Submitting...
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Initialize the page after DOM is ready with longer delay
    setTimeout(() => {
        initStoreApplicationPage();
    }, 100);
    
    // Also try immediate initialization
    if (document.readyState === 'complete') {
        setTimeout(() => {
            initStoreApplicationPage();
        }, 50);
    }
    
    return page;
}

export function initStoreApplicationPage() {
    // Check if user is logged in with debugging and retry logic
    const isAuth = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    const token = localStorage.getItem('access_token');
    
    console.log('🔐 Store Application Auth Check:', {
        isAuthenticated: isAuth,
        user: user,
        token: !!token,
        tokenLength: token ? token.length : 0
    });
    
    // If not authenticated but token exists, try to restore auth state
    if (!isAuth && token) {
        console.log('🔄 Token exists but not authenticated, attempting to restore state...');
        
        // Try multiple times to restore authentication state
        let retryCount = 0;
        const maxRetries = 3;
        
        const retryAuth = () => {
            retryCount++;
            console.log(`🔄 Retry auth check #${retryCount}...`);
            
            const retryAuthResult = authService.isAuthenticated();
            console.log('🔄 Retry auth result:', retryAuthResult);
            
            if (retryAuthResult) {
                console.log('✅ Authentication restored, proceeding with store application');
                proceedWithStoreApplication();
            } else if (retryCount < maxRetries) {
                console.log(`🔄 Retry ${retryCount}/${maxRetries} failed, trying again...`);
                setTimeout(retryAuth, 300);
            } else {
                console.log('❌ All retries failed, redirecting to login');
                window.location.hash = '#/login';
            }
        };
        
        setTimeout(retryAuth, 200);
        return;
    }
    
    if (!isAuth) {
        console.log('❌ User not authenticated and no token, redirecting to login');
        window.location.hash = '#/login';
        return;
    }
    
    console.log('✅ User authenticated, proceeding with store application');
    proceedWithStoreApplication();
}

function proceedWithStoreApplication() {
    console.log('🔄 Proceeding with store application setup...');

    // Check existing application status
    checkApplicationStatus();

    // Initialize form
    const form = document.getElementById('store-application-form');
    const submitBtn = document.getElementById('submit-btn');
    
    console.log('🔍 Form elements check:');
    console.log('  Form:', form ? 'Found' : 'Not found');
    console.log('  Submit button:', submitBtn ? 'Found' : 'Not found');
    
    if (form) {
        console.log('✅ Adding submit event listener to form');
        form.addEventListener('submit', handleFormSubmit);
    } else {
        console.error('❌ Form not found! Cannot add event listener');
    }
    
    if (submitBtn) {
        console.log('✅ Submit button found and visible');
        console.log('  Button classes:', submitBtn.className);
        console.log('  Button style:', submitBtn.style.cssText);
        console.log('  Button disabled:', submitBtn.disabled);
    } else {
        console.error('❌ Submit button not found!');
    }
    
    // Force show submit button if hidden
    setTimeout(() => {
        const btn = document.getElementById('submit-btn');
        if (btn) {
            btn.style.display = 'block';
            btn.style.visibility = 'visible';
            console.log('🔧 Forced submit button to be visible');
        }
    }, 500);
}

async function checkApplicationStatus() {
    try {
        const application = await storeService.getMyApplication();
        
        if (application) {
            showApplicationStatus(application);
            hideApplicationForm();
        }
    } catch (error) {
        // No application found, show form
        console.log('No existing application found');
    }
}

function showApplicationStatus(application) {
    const statusContainer = document.getElementById('application-status');
    
    let statusColor = 'bg-yellow-100 border-yellow-400 text-yellow-800';
    let statusIcon = 'fas fa-clock';
    let statusMessage = 'Under Review';
    
    switch (application.status) {
        case 'approved':
            statusColor = 'bg-green-100 border-green-400 text-green-800';
            statusIcon = 'fas fa-check-circle';
            statusMessage = 'Your application has been approved! You can now manage your store.';
            break;
        case 'rejected':
            statusColor = 'bg-red-100 border-red-400 text-red-800';
            statusIcon = 'fas fa-times-circle';
            statusMessage = 'Your application has been rejected. You can submit a new application after improving the information.';
            break;
        case 'under_review':
            statusMessage = 'Your application is under review by the management team.';
            break;
        default:
            statusMessage = 'Your application is under review.';
    }
    
    statusContainer.innerHTML = `
        <div class="border-l-4 ${statusColor} p-4 rounded-lg">
            <div class="flex items-center">
                <i class="${statusIcon} text-xl mr-3"></i>
                <div>
                    <h3 class="text-lg font-medium">
                        Store Application Status: ${application.status_display}
                    </h3>
                    <p class="mt-1">${statusMessage}</p>
                    ${application.review_notes ? `
                        <div class="mt-2 p-3 bg-gray-50 rounded">
                            <p class="text-sm font-medium">Management Notes:</p>
                            <p class="text-sm mt-1">${application.review_notes}</p>
                        </div>
                    ` : ''}
                    ${application.status === 'approved' ? `
                        <div class="mt-4">
                            <a href="#/store/dashboard" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Go to Dashboard
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function hideApplicationForm() {
    const formContainer = document.getElementById('application-form');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    console.log('🔄 Form submission started');
    
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    
    if (!submitBtn || !submitText || !submitLoading) {
        console.error('❌ Submit button elements not found');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitLoading.classList.remove('hidden');
    
    try {
        const formData = new FormData(event.target);
        
        console.log('📋 Form data collected:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
            } else {
                console.log(`  ${key}: ${value}`);
            }
        }
        
        // Validate required fields
        const requiredFields = [
            'store_name', 'business_type', 'store_description',
            'business_email', 'business_phone', 'business_address',
            'business_license', 'tax_id'
        ];
        
        console.log('🔍 Validating required fields...');
        for (const field of requiredFields) {
            const value = formData.get(field);
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                console.error(`❌ Missing required field: ${field}`);
                throw new Error(`Field ${field} is required`);
            }
            console.log(`✅ ${field}: OK`);
        }
        
        // Check terms acceptance
        const termsAccepted = formData.get('terms_accepted');
        console.log('🔍 Terms accepted:', termsAccepted);
        if (!termsAccepted) {
            console.error('❌ Terms not accepted');
            throw new Error('You must agree to the Terms and Conditions');
        }
        
        console.log('✅ All validations passed, submitting application...');
        
        // Submit application
        const result = await storeService.submitApplication(formData);
        
        console.log('✅ Application submitted successfully:', result);
        showToast('Your application has been submitted successfully! It will be reviewed within 3-5 business days.', 'success');
        
        // Refresh page to show status
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting application:', error);
        showToast(error.message || 'An error occurred while submitting the application. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
    }
}