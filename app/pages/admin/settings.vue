<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-800">الإعدادات</h1>
        <p class="text-gray-600 mt-1">إدارة إعدادات الصالون</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">جاري تحميل الإعدادات...</p>
      </div>

      <!-- Settings Form -->
      <div v-else class="space-y-6">
        <!-- Working Days Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">أيام العمل</h2>
          <div class="space-y-3">
            <div
              v-for="(dayKey, index) in dayKeys"
              :key="dayKey"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  :id="`day-${dayKey}`"
                  v-model="settingsForm.working_hours[dayKey].is_open"
                  class="w-5 h-5 text-primary rounded focus:ring-primary"
                />
                <label :for="`day-${dayKey}`" class="text-sm font-medium text-gray-700 cursor-pointer">
                  {{ getDayName(dayKey) }}
                </label>
              </div>
              <div v-if="settingsForm.working_hours[dayKey].is_open" class="flex items-center gap-2">
                <input
                  v-model="settingsForm.working_hours[dayKey].from_time"
                  type="time"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
                <span class="text-gray-500">إلى</span>
                <input
                  v-model="settingsForm.working_hours[dayKey].to_time"
                  type="time"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Location Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">موقع الصالون</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
              <UiInput
                v-model="settingsForm.address"
                type="text"
                placeholder="أدخل عنوان الصالون"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">خط العرض (Latitude)</label>
                <input
                  v-model.number="settingsForm.latitude"
                  type="number"
                  step="any"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="24.7136"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">خط الطول (Longitude)</label>
                <input
                  v-model.number="settingsForm.longitude"
                  type="number"
                  step="any"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="46.6753"
                />
              </div>
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-600 mb-2">اختر الموقع على الخريطة (اسحب الـ marker لتحديد الموقع):</p>
              <div
                ref="mapContainer"
                class="border border-gray-300 rounded-lg overflow-hidden"
                style="height: 400px;"
              ></div>
              <a
                v-if="settingsForm.latitude && settingsForm.longitude"
                :href="`https://www.google.com/maps/search/?api=1&query=${settingsForm.latitude},${settingsForm.longitude}`"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <MapPin :size="16" />
                <span>فتح في Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Contact Info Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">معلومات التواصل</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiInput
              v-model="settingsForm.mobile"
              label="رقم الهاتف"
              type="tel"
              placeholder="0501234567"
            />
            <UiInput
              v-model="settingsForm.whatsapp"
              label="رقم الواتساب"
              type="tel"
              placeholder="0501234567"
            />
            <UiInput
              v-model="settingsForm.email"
              label="البريد الإلكتروني"
              type="email"
              placeholder="info@novaya.com"
            />
          </div>
        </div>

        <!-- Social Media Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">وسائل التواصل الاجتماعي</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiInput
              :model-value="settingsForm.facebook_link || ''"
              @update:model-value="settingsForm.facebook_link = $event"
              label="Facebook"
              type="url"
              placeholder="https://facebook.com/..."
            />
            <UiInput
              :model-value="settingsForm.instagram_link || ''"
              @update:model-value="settingsForm.instagram_link = $event"
              label="Instagram"
              type="url"
              placeholder="https://instagram.com/..."
            />
            <UiInput
              :model-value="settingsForm.twitter_link || ''"
              @update:model-value="settingsForm.twitter_link = $event"
              label="Twitter"
              type="url"
              placeholder="https://twitter.com/..."
            />
            <UiInput
              :model-value="settingsForm.youtube_link || ''"
              @update:model-value="settingsForm.youtube_link = $event"
              label="YouTube"
              type="url"
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end gap-4">
          <UiButton @click="handleSave" :disabled="isSubmitting" size="lg">
            {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الإعدادات' }}
          </UiButton>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'
import type { Settings } from '~/composables/useSettings'
import { useSettings } from '~/composables/useSettings'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { getSettings, updateSettings } = useSettings()
const { success: showSuccess, error: showError } = useToast()

const isLoading = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let marker: any = null

const dayKeys = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const

const settingsForm = ref<Settings>({
  address: '',
  latitude: 24.7136,
  longitude: 46.6753,
  mobile: '',
  whatsapp: '',
  email: '',
  facebook_link: '',
  instagram_link: '',
  twitter_link: '',
  youtube_link: '',
  working_hours: {
    saturday: { from_time: '09:00', to_time: '17:00', is_open: true },
    sunday: { from_time: '09:00', to_time: '17:00', is_open: true },
    monday: { from_time: '09:00', to_time: '17:00', is_open: true },
    tuesday: { from_time: '09:00', to_time: '17:00', is_open: true },
    wednesday: { from_time: '09:00', to_time: '17:00', is_open: true },
    thursday: { from_time: '09:00', to_time: '17:00', is_open: true },
    friday: { from_time: '09:00', to_time: '17:00', is_open: true }
  }
})

const getDayName = (day: string) => {
  const dayNames: Record<string, string> = {
    saturday: 'السبت',
    sunday: 'الأحد',
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة'
  }
  return dayNames[day] || day
}

// Fetch settings from API
const fetchSettings = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const settings = await getSettings()
    // Map API response to form structure
    settingsForm.value = {
      address: settings.address || '',
      latitude: settings.latitude || 24.7136,
      longitude: settings.longitude || 46.6753,
      mobile: settings.mobile || '',
      whatsapp: settings.whatsapp || '',
      email: settings.email || '',
      facebook_link: settings.facebook_link || '',
      instagram_link: settings.instagram_link || '',
      twitter_link: settings.twitter_link || '',
      youtube_link: settings.youtube_link || '',
      working_hours: settings.working_hours || settingsForm.value.working_hours
    }
  } catch (err: any) {
    error.value = err.message || 'فشل جلب الإعدادات'
    // If settings don't exist, keep default values
  } finally {
    isLoading.value = false
  }
}

