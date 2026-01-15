import { createElementFromHTML, showToast, formatCurrency } from "../utils/helpers.js"
import { dashboardService, reportsService, productService, authService } from "../services/api.js"
import store from "../state/store.js"

/**
 * Super Admin Dashboard - Comprehensive system management interface
 * Only accessible to users with admin role
 */
export default function SuperAdminDashboard() {
  const { user } = store.getState()

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return createElementFromHTML(`
      <div class="container mx-auto py-8 px-4">
        <div class="text-center">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-shield-exclamation text-red-600 text-3xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p class="text-gray-600 mb-4">You don't have permission to access the Super Admin Dashboard.</p>
          <a href="#/" class="btn btn-primary">
            <i class="fa-solid fa-home mr-2"></i>
            Go Home
          </a>
        </div>
      </div>
    `)
  }

  const page = createElementFromHTML(`
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div class="container mx-auto py-8 px-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold flex items-center gap-3">
                <i class="fa-solid fa-crown"></i>
                Super Admin Dashboard
              </h1>
              <p class="text-purple-100 mt-2">Complete system management and analytics</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-purple-100">Welcome back,</div>
              <div class="text-xl font-semibold">${user.first_name || user.username}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="container mx-auto py-8 px-4">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="stats-cards">
          <!-- Loading stats -->
          <div class="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div class="loader mx-auto mb-2"></div>
            <p class="text-gray-500">Loading stats...</p>
          </div>
        </div>

        <!-- Main Dashboard Tabs -->
        <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
          <!-- Tab Navigation -->
          <div class="border-b border-gray-200">
            <nav class="flex space-x-8 px-6" aria-label="Tabs">
              <button class="dashboard-tab active py-4 px-1 border-b-2 border-purple-500 font-medium text-sm text-purple-600" 
                      data-tab="overview">
                <i class="fa-solid fa-chart-line mr-2"></i>
                Overview
              </button>
              <button class="dashboard-tab py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                      data-tab="users">
                <i class="fa-solid fa-users mr-2"></i>
                User Management
              </button>
              <button class="dashboard-tab py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                      data-tab="stores">
                <i class="fa-solid fa-store mr-2"></i>
                Store Management
              </button>
              <button class="dashboard-tab py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                      data-tab="products">
                <i class="fa-solid fa-box mr-2"></i>
                Product Management
              </button>
              <button class="dashboard-tab py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                      data-tab="analytics">
                <i class="fa-solid fa-chart-bar mr-2"></i>
                Analytics
              </button>
              <button class="dashboard-tab py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                      data-tab="reports">
                <i class="fa-solid fa-file-alt mr-2"></i>
                Reports
              </button>
              <button class="dashboard-tab py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                      data-tab="settings">
                <i class="fa-solid fa-cog mr-2"></i>
                System Settings
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- Overview Tab -->
            <div id="tab-overview" class="tab-content">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- System Health -->
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-heartbeat text-green-600"></i>
                    System Health
                  </h3>
                  <div id="system-health" class="space-y-3">
                    <!-- Will be populated -->
                  </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-clock text-blue-600"></i>
                    Recent Activity
                  </h3>
                  <div id="recent-activity" class="space-y-3">
                    <!-- Will be populated -->
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="mt-8">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <button class="quick-action-btn" onclick="createUser()">
                    <i class="fa-solid fa-user-plus text-2xl mb-2"></i>
                    <span>Add User</span>
                  </button>
                  <button class="quick-action-btn" onclick="approveStore()">
                    <i class="fa-solid fa-store text-2xl mb-2"></i>
                    <span>Approve Store</span>
                  </button>
                  <button class="quick-action-btn" onclick="generateReport()">
                    <i class="fa-solid fa-chart-line text-2xl mb-2"></i>
                    <span>Generate Report</span>
                  </button>
                  <button class="quick-action-btn" onclick="systemBackup()">
                    <i class="fa-solid fa-database text-2xl mb-2"></i>
                    <span>System Backup</span>
                  </button>
                  <button class="quick-action-btn" onclick="clearCache()">
                    <i class="fa-solid fa-broom text-2xl mb-2"></i>
                    <span>Clear Cache</span>
                  </button>
                  <button class="quick-action-btn" onclick="systemLogs()">
                    <i class="fa-solid fa-file-lines text-2xl mb-2"></i>
                    <span>View Logs</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Users Tab -->
            <div id="tab-users" class="tab-content hidden">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-800">User Management</h3>
                <div class="flex gap-3">
                  <button class="btn btn-outline" onclick="exportUsers()">
                    <i class="fa-solid fa-download mr-2"></i>
                    Export Users
                  </button>
                  <button class="btn btn-primary" onclick="createUser()">
                    <i class="fa-solid fa-user-plus mr-2"></i>
                    Add User
                  </button>
                </div>
              </div>

              <!-- Users Table -->
              <div id="users-table" class="overflow-x-auto">
                <div class="text-center py-8">
                  <div class="loader mx-auto mb-4"></div>
                  <p class="text-gray-500">Loading users...</p>
                </div>
              </div>
            </div>

            <!-- Stores Tab -->
            <div id="tab-stores" class="tab-content hidden">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-800">Store Management</h3>
                <div class="flex gap-3">
                  <button class="btn btn-outline" onclick="exportStores()">
                    <i class="fa-solid fa-download mr-2"></i>
                    Export Stores
                  </button>
                  <button class="btn btn-primary" onclick="createStore()">
                    <i class="fa-solid fa-store mr-2"></i>
                    Add Store
                  </button>
                </div>
              </div>

              <!-- Stores Grid -->
              <div id="stores-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="text-center py-8 col-span-full">
                  <div class="loader mx-auto mb-4"></div>
                  <p class="text-gray-500">Loading stores...</p>
                </div>
              </div>
            </div>

            <!-- Products Tab -->
            <div id="tab-products" class="tab-content hidden">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-800">Product Management</h3>
                <div class="flex gap-3">
                  <button class="btn btn-outline" onclick="exportProducts()">
                    <i class="fa-solid fa-download mr-2"></i>
                    Export Products
                  </button>
                  <button class="btn btn-secondary" onclick="bulkActions()">
                    <i class="fa-solid fa-tasks mr-2"></i>
                    Bulk Actions
                  </button>
                </div>
              </div>

              <!-- Product Stats -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-blue-600" id="total-products">0</div>
                  <div class="text-sm text-blue-600">Total Products</div>
                </div>
                <div class="bg-green-50 rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-green-600" id="active-products">0</div>
                  <div class="text-sm text-green-600">Active Products</div>
                </div>
                <div class="bg-yellow-50 rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-yellow-600" id="pending-products">0</div>
                  <div class="text-sm text-yellow-600">Pending Approval</div>
                </div>
                <div class="bg-red-50 rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-red-600" id="out-of-stock">0</div>
                  <div class="text-sm text-red-600">Out of Stock</div>
                </div>
              </div>

              <!-- Products Table -->
              <div id="products-table" class="overflow-x-auto">
                <div class="text-center py-8">
                  <div class="loader mx-auto mb-4"></div>
                  <p class="text-gray-500">Loading products...</p>
                </div>
              </div>
            </div>

            <!-- Analytics Tab -->
            <div id="tab-analytics" class="tab-content hidden">
              <h3 class="text-xl font-semibold text-gray-800 mb-6">System Analytics</h3>
              
              <!-- Analytics Charts -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white border rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-800 mb-4">User Growth</h4>
                  <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <p class="text-gray-500">Chart will be displayed here</p>
                  </div>
                </div>
                <div class="bg-white border rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-800 mb-4">Revenue Trends</h4>
                  <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <p class="text-gray-500">Chart will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reports Tab -->
            <div id="tab-reports" class="tab-content hidden">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-800">System Reports</h3>
                <button class="btn btn-primary" onclick="generateCustomReport()">
                  <i class="fa-solid fa-plus mr-2"></i>
                  Generate Custom Report
                </button>
              </div>

              <!-- Report Types -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow" onclick="generateReport('users')">
                  <div class="flex items-center justify-between mb-4">
                    <i class="fa-solid fa-users text-blue-600 text-2xl"></i>
                    <span class="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">Auto</span>
                  </div>
                  <h4 class="font-semibold text-gray-800 mb-2">User Analytics Report</h4>
                  <p class="text-sm text-gray-600">Comprehensive user behavior and demographics</p>
                </div>

                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow" onclick="generateReport('sales')">
                  <div class="flex items-center justify-between mb-4">
                    <i class="fa-solid fa-chart-line text-green-600 text-2xl"></i>
                    <span class="bg-green-600 text-white px-2 py-1 rounded-full text-xs">Live</span>
                  </div>
                  <h4 class="font-semibold text-gray-800 mb-2">Sales Performance Report</h4>
                  <p class="text-sm text-gray-600">Revenue, orders, and conversion metrics</p>
                </div>

                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow" onclick="generateReport('inventory')">
                  <div class="flex items-center justify-between mb-4">
                    <i class="fa-solid fa-boxes text-purple-600 text-2xl"></i>
                    <span class="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">Daily</span>
                  </div>
                  <h4 class="font-semibold text-gray-800 mb-2">Inventory Report</h4>
                  <p class="text-sm text-gray-600">Stock levels, low inventory alerts</p>
                </div>
              </div>

              <!-- Recent Reports -->
              <div id="recent-reports">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Recent Reports</h4>
                <div class="text-center py-8">
                  <div class="loader mx-auto mb-4"></div>
                  <p class="text-gray-500">Loading recent reports...</p>
                </div>
              </div>
            </div>

            <!-- Settings Tab -->
            <div id="tab-settings" class="tab-content hidden">
              <h3 class="text-xl font-semibold text-gray-800 mb-6">System Settings</h3>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- General Settings -->
                <div class="bg-gray-50 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-800 mb-4">General Settings</h4>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                      <input type="text" value="Best on Click" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                      <textarea rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">Your one-stop shop for everything</textarea>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-700">Maintenance Mode</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Security Settings -->
                <div class="bg-gray-50 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-800 mb-4">Security Settings</h4>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" checked>
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-700">Login Attempts Limit</span>
                      <input type="number" value="5" min="1" max="10" class="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-700">Session Timeout (minutes)</span>
                      <input type="number" value="30" min="5" max="120" class="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Save Settings -->
              <div class="mt-8 text-center">
                <button class="btn btn-primary" onclick="saveSettings()">
                  <i class="fa-solid fa-save mr-2"></i>
                  Save All Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `)

  // Initialize dashboard
  initializeSuperAdminDashboard(page)

  return page
}

