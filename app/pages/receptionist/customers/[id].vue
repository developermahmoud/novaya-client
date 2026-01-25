<template>
  <NuxtLayout name="receptionist">
    <div v-if="!user" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-xl text-gray-600 mb-4">يجب تسجيل الدخول للوصول إلى لوحة التحكم</p>
        <NuxtLink to="/" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
          العودة للصفحة الرئيسية
        </NuxtLink>
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- Header Section -->
      <div class="bg-gradient-to-l from-primary to-primary-dark text-white rounded-xl p-6 shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <NuxtLink
                to="/receptionist/customers"
                class="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="العودة"
              >
                <ArrowRight :size="24" />
              </NuxtLink>
              <h1 class="text-2xl font-bold">حجوزات العميل</h1>
            </div>
            <p v-if="customer" class="text-white/90">عرض جميع حجوزات {{ customer.name }}</p>
          </div>
        </div>
      </div>

      <!-- Customer Info Card -->
      <div v-if="customer" class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
            {{ customer.name.charAt(0) }}
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold text-gray-800">{{ customer.name }}</h2>
            <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <Mail :size="16" class="text-gray-400" />
                <span>{{ customer.email }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Phone :size="16" class="text-gray-400" />
                <span>{{ customer.mobile }}</span>
              </div>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                ]"
              >
                {{ customer.status === 'active' ? 'نشط' : 'غير نشط' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bookings Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">قائمة الحجوزات</h2>
          <div class="text-sm text-gray-600">
            إجمالي الحجوزات: <span class="font-semibold text-gray-800">{{ pagination.total || 0 }}</span>
          </div>
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
        <div v-else-if="bookings.length === 0" class="text-center py-12">
          <Calendar :size="48" class="mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600 text-lg">لا توجد حجوزات لهذا العميل</p>
        </div>

        <!-- Bookings List -->
        <div v-else-if="!isLoadingBookings && !bookingsError && bookings.length > 0" class="space-y-4">
          <div
            v-for="booking in bookings"
            :key="booking.id"
            class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                  <div class="flex items-center gap-2">
                    <Calendar :size="16" class="text-gray-400" />
                    <span>{{ formatDate(booking.booking_date) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Clock :size="16" class="text-gray-400" />
                    <span>{{ formatTime12Hour(booking.booking_time) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <DollarSign :size="16" class="text-gray-400" />
                    <span class="font-semibold text-gray-800">الإجمالي: {{ booking.total_amount }} ريال</span>
                  </div>
                  <div v-if="booking.notes" class="flex items-start gap-2">
                    <span class="text-xs text-gray-500">ملاحظات:</span>
                    <span class="text-xs text-gray-600">{{ booking.notes }}</span>
                  </div>
                </div>
                
                <!-- Services List -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <h4 class="text-sm font-semibold text-gray-700 mb-2">الخدمات:</h4>
                  <div class="space-y-2">
                    <div
                      v-for="service in booking.services"
                      :key="service.id"
                      class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div class="flex-1">
                        <p class="font-medium text-gray-800">{{ service.service_name }}</p>
                        <p class="text-xs text-gray-500">المدة: {{ service.duration }} دقيقة</p>
                      </div>
                      <div class="text-right">
                        <p class="font-semibold text-gray-800">{{ service.price }} ريال</p>
                      </div>
                    </div>
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
      :booking="selectedInvoiceBooking"
      :client-name="customer?.name || 'العميل'"
      @close="showInvoice = false"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Calendar, Clock, Mail, Phone, DollarSign, ArrowLeft, ArrowRight, FileText } from 'lucide-vue-next'
import type { CustomerBooking } from '~/composables/useCustomers'
import { useCustomers } from '~/composables/useCustomers'
import { getStatusConfig } from '~/utils/helpers'
import type { ApiUserBooking } from '~/composables/useData'

definePageMeta({
  layout: 'receptionist'
})

const route = useRoute()
const { user } = useAuth()
const { fetchCustomerBookings, fetchCustomers } = useCustomers()

const customerId = computed(() => {
  const id = route.params.id
  if (Array.isArray(id)) {
    return parseInt(id[0] || '0')
  }
  return parseInt(id as string || '0')
})

// Customer info
const customer = ref<CustomerBooking['customer'] | null>(null)

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

// Bookings data
const bookings = ref<CustomerBooking[]>([])

// Invoice modal
const showInvoice = ref(false)
const selectedInvoiceBooking = ref<ApiUserBooking | null>(null)

// Fetch customer info
const loadCustomerInfo = async () => {
  if (!customerId.value || isNaN(customerId.value)) {
    return
  }

  try {
    const result = await fetchCustomers(1)
    if (result.success && result.data) {
      const foundCustomer = result.data.customers.find(c => c.id === customerId.value)
      if (foundCustomer) {
        customer.value = {
          id: foundCustomer.id,
          name: foundCustomer.name,
          email: foundCustomer.email,
          mobile: foundCustomer.mobile,
          status: foundCustomer.status,
          role: foundCustomer.role
        }
      }
    }
  } catch (error) {
    console.error('Error loading customer info:', error)
  }
}

// Fetch bookings from API
const loadBookings = async (page: number = 1) => {
  if (!customerId.value || isNaN(customerId.value)) {
    bookingsError.value = 'معرف العميل غير صحيح'
    return
  }

  isLoadingBookings.value = true
  bookingsError.value = ''
  
  try {
    const result = await fetchCustomerBookings(customerId.value, page)
    
    if (result.success && result.data) {
      bookings.value = result.data.bookings || []
      pagination.value = result.data.pagination
      currentPage.value = result.data.pagination.current_page
      
      // Extract customer info from first booking if available
      if (bookings.value.length > 0 && bookings.value[0].customer) {
        customer.value = bookings.value[0].customer
      } else if (!customer.value) {
        // If no customer info from bookings, try to load it separately
        await loadCustomerInfo()
      }
    } else {
      bookingsError.value = result.error || 'فشل جلب الحجوزات'
      // Try to load customer info even if bookings failed
      if (!customer.value) {
        await loadCustomerInfo()
      }
    }
  } catch (error) {
    console.error('Error loading bookings:', error)
    bookingsError.value = 'حدث خطأ أثناء جلب الحجوزات'
    // Try to load customer info even if bookings failed
    if (!customer.value) {
      await loadCustomerInfo()
    }
  } finally {
    isLoadingBookings.value = false
  }
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

// Safe wrapper for getStatusConfig
const getStatusConfigSafe = (status: string) => {
  const validStatuses: ('pending' | 'completed' | 'cancelled')[] = ['pending', 'completed', 'cancelled']
  const normalizedStatus = validStatuses.includes(status as any) ? status as 'pending' | 'completed' | 'cancelled' : 'pending'
  return getStatusConfig(normalizedStatus)
}

const viewInvoice = (booking: CustomerBooking) => {
  // Convert CustomerBooking to ApiUserBooking format for InvoiceModal
  type BookingService = CustomerBooking['services'][number]
  
  const invoiceBooking: ApiUserBooking = {
    id: booking.id,
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    status: booking.status,
    notes: booking.notes,
    total_amount: booking.total_amount,
    customer_id: booking.customer_id,
    services: booking.services.map((s: BookingService) => ({
      id: s.id,
      service_id: s.service_id,
      service_name: s.service_name,
      service: s.service,
      employee_id: s.employee_id,
      price: s.price,
      duration: s.duration
    })),
    created_at: booking.created_at,
    updated_at: booking.updated_at
  }
  selectedInvoiceBooking.value = invoiceBooking
  showInvoice.value = true
}

// Pagination handlers
const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.last_page && page !== currentPage.value) {
    currentPage.value = page
    loadBookings(page)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    const newPage = currentPage.value - 1
    currentPage.value = newPage
    loadBookings(newPage)
  }
}

const nextPage = () => {
  if (currentPage.value < pagination.value.last_page) {
    const newPage = currentPage.value + 1
    currentPage.value = newPage
    loadBookings(newPage)
  }
}

// Load data on mount
onMounted(async () => {
  // Load customer info first
  await loadCustomerInfo()
  // Then load bookings
  await loadBookings(1)
})

// Watch for route changes
watch(() => route.params.id, async (newId) => {
  if (newId) {
    customer.value = null
    bookings.value = []
    await loadCustomerInfo()
    await loadBookings(1)
  }
})
</script>
