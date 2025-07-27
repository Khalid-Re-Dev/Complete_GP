// ComparePage.js
// Displays a comparison table for multiple products with the same name,
// fetched based on a single product ID/slug from the URL.

export default function ComparePage() {
    const container = document.createElement('div');
    container.className = 'compare-page container py-8 px-4'; // Added px-4 for horizontal padding
    container.innerHTML = `
<<<<<<< Updated upstream
        <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">مقارنة المنتجات المتشابهة</h1>
        <div id="loading-spinner" class="text-center text-gray-500 mt-6">
            <svg class="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2 text-lg">جاري تحميل المنتجات للمقارنة...</p>
        </div>
        <div id="compare-result-table" class="mt-6"></div>
        <div id="ai-analysis" class="mt-8"></div>
    `;

    const resultTableDiv = container.querySelector('#compare-result-table');
    const aiDiv = container.querySelector('#ai-analysis');
    const loadingSpinner = container.querySelector('#loading-spinner');

    let productIdentifier = null; // Can be ID or Slug

    // Determine the product identifier from URL query parameters or hash
    if (typeof arguments[0] === 'object' && arguments[0] && arguments[0].query) {
        const queryParams = new URLSearchParams(arguments[0].query);
        productIdentifier = queryParams.get('product');
    } else {
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        productIdentifier = hashParams.get('product');
    }

    // If no product identifier is found, display an error message
    if (!productIdentifier) {
        loadingSpinner.remove();
        resultTableDiv.innerHTML = `
            <p class='text-red-600 text-center bg-red-100 p-4 rounded-lg border border-red-200'>
                <i class="fas fa-exclamation-circle ml-2"></i> يرجى اختيار منتج واحد على الأقل للمقارنة عبر صفحة المنتجات.
            </p>`;
        return container;
    }

    // Fetch product data from the backend
    // This assumes your backend endpoint /api/comparisons/products/{id_or_slug}/
    // now returns an array of products with the same name.
    fetch(`http://localhost:8000/api/comparisons/products/${productIdentifier}/`)
        .then(res => {
            if (!res.ok) {
                // Handle HTTP errors (e.g., 404, 500)
                return res.json().then(err => Promise.reject(err));
            }
            return res.json();
        })
        .then(productsList => {
            loadingSpinner.remove(); // Remove spinner once data is received

            // Check if the response indicates an error from the backend
            if (productsList.error) {
                resultTableDiv.innerHTML = `
                    <p class='text-red-600 text-center bg-red-100 p-4 rounded-lg border border-red-200'>
                        <i class="fas fa-times-circle ml-2"></i> ${productsList.error}
                    </p>`;
                aiDiv.innerHTML = ''; // Clear any previous AI analysis
                return;
            }

            // Ensure productsList is an array and contains products
            if (!Array.isArray(productsList) || productsList.length === 0) {
                resultTableDiv.innerHTML = `
                    <p class='text-orange-600 text-center bg-orange-100 p-4 rounded-lg border border-orange-200'>
                        <i class="fas fa-info-circle ml-2"></i> لم يتم العثور على منتجات متشابهة للمقارنة.
                    </p>`;
                aiDiv.innerHTML = '';
                return;
            }

            // Build the comparison table dynamically
            let tableHtml = `
                <div class='flex justify-center'>
                    <div class='overflow-x-auto w-full max-w-5xl rounded-lg shadow-lg'>
                        <table class='min-w-full bg-white'>
                            <thead class="bg-blue-600 text-white">
                                <tr class="text-left">
                                    <th class="py-3 px-4 rounded-tl-lg">الميزة</th>
                                    ${productsList.map(p => `<th class="py-3 px-4 text-center">${p.name}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody class='text-gray-700 text-sm font-light'>`;

            // Define the features to compare
            const features = [
                { key: 'image_url', label: 'الصورة', type: 'image' },
                { key: 'store_name', label: 'المتجر', type: 'text' },
                { key: 'price', label: 'السعر الأصلي', type: 'currency' },
                { key: 'final_price', label: 'السعر النهائي', type: 'currency-bold' },
                { key: 'average_rating', label: 'التقييم', type: 'rating' },
                { key: 'stock_quantity', label: 'الكمية المتوفرة', type: 'text' },
                { key: 'product_url', label: 'الرابط', type: 'link' },
                { key: 'description', label: 'الوصف', type: 'text-long' },
                // Add more features as needed
            ];

            features.forEach(feature => {
                tableHtml += `<tr class='border-b border-gray-200 hover:bg-gray-100'>`;
                tableHtml += `<td class='py-3 px-4 font-medium text-gray-800'>${feature.label}</td>`;
                productsList.forEach(p => {
                    let value = p[feature.key];
                    let displayValue = '-';
                    let cellClass = 'py-3 px-4 text-center';

                    switch (feature.type) {
                        case 'image':
                            const imageUrl = (p.images && p.images[0] && p.images[0].image) || (p.image_urls && p.image_urls[0]) || '/public/placeholder.jpg';
                            displayValue = `<img src='${imageUrl}' alt='${p.name}' class='w-16 h-16 object-contain mx-auto rounded-lg shadow-sm'>`;
                            break;
                        case 'text':
                            displayValue = value || '-';
                            if (feature.key === 'store_name') {
                                displayValue = p.store ? p.store.name : 'متجر غير معروف';
                            }
                            break;
                        case 'currency':
                            displayValue = value ? `${parseFloat(value).toFixed(2)}` : '-';
                            cellClass += ' line-through text-gray-500';
                            break;
                        case 'currency-bold':
                            displayValue = value ? `${parseFloat(value).toFixed(2)} <span class="text-xs text-gray-500">ريال</span>` : '-';
                            cellClass += ' font-bold text-green-700 text-base';
                            break;
                        case 'rating':
                            displayValue = value ? `${parseFloat(value).toFixed(1)} <i class="fas fa-star text-yellow-400"></i>` : '-';
                            break;
                        case 'link':
                            displayValue = value ? `<a href="${value}" target="_blank" class="text-blue-600 hover:text-blue-800 hover:underline transition duration-300">عرض المنتج <i class="fas fa-external-link-alt text-xs ml-1"></i></a>` : '-';
                            break;
                        case 'text-long':
                            displayValue = value ? `<div class="max-h-20 overflow-y-auto text-xs text-gray-600 text-right">${value}</div>` : '-';
                            cellClass += ' text-right'; // Align description to right for Arabic
                            break;
                        default:
                            displayValue = value || '-';
                    }
                    tableHtml += `<td class='${cellClass}'>${displayValue}</td>`;
                });
                tableHtml += `</tr>`;
            });


            productsList.forEach(p => {
                // This loop is no longer needed as features are iterated over
            });

            tableHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>`;
            resultTableDiv.innerHTML = tableHtml;

            // --- AI Comparison Request (Optional but recommended for full comparison) ---
            // To get AI analysis, we need to make a POST request to the /api/comparisons/products/ endpoint
            // using the IDs of the products we just fetched.
            const productIdsForAI = productsList.map(p => p.id);
            if (productIdsForAI.length > 1) { // AI comparison makes sense with at least 2 products
                aiDiv.innerHTML = `<div class='text-center text-gray-500 mt-6'><i class="fas fa-robot animate-pulse text-xl"></i><p class="mt-2 text-lg">جاري توليد تحليل مقارنة بالذكاء الاصطناعي...</p></div>`;

                fetch('http://localhost:8000/api/comparisons/products/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // If authentication is required for POST requests:
                        // 'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Example for JWT token
                    },
                    body: JSON.stringify({
                        product_ids: productIdsForAI,
                        // You can customize criteria here or let the backend use defaults
                        criteria: ["السعر", "المواصفات", "المتجر", "التقييمات"],
                        include_ai_recommendation: true
                    })
                })
                .then(aiRes => {
                    if (!aiRes.ok) {
                        return aiRes.json().then(err => Promise.reject(err));
                    }
                    return aiRes.json();
                })
                .then(aiComparisonResult => {
                    if (aiComparisonResult.error) {
                        aiDiv.innerHTML = `
                            <p class='text-red-600 text-center bg-red-100 p-4 rounded-lg border border-red-200 mt-6'>
                                <i class="fas fa-times-circle ml-2"></i> خطأ في تحليل الذكاء الاصطناعي: ${aiComparisonResult.error}
                            </p>`;
                    } else {
                        aiDiv.innerHTML = `
                            <div class="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-6 max-w-3xl mx-auto shadow-md">
                                <h2 class="font-bold mb-3 text-xl text-blue-800"><i class="fas fa-brain mr-2"></i> نتيجة المقارنة الذكية</h2>
                                <div class="mb-3 text-gray-700"><b>المعايير:</b> ${Array.isArray(aiComparisonResult.comparison_criteria) ? aiComparisonResult.comparison_criteria.join(', ') : aiComparisonResult.comparison_criteria || 'غير محددة'}</div>
                                <div class="text-gray-800"><b>تحليل الذكاء الاصطناعي:</b>
                                    <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed p-3 bg-white border border-gray-200 rounded-md mt-2">${aiComparisonResult.ai_analysis || 'لا يوجد تحليل متاح.'}</pre>
                                </div>
                                ${aiComparisonResult.ai_recommendation ? `
                                    <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <h3 class="font-bold text-orange-700"><i class="fas fa-lightbulb mr-2"></i> توصية:</h3>
                                        <p class="text-sm text-gray-800">${aiComparisonResult.ai_recommendation}</p>
                                    </div>
                                ` : ''}
                            </div>`;
                    }
                })
                .catch(aiError => {
                    console.error("Error fetching AI comparison:", aiError);
                    aiDiv.innerHTML = `
                        <p class='text-red-600 text-center bg-red-100 p-4 rounded-lg border border-red-200 mt-6'>
                            <i class="fas fa-times-circle ml-2"></i> حدث خطأ أثناء جلب تحليل الذكاء الاصطناعي.
                        </p>`;
                });
            } else {
                aiDiv.innerHTML = `
                    <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-6 max-w-3xl mx-auto text-center text-orange-800">
                        <i class="fas fa-info-circle ml-2"></i> لا يوجد عدد كافٍ من المنتجات (يلزم منتجان على الأقل) لتوليد تحليل مقارنة شامل بالذكاء الاصطناعي.
                    </div>`;
            }

        })
        .catch(error => {
            loadingSpinner.remove(); // Remove spinner on any error
            console.error("Error fetching comparison data:", error);
            resultTableDiv.innerHTML = `
                <p class='text-red-600 text-center bg-red-100 p-4 rounded-lg border border-red-200'>
                    <i class="fas fa-times-circle ml-2"></i> حدث خطأ غير متوقع أثناء جلب تفاصيل المنتجات. الرجاء التحقق من الاتصال والمحاولة مرة أخرى.
                </p>`;
            aiDiv.innerHTML = ''; // Clear AI analysis on error
        });