function initializeSuperAdminDashboard(page) {
  // Initialize tab switching
  initializeTabSwitching(page)
  
  // Load initial data
  loadDashboardStats(page)
  loadSystemHealth(page)
  loadRecentActivity(page)
  
  // Setup global functions
  setupGlobalFunctions()
}

function initializeTabSwitching(page) {
  const tabs = page.querySelectorAll('.dashboard-tab')
  const tabContents = page.querySelectorAll('.tab-content')

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab

      // Update tab appearance
      tabs.forEach(t => {
        t.classList.remove('active', 'border-purple-500', 'text-purple-600')
        t.classList.add('border-transparent', 'text-gray-500')
      })
      tab.classList.add('active', 'border-purple-500', 'text-purple-600')
      tab.classList.remove('border-transparent', 'text-gray-500')

      // Show/hide content
      tabContents.forEach(content => {
        content.classList.add('hidden')
      })
      const targetContent = page.querySelector(`#tab-${targetTab}`)
      if (targetContent) {
        targetContent.classList.remove('hidden')
      }

      // Load tab-specific content
      loadTabContent(targetTab, page)
    })
  })
}

async function loadDashboardStats(page) {
  try {
    // Mock stats - in real app, this would come from API
    const stats = {
      totalUsers: 1250,
      totalStores: 45,
      totalProducts: 3420,
      totalRevenue: 125000
    }

    const statsContainer = page.querySelector('#stats-cards')
    statsContainer.innerHTML = `
      <div class="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div class="text-3xl font-bold text-blue-600 mb-2">${stats.totalUsers.toLocaleString()}</div>
        <div class="text-sm text-gray-600">Total Users</div>
        <div class="text-xs text-green-600 mt-1">↗ +12% this month</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div class="text-3xl font-bold text-green-600 mb-2">${stats.totalStores}</div>
        <div class="text-sm text-gray-600">Active Stores</div>
        <div class="text-xs text-green-600 mt-1">↗ +3 new stores</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div class="text-3xl font-bold text-purple-600 mb-2">${stats.totalProducts.toLocaleString()}</div>
        <div class="text-sm text-gray-600">Total Products</div>
        <div class="text-xs text-blue-600 mt-1">↗ +156 this week</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div class="text-3xl font-bold text-orange-600 mb-2">${formatCurrency(stats.totalRevenue)}</div>
        <div class="text-sm text-gray-600">Total Revenue</div>
        <div class="text-xs text-green-600 mt-1">↗ +8.5% this month</div>
      </div>
    `
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
  }
}

