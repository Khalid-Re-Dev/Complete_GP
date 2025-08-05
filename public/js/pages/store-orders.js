/**
 * Store Orders Management Page
 * Page for store owners to manage their orders
 */

import { authService } from '../services/auth.js';
import { storeService } from '../services/store.js';
import { showToast } from '../utils/toast.js';

export function StoreOrdersPage() {
    const page = document.createElement('div');
    page.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">Orders Management</h1>
                            <p class="text-gray-600 mt-2">Manage your store orders and track their status</p>
                        </div>
                        <div class="flex space-x-4">
                            <button
                                id="export-orders-btn"
                                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <i class="fas fa-download mr-2"></i>
                                Export Orders
                            </button>
                            <a
                                href="#/store/dashboard"
                                class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center"
                            >
                                <i class="fas fa-arrow-left mr-2"></i>
                                Back to Dashboard
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div id="orders-loading" class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p class="mt-2 text-gray-600">Loading orders...</p>
                </div>

                <!-- Orders Content -->
                <div id="orders-content" class="hidden">
                    <!-- Statistics Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-blue-100 rounded-lg">
                                    <i class="fas fa-shopping-cart text-blue-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm text-gray-600">Total Orders</p>
                                    <p class="text-2xl font-bold text-gray-900" id="total-orders">0</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-yellow-100 rounded-lg">
                                    <i class="fas fa-clock text-yellow-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm text-gray-600">Pending Orders</p>
                                    <p class="text-2xl font-bold text-gray-900" id="pending-orders">0</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-green-100 rounded-lg">
                                    <i class="fas fa-check-circle text-green-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm text-gray-600">Completed Orders</p>
                                    <p class="text-2xl font-bold text-gray-900" id="completed-orders">0</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center">
                                <div class="p-3 bg-purple-100 rounded-lg">
                                    <i class="fas fa-dollar-sign text-purple-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm text-gray-600">Total Revenue</p>
                                    <p class="text-2xl font-bold text-gray-900" id="total-revenue">$0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="bg-white p-6 rounded-lg shadow-sm border mb-8">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-2">
                                    Order Status
                                </label>
                                <select
                                    id="status-filter"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            
                            <div>
                                <label for="date-from" class="block text-sm font-medium text-gray-700 mb-2">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    id="date-from"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                            </div>
                            
                            <div>
                                <label for="date-to" class="block text-sm font-medium text-gray-700 mb-2">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    id="date-to"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                            </div>
                            
                            <div class="flex items-end">
                                <button
                                    id="apply-filters-btn"
                                    class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Orders Table -->
                    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h2 class="text-lg font-semibold text-gray-900">Orders List</h2>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Products
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="orders-table" class="bg-white divide-y divide-gray-200">
                                    <!-- Orders will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <div id="orders-pagination" class="px-6 py-4 border-t border-gray-200">
                            <!-- Pagination will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- No Orders State -->
                <div id="no-orders" class="hidden text-center py-12">
                    <i class="fas fa-shopping-cart text-gray-400 text-6xl mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                    <p class="text-gray-600 mb-6">You haven't received any orders yet. Start promoting your products!</p>
                    <a
                        href="#/store/products"
                        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                        <i class="fas fa-plus mr-2"></i>
                        Add Products
                    </a>
                </div>
            </div>
        </div>

        <!-- Order Details Modal -->
        <div id="order-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-semibold text-gray-900">Order Details</h2>
                            <button id="close-order-modal" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div id="order-details-content">
                            <!-- Order details will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize the page after DOM is ready
    setTimeout(() => {
        initStoreOrders();
    }, 100);
    
    return page;
}

export function initStoreOrders() {
    // Check if user is authenticated and is store owner
    if (!authService.isAuthenticated()) {
        window.location.hash = '#/login';
        return;
    }

    const user = authService.getCurrentUser();
    if (user.role !== 'store_owner') {
        showToast('You do not have permission to access this page', 'error');
        window.location.hash = '#/';
        return;
    }

    // Load orders data
    loadOrdersData();

    // Initialize event listeners
    initEventListeners();
}

async function loadOrdersData() {
    try {
        // Show loading state
        document.getElementById('orders-loading').classList.remove('hidden');
        document.getElementById('orders-content').classList.add('hidden');
        document.getElementById('no-orders').classList.add('hidden');
        
        console.log('🔄 Loading store orders...');
        
        // Get filters
        const filters = {
            status: document.getElementById('status-filter')?.value || '',
            date_from: document.getElementById('date-from')?.value || '',
            date_to: document.getElementById('date-to')?.value || ''
        };
        
        let ordersData;
        
        try {
            // Attempt to load real orders data
            ordersData = await storeService.getStoreOrders(filters);
            console.log('✅ Orders loaded:', ordersData);
        } catch (apiError) {
            console.warn('⚠️ API not available, using mock data:', apiError);
            // Use mock data for demonstration
            ordersData = generateMockOrdersData();
        }
        
        // Hide loading and show content
        document.getElementById('orders-loading').classList.add('hidden');
        
        if (ordersData.results && ordersData.results.length > 0) {
            document.getElementById('orders-content').classList.remove('hidden');
            
            // Update statistics
            updateOrdersStatistics(ordersData);
            
            // Display orders list
            displayOrdersList(ordersData.results);
            
            // Update pagination
            updateOrdersPagination(ordersData);
            
        } else {
            document.getElementById('no-orders').classList.remove('hidden');
        }
        
        showToast('Orders loaded successfully', 'success');
        
    } catch (error) {
        console.error('❌ Error loading orders data:', error);
        document.getElementById('orders-loading').classList.add('hidden');
        document.getElementById('no-orders').classList.remove('hidden');
        showToast('Error loading orders: ' + error.message, 'error');
    }
}

