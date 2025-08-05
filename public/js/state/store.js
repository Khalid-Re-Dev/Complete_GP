/**
 * A simple centralized state management object (store).
 * It holds the application's global state and notifies observers of changes.
 */
const store = {
  state: {
    isAuthenticated: false,
    user: null, // { username, email, role, etc. }
    token: null,
    cart: [],
  },
  observers: [],

  /**
   * Initializes the state from localStorage.
   * This allows the user's session to persist across page reloads.
   */
  initState() {
    console.log('🔄 Store initializing state from localStorage...');
    
    // Check for authService token formats
    const authToken = localStorage.getItem("authToken") || localStorage.getItem("access_token")
    const currentUser = localStorage.getItem("currentUser") || localStorage.getItem("user")
    
    console.log('🔍 Store init check:', {
      hasAuthToken: !!authToken,
      hasCurrentUser: !!currentUser,
      authTokenLength: authToken ? authToken.length : 0,
      currentUserData: currentUser
    });

    if (authToken && currentUser && currentUser !== 'null') {
      try {
        const userData = JSON.parse(currentUser);
        this.state.isAuthenticated = true
        this.state.token = authToken
        this.state.user = userData
        
        console.log('✅ Store state initialized successfully:', {
          isAuthenticated: this.state.isAuthenticated,
          userRole: userData.role,
          userEmail: userData.email
        });
      } catch (error) {
        console.error('❌ Error parsing user data in store:', error);
        this.clearState();
      }
    } else {
      console.log('⚠️ No valid auth data found, clearing store state');
      this.clearState();
    }
    
    this.notifyObservers()
  },

  /**
   * Clear authentication state
   */
  clearState() {
    this.state.isAuthenticated = false;
    this.state.user = null;
    this.state.token = null;
    console.log('🧹 Store state cleared');
  },

  /**
   * Returns the current state.
   * @returns {object} The current state object.
   */
  getState() {
    return this.state
  },

  /**
   * Updates the state with new values and notifies observers.
   * @param {object} newState - An object with the new state values.
   */
  setState(newState) {
    console.log('🔄 Store setState called with:', newState);
    this.state = { ...this.state, ...newState }

    // Persist auth state to localStorage (compatible with authService)
    if (newState.token !== undefined) {
      if (newState.token) {
        // Store in both formats for compatibility
        localStorage.setItem("authToken", newState.token)
        localStorage.setItem("access_token", newState.token)
        localStorage.setItem("token", newState.token) // Legacy support
        console.log('💾 Token saved to localStorage');
      } else {
        localStorage.removeItem("authToken")
        localStorage.removeItem("access_token")
        localStorage.removeItem("token")
        console.log('🗑️ Token removed from localStorage');
      }
    }
    if (newState.user !== undefined) {
      if (newState.user) {
        // Store in both formats for compatibility
        localStorage.setItem("currentUser", JSON.stringify(newState.user))
        localStorage.setItem("user", JSON.stringify(newState.user)) // Legacy support
        console.log('💾 User data saved to localStorage');
      } else {
        localStorage.removeItem("currentUser")
        localStorage.removeItem("user")
        console.log('🗑️ User data removed from localStorage');
      }
    }
    if (newState.isAuthenticated === false) {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }

    this.notifyObservers()
  },

  /**
   * Adds an observer function to be called on state changes.
   * @param {function} observer - The function to be called.
   */
  addObserver(observer) {
    this.observers.push(observer)
  },

  /**
   * Calls all registered observer functions.
   */
  notifyObservers() {
    this.observers.forEach((observer) => observer(this.state))
  },
}

export default store