function loadSystemHealth(page) {
  const healthContainer = page.querySelector('#system-health')
  
  // Mock system health data
  const healthMetrics = [
    { name: 'Database', status: 'healthy', value: '99.9%' },
    { name: 'API Response Time', status: 'healthy', value: '120ms' },
    { name: 'Storage Usage', status: 'warning', value: '78%' },
    { name: 'Cache Hit Rate', status: 'healthy', value: '94%' }
  ]

  healthContainer.innerHTML = healthMetrics.map(metric => `
    <div class="flex items-center justify-between p-3 bg-white rounded border">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full ${getStatusColor(metric.status)}"></div>
        <span class="font-medium text-gray-800">${metric.name}</span>
      </div>
      <span class="text-sm text-gray-600">${metric.value}</span>
    </div>
  `).join('')
}

function loadRecentActivity(page) {
  const activityContainer = page.querySelector('#recent-activity')
  
  // Mock recent activity data
  const activities = [
    { type: 'user', message: 'New user registered: john.doe@email.com', time: '2 minutes ago' },
    { type: 'store', message: 'Store "Tech Paradise" submitted for approval', time: '15 minutes ago' },
    { type: 'product', message: '5 new products added by "Fashion Hub"', time: '1 hour ago' },
    { type: 'system', message: 'System backup completed successfully', time: '2 hours ago' }
  ]

  activityContainer.innerHTML = activities.map(activity => `
    <div class="flex items-start gap-3 p-3 bg-white rounded border">
      <div class="w-8 h-8 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center">
        <i class="fa-solid ${getActivityIcon(activity.type)} text-white text-sm"></i>
      </div>
      <div class="flex-1">
        <p class="text-sm text-gray-800">${activity.message}</p>
        <p class="text-xs text-gray-500 mt-1">${activity.time}</p>
      </div>
    </div>
  `).join('')
}

