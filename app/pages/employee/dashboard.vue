<template>
  <NuxtLayout name="employee">
    <div v-if="!user" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-xl text-gray-600 mb-4">يجب تسجيل الدخول للوصول إلى لوحة التحكم</p>
        <NuxtLink to="/" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
          العودة للصفحة الرئيسية
        </NuxtLink>
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-l from-primary to-primary-dark text-white rounded-xl p-6 shadow-lg">
        <h1 class="text-2xl font-bold mb-2">مرحباً {{ user.name }} 👋</h1>
        <p class="text-white/90">جدول مواعيدك اليوم</p>
      </div>

      <!-- Attendance Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock :size="24" class="text-primary" />
          الحضور والانصراف
        </h2>
        
        <div v-if="loadingAttendance" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="text-gray-600 mt-2">جاري التحميل...</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Today's Status -->
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-semibold text-gray-700">حالة اليوم</span>
              <span class="text-xs text-gray-500">{{ todayDate }}</span>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <!-- Check In Status -->
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" 
                     :class="attendanceStatus?.check_in ? 'bg-green-100' : 'bg-gray-200'">
                  <CheckCircle2 v-if="attendanceStatus?.check_in" :size="20" class="text-green-600" />
                  <Circle v-else :size="20" class="text-gray-400" />
                </div>
                <div>
                  <p class="text-xs text-gray-600">وقت الحضور</p>
                  <p class="text-sm font-semibold text-gray-800">
                    {{ attendanceStatus?.check_in ? formatTime(attendanceStatus.check_in) : 'لم يتم التسجيل' }}
                  </p>
                </div>
              </div>

              <!-- Check Out Status -->
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                     :class="attendanceStatus?.check_out ? 'bg-red-100' : 'bg-gray-200'">
                  <XCircle v-if="attendanceStatus?.check_out" :size="20" class="text-red-600" />
                  <Circle v-else :size="20" class="text-gray-400" />
                </div>
                <div>
                  <p class="text-xs text-gray-600">وقت الانصراف</p>
                  <p class="text-sm font-semibold text-gray-800">
                    {{ attendanceStatus?.check_out ? formatTime(attendanceStatus.check_out) : 'لم يتم التسجيل' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-sm text-green-600">{{ successMessage }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              @click="handleCheckIn"
              :disabled="isProcessing || !!attendanceStatus?.check_in"
              class="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogIn v-if="!isProcessing" :size="20" />
              <div v-else class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>{{ isProcessing ? 'جاري التسجيل...' : 'تسجيل الحضور' }}</span>
            </button>

            <button
              @click="handleCheckOut"
              :disabled="isProcessing || !attendanceStatus?.check_in || !!attendanceStatus?.check_out"
              class="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogOut v-if="!isProcessing" :size="20" />
              <div v-else class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>{{ isProcessing ? 'جاري التسجيل...' : 'تسجيل الانصراف' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Today's Schedule -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar :size="24" class="text-primary" />
          مواعيد اليوم
        </h2>
        
        <div v-if="loadingBookings" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="text-gray-600 mt-2">جاري تحميل الحجوزات...</p>
        </div>

        <div v-else-if="bookingsError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-600">{{ bookingsError }}</p>
        </div>

        <div v-else-if="todayBookings.length === 0" class="text-center py-12">
          <Calendar :size="48" class="mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600">لا توجد مواعيد اليوم</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="booking in todayBookings"
            :key="booking.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            :class="getStatusClass(booking.status)"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Clock :size="18" class="text-gray-500" />
                  <span class="font-semibold text-gray-800">{{ formatBookingTime(booking.booking_time) }}</span>
                  <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadgeClass(booking.status)">
                    {{ getStatusText(booking.status) }}
                  </span>
                </div>
                <div v-if="booking.customer" class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User :size="16" class="text-gray-400" />
                  <span>{{ booking.customer.name }}</span>
                  <span class="text-gray-400">•</span>
                  <span>{{ booking.customer.mobile }}</span>
                </div>
              </div>
              <div class="text-left">
                <p class="text-lg font-bold text-primary">{{ booking.total_amount }} ريال</p>
              </div>
            </div>

            <!-- Services -->
            <div class="mt-3 pt-3 border-t border-gray-100">
              <p class="text-xs font-semibold text-gray-600 mb-2">الخدمات:</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="service in booking.services"
                  :key="service.id"
                  class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                >
                  {{ service.service?.name || service.service_name }}
                  <span class="text-gray-500">({{ service.duration }} دقيقة)</span>
                </span>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="booking.notes" class="mt-3 pt-3 border-t border-gray-100">
              <p class="text-xs font-semibold text-gray-600 mb-1">ملاحظات:</p>
              <p class="text-sm text-gray-700">{{ booking.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Previous Bookings Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar :size="24" class="text-primary" />
          المواعيد السابقة
        </h2>

        <!-- Filters -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Customer Name Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">اسم العميل</label>
              <input
                v-model="filterCustomerName"
                type="text"
                placeholder="ابحث بالاسم..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                @input="handleFilterChange"
              />
            </div>

            <!-- Date From Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
              <input
                v-model="filterDateFrom"
                type="date"
                :max="maxDate"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                @change="handleFilterChange"
              />
            </div>

            <!-- Date To Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
              <input
                v-model="filterDateTo"
                type="date"
                :max="maxDate"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                @change="handleFilterChange"
              />
            </div>

            <!-- Clear Filters Button -->
            <div class="flex items-end">
              <button
                @click="clearFilters"
                class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                مسح الفلاتر
              </button>
            </div>
          </div>

          <!-- Total Amount -->
          <div v-if="previousBookings.length > 0" class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">إجمالي المبلغ:</span>
              <span class="text-xl font-bold text-primary">{{ totalAmount.toFixed(2) }} ريال</span>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loadingPreviousBookings" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="text-gray-600 mt-2">جاري تحميل الحجوزات...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="previousBookingsError" class="text-center py-12">
          <p class="text-red-600 mb-4">{{ previousBookingsError }}</p>
          <button
            @click="() => fetchPreviousBookings(previousCurrentPage)"
            class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="previousBookings.length === 0" class="text-center py-12">
          <Calendar :size="48" class="mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600">لا توجد حجوزات سابقة</p>
        </div>

        <!-- Bookings List -->
        <div v-else class="space-y-4">
          <div
            v-for="booking in previousBookings"
            :key="booking.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            :class="getStatusClass(booking.status)"
          >
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-800">
                    حجز #{{ booking.id }}
                  </h3>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      getStatusBadgeClass(booking.status)
                    ]"
                  >
                    {{ getStatusText(booking.status) }}
                  </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <Calendar :size="16" class="text-gray-400" />
                    <span>{{ formatDate(booking.booking_date) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Clock :size="16" class="text-gray-400" />
                    <span>{{ formatBookingTime(booking.booking_time) }}</span>
                  </div>
                  <div v-if="booking.customer" class="flex items-center gap-2">
                    <User :size="16" class="text-gray-400" />
                    <span>{{ booking.customer.name }}</span>
                  </div>
                  <div v-if="booking.customer" class="flex items-center gap-2">
                    <Phone :size="16" class="text-gray-400" />
                    <span>{{ booking.customer.mobile }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Scissors :size="16" class="text-gray-400" />
                    <span>{{ getServiceNames(booking.services) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <DollarSign :size="16" class="text-gray-400" />
                    <span class="font-semibold text-gray-800">{{ booking.total_amount }} ريال</span>
                  </div>
                  <div v-if="booking.notes" class="col-span-2 flex items-start gap-2">
                    <span class="text-xs text-gray-500">ملاحظات:</span>
                    <span class="text-xs text-gray-600">{{ booking.notes }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="!loadingPreviousBookings && previousPagination.last_page > 1" class="mt-6 flex items-center justify-center gap-2">
          <button
            @click="previousPage"
            :disabled="previousCurrentPage === 1 || loadingPreviousBookings"
            :class="[
              'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
              previousCurrentPage === 1 || loadingPreviousBookings
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            <ArrowRight :size="18" />
            <span>السابق</span>
          </button>
          
          <div class="flex items-center gap-1 flex-wrap justify-center">
            <button
              v-for="page in previousPagination.last_page"
              :key="page"
              @click="() => goToPage(page)"
              :disabled="loadingPreviousBookings"
              :class="[
                'px-4 py-2 rounded-lg transition-colors min-w-[40px]',
                previousCurrentPage === page
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
                loadingPreviousBookings ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="nextPage"
            :disabled="previousCurrentPage === previousPagination.last_page || loadingPreviousBookings"
            :class="[
              'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
              previousCurrentPage === previousPagination.last_page || loadingPreviousBookings
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            <span>التالي</span>
            <ArrowLeft :size="18" />
          </button>
        </div>

        <!-- Pagination Info -->
        <div v-if="!loadingPreviousBookings && previousPagination.total > 0" class="mt-4 text-center text-sm text-gray-600">
          عرض {{ ((previousCurrentPage - 1) * previousPagination.per_page) + 1 }} إلى {{ Math.min(previousCurrentPage * previousPagination.per_page, previousPagination.total) }} من {{ previousPagination.total }} حجز
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Calendar, Clock, CheckCircle2, Circle, XCircle, LogIn, LogOut, User, Phone, Scissors, DollarSign, ArrowLeft, ArrowRight } from 'lucide-vue-next'
import type { ApiResponse } from '~/composables/useAuth'

definePageMeta({
  layout: 'employee'
})

const { user } = useAuth()
const { getTodayAttendance, checkIn, checkOut } = useAttendance()
const { getSettings } = useSettings()
const api = useApi()

interface BookingService {
  id: number
  service_id: number
  service_name: string
  service?: {
    id: number
    name: string
    description?: string
    price: number
    duration: number
  }
  employee_id?: number
  price: number
  duration: number
}

interface TodayBooking {
  id: number
  booking_date: string
  booking_time: string
  status: 'pending' | 'completed' | 'cancelled'
  notes?: string
  total_amount: number
  customer_id: number
  customer?: {
    id: number
    name: string
    email: string
    mobile: string
    status: string
    role: string
  }
  services: BookingService[]
  created_at: string
  updated_at: string
}

const attendanceStatus = ref<any>(null)
const loadingAttendance = ref(true)
const isProcessing = ref(false)
const error = ref('')
const successMessage = ref('')

const todayBookings = ref<TodayBooking[]>([])
const loadingBookings = ref(true)
const bookingsError = ref('')

// Previous bookings state
const previousBookings = ref<TodayBooking[]>([])
const loadingPreviousBookings = ref(false)
const previousBookingsError = ref('')
const previousCurrentPage = ref(1)
const previousPagination = ref({
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1
})

// Filters
const filterCustomerName = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')

const todayDate = computed(() => {
  const today = new Date()
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return today.toLocaleDateString('ar-SA', options)
})

const maxDate = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const formatTime = (timeString: string | null) => {
  if (!timeString) return ''
  
  // Check if it's already a valid date string (ISO format or timestamp)
  let date: Date
  
  // If it's just a time string (HH:mm or HH:mm:ss), combine with today's date
  if (timeString.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
    const today = new Date()
    const [hours, minutes, seconds] = timeString.split(':')
    date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
                    parseInt(hours || '0'), parseInt(minutes || '0'), parseInt(seconds || '0'))
  } else {
    // Try to parse as a full date string
    date = new Date(timeString)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // If invalid, try to parse as time only and combine with today
      const timeMatch = timeString.match(/(\d{2}):(\d{2})(:(\d{2}))?/)
      if (timeMatch && timeMatch[1] && timeMatch[2]) {
        const today = new Date()
        date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
                        parseInt(timeMatch[1]), parseInt(timeMatch[2]), parseInt(timeMatch[4] || '0'))
      } else {
        return timeString // Return original if can't parse
      }
    }
  }
  
  // Check if date is still invalid
  if (isNaN(date.getTime())) {
    return timeString
  }
  
  return date.toLocaleTimeString('ar-SA', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

const fetchTodayAttendance = async () => {
  loadingAttendance.value = true
  error.value = ''
  try {
    const result = await getTodayAttendance()
    if (result.success && result.data) {
      attendanceStatus.value = result.data
    } else {
      // If no attendance record exists, set to null
      attendanceStatus.value = null
    }
  } catch (err: any) {
    console.error('Error fetching attendance:', err)
    error.value = 'حدث خطأ أثناء جلب حالة الحضور'
  } finally {
    loadingAttendance.value = false
  }
}

// Calculate distance between two coordinates in meters using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Check if location is within allowed radius (default 100 meters)
const isLocationNearBusiness = async (userLat: number, userLon: number, maxDistanceMeters: number = 100): Promise<{ isNear: boolean; distance?: number; error?: string }> => {
  try {
    const settings = await getSettings()
    
    if (!settings.latitude || !settings.longitude) {
      return { isNear: false, error: 'لم يتم تحديد موقع المؤسسة في الإعدادات' }
    }

    const distance = calculateDistance(
      userLat,
      userLon,
      settings.latitude,
      settings.longitude
    )

    return {
      isNear: distance <= maxDistanceMeters,
      distance: Math.round(distance)
    }
  } catch (err: any) {
    console.error('Error checking location:', err)
    return { isNear: false, error: 'فشل التحقق من الموقع' }
  }
}

const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('المتصفح لا يدعم تحديد الموقع'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (err) => {
        reject(new Error('فشل الحصول على الموقع. يرجى التأكد من تفعيل صلاحيات الموقع'))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

const handleCheckIn = async () => {
  if (attendanceStatus.value?.check_in) {
    error.value = 'تم تسجيل الحضور مسبقاً'
    return
  }

  isProcessing.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const location = await getCurrentLocation()
    
    // Check if location is near business
    const locationCheck = await isLocationNearBusiness(location.latitude, location.longitude, 100)
    
    if (!locationCheck.isNear) {
      if (locationCheck.distance !== undefined) {
        error.value = `أنت بعيد عن موقع المؤسسة بمسافة ${locationCheck.distance} متر. يجب أن تكون على بعد 100 متر أو أقل لتسجيل الحضور.`
      } else {
        error.value = locationCheck.error || 'يجب أن تكون قريباً من موقع المؤسسة لتسجيل الحضور'
      }
      isProcessing.value = false
      return
    }

    const result = await checkIn(location.latitude, location.longitude)
    
    if (result.success) {
      successMessage.value = 'تم تسجيل الحضور بنجاح'
      await fetchTodayAttendance()
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      error.value = result.error || 'فشل تسجيل الحضور'
    }
  } catch (err: any) {
    error.value = err.message || 'حدث خطأ أثناء تسجيل الحضور'
  } finally {
    isProcessing.value = false
  }
}

const handleCheckOut = async () => {
  if (!attendanceStatus.value?.check_in) {
    error.value = 'يجب تسجيل الحضور أولاً'
    return
  }

  if (attendanceStatus.value?.check_out) {
    error.value = 'تم تسجيل الانصراف مسبقاً'
    return
  }

  isProcessing.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const location = await getCurrentLocation()
    
    // Check if location is near business
    const locationCheck = await isLocationNearBusiness(location.latitude, location.longitude, 100)
    
    if (!locationCheck.isNear) {
      if (locationCheck.distance !== undefined) {
        error.value = `أنت بعيد عن موقع المؤسسة بمسافة ${locationCheck.distance} متر. يجب أن تكون على بعد 100 متر أو أقل لتسجيل الانصراف.`
      } else {
        error.value = locationCheck.error || 'يجب أن تكون قريباً من موقع المؤسسة لتسجيل الانصراف'
      }
      isProcessing.value = false
      return
    }

    const result = await checkOut(location.latitude, location.longitude)
    
    if (result.success) {
      successMessage.value = 'تم تسجيل الانصراف بنجاح'
      await fetchTodayAttendance()
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      error.value = result.error || 'فشل تسجيل الانصراف'
    }
  } catch (err: any) {
    error.value = err.message || 'حدث خطأ أثناء تسجيل الانصراف'
  } finally {
    isProcessing.value = false
  }
}

const fetchTodayBookings = async () => {
  loadingBookings.value = true
  bookingsError.value = ''
  try {
    const response = await api.get<ApiResponse<TodayBooking[]>>('/bookings/employee/today')
    
    if (response.data.success && response.data.data) {
      // Sort bookings by time
      todayBookings.value = response.data.data.sort((a, b) => {
        const timeA = a.booking_time.split(':').map(Number)
        const timeB = b.booking_time.split(':').map(Number)
        const minutesA = (timeA[0] || 0) * 60 + (timeA[1] || 0)
        const minutesB = (timeB[0] || 0) * 60 + (timeB[1] || 0)
        return minutesA - minutesB
      })
    } else {
      todayBookings.value = []
      bookingsError.value = response.data.message || 'فشل جلب الحجوزات'
    }
  } catch (err: any) {
    console.error('Error fetching today bookings:', err)
    bookingsError.value = err.response?.data?.message || err.response?.data?.error || 'حدث خطأ أثناء جلب الحجوزات'
    todayBookings.value = []
  } finally {
    loadingBookings.value = false
  }
}

const formatBookingTime = (time: string) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  if (!hours || !minutes) return time
  const hour = parseInt(hours) || 0
  const minute = parseInt(minutes) || 0
  const period = hour >= 12 ? 'م' : 'ص'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'قيد الانتظار',
    completed: 'مكتمل',
    cancelled: 'ملغي'
  }
  return statusMap[status] || status
}

const getStatusBadgeClass = (status: string) => {
  const classMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    pending: 'border-yellow-200 bg-yellow-50/30',
    completed: 'border-green-200 bg-green-50/30',
    cancelled: 'border-red-200 bg-red-50/30'
  }
  return classMap[status] || ''
}

const totalAmount = computed(() => {
  return previousBookings.value.reduce((sum, booking) => sum + booking.total_amount, 0)
})

const formatDate = (dateStr: string) => {
  const dateObj = new Date(dateStr)
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  const day = days[dateObj.getDay()]
  const dayNum = dateObj.getDate()
  const month = months[dateObj.getMonth()]
  const year = dateObj.getFullYear()
  return `${day}، ${dayNum} ${month} ${year}`
}

const getServiceNames = (services: BookingService[]) => {
  return services.map(s => s.service?.name || s.service_name).join('، ')
}

interface PreviousBookingsResponse {
  success: boolean
  message?: string
  data: TodayBooking[]
  current_page: number
  per_page: number
  total: number
  last_page: number
  from?: number
  to?: number
}

const fetchPreviousBookings = async (page: number = 1) => {
  loadingPreviousBookings.value = true
  previousBookingsError.value = ''
  
  try {
    let url = `/bookings/employee?page=${page}`
    const params: string[] = []
    
    if (filterCustomerName.value.trim()) {
      params.push(`customer_name=${encodeURIComponent(filterCustomerName.value.trim())}`)
    }
    
    if (filterDateFrom.value) {
      params.push(`date_from=${filterDateFrom.value}`)
    }
    
    if (filterDateTo.value) {
      params.push(`date_to=${filterDateTo.value}`)
    }
    
    if (params.length > 0) {
      url += `&${params.join('&')}`
    }
    
    const response = await api.get<PreviousBookingsResponse>(url)
    
    if (response.data.success && response.data.data) {
      previousBookings.value = response.data.data
      previousPagination.value = {
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        last_page: response.data.last_page
      }
      previousCurrentPage.value = response.data.current_page
    } else {
      previousBookings.value = []
      previousBookingsError.value = response.data.message || 'فشل جلب الحجوزات'
    }
  } catch (err: any) {
    console.error('Error fetching previous bookings:', err)
    previousBookingsError.value = err.response?.data?.message || err.response?.data?.error || 'حدث خطأ أثناء جلب الحجوزات'
    previousBookings.value = []
  } finally {
    loadingPreviousBookings.value = false
  }
}

const handleFilterChange = () => {
  previousCurrentPage.value = 1
  fetchPreviousBookings(1)
}

const clearFilters = () => {
  filterCustomerName.value = ''
  filterDateFrom.value = ''
  filterDateTo.value = ''
  previousCurrentPage.value = 1
  fetchPreviousBookings(1)
}

// Pagination handlers
const goToPage = (page: number) => {
  if (page >= 1 && page <= previousPagination.value.last_page && page !== previousCurrentPage.value) {
    previousCurrentPage.value = page
    fetchPreviousBookings(page)
  }
}

const previousPage = () => {
  if (previousCurrentPage.value > 1) {
    const newPage = previousCurrentPage.value - 1
    previousCurrentPage.value = newPage
    fetchPreviousBookings(newPage)
  }
}

const nextPage = () => {
  if (previousCurrentPage.value < previousPagination.value.last_page) {
    const newPage = previousCurrentPage.value + 1
    previousCurrentPage.value = newPage
    fetchPreviousBookings(newPage)
  }
}

onMounted(() => {
  if (user) {
    fetchTodayAttendance()
    fetchTodayBookings()
    fetchPreviousBookings()
  }
})
</script>
