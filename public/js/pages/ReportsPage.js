import { createElementFromHTML, showToast, formatCurrency } from "../utils/helpers.js"
import { reportsService } from "../services/api.js"
import store from "../state/store.js"

/**
 * Reports Page - Generate and view various business reports
 */
export default function ReportsPage() {
  const { user } = store.getState()
  
  if (!user || (user.role !== 'store_owner' && user.role !== 'super_admin')) {
    return createElementFromHTML(`
      <div class="container mx-auto py-8 px-4">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-danger mb-4">Access Denied</h1>
          <p class="text-muted">You must be a store owner or admin to access this page.</p>
        </div>
      </div>
    `)
  }

  const page = createElementFromHTML(`
    <div class="container mx-auto py-8 px-4">
      <div class="mb-8">
        <h1 class="text-4xl font-extrabold mb-2">Reports & Analytics</h1>
        <p class="text-muted">Generate comprehensive business reports</p>
      </div>

      <!-- Report Types -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Sales Report -->
        <div class="card">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fa-solid fa-chart-line text-green-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold">Sales Report</h3>
              <p class="text-sm text-muted">Revenue and sales analytics</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex gap-2">
              <select id="sales-period" class="form-control flex-1">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <button id="generate-sales-report" class="btn btn-primary w-full">
              <i class="fa-solid fa-download mr-2"></i>
              Generate Sales Report
            </button>
          </div>
        </div>

        <!-- Products Report -->
        <div class="card">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fa-solid fa-box text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold">Products Report</h3>
              <p class="text-sm text-muted">Product performance analysis</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex gap-2">
              <select id="products-metric" class="form-control flex-1">
                <option value="views">Most Viewed</option>
                <option value="sales">Best Selling</option>
                <option value="rating">Highest Rated</option>
                <option value="inventory">Low Stock</option>
              </select>
            </div>
            <button id="generate-products-report" class="btn btn-primary w-full">
              <i class="fa-solid fa-download mr-2"></i>
              Generate Products Report
            </button>
          </div>
        </div>

        <!-- Customer Report -->
        <div class="card">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fa-solid fa-users text-purple-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold">Customer Report</h3>
              <p class="text-sm text-muted">Customer behavior insights</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex gap-2">
              <select id="customer-metric" class="form-control flex-1">
                <option value="activity">Customer Activity</option>
                <option value="demographics">Demographics</option>
                <option value="retention">Retention Rate</option>
                <option value="lifetime_value">Lifetime Value</option>
              </select>
            </div>
            <button id="generate-customer-report" class="btn btn-primary w-full">
              <i class="fa-solid fa-download mr-2"></i>
              Generate Customer Report
            </button>
          </div>
        </div>

        <!-- Inventory Report -->
        <div class="card">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fa-solid fa-warehouse text-orange-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold">Inventory Report</h3>
              <p class="text-sm text-muted">Stock levels and management</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex gap-2">
              <select id="inventory-type" class="form-control flex-1">
                <option value="current">Current Stock</option>
                <option value="low_stock">Low Stock Alert</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="movement">Stock Movement</option>
              </select>
            </div>
            <button id="generate-inventory-report" class="btn btn-primary w-full">
              <i class="fa-solid fa-download mr-2"></i>
              Generate Inventory Report
            </button>
          </div>
        </div>

        <!-- Financial Report -->
        <div class="card">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fa-solid fa-dollar-sign text-red-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold">Financial Report</h3>
              <p class="text-sm text-muted">Revenue and profit analysis</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex gap-2">
              <select id="financial-period" class="form-control flex-1">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <button id="generate-financial-report" class="btn btn-primary w-full">
              <i class="fa-solid fa-download mr-2"></i>
              Generate Financial Report
            </button>
          </div>
        </div>

        <!-- Custom Report -->
        <div class="card">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fa-solid fa-cog text-gray-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold">Custom Report</h3>
              <p class="text-sm text-muted">Build your own report</p>
            </div>
          </div>
          <div class="space-y-3">
            <button id="create-custom-report" class="btn btn-outline w-full">
              <i class="fa-solid fa-plus mr-2"></i>
              Create Custom Report
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Reports -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold">Recent Reports</h2>
          <button id="refresh-reports" class="btn btn-outline btn-sm">
            <i class="fa-solid fa-refresh mr-2"></i>
            Refresh
          </button>
        </div>
        
        <div id="recent-reports-container">
          <div class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p class="text-muted">Loading recent reports...</p>
          </div>
        </div>
      </div>

      <!-- Report Preview Modal -->
      <div id="report-preview-modal" class="fixed inset-0 z-50 hidden bg-black bg-opacity-50 backdrop-blur-sm">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 class="text-xl font-bold" id="report-modal-title">Report Preview</h3>
              <button id="close-report-modal" class="text-gray-400 hover:text-gray-600">
                <i class="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <div class="p-6 overflow-auto max-h-[calc(90vh-120px)]" id="report-modal-content">
              <!-- Report content will be loaded here -->
            </div>
            <div class="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
              <button id="download-report" class="btn btn-primary">
                <i class="fa-solid fa-download mr-2"></i>
                Download Report
              </button>
              <button id="close-report-modal-btn" class="btn btn-outline">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `)

  // Initialize page functionality
  initializeReportsPage(page)

  // Store page instance globally for error handlers
  window.reportsPageInstance = {
    loadRecentReports: () => loadRecentReports(page)
  }

  return page
}