function loadTabContent(tabName, page) {
  switch (tabName) {
    case 'users':
      loadUsersContent(page)
      break
    case 'stores':
      loadStoresContent(page)
      break
    case 'products':
      loadProductsContent(page)
      break
    case 'reports':
      loadReportsContent(page)
      break
  }
}

function loadUsersContent(page) {
  const usersTable = page.querySelector('#users-table')
  // Mock users data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'store_owner', status: 'active', joined: '2024-01-10' },
    { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', joined: '2024-01-01' }
  ]

  usersTable.innerHTML = `
    <table class="w-full">
      <thead class="bg-gray-50">
        <tr>
          <th class="text-left p-3 font-semibold">User</th>
          <th class="text-left p-3 font-semibold">Role</th>
          <th class="text-left p-3 font-semibold">Status</th>
          <th class="text-left p-3 font-semibold">Joined</th>
          <th class="text-left p-3 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr class="border-b hover:bg-gray-50">
            <td class="p-3">
              <div>
                <div class="font-medium text-gray-800">${user.name}</div>
                <div class="text-sm text-gray-500">${user.email}</div>
              </div>
            </td>
            <td class="p-3">
              <span class="px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}">${user.role}</span>
            </td>
            <td class="p-3">
              <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}">${user.status}</span>
            </td>
            <td class="p-3 text-sm text-gray-600">${user.joined}</td>
            <td class="p-3">
              <div class="flex gap-2">
                <button class="text-blue-600 hover:text-blue-800" onclick="editUser(${user.id})">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-800" onclick="deleteUser(${user.id})">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

function loadStoresContent(page) {
  const storesGrid = page.querySelector('#stores-grid')
  // Mock stores data
  const stores = [
    { id: 1, name: 'Tech Paradise', owner: 'John Smith', status: 'active', products: 45, rating: 4.8 },
    { id: 2, name: 'Fashion Hub', owner: 'Sarah Johnson', status: 'pending', products: 23, rating: 4.5 },
    { id: 3, name: 'Home & Garden', owner: 'Mike Wilson', status: 'active', products: 67, rating: 4.9 }
  ]

  storesGrid.innerHTML = stores.map(store => `
    <div class="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-semibold text-gray-800">${store.name}</h4>
        <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(store.status)}">${store.status}</span>
      </div>
      <div class="space-y-2 text-sm text-gray-600">
        <div class="flex justify-between">
          <span>Owner:</span>
          <span class="font-medium">${store.owner}</span>
        </div>
        <div class="flex justify-between">
          <span>Products:</span>
          <span class="font-medium">${store.products}</span>
        </div>
        <div class="flex justify-between">
          <span>Rating:</span>
          <span class="font-medium text-yellow-600">★ ${store.rating}</span>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button class="btn btn-sm btn-outline flex-1" onclick="viewStore(${store.id})">
          <i class="fa-solid fa-eye mr-1"></i>
          View
        </button>
        <button class="btn btn-sm btn-primary flex-1" onclick="editStore(${store.id})">
          <i class="fa-solid fa-edit mr-1"></i>
          Edit
        </button>
      </div>
    </div>
  `).join('')
}

function loadProductsContent(page) {
  // Update product stats
  const stats = { total: 3420, active: 3156, pending: 45, outOfStock: 219 }
  page.querySelector('#total-products').textContent = stats.total.toLocaleString()
  page.querySelector('#active-products').textContent = stats.active.toLocaleString()
  page.querySelector('#pending-products').textContent = stats.pending
  page.querySelector('#out-of-stock').textContent = stats.outOfStock

  const productsTable = page.querySelector('#products-table')
  // Mock products data
  const products = [
    { id: 1, name: 'iPhone 15 Pro', store: 'Tech Paradise', price: 999, stock: 25, status: 'active' },
    { id: 2, name: 'Summer Dress', store: 'Fashion Hub', price: 89, stock: 0, status: 'out_of_stock' },
    { id: 3, name: 'Garden Tools Set', store: 'Home & Garden', price: 156, stock: 12, status: 'active' }
  ]

  productsTable.innerHTML = `
    <table class="w-full">
      <thead class="bg-gray-50">
        <tr>
          <th class="text-left p-3 font-semibold">Product</th>
          <th class="text-left p-3 font-semibold">Store</th>
          <th class="text-left p-3 font-semibold">Price</th>
          <th class="text-left p-3 font-semibold">Stock</th>
          <th class="text-left p-3 font-semibold">Status</th>
          <th class="text-left p-3 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(product => `
          <tr class="border-b hover:bg-gray-50">
            <td class="p-3 font-medium text-gray-800">${product.name}</td>
            <td class="p-3 text-gray-600">${product.store}</td>
            <td class="p-3 font-medium text-green-600">${formatCurrency(product.price)}</td>
            <td class="p-3 ${product.stock === 0 ? 'text-red-600' : 'text-gray-600'}">${product.stock}</td>
            <td class="p-3">
              <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(product.status)}">${product.status.replace('_', ' ')}</span>
            </td>
            <td class="p-3">
              <div class="flex gap-2">
                <button class="text-blue-600 hover:text-blue-800" onclick="editProduct(${product.id})">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-800" onclick="deleteProduct(${product.id})">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

