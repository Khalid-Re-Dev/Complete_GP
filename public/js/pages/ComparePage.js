// ComparePage.js
// Simple placeholder for the Compare page

export default function ComparePage() {
    const container = document.createElement('div');
    container.className = 'compare-page container py-8';
    container.innerHTML = `
        <h1 class="text-2xl font-bold mb-4">Product Comparison</h1>
        <p>Welcome to the product comparison page. Here you will be able to compare products side by side.</p>
        <div class="mt-6">
            <p class="text-gray-500">(This page is under construction. Please check back soon!)</p>
        </div>
    `;
    return container;
}
