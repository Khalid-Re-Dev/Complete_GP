import store from "../state/store.js"
import { recommendationService } from "../services/api.js"

/**
 * Renders a personalized recommendations section for authenticated users.
 * Only visible if the user is logged in.
 */
export function PersonalizedRecommendationsSection() {
  // Only show if user is authenticated
  if (!store.state.isAuthenticated) return ""

  // Create container
  const section = document.createElement("section")
  section.className = "my-10 bg-white rounded-xl shadow-lg border border-gray-100 p-6"
  section.innerHTML = `
    <h2 class="text-2xl font-bold text-primary mb-4 flex items-center">
      <i class="fa-solid fa-star text-secondary mr-2"></i>
      توصيات مخصصة لك
    </h2>
    <div id="personalized-recommendations-content">
      <div class="loader w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-500 text-center">جاري تحميل التوصيات المخصصة...</p>
    </div>
  `

  // Fetch personalized recommendations
  recommendationService.getPersonalizedRecs()
    .then(data => {
      const content = section.querySelector("#personalized-recommendations-content")
      if (data && data.recommendations && data.recommendations.length > 0) {
        content.innerHTML = `
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            ${data.recommendations.map(rec => `
              <div class="bg-light-gray rounded-lg p-4 flex flex-col items-center shadow-sm">
                <img src="${rec.image_url || '/placeholder.jpg'}" alt="${rec.name}" class="w-24 h-24 object-cover rounded mb-2" />
                <h3 class="font-semibold text-lg text-primary mb-1">${rec.name}</h3>
                <p class="text-sm text-gray-600 mb-2">${rec.short_description || ''}</p>
                <span class="text-secondary font-bold">${rec.price ? rec.price + ' ر.س' : ''}</span>
              </div>
            `).join('')}
          </div>
        `
      } else {
        // عرض رسالة backend إذا توفرت
        if (data && data.message) {
          content.innerHTML = `<p class="text-gray-500 text-center">${data.message}</p>`
        } else {
          content.innerHTML = `<p class="text-gray-500 text-center">لا توجد توصيات مخصصة حاليا.</p>`
        }
      }
    })
    .catch((err) => {
      const content = section.querySelector("#personalized-recommendations-content")
      content.innerHTML = `<p class="text-danger text-center">تعذر تحميل التوصيات المخصصة.</p>`
    })

  return section
}