/**
 * Initialize reports page functionality
 */
function initializeReportsPage(page) {
  // Load recent reports
  loadRecentReports(page)

  // Get current user's store ID
  const currentUser = window.store?.getState()?.user
  const storeId = currentUser?.store_id || currentUser?.stores?.[0]?.id || 1

  // Sales Report (maps to store_performance)
  const salesBtn = page.querySelector('#generate-sales-report')
  if (salesBtn) {
    salesBtn.addEventListener('click', async () => {
      const period = page.querySelector('#sales-period')?.value || 30
      const dateFrom = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const dateTo = new Date().toISOString().split('T')[0]
      await generateReport(page, 'sales', 'store_performance', storeId, dateFrom, dateTo, { period: parseInt(period) })
    })
  }

  // Products Report (maps to product_analysis)
  const productsBtn = page.querySelector('#generate-products-report')
  if (productsBtn) {
    productsBtn.addEventListener('click', async () => {
      const metric = page.querySelector('#products-metric')?.value || 'views'
      const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const dateTo = new Date().toISOString().split('T')[0]
      await generateReport(page, 'products', 'product_analysis', storeId, dateFrom, dateTo, { metric })
    })
  }

  // Customer Report (maps to customer_insights)
  const customerBtn = page.querySelector('#generate-customer-report')
  if (customerBtn) {
    customerBtn.addEventListener('click', async () => {
      const metric = page.querySelector('#customer-metric')?.value || 'activity'
      const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const dateTo = new Date().toISOString().split('T')[0]
      await generateReport(page, 'customers', 'customer_insights', storeId, dateFrom, dateTo, { metric })
    })
  }

  // Inventory Report (maps to financial_summary)
  const inventoryBtn = page.querySelector('#generate-inventory-report')
  if (inventoryBtn) {
    inventoryBtn.addEventListener('click', async () => {
      const type = page.querySelector('#inventory-type')?.value || 'current'
      const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const dateTo = new Date().toISOString().split('T')[0]
      await generateReport(page, 'inventory', 'financial_summary', storeId, dateFrom, dateTo, { type })
    })
  }

  // Financial Report (maps to financial_summary)
  const financialBtn = page.querySelector('#generate-financial-report')
  if (financialBtn) {
    financialBtn.addEventListener('click', async () => {
      const period = page.querySelector('#financial-period')?.value || 'monthly'
      const days = period === 'monthly' ? 30 : period === 'quarterly' ? 90 : 365
      const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const dateTo = new Date().toISOString().split('T')[0]
      await generateReport(page, 'financial', 'financial_summary', storeId, dateFrom, dateTo, { period })
    })
  }

  // Custom Report
  page.querySelector('#create-custom-report').addEventListener('click', () => {
    showCustomReportBuilder(page)
  })

  // Refresh Reports
  page.querySelector('#refresh-reports').addEventListener('click', () => {
    loadRecentReports(page)
  })

  // Modal controls
  page.querySelector('#close-report-modal').addEventListener('click', () => {
    closeReportModal(page)
  })

  page.querySelector('#close-report-modal-btn').addEventListener('click', () => {
    closeReportModal(page)
  })

  page.querySelector('#download-report').addEventListener('click', () => {
    downloadCurrentReport()
  })
}

/**
 * Generate report
 */
