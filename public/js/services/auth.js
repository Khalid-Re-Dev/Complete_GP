/**
 * Authentication Service for Best on Click
 * Handles user authentication, login, logout, and session management
 */

class AuthService {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/auth';
        this.currentUser = null;
        this.token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refreshToken');
        
        // Initialize user from stored data
        this.initializeUser();
        
        console.log('🔧 AuthService initialized:', {
            hasToken: !!this.token,
            hasRefreshToken: !!this.refreshToken,
            hasUser: !!this.currentUser
        });
    }

    /**
     * Initialize user from stored authentication data
     */
    initializeUser() {
        const storedUser = localStorage.getItem('currentUser');
        console.log('🔄 Initializing user from storage:', { 
            hasStoredUser: !!storedUser, 
            hasToken: !!this.token,
            storedUserData: storedUser 
        });
        
        if (storedUser && storedUser !== 'null' && this.token) {
            try {
                this.currentUser = JSON.parse(storedUser);
                console.log('✅ User initialized successfully:', this.currentUser);
                // Don't validate token on initialization to avoid async issues
                // this.validateToken();
            } catch (error) {
                console.error('❌ Error parsing stored user data:', error);
                this.logout();
            }
        } else {
            console.log('⚠️ No valid user data or token found in storage');
        }
    }

    /**
     * Validate current token
     */
    async validateToken() {
        if (!this.token) return false;

        try {
            const response = await fetch(`${this.baseURL}/validate/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                await this.refreshAuthToken();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    /**
     * Login user with email and password
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.access;
                this.refreshToken = data.refresh;
                this.currentUser = data.user;

                // Store in localStorage (both formats for compatibility)
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('access_token', this.token); // For compatibility
                localStorage.setItem('refreshToken', this.refreshToken);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                // Sync with store state
                if (window.store) {
                    window.store.setState({
                        isAuthenticated: true,
                        token: this.token,
                        user: this.currentUser
                    });
                    console.log('🔄 Synced authService with store state');
                }

                // Dispatch login event
                window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                    detail: this.currentUser 
                }));

                // Handle store owner specific routing
                const storeOwnerResult = await this.handleStoreOwnerLogin(this.currentUser);
                
                return { 
                    success: true, 
                    user: this.currentUser,
                    storeOwnerHandling: storeOwnerResult
                };
            } else {
                return { 
                    success: false, 
                    error: data.message || 'فشل في تسجيل الدخول' 
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: 'خطأ في الاتصال بالخادم' 
            };
        }
    }

    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                // If registration includes auto-login (tokens returned)
                if (data.tokens && data.user) {
                    console.log('🎉 Registration with auto-login successful:', data);
                    
                    // Set auth state immediately
                    this.token = data.tokens.access;
                    this.refreshToken = data.tokens.refresh;
                    this.currentUser = data.user;
                    
                    // Store in localStorage (both formats)
                    localStorage.setItem('authToken', this.token);
                    localStorage.setItem('access_token', this.token);
                    localStorage.setItem('refreshToken', this.refreshToken);
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    
                    // Sync with store state
                    if (window.store) {
                        window.store.setState({
                            isAuthenticated: true,
                            token: this.token,
                            user: this.currentUser
                        });
                        console.log('🔄 Synced registration with store state');
                    }
                    
                    return { 
                        success: true, 
                        message: 'Registration successful!',
                        tokens: data.tokens,
                        user: data.user
                    };
                } else {
                    // Registration successful but no auto-login
                    return { 
                        success: true, 
                        message: 'Registration successful! Please log in.' 
                    };
                }
            } else {
                return { 
                    success: false, 
                    error: data.message || 'Registration failed' 
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                error: 'خطأ في الاتصال بالخادم' 
            };
        }
    }

    /**
     * Handle post-login routing for store owners
     */
    async handleStoreOwnerLogin(user) {
        if (user.role !== 'store_owner') {
            return; // Not a store owner, no special handling needed
        }

        try {
            // Import storeService dynamically to avoid circular imports
            const { storeService } = await import('./store.js');
            const storeStatus = await storeService.checkUserStoreStatus(user.id);
            
            if (storeStatus.needsStoreCreation) {
                // Redirect to store application page
                window.location.hash = '#/store/apply';
                
                // Import and show notification
                const { showInfo } = await import('../utils/toast.js');
                showInfo('مرحباً! يرجى إنشاء متجرك أولاً للبدء في البيع على منصتنا');
                
                return { redirected: true, reason: 'needs_store_creation' };
            } else {
                // Redirect to store dashboard
                window.location.hash = '#/store/dashboard';
                
                // Import and show notification
                const { showSuccess } = await import('../utils/toast.js');
                showSuccess(`مرحباً بعودتك إلى متجر ${storeStatus.primaryStore.name}`);
                
                return { redirected: true, reason: 'has_store' };
            }
        } catch (error) {
            console.error('Error handling store owner login:', error);
            // Fallback to store application page
            window.location.hash = '#/store/apply';
            return { redirected: true, reason: 'error_fallback' };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            if (this.token) {
                await fetch(`${this.baseURL}/logout/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refresh: this.refreshToken })
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all stored data
            this.token = null;
            this.refreshToken = null;
            this.currentUser = null;
            
            localStorage.removeItem('authToken');
            localStorage.removeItem('access_token'); // Remove both formats
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('user'); // Legacy support
            localStorage.removeItem('token'); // Legacy support

            // Sync with store state
            if (window.store) {
                window.store.setState({
                    isAuthenticated: false,
                    token: null,
                    user: null
                });
                console.log('🔄 Synced logout with store state');
            }

            // Dispatch logout event
            window.dispatchEvent(new CustomEvent('userLoggedOut'));
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshAuthToken() {
        if (!this.refreshToken) {
            this.logout();
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: this.refreshToken })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.access;
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('access_token', this.token); // For compatibility
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        // If user not in memory, try to restore from localStorage
        if (!this.currentUser) {
            try {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser && storedUser !== 'null') {
                    this.currentUser = JSON.parse(storedUser);
                    console.log('🔄 Restored user in getCurrentUser:', this.currentUser);
                }
            } catch (error) {
                console.error('❌ Error parsing stored user in getCurrentUser:', error);
            }
        }
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        // Check both token formats for compatibility
        const authToken = this.token || localStorage.getItem('authToken') || localStorage.getItem('access_token');
        let user = this.currentUser;
        
        // Try to restore user from localStorage if not in memory
        if (!user) {
            try {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser && storedUser !== 'null') {
                    user = JSON.parse(storedUser);
                    console.log('🔄 Restored user from localStorage:', user);
                }
            } catch (error) {
                console.error('❌ Error parsing stored user:', error);
                user = null;
            }
        }
        
        // Update internal state if needed
        if (authToken && !this.token) {
            this.token = authToken;
            console.log('🔄 Restored token to memory');
        }
        if (user && !this.currentUser) {
            this.currentUser = user;
            console.log('🔄 Restored user to memory');
        }
        
        const isAuth = !!(authToken && user);
        console.log('🔐 Auth check:', { 
            hasToken: !!authToken, 
            hasUser: !!user, 
            isAuthenticated: isAuth,
            userRole: user?.role,
            tokenLength: authToken ? authToken.length : 0,
            userEmail: user?.email
        });
        
        // Sync with store if authenticated and store exists
        if (isAuth && window.store) {
            const storeState = window.store.getState();
            if (!storeState.isAuthenticated || !storeState.user) {
                console.log('🔄 Store out of sync, updating...');
                window.store.setState({
                    isAuthenticated: true,
                    token: authToken,
                    user: user
                });
            }
        }
        
        return isAuth;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles) {
        return this.currentUser && roles.includes(this.currentUser.role);
    }

    /**
     * Get authorization header
     */
    getAuthHeader() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    /**
     * Make authenticated API request
     */
    async authenticatedRequest(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...this.getAuthHeader(),
            ...options.headers
        };

        try {
            let response = await fetch(url, {
                ...options,
                headers
            });

            // If token expired, try to refresh
            if (response.status === 401) {
                const refreshed = await this.refreshAuthToken();
                if (refreshed) {
                    headers.Authorization = `Bearer ${this.token}`;
                    response = await fetch(url, {
                        ...options,
                        headers
                    });
                } else {
                    throw new Error('Authentication failed');
                }
            }

            return response;
        } catch (error) {
            console.error('Authenticated request error:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(profileData) {
        try {
            const response = await this.authenticatedRequest(`${this.baseURL}/profile/`, {
                method: 'PATCH',
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = { ...this.currentUser, ...data };
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
                    detail: this.currentUser 
                }));

                return { success: true, user: this.currentUser };
            } else {
                return { 
                    success: false, 
                    error: data.message || 'فشل في تحديث الملف الشخصي' 
                };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return { 
                success: false, 
                error: 'خطأ في الاتصال بالخادم' 
            };
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await this.authenticatedRequest(`${this.baseURL}/change-password/`, {
                method: 'POST',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
            } else {
                return { 
                    success: false, 
                    error: data.message || 'فشل في تغيير كلمة المرور' 
                };
            }
        } catch (error) {
            console.error('Password change error:', error);
            return { 
                success: false, 
                error: 'خطأ في الاتصال بالخادم' 
            };
        }
    }

    /**
     * Request password reset
     */
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${this.baseURL}/password-reset/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, message: 'تم إرسال رابط إعادة تعيين كلمة المرور' };
            } else {
                return { 
                    success: false, 
                    error: data.message || 'فشل في إرسال رابط إعادة التعيين' 
                };
            }
        } catch (error) {
            console.error('Password reset error:', error);
            return { 
                success: false, 
                error: 'خطأ في الاتصال بالخادم' 
            };
        }
    }

    /**
     * Mock login for development
     */
    mockLogin(userType = 'customer') {
        const mockUsers = {
            customer: {
                id: 1,
                email: 'customer@example.com',
                name: 'عميل تجريبي',
                role: 'customer',
                avatar: null
            },
            store_owner: {
                id: 2,
                email: 'store@example.com',
                name: 'صاحب متجر',
                role: 'store_owner',
                avatar: null,
                store_id: 1
            },
            admin: {
                id: 3,
                email: 'admin@example.com',
                name: 'مدير النظام',
                role: 'admin',
                avatar: null
            }
        };

        this.currentUser = mockUsers[userType];
        this.token = 'mock-token-' + Date.now();
        
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
            detail: this.currentUser 
        }));

        return { success: true, user: this.currentUser };
    }
}

// Create and export singleton instance
const authService = new AuthService();

// Global access for debugging
window.authService = authService;

export { authService };
export default authService;