// Initialize Google Maps
const initMap = () => {
  if (typeof window === 'undefined' || !mapContainer.value) return

  // Default location (Riyadh, Saudi Arabia)
  const defaultLat = settingsForm.value.latitude || 24.7136
  const defaultLng = settingsForm.value.longitude || 46.6753

  // Check if Google Maps is already loaded
  if (typeof (window as any).google !== 'undefined' && (window as any).google.maps) {
    createMap(defaultLat, defaultLng)
    return
  }

  // Load Google Maps script dynamically
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
  if (existingScript) {
    if ((window as any).google && (window as any).google.maps) {
      createMap(defaultLat, defaultLng)
    } else {
      existingScript.addEventListener('load', () => {
        createMap(defaultLat, defaultLng)
      })
    }
    return
  }

  // Load Google Maps API
  // Note: You can add your Google Maps API key here or use environment variable
  // Get it from: https://console.cloud.google.com/google/maps-apis
  const apiKey = '' // TODO: Add your Google Maps API key here
  
  const callbackName = `initGoogleMap_${Date.now()}`
  const script = document.createElement('script')
  
  if (apiKey) {
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`
  } else {
    // Try without API key (may have limitations)
    script.src = `https://maps.googleapis.com/maps/api/js?libraries=places&callback=${callbackName}`
  }
  
  script.async = true
  script.defer = true
  
  // Set global callback
  ;(window as any)[callbackName] = () => {
    createMap(defaultLat, defaultLng)
    delete (window as any)[callbackName]
  }
  
  script.onerror = () => {
    console.error('Failed to load Google Maps')
    error.value = 'فشل تحميل Google Maps. يرجى إضافة Google Maps API key في ملف settings.vue (السطر 299)'
    // Show fallback message
    if (mapContainer.value) {
      mapContainer.value.innerHTML = `
        <div class="flex items-center justify-center h-full bg-gray-100 text-gray-600 p-4 text-center">
          <div>
            <p class="font-semibold mb-2">فشل تحميل Google Maps</p>
            <p class="text-sm">يرجى إضافة Google Maps API key في ملف settings.vue</p>
            <p class="text-xs mt-2 text-gray-500">يمكنك الحصول على API key من: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" class="text-primary underline">Google Cloud Console</a></p>
          </div>
        </div>
      `
    }
    delete (window as any)[callbackName]
  }
  
  document.head.appendChild(script)
}

const createMap = (lat: number, lng: number) => {
  if (typeof window === 'undefined' || !mapContainer.value) return
  
  const google = (window as any).google
  if (!google || !google.maps) {
    console.error('Google Maps API not loaded')
    // Fallback to iframe
    if (mapContainer.value) {
      const mapLat = settingsForm.value.latitude || lat
      const mapLng = settingsForm.value.longitude || lng
      mapContainer.value.innerHTML = `
        <iframe
          src="https://www.google.com/maps?q=${mapLat},${mapLng}&output=embed&z=15"
          width="100%"
          height="100%"
          style="border:0;"
          allowfullscreen
          loading="lazy"
        ></iframe>
      `
    }
    return
  }

  // Use saved coordinates or default
  const mapLat = settingsForm.value.latitude || lat
  const mapLng = settingsForm.value.longitude || lng

  // Create map
  map = new google.maps.Map(mapContainer.value, {
    center: { lat: mapLat, lng: mapLng },
    zoom: mapLat && mapLng ? 15 : 10,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true
  })

  // Create or update marker function
  const updateMarker = (lat: number, lng: number) => {
    if (marker) {
      marker.setPosition({ lat, lng })
      map.setCenter({ lat, lng })
    } else {
      marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        draggable: true,
        title: 'موقع الصالون',
        animation: google.maps.Animation.DROP
      })

      // Update coordinates when marker is dragged
      marker.addListener('dragend', (event: any) => {
        const position = event.latLng
        settingsForm.value.latitude = position.lat()
        settingsForm.value.longitude = position.lng()
      })
    }
  }

  // Create marker if coordinates exist
  if (mapLat && mapLng) {
    updateMarker(mapLat, mapLng)
  }

  // Click on map to add/update marker
  map.addListener('click', (event: any) => {
    const position = event.latLng
    settingsForm.value.latitude = position.lat()
    settingsForm.value.longitude = position.lng()
    updateMarker(position.lat(), position.lng())
  })

  // Update marker position when coordinates change manually
  watch(
    () => [settingsForm.value.latitude, settingsForm.value.longitude],
    ([newLat, newLng]) => {
      if (map && newLat && newLng) {
        updateMarker(newLat, newLng)
      }
    }
  )
}

// Load settings on mount
onMounted(async () => {
  await fetchSettings()
  await nextTick()
  // Initialize map after DOM is ready
  if (mapContainer.value) {
    initMap()
  }
})

// Re-initialize map when settings are loaded
watch(
  () => settingsForm.value.latitude && settingsForm.value.longitude,
  (hasLocation) => {
    if (hasLocation && !map && mapContainer.value) {
      initMap()
    }
  }
)

// Save settings
const handleSave = async () => {
  isSubmitting.value = true
  error.value = ''

  try {
    await updateSettings(settingsForm.value)
    showSuccess('تم حفظ الإعدادات بنجاح')
  } catch (err: any) {
    error.value = err.message || 'حدث خطأ'
    showError(err.message || 'حدث خطأ')
  } finally {
    isSubmitting.value = false
  }
}
</script>
