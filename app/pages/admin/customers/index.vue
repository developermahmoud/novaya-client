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
      <!-- Header Section -->
      <div class="bg-gradient-to-l from-primary to-primary-dark text-white rounded-xl p-6 shadow-lg">
        <h1 class="text-2xl font-bold mb-2">إدارة العملاء</h1>
        <p class="text-white/90">عرض وإدارة بيانات العملاء</p>
      </div>

      <!-- Search Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">البحث باسم العميل</label>
            <div class="relative">
              <Search :size="20" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchName"
                @input="handleSearch"
                type="text"
                placeholder="ابحث عن عميل..."
                class="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Customers Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">قائمة العملاء</h2>
          <div class="flex items-center gap-4">
            <div class="text-sm text-gray-600">
              إجمالي العملاء: <span class="font-semibold text-gray-800">{{ pagination.total || 0 }}</span>
            </div>
            <button
              @click="exportToExcel"
              :disabled="isExporting || customers.length === 0"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download :size="18" />
              <span v-if="isExporting">جاري التصدير...</span>
              <span v-else>تصدير Excel</span>
            </button>
            <button
              @click="showAddModal = true"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <Plus :size="18" />
              <span>إضافة عميل جديد</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingCustomers" class="text-center py-12">
          <p class="text-gray-600">جاري تحميل العملاء...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="customersError" class="text-center py-12">
          <p class="text-red-600 mb-4">{{ customersError }}</p>
          <button
            @click="loadCustomers(currentPage)"
            class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="customers.length === 0" class="text-center py-12">
          <Users :size="48" class="mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600 text-lg">لا توجد عملاء</p>
        </div>

        <!-- Customers List -->
        <div v-else-if="!isLoadingCustomers && !customersError && customers.length > 0" class="space-y-4">
          <div
            v-for="customer in customers"
            :key="customer.id"
            class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {{ customer.name.charAt(0) }}
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">{{ customer.name }}</h3>
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-semibold inline-block mt-1',
                        customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      ]"
                    >
                      {{ customer.status === 'active' ? 'نشط' : 'غير نشط' }}
                    </span>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <Mail :size="16" class="text-gray-400" />
                    <span>{{ customer.email }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Phone :size="16" class="text-gray-400" />
                    <span>{{ customer.mobile }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Calendar :size="16" class="text-gray-400" />
                    <span>حجوزات مكتملة: <span class="font-semibold text-gray-800">{{ customer.completed_bookings_count || 0 }}</span></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <DollarSign :size="16" class="text-gray-400" />
                    <span>إجمالي المبلغ: <span class="font-semibold text-gray-800">{{ customer.total_amount || 0 }} ريال</span></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Clock :size="16" class="text-gray-400" />
                    <span>تاريخ التسجيل: {{ formatDate(customer.created_at) }}</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <NuxtLink
                  :to="`/admin/customers/${customer.id}`"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  title="عرض الحجوزات"
                >
                  <Calendar :size="18" />
                  <span>عرض الحجوزات</span>
                </NuxtLink>
                <button
                  @click="openBookingModal(customer)"
                  class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                  title="إضافة حجز"
                >
                  <CalendarPlus :size="18" />
                  <span>إضافة حجز</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="!isLoadingCustomers && pagination.last_page > 1" class="mt-6 flex items-center justify-center gap-2">
          <button
            @click="previousPage"
            :disabled="currentPage === 1 || isLoadingCustomers"
            :class="[
              'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
              currentPage === 1 || isLoadingCustomers
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
              :disabled="isLoadingCustomers"
              :class="[
                'px-4 py-2 rounded-lg transition-colors min-w-[40px]',
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
                isLoadingCustomers ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="nextPage"
            :disabled="currentPage === pagination.last_page || isLoadingCustomers"
            :class="[
              'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
              currentPage === pagination.last_page || isLoadingCustomers
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            <span>التالي</span>
            <ArrowLeft :size="18" />
          </button>
        </div>

        <!-- Pagination Info -->
        <div v-if="!isLoadingCustomers && pagination.total > 0" class="mt-4 text-center text-sm text-gray-600">
          عرض {{ ((currentPage - 1) * pagination.per_page) + 1 }} إلى {{ Math.min(currentPage * pagination.per_page, pagination.total) }} من {{ pagination.total }} عميل
        </div>
      </div>
    </div>

    <!-- Booking Modal for Customer -->
    <ReceptionistBookingModal
      :is-open="showBookingModal"
      :customer-id="selectedCustomerId"
      :customer-name="selectedCustomerName"
      @close="closeBookingModal"
      @booking-created="handleBookingCreated"
    />

    <!-- Add Customer Modal -->
    <UiModal :is-open="showAddModal" title="إضافة عميل جديد" size="md" @close="closeAddModal">
      <form @submit.prevent="handleAddCustomer" class="space-y-4">
        <UiInput
          v-model="newCustomer.name"
          label="الاسم الكامل"
          type="text"
          :error="errors.name"
          required
          @input="errors.name = ''"
        />
        <UiInput
          v-model="newCustomer.email"
          label="البريد الإلكتروني"
          type="email"
          :error="errors.email"
          required
          @input="errors.email = ''"
        />
        <UiInput
          v-model="newCustomer.mobile"
          label="رقم الجوال (سعودي)"
          type="tel"
          placeholder="05xxxxxxxx"
          :error="errors.mobile"
          required
          @input="errors.mobile = ''"
        />
        <UiInput
          v-model="newCustomer.password"
          label="كلمة المرور"
          type="password"
          :error="errors.password"
          required
          @input="errors.password = ''"
        />
        <div v-if="addError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {{ addError }}
        </div>
        <div class="flex gap-3">
          <UiButton type="button" variant="outline" full-width @click="closeAddModal" :disabled="isAdding">
            إلغاء
          </UiButton>
          <UiButton type="submit" full-width :disabled="isAdding">
            {{ isAdding ? 'جاري الإضافة...' : 'إضافة' }}
          </UiButton>
        </div>
      </form>
    </UiModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Search, Users, Mail, Phone, Calendar, DollarSign, Clock, ArrowLeft, ArrowRight, Plus, CalendarPlus, Download } from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import type { Customer } from '~/composables/useCustomers'
import { useCustomers } from '~/composables/useCustomers'
import { validateName, validateEmail, validateSaudiMobile, validatePassword, normalizeSaudiMobile } from '~/utils/validation'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()
const { fetchCustomers, createCustomer } = useCustomers()
const router = useRouter()

// Add customer modal state
const showAddModal = ref(false)
const isAdding = ref(false)
const addError = ref('')
const newCustomer = ref({
  name: '',
  email: '',
  mobile: '',
  password: ''
})
const errors = ref({
  name: '',
  email: '',
  mobile: '',
  password: ''
})

// Booking modal state
const showBookingModal = ref(false)
const selectedCustomerId = ref<number | null>(null)
const selectedCustomerName = ref('')

const searchName = ref('')
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// Pagination state
const currentPage = ref(1)
const pagination = ref({
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1
})
const isLoadingCustomers = ref(false)
const customersError = ref('')
const isExporting = ref(false)

// Customers data
const customers = ref<Customer[]>([])

// Fetch customers from API
const loadCustomers = async (page: number = 1, name?: string) => {
  isLoadingCustomers.value = true
  customersError.value = ''
  
  try {
    const result = await fetchCustomers(page, name)
    
    if (result.success && result.data) {
      customers.value = result.data.customers || []
      pagination.value = result.data.pagination
      currentPage.value = result.data.pagination.current_page
    } else {
      customersError.value = result.error || 'فشل جلب العملاء'
    }
  } catch (error) {
    console.error('Error loading customers:', error)
    customersError.value = 'حدث خطأ أثناء جلب العملاء'
  } finally {
    isLoadingCustomers.value = false
  }
}

// Handle search with debounce
const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1
    loadCustomers(1, searchName.value)
  }, 500)
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

