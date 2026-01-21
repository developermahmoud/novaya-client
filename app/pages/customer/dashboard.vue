<template>
  <NuxtLayout name="customer">
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
        <p class="text-white/90">إليك ملخص حجوزاتك وخدماتنا</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">إجمالي الحجوزات</p>
              <p class="text-2xl font-bold text-gray-800">{{ pagination.total || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar :size="24" class="text-blue-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">الحجوزات المعلقة</p>
              <p class="text-2xl font-bold text-yellow-600">{{ pendingBookings?.length || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock :size="24" class="text-yellow-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">إجمالي المدفوع</p>
              <p class="text-2xl font-bold text-green-600">{{ totalSpent }} ريال</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign :size="24" class="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">معلومات الحساب</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-gray-600 text-sm mb-1">الاسم الكامل</p>
            <p class="text-lg font-semibold text-gray-800">{{ user.name }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm mb-1">البريد الإلكتروني</p>
            <p class="text-lg font-semibold text-gray-800">{{ user.email }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm mb-1">رقم الهاتف</p>
            <p class="text-lg font-semibold text-gray-800">{{ user.phone }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm mb-1">نوع الحساب</p>
            <p class="text-lg font-semibold text-gray-800">عميل</p>
          </div>
        </div>
      </div>

      <!-- Bookings Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">حجوزاتي</h2>
          <NuxtLink
            to="/"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Calendar :size="18" />
            <span>حجز جديد</span>
          </NuxtLink>
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-2 mb-6 border-b border-gray-200">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="handleFilterChange(filter.value)"
            :class="[
              'px-4 py-2 font-medium transition-colors border-b-2',
              activeFilter === filter.value
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            ]"
          >
            {{ filter.label }} ({{ filter.count }})
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingBookings" class="text-center py-12">
          <p class="text-gray-600">جاري تحميل الحجوزات...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="bookingsError" class="text-center py-12">
          <p class="text-red-600 mb-4">{{ bookingsError }}</p>
          <button
            @click="loadBookings(currentPage)"
            class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredBookings.length === 0" class="text-center py-12">
          <Calendar :size="48" class="mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600 text-lg">لا توجد حجوزات {{ activeFilter === 'all' ? '' : filters.find(f => f.value === activeFilter)?.label.toLowerCase() }}</p>
          <NuxtLink
            to="/"
            class="mt-4 inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            احجز موعدك الآن
          </NuxtLink>
        </div>

        <!-- Bookings List -->
        <div v-else-if="!isLoadingBookings && !bookingsError && filteredBookings.length > 0" class="space-y-4">
          <div
            v-for="booking in filteredBookings"
            :key="booking.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
                      getStatusConfigSafe(booking.status).color
                    ]"
                  >
                    {{ getStatusConfigSafe(booking.status).text }}
                  </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <Calendar :size="16" class="text-gray-400" />
                    <span>{{ formatDate(booking.booking_date) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Clock :size="16" class="text-gray-400" />
                    <span>{{ formatTime12Hour(booking.booking_time) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Scissors :size="16" class="text-gray-400" />
                    <span>{{ getServiceNamesFromApi(booking.services) }}</span>
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
              <div class="flex gap-2">
                <button
                v-if="booking.status === 'completed'"
                  @click="viewInvoice(booking)"
                  class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  <FileText :size="18" />
                  <span>عرض الفاتورة</span>
                </button>
                <button
                  v-if="booking.status === 'pending'"
                  @click="cancelBooking(booking.id)"
                  class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  إلغاء الحجز
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="!isLoadingBookings && pagination.last_page > 1" class="mt-6 flex items-center justify-center gap-2">
          <button
            @click="previousPage"
            :disabled="currentPage === 1 || isLoadingBookings"
            :class="[
              'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
              currentPage === 1 || isLoadingBookings
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            <ArrowRight :size="18" />
            <span>السابق</span>
          </button>
          
          <div class="flex items-center gap-1 flex-wrap justify-center">
            <button
              v-for="page in pagination.last_page"
              :key="page"
              @click="goToPage(page)"
              :disabled="isLoadingBookings"
              :class="[
                'px-4 py-2 rounded-lg transition-colors min-w-[40px]',
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
                isLoadingBookings ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="nextPage"
            :disabled="currentPage === pagination.last_page || isLoadingBookings"
            :class="[
              'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
              currentPage === pagination.last_page || isLoadingBookings
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            <span>التالي</span>
            <ArrowLeft :size="18" />
          </button>
        </div>

        <!-- Pagination Info -->
        <div v-if="!isLoadingBookings && pagination.total > 0" class="mt-4 text-center text-sm text-gray-600">
          عرض {{ ((currentPage - 1) * pagination.per_page) + 1 }} إلى {{ Math.min(currentPage * pagination.per_page, pagination.total) }} من {{ pagination.total }} حجز
        </div>
      </div>
    </div>

    <!-- Invoice Modal -->
    <InvoiceModal
      :is-open="showInvoice"
      :booking="selectedBooking"
      :client-name="user?.name || ''"
      @close="showInvoice = false"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Calendar, Clock, DollarSign, Scissors, FileText, ArrowLeft, ArrowRight } from 'lucide-vue-next'
import type { ApiUserBooking } from '~/composables/useData'
import { getStatusConfig } from '~/utils/helpers'

definePageMeta({
  layout: 'customer'
})

const { user } = useAuth()
const { services, fetchUserBookings, cancelBooking: cancelBookingApi } = useData()

const activeFilter = ref<'all' | 'pending' | 'completed' | 'cancelled'>('all')
const showInvoice = ref(false)
const selectedBooking = ref<ApiUserBooking | null>(null)
const isCancelling = ref(false)

// Pagination state
const currentPage = ref(1)
const pagination = ref({
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1
})
const isLoadingBookings = ref(false)
const bookingsError = ref('')

// API bookings data
const userBookings = ref<ApiUserBooking[]>([])

// Fetch bookings from API
const loadBookings = async (page: number = 1, status?: 'pending' | 'completed' | 'cancelled') => {
  if (!user.value) {
    console.log('User not loaded yet, skipping bookings fetch')
    return
  }
  
  isLoadingBookings.value = true
  bookingsError.value = ''
  
  try {
    console.log('Fetching bookings for page:', page, 'status:', status || 'all')
    const result = await fetchUserBookings(page, status)
    console.log('Bookings fetch result:', result)
    
    if (result.success && result.data) {
      userBookings.value = result.data.bookings || []
      pagination.value = result.data.pagination
      currentPage.value = result.data.pagination.current_page
      console.log('Bookings loaded:', userBookings.value.length, 'bookings')
    } else {
      bookingsError.value = result.error || 'فشل جلب الحجوزات'
      console.error('Failed to load bookings:', result.error)
    }
  } catch (error) {
    console.error('Error loading bookings:', error)
    bookingsError.value = 'حدث خطأ أثناء جلب الحجوزات'
  } finally {
    isLoadingBookings.value = false
  }
}

// Load bookings on mount - wait for user to be loaded
watch([user], ([newUser]) => {
  if (newUser && userBookings.value.length === 0 && !isLoadingBookings.value) {
    const status = activeFilter.value === 'all' ? undefined : activeFilter.value
    loadBookings(1, status)
  }
}, { immediate: true })

onMounted(async () => {
  // Wait a bit for user to be loaded if not already
  if (!user.value) {
    await nextTick()
  }
  if (user.value && userBookings.value.length === 0 && !isLoadingBookings.value) {
    const status = activeFilter.value === 'all' ? undefined : activeFilter.value
    loadBookings(1, status)
  }
})

const customerBookings = computed(() => {
  return userBookings.value || []
})

const pendingBookings = computed(() => {
  return (customerBookings.value || []).filter(b => b.status === 'pending')
})

const totalSpent = computed(() => {
  return (customerBookings.value || [])
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.total_amount, 0)
})

const filters = computed(() => {
  const bookings = customerBookings.value || []
  return [
    { value: 'all' as const, label: 'الكل', count: pagination.value?.total || 0 },
    { value: 'pending' as const, label: 'معلقة', count: pendingBookings.value?.length || 0 },
    { value: 'completed' as const, label: 'مكتملة', count: bookings.filter(b => b.status === 'completed').length },
    { value: 'cancelled' as const, label: 'ملغاة', count: bookings.filter(b => b.status === 'cancelled').length },
  ]
})

const filteredBookings = computed(() => {
  // Since we're now fetching from API with status filter, just return all bookings
  // The API already filters by status
  return customerBookings.value || []
})

// Handle filter change - fetch from API with new status
const handleFilterChange = (filter: 'all' | 'pending' | 'completed' | 'cancelled') => {
  activeFilter.value = filter
  // Reset to page 1 when changing filter
  currentPage.value = 1
  
  // If 'all', don't pass status parameter, otherwise pass the status
  const status = filter === 'all' ? undefined : filter
  loadBookings(1, status)
}

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

const formatTime12Hour = (time24: string) => {
  const parts = time24.split(':')
  const hours = parts[0] ? parseInt(parts[0], 10) : 0
  const minutes = parts[1] ? parseInt(parts[1], 10) : 0
  const hour12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
  const period = hours >= 12 ? 'م' : 'ص'
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

const getServiceNamesFromApi = (services: ApiUserBooking['services']) => {
  return services.map(s => s.service_name).join('، ')
}

// Safe wrapper for getStatusConfig to handle string status
const getStatusConfigSafe = (status: string) => {
  const validStatuses: ('pending' | 'completed' | 'cancelled')[] = ['pending', 'completed', 'cancelled']
  const normalizedStatus = validStatuses.includes(status as any) ? status as 'pending' | 'completed' | 'cancelled' : 'pending'
  return getStatusConfig(normalizedStatus)
}

const viewInvoice = (booking: ApiUserBooking) => {
  selectedBooking.value = booking
  showInvoice.value = true
}

const cancelBooking = async (bookingId: number) => {
  if (!confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) {
    return
  }
  
  isCancelling.value = true
  
  try {
    const result = await cancelBookingApi(bookingId)
    
    if (result.success) {
      // Reload bookings to reflect the cancellation
      const status = activeFilter.value === 'all' ? undefined : activeFilter.value
      await loadBookings(currentPage.value, status)
      
      // Show success message (you can add a toast notification here)
      alert('تم إلغاء الحجز بنجاح')
    } else {
      alert(result.error || 'فشل إلغاء الحجز')
    }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    alert('حدث خطأ أثناء إلغاء الحجز')
  } finally {
    isCancelling.value = false
  }
}

// Pagination handlers
const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.last_page && page !== currentPage.value) {
    currentPage.value = page
    const status = activeFilter.value === 'all' ? undefined : activeFilter.value
    loadBookings(page, status)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    const newPage = currentPage.value - 1
    currentPage.value = newPage
    const status = activeFilter.value === 'all' ? undefined : activeFilter.value
    loadBookings(newPage, status)
  }
}

const nextPage = () => {
  if (currentPage.value < pagination.value.last_page) {
    const newPage = currentPage.value + 1
    currentPage.value = newPage
    const status = activeFilter.value === 'all' ? undefined : activeFilter.value
    loadBookings(newPage, status)
  }
}

// Middleware will handle authentication check if needed
</script>
