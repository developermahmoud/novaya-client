<template>
  <NuxtLayout name="admin">
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
        <p class="text-white/90">إدارة الحجوزات</p>
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
              <p class="text-gray-600 text-sm mb-1">حجوزات معلقة</p>
              <p class="text-2xl font-bold text-yellow-600">{{ pendingBookingsCount }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock :size="24" class="text-yellow-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">حجوزات مكتملة</p>
              <p class="text-2xl font-bold text-green-600">{{ completedBookingsCount }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle :size="24" class="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Bookings Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">جميع الحجوزات</h2>
        </div>

        <!-- Filters -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
              <select
                v-model="activeFilter"
                @change="applyFilters"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">الكل</option>
                <option value="pending">معلقة</option>
                <option value="completed">مكتملة</option>
                <option value="cancelled">ملغاة</option>
              </select>
            </div>

            <!-- Date From Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
              <input
                v-model="filterDateFrom"
                type="date"
                @change="applyFilters"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <!-- Date To Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
              <input
                v-model="filterDateTo"
                type="date"
                @change="applyFilters"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <!-- Employee Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">الموظف</label>
              <select
                v-model="filterEmployeeId"
                @change="applyFilters"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option :value="undefined">الكل</option>
                <option
                  v-for="employee in employeesList"
                  :key="employee.id"
                  :value="employee.id"
                >
                  {{ employee.name }}
                </option>
              </select>
            </div>

            <!-- Clear Filters Button -->
            <div class="flex items-end">
              <button
                @click="clearFilters"
                class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                مسح الفلاتر
              </button>
            </div>
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
        <div v-else-if="allBookings.length === 0" class="text-center py-12">
          <Calendar :size="48" class="mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600 text-lg">لا توجد حجوزات</p>
        </div>

        <!-- Bookings List -->
        <div v-else-if="!isLoadingBookings && !bookingsError && allBookings.length > 0" class="space-y-4">
          <div
            v-for="booking in allBookings"
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
                  @click="handleApprove(booking)"
                  class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <CheckCircle :size="18" />
                  <span>موافقة</span>
                </button>
                <button
                  v-if="booking.status === 'pending'"
                  @click="cancelBooking(booking.id)"
                  :disabled="isCancelling === booking.id"
                  class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isCancelling === booking.id">جاري الإلغاء...</span>
                  <span v-else>إلغاء</span>
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

    <!-- Approve Booking Modal -->
    <ApproveBookingModal
      :is-open="showApproveModal"
      :booking="selectedBooking"
      :employees="employeesList"
      @close="showApproveModal = false"
      @approve="handleApproveConfirm"
    />

    <!-- Invoice Modal -->
    <InvoiceModal
      :is-open="showInvoice"
      :booking="selectedInvoiceBooking"
      :client-name="selectedInvoiceBooking ? (allBookings.find(b => b.id === selectedInvoiceBooking?.id)?.customer?.name || 'العميل') : ''"
      @close="showInvoice = false"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Calendar, Clock, CheckCircle, User, Phone, Scissors, DollarSign, ArrowLeft, ArrowRight, FileText } from 'lucide-vue-next'
import type { ApiBooking, ApproveBookingPayload, ApiUserBooking } from '~/composables/useData'
import { getStatusConfig } from '~/utils/helpers'
import type { EmployeeDropdown } from '~/composables/useEmployees'
import { useEmployees } from '~/composables/useEmployees'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()
const { fetchAllBookings, cancelBooking: cancelBookingApi, approveBooking } = useData()
const { getEmployeesDropdown } = useEmployees()

const activeFilter = ref<'all' | 'pending' | 'completed' | 'cancelled'>('all')
const filterDateFrom = ref<string>('')
const filterDateTo = ref<string>('')
const filterEmployeeId = ref<number | undefined>(undefined)
const showApproveModal = ref(false)
const selectedBooking = ref<ApiBooking | null>(null)
const isCancelling = ref<number | false>(false)
const employeesList = ref<EmployeeDropdown[]>([])
const showInvoice = ref(false)
const selectedInvoiceBooking = ref<ApiUserBooking | null>(null)

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
const allBookings = ref<ApiBooking[]>([])

// Fetch bookings from API
const loadBookings = async (page: number = 1) => {
  isLoadingBookings.value = true
  bookingsError.value = ''
  
  try {
    const status = activeFilter.value === 'all' ? undefined : activeFilter.value
    const result = await fetchAllBookings(
      page, 
      status,
      filterDateFrom.value || undefined,
      filterDateTo.value || undefined,
      filterEmployeeId.value
    )
    
    if (result.success && result.data) {
      allBookings.value = result.data.bookings || []
      pagination.value = result.data.pagination
      currentPage.value = result.data.pagination.current_page
    } else {
      bookingsError.value = result.error || 'فشل جلب الحجوزات'
    }
  } catch (error) {
    console.error('Error loading bookings:', error)
    bookingsError.value = 'حدث خطأ أثناء جلب الحجوزات'
  } finally {
    isLoadingBookings.value = false
  }
}

// Load employees
const loadEmployees = async () => {
  try {
    employeesList.value = await getEmployeesDropdown()
  } catch (error) {
    console.error('Error loading employees:', error)
  }
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    loadBookings(1),
    loadEmployees()
  ])
})