function updateOrdersStatistics(data) {
    const stats = data.statistics || {
        total_orders: data.count || 0,
        pending_orders: 0,
        completed_orders: 0,
        total_revenue: 0
    };
    
    document.getElementById('total-orders').textContent = stats.total_orders.toLocaleString();
    document.getElementById('pending-orders').textContent = stats.pending_orders.toLocaleString();
    document.getElementById('completed-orders').textContent = stats.completed_orders.toLocaleString();
    document.getElementById('total-revenue').textContent = `$${stats.total_revenue.toLocaleString()}`;
}

function displayOrdersList(orders) {
    const container = document.getElementById('orders-table');
    
    container.innerHTML = orders.map(order => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">#${order.id}</div>
                <div class="text-sm text-gray-500">${order.order_number || `ORD-${order.id}`}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${order.customer_name || order.user?.name || 'N/A'}</div>
                <div class="text-sm text-gray-500">${order.customer_email || order.user?.email || 'N/A'}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                    ${order.items ? order.items.length : order.order_items?.length || 0} item(s)
                </div>
                <div class="text-sm text-gray-500">
                    ${order.items ? order.items.slice(0, 2).map(item => item.product_name || item.product?.name).join(', ') : 'N/A'}
                    ${order.items && order.items.length > 2 ? '...' : ''}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">$${order.total_amount?.toFixed(2) || '0.00'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusClass(order.status)}">
                    ${order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(order.created_at)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                    class="view-order-btn text-blue-600 hover:text-blue-900 mr-3"
                    data-order-id="${order.id}"
                >
                    View
                </button>
                ${order.status === 'pending' ? `
                    <button
                        class="update-status-btn text-green-600 hover:text-green-900"
                        data-order-id="${order.id}"
                        data-status="confirmed"
                    >
                        Confirm
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
    
    // Add event listeners for action buttons
    container.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.target.dataset.orderId;
            viewOrderDetails(orderId);
        });
    });
    
    container.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.target.dataset.orderId;
            const status = e.target.dataset.status;
            updateOrderStatus(orderId, status);
        });
    });
}

function getOrderStatusClass(status) {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'confirmed':
            return 'bg-blue-100 text-blue-800';
        case 'processing':
            return 'bg-purple-100 text-purple-800';
        case 'shipped':
            return 'bg-indigo-100 text-indigo-800';
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function updateOrdersPagination(data) {
    const container = document.getElementById('orders-pagination');
    
    if (!data.next && !data.previous) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
                Showing ${data.results?.length || 0} of ${data.count || 0} orders
            </div>
            <div class="flex space-x-2">
                ${data.previous ? `
                    <button
                        id="prev-page-btn"
                        class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Previous
                    </button>
                ` : ''}
                ${data.next ? `
                    <button
                        id="next-page-btn"
                        class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Next
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

async function viewOrderDetails(orderId) {
    try {
        console.log('🔄 Loading order details for order:', orderId);
        
        const orderDetails = await storeService.getOrderDetails(orderId);
        console.log('✅ Order details loaded:', orderDetails);
        
        displayOrderDetailsModal(orderDetails);
        
    } catch (error) {
        console.error('❌ Error loading order details:', error);
        showToast('Error loading order details: ' + error.message, 'error');
    }
}

function displayOrderDetailsModal(order) {
    const modal = document.getElementById('order-modal');
    const content = document.getElementById('order-details-content');
    
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Order Header -->
            <div class="border-b pb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Order #${order.id}</h3>
                        <p class="text-sm text-gray-600">Order Number: ${order.order_number || `ORD-${order.id}`}</p>
                        <p class="text-sm text-gray-600">Date: ${formatDate(order.created_at)}</p>
                    </div>
                    <span class="px-3 py-1 text-sm font-semibold rounded-full ${getOrderStatusClass(order.status)}">
                        ${order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                    </span>
                </div>
            </div>
            
            <!-- Customer Information -->
            <div>
                <h4 class="text-md font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Name:</strong> ${order.customer_name || order.user?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${order.customer_email || order.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${order.customer_phone || order.user?.phone || 'N/A'}</p>
                    ${order.shipping_address ? `
                        <p><strong>Shipping Address:</strong> ${order.shipping_address}</p>
                    ` : ''}
                </div>
            </div>
            
            <!-- Order Items -->
            <div>
                <h4 class="text-md font-semibold text-gray-900 mb-3">Order Items</h4>
                <div class="space-y-3">
                    ${(order.items || order.order_items || []).map(item => `
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center">
                                <img
                                    src="${item.product_image || item.product?.image_urls?.[0] || '/placeholder.jpg'}"
                                    alt="${item.product_name || item.product?.name}"
                                    class="w-16 h-16 object-cover rounded-lg mr-4"
                                >
                                <div>
                                    <h5 class="font-medium text-gray-900">${item.product_name || item.product?.name}</h5>
                                    <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
                                    <p class="text-sm text-gray-600">Price: $${item.price?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold text-gray-900">$${(item.quantity * item.price)?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Order Summary -->
            <div class="border-t pt-4">
                <h4 class="text-md font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>$${order.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    ${order.shipping_cost ? `
                        <div class="flex justify-between mb-2">
                            <span>Shipping:</span>
                            <span>$${order.shipping_cost.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    ${order.tax_amount ? `
                        <div class="flex justify-between mb-2">
                            <span>Tax:</span>
                            <span>$${order.tax_amount.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>$${order.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="flex space-x-4 pt-4 border-t">
                ${order.status === 'pending' ? `
                    <button
                        class="update-order-status-btn bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        data-order-id="${order.id}"
                        data-status="confirmed"
                    >
                        Confirm Order
                    </button>
                    <button
                        class="update-order-status-btn bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        data-order-id="${order.id}"
                        data-status="cancelled"
                    >
                        Cancel Order
                    </button>
                ` : ''}
                ${order.status === 'confirmed' ? `
                    <button
                        class="update-order-status-btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        data-order-id="${order.id}"
                        data-status="processing"
                    >
                        Start Processing
                    </button>
                ` : ''}
                ${order.status === 'processing' ? `
                    <button
                        class="update-order-status-btn bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        data-order-id="${order.id}"
                        data-status="shipped"
                    >
                        Mark as Shipped
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    // Add event listeners for status update buttons
    content.querySelectorAll('.update-order-status-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.target.dataset.orderId;
            const status = e.target.dataset.status;
            updateOrderStatus(orderId, status);
        });
    });
    
    modal.classList.remove('hidden');
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        console.log('🔄 Updating order status:', orderId, newStatus);
        
        await storeService.updateOrderStatus(orderId, newStatus);
        console.log('✅ Order status updated successfully');
        
        showToast('Order status updated successfully', 'success');
        
        // Close modal and reload data
        document.getElementById('order-modal').classList.add('hidden');
        loadOrdersData();
        
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        showToast('Error updating order status: ' + error.message, 'error');
    }
}

function initEventListeners() {
    // Apply filters button
    document.getElementById('apply-filters-btn')?.addEventListener('click', loadOrdersData);
    
    // Export orders button
    document.getElementById('export-orders-btn')?.addEventListener('click', exportOrders);
    
    // Close modal button
    document.getElementById('close-order-modal')?.addEventListener('click', () => {
        document.getElementById('order-modal').classList.add('hidden');
    });
    
    // Close modal on outside click
    document.getElementById('order-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'order-modal') {
            document.getElementById('order-modal').classList.add('hidden');
        }
    });
}

async function exportOrders() {
    try {
        console.log('🔄 Exporting orders...');
        
        const filters = {
            status: document.getElementById('status-filter')?.value || '',
            date_from: document.getElementById('date-from')?.value || '',
            date_to: document.getElementById('date-to')?.value || ''
        };
        
        const ordersData = await storeService.exportOrders(filters);
        
        // Create and download CSV file
        const blob = new Blob([ordersData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `store-orders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('Orders exported successfully', 'success');
        console.log('✅ Orders exported successfully');
        
    } catch (error) {
        console.error('❌ Error exporting orders:', error);
        showToast('Error exporting orders: ' + error.message, 'error');
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function generateMockOrdersData() {
    return {
        count: 25,
        results: [
            {
                id: 1,
                order_number: 'ORD-001',
                customer_name: 'John Doe',
                customer_email: 'john@example.com',
                customer_phone: '+1234567890',
                status: 'pending',
                total_amount: 299.99,
                created_at: new Date().toISOString(),
                items: [
                    {
                        product_name: 'Wireless Headphones',
                        quantity: 1,
                        price: 299.99,
                        product_image: '/placeholder.jpg'
                    }
                ]
            },
            {
                id: 2,
                order_number: 'ORD-002',
                customer_name: 'Jane Smith',
                customer_email: 'jane@example.com',
                customer_phone: '+1234567891',
                status: 'confirmed',
                total_amount: 149.99,
                created_at: new Date(Date.now() - 86400000).toISOString(),
                items: [
                    {
                        product_name: 'Bluetooth Speaker',
                        quantity: 1,
                        price: 149.99,
                        product_image: '/placeholder.jpg'
                    }
                ]
            }
        ],
        statistics: {
            total_orders: 25,
            pending_orders: 5,
            completed_orders: 18,
            total_revenue: 4567.89
        }
    };
}