async function generateReport(page, frontendType, backendType, storeId, dateFrom, dateTo, params = {}) {
  const button = page.querySelector(`#generate-${frontendType}-report`)
  if (!button) {
    console.error(`Button not found for report type: ${frontendType}`)
    showToast('Report button not found', 'error')
    return
  }
  
  const originalText = button.innerHTML
  
  try {
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Generating...'
    button.disabled = true

    console.log(`Generating ${backendType} report for store ${storeId} from ${dateFrom} to ${dateTo}`)
    
    const reportData = await reportsService.generateReport(
      backendType,
      storeId,
      dateFrom,
      dateTo,
      params
    )
    
    if (reportData) {
      showReportPreview(page, reportData, frontendType)
      showToast('Report generated successfully!', 'success')
      loadRecentReports(page) // Refresh recent reports
    } else {
      showToast('Failed to generate report', 'error')
    }
  } catch (error) {
    console.error('Error generating report:', error)
    showToast('Error generating report: ' + error.message, 'error')
  } finally {
    button.innerHTML = originalText
    button.disabled = false
  }
}

/**
 * Load recent reports
 */
async function loadRecentReports(page) {
  const container = page.querySelector('#recent-reports-container')
  
  try {
    const reports = await reportsService.getReports()
    
    if (reports && reports.length > 0) {
      container.innerHTML = `
        <div class="overflow-x-auto">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Generated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${reports.map(report => `
                <tr>
                  <td class="font-medium">${report.report_type_display || report.report_type}</td>
                  <td>
                    <span class="badge badge-${getReportTypeBadge(report.report_type)}">
                      ${report.report_type_display || report.report_type}
                    </span>
                  </td>
                  <td class="text-muted">${new Date(report.generated_at).toLocaleDateString()}</td>
                  <td>
                    <span class="badge badge-${report.status === 'completed' ? 'success' : 'warning'}">
                      ${report.status}
                    </span>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <button class="btn btn-sm btn-outline" onclick="viewReport('${report.id}')">
                        <i class="fa-solid fa-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-outline" onclick="downloadReport('${report.id}')">
                        <i class="fa-solid fa-download"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    } else {
      container.innerHTML = `
        <div class="text-center py-8">
          <i class="fa-solid fa-file-alt text-4xl text-gray-300 mb-4"></i>
          <p class="text-muted">No reports generated yet</p>
          <p class="text-sm text-muted">Generate your first report using the options above</p>
        </div>
      `
    }
  } catch (error) {
    console.error('Error loading recent reports:', error)
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fa-solid fa-exclamation-triangle text-4xl text-red-300 mb-4"></i>
        <p class="text-muted">Failed to load recent reports</p>
        <button class="btn btn-outline btn-sm mt-2" onclick="window.reportsPageInstance?.loadRecentReports()">
          Try Again
        </button>
      </div>
    `
  }
}

/**
 * Show report preview
 */
function showReportPreview(page, reportData, type) {
  const modal = page.querySelector('#report-preview-modal')
  const title = page.querySelector('#report-modal-title')
  const content = page.querySelector('#report-modal-content')
  
  title.textContent = `${reportData.report_type_display || type.charAt(0).toUpperCase() + type.slice(1)} Report`
  content.innerHTML = formatReportContent(reportData, type)
  
  modal.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
  
  // Store current report data for download
  window.currentReportData = reportData
  window.currentReportType = type
  window.currentReportId = reportData.id
}

/**
 * Close report modal
 */
function closeReportModal(page) {
  const modal = page.querySelector('#report-preview-modal')
  modal.classList.add('hidden')
  document.body.style.overflow = ''
}

/**
 * Format report content for display
 */
function formatReportContent(data, type) {
  // Extract raw_data from backend response
  const reportData = data.raw_data || data
  const aiSummary = data.ai_summary_text || ''
  
  let formattedContent = ''
  
  // Add AI Summary if available
  if (aiSummary) {
    formattedContent += `
      <div class="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 class="font-bold text-blue-800 mb-2">AI Insights</h3>
        <p class="text-blue-700">${aiSummary}</p>
      </div>
    `
  }
  
  // Add formatted data based on type
  switch (type) {
    case 'sales':
      formattedContent += formatSalesReport(reportData)
      break
    case 'products':
      formattedContent += formatProductsReport(reportData)
      break
    case 'customers':
      formattedContent += formatCustomersReport(reportData)
      break
    case 'inventory':
      formattedContent += formatInventoryReport(reportData)
      break
    case 'financial':
      formattedContent += formatFinancialReport(reportData)
      break
    default:
      formattedContent += '<p>Report data not available</p>'
  }
  
  return formattedContent
}

/**
 * Format sales report
 */
function formatSalesReport(data) {
  // Extract performance metrics from backend data structure
  const metrics = data.performance_metrics || {}
  const storeInfo = data.store_info || {}
  const dailyAnalytics = data.daily_analytics || []
  const topProducts = data.top_products || []
  
  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-bold text-green-800">Total Revenue</h4>
          <p class="text-2xl font-bold text-green-600">${formatCurrency(metrics.total_revenue || 0)}</p>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-bold text-blue-800">Total Views</h4>
          <p class="text-2xl font-bold text-blue-600">${metrics.total_views || 0}</p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <h4 class="font-bold text-purple-800">Conversion Rate</h4>
          <p class="text-2xl font-bold text-purple-600">${metrics.avg_conversion_rate || 0}%</p>
        </div>
      </div>
      
      ${topProducts.length > 0 ? `
        <div>
          <h4 class="font-bold mb-4">Top Performing Products</h4>
          <div class="overflow-x-auto">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Views</th>
                  <th>Rating</th>
                  <th>Revenue Estimate</th>
                </tr>
              </thead>
              <tbody>
                ${topProducts.map(product => `
                  <tr>
                    <td class="font-medium">${product.name}</td>
                    <td>${product.views}</td>
                    <td>${product.rating}/5</td>
                    <td>${formatCurrency(product.revenue_estimate || 0)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${dailyAnalytics.length > 0 ? `
        <div>
          <h4 class="font-bold mb-4">Daily Analytics</h4>
          <div class="overflow-x-auto">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Views</th>
                  <th>Revenue</th>
                  <th>Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                ${dailyAnalytics.map(day => `
                  <tr>
                    <td>${new Date(day.date).toLocaleDateString()}</td>
                    <td>${day.views}</td>
                    <td>${formatCurrency(day.revenue)}</td>
                    <td>${day.conversion_rate}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    </div>
  `
}

/**
 * Format products report
 */
function formatProductsReport(data) {
  const products = data.products || []
  const categoryPerformance = data.category_performance || []
  const priceAnalysis = data.price_analysis || {}
  
  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-bold text-blue-800">Total Products</h4>
          <p class="text-2xl font-bold text-blue-600">${data.total_products || 0}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-bold text-green-800">Store Name</h4>
          <p class="text-lg font-bold text-green-600">${data.store_name || 'N/A'}</p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <h4 class="font-bold text-purple-800">Analysis Period</h4>
          <p class="text-sm font-bold text-purple-600">${data.analysis_period || 'N/A'}</p>
        </div>
      </div>
      
      ${products.length > 0 ? `
        <div>
          <h4 class="font-bold mb-4">Product Performance</h4>
          <div class="overflow-x-auto">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Clicks</th>
                  <th>Cart Adds</th>
                  <th>Conversion Rate</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(product => `
                  <tr>
                    <td class="font-medium">${product.name}</td>
                    <td>${product.category}</td>
                    <td>${formatCurrency(product.price || 0)}</td>
                    <td>${product.views || 0}</td>
                    <td>${product.clicks || 0}</td>
                    <td>${product.cart_adds || 0}</td>
                    <td>${product.conversion_rate?.toFixed(2) || 0}%</td>
                    <td>
                      <div class="flex items-center">
                        <span class="mr-1">${product.rating || 0}</span>
                        <i class="fa-solid fa-star text-yellow-400"></i>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : '<p>No product data available</p>'}
    </div>
  `
}

/**
 * Format customers report
 */
function formatCustomersReport(data) {
  const topUsers = data.top_users || []
  const hourlyPatterns = data.hourly_patterns || []
  const actionPatterns = data.action_patterns || []
  const customerSegments = data.customer_segments || []
  
  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-bold text-blue-800">Total Interactions</h4>
          <p class="text-2xl font-bold text-blue-600">${data.total_interactions || 0}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-bold text-green-800">Unique Users</h4>
          <p class="text-2xl font-bold text-green-600">${data.unique_users || 0}</p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <h4 class="font-bold text-purple-800">Store</h4>
          <p class="text-lg font-bold text-purple-600">${data.store_name || 'All Stores'}</p>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg">
          <h4 class="font-bold text-orange-800">Analysis Period</h4>
          <p class="text-sm font-bold text-orange-600">${data.analysis_period || 'N/A'}</p>
        </div>
      </div>
      
      ${topUsers.length > 0 ? `
        <div>
          <h4 class="font-bold mb-4">Top Active Users</h4>
          <div class="overflow-x-auto">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Total Actions</th>
                  <th>Unique Products</th>
                </tr>
              </thead>
              <tbody>
                ${topUsers.slice(0, 10).map(user => `
                  <tr>
                    <td>User ${user.user || 'Anonymous'}</td>
                    <td>${user.total_actions || 0}</td>
                    <td>${user.unique_products || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${actionPatterns.length > 0 ? `
        <div>
          <h4 class="font-bold mb-4">Action Patterns</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${actionPatterns.map(action => `
              <div class="bg-gray-50 p-4 rounded-lg">
                <h5 class="font-bold text-gray-800">${action.action_type}</h5>
                <p class="text-2xl font-bold text-gray-600">${action.count}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `
}

/**
 * Format inventory report
 */
function formatInventoryReport(data) {
  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-bold text-blue-800">Total Products</h4>
          <p class="text-2xl font-bold text-blue-600">${data.total_products || 0}</p>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <h4 class="font-bold text-yellow-800">Low Stock Items</h4>
          <p class="text-2xl font-bold text-yellow-600">${data.low_stock_items || 0}</p>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <h4 class="font-bold text-red-800">Out of Stock</h4>
          <p class="text-2xl font-bold text-red-600">${data.out_of_stock_items || 0}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-bold text-green-800">Total Value</h4>
          <p class="text-2xl font-bold text-green-600">${formatCurrency(data.total_value || 0)}</p>
        </div>
      </div>
    </div>
  `
}

/**
 * Format financial report
 */
function formatFinancialReport(data) {
  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-bold text-green-800">Revenue</h4>
          <p class="text-2xl font-bold text-green-600">${formatCurrency(data.revenue || 0)}</p>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <h4 class="font-bold text-red-800">Expenses</h4>
          <p class="text-2xl font-bold text-red-600">${formatCurrency(data.expenses || 0)}</p>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-bold text-blue-800">Profit</h4>
          <p class="text-2xl font-bold text-blue-600">${formatCurrency(data.profit || 0)}</p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <h4 class="font-bold text-purple-800">Profit Margin</h4>
          <p class="text-2xl font-bold text-purple-600">${data.profit_margin || 0}%</p>
        </div>
      </div>
    </div>
  `
}

/**
 * Get badge color for report type
 */
function getReportTypeBadge(type) {
  const badges = {
    sales: 'success',
    products: 'primary',
    customers: 'info',
    inventory: 'warning',
    financial: 'danger'
  }
  return badges[type] || 'secondary'
}

/**
 * Download current report
 */
function downloadCurrentReport() {
  if (window.currentReportData && window.currentReportType) {
    // Create downloadable content
    const content = formatReportForDownload(window.currentReportData, window.currentReportType)
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${window.currentReportType}-report-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showToast('Report downloaded successfully!', 'success')
  }
}

/**
 * Format report for download
 */
function formatReportForDownload(data, type) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${type.charAt(0).toUpperCase() + type.slice(1)} Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .summary-item { flex: 1; padding: 15px; background: #f9f9f9; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${type.charAt(0).toUpperCase() + type.slice(1)} Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      ${formatReportContent(data, type)}
    </body>
    </html>
  `
}







/**
 * Show custom report builder
 */
function showCustomReportBuilder(page) {
  showToast('Custom report builder coming soon!', 'info')
}

// Global functions for report actions
window.viewReport = async function(reportId) {
  try {
    const reportData = await reportsService.getReport(reportId)
    // Show report in modal
    showToast('Report loaded successfully!', 'success')
  } catch (error) {
    showToast('Failed to load report', 'error')
  }
}

window.downloadReport = async function(reportId) {
  try {
    // Create a temporary link to trigger download
    const downloadUrl = `${window.API_BASE_URL}/reports/${reportId}/download/`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `report_${reportId}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showToast('Report download started!', 'success')
  } catch (error) {
    console.error('Download error:', error)
    showToast('Failed to download report', 'error')
  }
}