function loadReportsContent(page) {
  const reportsContainer = page.querySelector('#recent-reports')
  // Mock reports data
  const reports = [
    { id: 1, name: 'Monthly Sales Report', type: 'sales', generated: '2024-01-25', size: '2.3 MB' },
    { id: 2, name: 'User Analytics Report', type: 'users', generated: '2024-01-24', size: '1.8 MB' },
    { id: 3, name: 'Inventory Status Report', type: 'inventory', generated: '2024-01-23', size: '945 KB' }
  ]

  reportsContainer.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left p-3 font-semibold">Report Name</th>
            <th class="text-left p-3 font-semibold">Type</th>
            <th class="text-left p-3 font-semibold">Generated</th>
            <th class="text-left p-3 font-semibold">Size</th>
            <th class="text-left p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map(report => `
            <tr class="border-b hover:bg-gray-50">
              <td class="p-3 font-medium text-gray-800">${report.name}</td>
              <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${getReportTypeColor(report.type)}">${report.type}</span>
              </td>
              <td class="p-3 text-gray-600">${report.generated}</td>
              <td class="p-3 text-gray-600">${report.size}</td>
              <td class="p-3">
                <div class="flex gap-2">
                  <button class="text-blue-600 hover:text-blue-800" onclick="downloadReport(${report.id})">
                    <i class="fa-solid fa-download"></i>
                  </button>
                  <button class="text-green-600 hover:text-green-800" onclick="viewReport(${report.id})">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button class="text-red-600 hover:text-red-800" onclick="deleteReport(${report.id})">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

// Helper functions
function getStatusColor(status) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-red-100 text-red-800',
    out_of_stock: 'bg-red-100 text-red-800',
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function getRoleColor(role) {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    store_owner: 'bg-blue-100 text-blue-800',
    customer: 'bg-gray-100 text-gray-800'
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

function getActivityColor(type) {
  const colors = {
    user: 'bg-blue-500',
    store: 'bg-green-500',
    product: 'bg-purple-500',
    system: 'bg-gray-500'
  }
  return colors[type] || 'bg-gray-500'
}

function getActivityIcon(type) {
  const icons = {
    user: 'fa-user',
    store: 'fa-store',
    product: 'fa-box',
    system: 'fa-cog'
  }
  return icons[type] || 'fa-info'
}

function getReportTypeColor(type) {
  const colors = {
    sales: 'bg-green-100 text-green-800',
    users: 'bg-blue-100 text-blue-800',
    inventory: 'bg-purple-100 text-purple-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

// Global functions for dashboard actions
function setupGlobalFunctions() {
  // Make functions available globally
  window.createUser = () => showToast('Create User functionality would be implemented here', 'info')
  window.editUser = (id) => showToast(`Edit User ${id} functionality would be implemented here`, 'info')
  window.deleteUser = (id) => showToast(`Delete User ${id} functionality would be implemented here`, 'warning')
  window.exportUsers = () => showToast('Export Users functionality would be implemented here', 'info')
  
  window.createStore = () => showToast('Create Store functionality would be implemented here', 'info')
  window.editStore = (id) => showToast(`Edit Store ${id} functionality would be implemented here`, 'info')
  window.viewStore = (id) => showToast(`View Store ${id} functionality would be implemented here`, 'info')
  window.approveStore = () => showToast('Approve Store functionality would be implemented here', 'info')
  window.exportStores = () => showToast('Export Stores functionality would be implemented here', 'info')
  
  window.editProduct = (id) => showToast(`Edit Product ${id} functionality would be implemented here`, 'info')
  window.deleteProduct = (id) => showToast(`Delete Product ${id} functionality would be implemented here`, 'warning')
  window.exportProducts = () => showToast('Export Products functionality would be implemented here', 'info')
  window.bulkActions = () => showToast('Bulk Actions functionality would be implemented here', 'info')
  
  window.generateReport = (type) => showToast(`Generate ${type || 'custom'} Report functionality would be implemented here`, 'info')
  window.generateCustomReport = () => showToast('Generate Custom Report functionality would be implemented here', 'info')
  window.downloadReport = (id) => showToast(`Download Report ${id} functionality would be implemented here`, 'info')
  window.viewReport = (id) => showToast(`View Report ${id} functionality would be implemented here`, 'info')
  window.deleteReport = (id) => showToast(`Delete Report ${id} functionality would be implemented here`, 'warning')
  
  window.systemBackup = () => showToast('System Backup functionality would be implemented here', 'info')
  window.clearCache = () => showToast('Clear Cache functionality would be implemented here', 'info')
  window.systemLogs = () => showToast('System Logs functionality would be implemented here', 'info')
  window.saveSettings = () => showToast('Settings saved successfully!', 'success')
}