const pendingBookingsCount = computed(() => {
  return allBookings.value.filter(b => b.status === 'pending').length
})

const completedBookingsCount = computed(() => {
  return allBookings.value.filter(b => b.status === 'completed').length
})

// Apply filters
const applyFilters = () => {
  currentPage.value = 1
  loadBookings(1)
}

// Clear all filters
const clearFilters = () => {
  activeFilter.value = 'all'
  filterDateFrom.value = ''
  filterDateTo.value = ''
  filterEmployeeId.value = undefined
  currentPage.value = 1
  loadBookings(1)
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

const getServiceNamesFromApi = (services: ApiBooking['services']) => {
  return services.map(s => s.service_name).join('، ')
}

// Safe wrapper for getStatusConfig to handle string status
const getStatusConfigSafe = (status: string) => {
  const validStatuses: ('pending' | 'completed' | 'cancelled')[] = ['pending', 'completed', 'cancelled']
  const normalizedStatus = validStatuses.includes(status as any) ? status as 'pending' | 'completed' | 'cancelled' : 'pending'
  return getStatusConfig(normalizedStatus)
}

const handleApprove = (booking: ApiBooking) => {
  selectedBooking.value = booking
  showApproveModal.value = true
}

const viewInvoice = (booking: ApiBooking) => {
  // Convert ApiBooking to ApiUserBooking format for InvoiceModal
  // ApiBooking has customer object, but ApiUserBooking doesn't, so we just use the booking data
  const invoiceBooking: ApiUserBooking = {
    id: booking.id,
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    status: booking.status,
    notes: booking.notes,
    total_amount: booking.total_amount,
    customer_id: booking.customer_id,
    services: booking.services,
    created_at: booking.created_at,
    updated_at: booking.updated_at
  }
  selectedInvoiceBooking.value = invoiceBooking
  showInvoice.value = true
}

const handleApproveConfirm = async (payload: ApproveBookingPayload) => {
  if (!selectedBooking.value) return
  
  try {
    const result = await approveBooking(selectedBooking.value.id, payload)
    
    if (result.success) {
      showApproveModal.value = false
      selectedBooking.value = null
      
      // Reload bookings to reflect the approval
      await loadBookings(currentPage.value)
      
      alert('تم الموافقة على الحجز بنجاح')
    } else {
      alert(result.error || 'فشل الموافقة على الحجز')
    }
  } catch (error) {
    console.error('Error approving booking:', error)
    alert('حدث خطأ أثناء الموافقة على الحجز')
  }
}

const cancelBooking = async (bookingId: number) => {
  if (!confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) {
    return
  }
  
  isCancelling.value = bookingId
  
  try {
    const result = await cancelBookingApi(bookingId)
    
    if (result.success) {
      // Reload bookings to reflect the cancellation
      await loadBookings(currentPage.value)
      
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
</script>