// Pagination handlers
const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.last_page && page !== currentPage.value) {
    currentPage.value = page
    loadCustomers(page, searchName.value || undefined)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    const newPage = currentPage.value - 1
    currentPage.value = newPage
    loadCustomers(newPage, searchName.value || undefined)
  }
}

const nextPage = () => {
  if (currentPage.value < pagination.value.last_page) {
    const newPage = currentPage.value + 1
    currentPage.value = newPage
    loadCustomers(newPage, searchName.value || undefined)
  }
}

// Load data on mount
onMounted(async () => {
  await loadCustomers(1)
})

// Handle add customer
const handleAddCustomer = async () => {
  addError.value = ''
  errors.value = {
    name: '',
    email: '',
    mobile: '',
    password: ''
  }

  // Validate name
  const nameValidation = validateName(newCustomer.value.name)
  if (!nameValidation.isValid) {
    errors.value.name = nameValidation.error || 'الاسم مطلوب'
    return
  }

  // Validate email
  const emailValidation = validateEmail(newCustomer.value.email)
  if (!emailValidation.isValid) {
    errors.value.email = emailValidation.error || 'البريد الإلكتروني غير صحيح'
    return
  }

  // Validate mobile
  const mobileValidation = validateSaudiMobile(newCustomer.value.mobile)
  if (!mobileValidation.isValid) {
    errors.value.mobile = mobileValidation.error || 'رقم الجوال غير صحيح'
    return
  }

  // Validate password
  const passwordValidation = validatePassword(newCustomer.value.password)
  if (!passwordValidation.isValid) {
    errors.value.password = passwordValidation.error || 'كلمة المرور غير صحيحة'
    return
  }

  isAdding.value = true

  try {
    const normalizedMobile = normalizeSaudiMobile(newCustomer.value.mobile)
    await createCustomer({
      name: newCustomer.value.name.trim(),
      email: newCustomer.value.email.trim(),
      mobile: normalizedMobile,
      password: newCustomer.value.password
    })

    // Reset form
    newCustomer.value = {
      name: '',
      email: '',
      mobile: '',
      password: ''
    }
    showAddModal.value = false

    // Reload customers list
    await loadCustomers(currentPage.value, searchName.value || undefined)
    
    alert('تم إضافة العميل بنجاح')
  } catch (error: any) {
    console.error('Error adding customer:', error)
    addError.value = error.message || 'فشل إضافة العميل'
  } finally {
    isAdding.value = false
  }
}