=======
        <h1 class="text-2xl font-bold mb-4">Product Comparison</h1>
        <p>اختر المنتجات التي تريد مقارنتها ثم اضغط زر "قارن المنتجات المختارة".</p>
        <form id="compare-form">
            <div id="compare-table" class="mt-6"></div>
            <button type="submit" id="compare-btn" class="btn btn-primary mt-4" disabled>قارن المنتجات المختارة</button>
        </form>
        <div id="ai-analysis" class="mt-8"></div>
    `;

    const form = container.querySelector('#compare-form');
    const compareBtn = container.querySelector('#compare-btn');
    const aiDiv = container.querySelector('#ai-analysis');
    let selectedIds = [];

    // Fetch products from backend (use full backend URL)
    fetch('http://localhost:8000/api/products/')
        .then(res => res.json())
        .then(data => {
            const products = data.results || data; // handle paginated or plain list
            const tableDiv = container.querySelector('#compare-table');
            if (!products.length) {
                tableDiv.innerHTML = '<p>No products found.</p>';
                return;
            }
            // Add checkboxes for selection
            let table = `<div class="overflow-x-auto"><table class="min-w-full border text-sm"><thead><tr>
                <th class="border px-2 py-1"></th>
                <th class="border px-2 py-1">Image</th>
                <th class="border px-2 py-1">Name</th>
                <th class="border px-2 py-1">Brand</th>
                <th class="border px-2 py-1">Store</th>
                <th class="border px-2 py-1">Price</th>
                <th class="border px-2 py-1">Final Price</th>
                <th class="border px-2 py-1">Rating</th>
            </tr></thead><tbody>`;
            for (const p of products) {
                table += `<tr>
                    <td class="border px-2 py-1 text-center"><input type="checkbox" class="compare-checkbox" value="${p.id}"></td>
                    <td class="border px-2 py-1"><img src="${(p.images && p.images[0] && p.images[0].image) || '/public/placeholder.jpg'}" alt="${p.name}" style="width:48px;height:48px;object-fit:contain;"></td>
                    <td class="border px-2 py-1">${p.name}</td>
                    <td class="border px-2 py-1">${p.brand ? p.brand.name : '-'}</td>
                    <td class="border px-2 py-1">${p.store ? p.store.name : '-'}</td>
                    <td class="border px-2 py-1">${p.price}</td>
                    <td class="border px-2 py-1">${p.final_price}</td>
                    <td class="border px-2 py-1">${p.average_rating || '-'}</td>
                </tr>`;
            }
            table += '</tbody></table></div>';
            tableDiv.innerHTML = table;

            // Checkbox logic
            const checkboxes = tableDiv.querySelectorAll('.compare-checkbox');
            checkboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    selectedIds = Array.from(checkboxes).filter(c => c.checked).map(c => parseInt(c.value));
                    compareBtn.disabled = selectedIds.length < 2;
                });
            });
        })
        .catch(err => {
            const tableDiv = container.querySelector('#compare-table');
            tableDiv.innerHTML = `<p class="text-red-500">Error loading products for comparison.</p>`;
        });

    // Handle compare submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        aiDiv.innerHTML = '';
        if (selectedIds.length < 2) return;
        compareBtn.disabled = true;
        compareBtn.textContent = '...جاري المقارنة';
        fetch('http://localhost:8000/api/comparisons/products/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_ids: selectedIds })
        })
        .then(res => res.json())
        .then(data => {
            compareBtn.disabled = false;
            compareBtn.textContent = 'قارن المنتجات المختارة';
            if (data.error) {
                aiDiv.innerHTML = `<p class="text-red-500">${data.error}</p>`;
                return;
            }
            // Show AI analysis and criteria
            aiDiv.innerHTML = `<div class="bg-gray-50 p-4 rounded border">
                <h2 class="font-bold mb-2">نتيجة المقارنة الذكية</h2>
                <div class="mb-2"><b>المعايير:</b> ${Array.isArray(data.comparison_criteria) ? data.comparison_criteria.join(', ') : data.comparison_criteria}</div>
                <div><b>تحليل AI:</b><br><pre class="whitespace-pre-wrap">${data.ai_analysis}</pre></div>
            </div>`;
        })
        .catch(() => {
            compareBtn.disabled = false;
            compareBtn.textContent = 'قارن المنتجات المختارة';
            aiDiv.innerHTML = `<p class="text-red-500">حدث خطأ أثناء المقارنة.</p>`;
        });
    });

>>>>>>> Stashed changes
    return container;
}