const closeAddModal = () => {
  if (!isAdding.value) {
    showAddModal.value = false
    newCustomer.value = {
      name: '',
      email: '',
      mobile: '',
      password: ''
    }
    errors.value = {
      name: '',
      email: '',
      mobile: '',
      password: ''
    }
    addError.value = ''
  }
}

// Booking modal handlers
const openBookingModal = (customer: Customer) => {
  selectedCustomerId.value = customer.id
  selectedCustomerName.value = customer.name
  showBookingModal.value = true
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedCustomerId.value = null
  selectedCustomerName.value = ''
}

const handleBookingCreated = async () => {
  // Reload customers to update booking counts
  await loadCustomers(currentPage.value, searchName.value || undefined)
}

// Navigate to customer bookings page
const viewCustomerBookings = (customerId: number) => {
  router.push(`/admin/customers/${customerId}`)
}

// Export to Excel
const exportToExcel = async () => {
  if (customers.value.length === 0) {
    alert('لا توجد بيانات للتصدير')
    return
  }

  isExporting.value = true

  try {
    // Prepare data for Excel
    const excelData = customers.value.map(customer => {
      return {
        'رقم العميل': customer.id,
        'الاسم': customer.name,
        'البريد الإلكتروني': customer.email,
        'الجوال': customer.mobile,
        'الحالة': customer.status === 'active' ? 'نشط' : 'غير نشط',
        'حجوزات مكتملة': customer.completed_bookings_count || 0,
        'إجمالي المبلغ': customer.total_amount || 0,
        'تاريخ التسجيل': formatDate(customer.created_at)
      }
    })

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'العملاء')

    // Generate filename with current date
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const filename = `عملاء_${dateStr}.xlsx`

    // Write file
    XLSX.writeFile(workbook, filename)

    alert('تم تصدير البيانات بنجاح')
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    alert('حدث خطأ أثناء تصدير البيانات')
  } finally {
    isExporting.value = false
  }
}

// Cleanup timeout on unmount
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>
