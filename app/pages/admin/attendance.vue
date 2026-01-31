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
        <p class="text-white/90">مراقبة الحضور والانصراف</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">إجمالي السجلات</p>
              <p class="text-2xl font-bold text-gray-800">{{ pagination.total || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock :size="24" class="text-blue-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">حضور اليوم</p>
              <p class="text-2xl font-bold text-green-600">{{ todayAttendanceCount }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle :size="24" class="text-green-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">انصراف اليوم</p>
              <p class="text-2xl font-bold text-orange-600">{{ todayCheckoutCount }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <LogOut :size="24" class="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">سجلات الحضور والانصراف</h2>
          <button
            @click="exportToExcel"
            :disabled="isExporting || attendanceRecords.length === 0"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download :size="18" />
            <span v-if="isExporting">جاري التصدير...</span>
            <span v-else>تصدير Excel</span>
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div v-if="isLoading" class="text-center py-12">
          <p class="text-gray-600">جاري تحميل السجلات...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button
            @click="loadRecords(currentPage)"
            class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="attendanceRecords.length === 0" class="text-center py-12">
          <Clock :size="48" class="mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600 text-lg">لا توجد سجلات حضور</p>
        </div>

        <!-- Attendance Records Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">رقم السجل</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">الموظف</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">وقت الحضور</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">وقت الانصراف</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">عدد الساعات</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="record in attendanceRecords"
                :key="record.id"
                class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-800">#{{ record.id }}</td>
                <td class="px-4 py-3 text-sm text-gray-800">
                  <div>
                    <p class="font-medium">{{ record.employee.name }}</p>
                    <p class="text-xs text-gray-500">{{ record.employee.mobile }}</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-800">{{ formatDate(record.date) }}</td>
                <td class="px-4 py-3 text-sm text-gray-800">
                  <span v-if="record.check_in" class="text-green-600 font-medium">
                    {{ formatTime(record.check_in) }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-800">
                  <span v-if="record.check_out" class="text-orange-600 font-medium">
                    {{ formatTime(record.check_out) }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-800">
                  <span v-if="record.check_in && record.check_out" class="font-medium">
                    {{ calculateHours(record.check_in, record.check_out) }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      getStatusClass(record)
                    ]"
                  >
                    {{ getStatusText(record) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!isLoading && pagination.last_page > 1" class="mt-6 flex items-center justify-center gap-2">
          <button
            @click="previousPage"
            :disabled="currentPage === 1 || isLoading"
            :class="[
              'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
              currentPage === 1 || isLoading
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
              :disabled="isLoading"
              :class="[
                'px-4 py-2 rounded-lg transition-colors min-w-[40px]',
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="nextPage"
            :disabled="currentPage === pagination.last_page || isLoading"
            :class="[
              'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
              currentPage === pagination.last_page || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            <span>التالي</span>
            <ArrowLeft :size="18" />
          </button>
        </div>

        <!-- Pagination Info -->
        <div v-if="!isLoading && pagination.total > 0" class="mt-4 text-center text-sm text-gray-600">
          عرض {{ ((currentPage - 1) * pagination.per_page) + 1 }} إلى {{ Math.min(currentPage * pagination.per_page, pagination.total) }} من {{ pagination.total }} سجل
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Clock, CheckCircle, LogOut, Download, ArrowLeft, ArrowRight } from 'lucide-vue-next'
import type { AdminAttendanceRecord } from '~/composables/useAttendance'
import { useAttendance } from '~/composables/useAttendance'
import type { EmployeeDropdown } from '~/composables/useEmployees'
import { useEmployees } from '~/composables/useEmployees'
import * as XLSX from 'xlsx'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()
const { getAllAttendanceRecords } = useAttendance()
const { getEmployeesDropdown } = useEmployees()

const filterDateFrom = ref<string>('')
const filterDateTo = ref<string>('')
const filterEmployeeId = ref<number | undefined>(undefined)
const employeesList = ref<EmployeeDropdown[]>([])
const isExporting = ref(false)

// Pagination state
const currentPage = ref(1)
const pagination = ref({
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1
})
const isLoading = ref(false)
const error = ref('')

// Attendance records
const attendanceRecords = ref<AdminAttendanceRecord[]>([])

// Load employees
const loadEmployees = async () => {
  try {
    employeesList.value = await getEmployeesDropdown()
  } catch (error) {
    console.error('Error loading employees:', error)
  }
}

// Fetch attendance records
const loadRecords = async (page: number = 1) => {
  isLoading.value = true
  error.value = ''
  
  try {
    const result = await getAllAttendanceRecords(
      page,
      filterDateFrom.value || undefined,
      filterDateTo.value || undefined,
      filterEmployeeId.value
    )
    
    if (result.success && result.data) {
      attendanceRecords.value = result.data.records || []
      pagination.value = result.data.pagination
      currentPage.value = result.data.pagination.current_page
    } else {
      error.value = result.error || 'فشل جلب السجلات'
    }
  } catch (err) {
    console.error('Error loading attendance records:', err)
    error.value = 'حدث خطأ أثناء جلب السجلات'
  } finally {
    isLoading.value = false
  }
}

// Apply filters
const applyFilters = () => {
  currentPage.value = 1
  loadRecords(1)
}

// Clear all filters
const clearFilters = () => {
  filterDateFrom.value = ''
  filterDateTo.value = ''
  filterEmployeeId.value = undefined
  currentPage.value = 1
  loadRecords(1)
}

// Pagination handlers
const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.last_page && page !== currentPage.value) {
    currentPage.value = page
    loadRecords(page)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    const newPage = currentPage.value - 1
    currentPage.value = newPage
    loadRecords(newPage)
  }
}

const nextPage = () => {
  if (currentPage.value < pagination.value.last_page) {
    const newPage = currentPage.value + 1
    currentPage.value = newPage
    loadRecords(newPage)
  }
}

// Format date
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

// Format time
const formatTime = (timeStr: string) => {
  if (!timeStr) return '-'
  // Handle both "HH:mm:ss" and ISO datetime formats
  const time = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr
  const parts = time.split(':')
  const hours = parts[0] ? parseInt(parts[0], 10) : 0
  const minutes = parts[1] ? parseInt(parts[1], 10) : 0
  const hour12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
  const period = hours >= 12 ? 'م' : 'ص'
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Calculate hours worked
const calculateHours = (checkIn: string, checkOut: string) => {
  try {
    const checkInTime = new Date(`2000-01-01T${checkIn.split('T')[1] || checkIn}`)
    const checkOutTime = new Date(`2000-01-01T${checkOut.split('T')[1] || checkOut}`)
    const diff = checkOutTime.getTime() - checkInTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  } catch {
    return '-'
  }
}

// Get status
const getStatusText = (record: AdminAttendanceRecord) => {
  if (record.check_in && record.check_out) {
    return 'مكتمل'
  } else if (record.check_in) {
    return 'حاضر'
  } else {
    return 'غير محدد'
  }
}

const getStatusClass = (record: AdminAttendanceRecord) => {
  if (record.check_in && record.check_out) {
    return 'bg-green-100 text-green-800'
  } else if (record.check_in) {
    return 'bg-yellow-100 text-yellow-800'
  } else {
    return 'bg-gray-100 text-gray-800'
  }
}

// Today's attendance count
const todayAttendanceCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return attendanceRecords.value.filter(r => r.date === today && r.check_in).length
})

const todayCheckoutCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return attendanceRecords.value.filter(r => r.date === today && r.check_out).length
})

// Export to Excel
const exportToExcel = async () => {
  if (attendanceRecords.value.length === 0) {
    alert('لا توجد بيانات للتصدير')
    return
  }

  isExporting.value = true

  try {
    // Prepare data for Excel
    const excelData = attendanceRecords.value.map(record => {
      const hours = record.check_in && record.check_out 
        ? calculateHours(record.check_in, record.check_out)
        : '-'

      return {
        'رقم السجل': record.id,
        'اسم الموظف': record.employee.name,
        'البريد الإلكتروني': record.employee.email,
        'الجوال': record.employee.mobile,
        'التاريخ': formatDate(record.date),
        'وقت الحضور': record.check_in ? formatTime(record.check_in) : '-',
        'وقت الانصراف': record.check_out ? formatTime(record.check_out) : '-',
        'عدد الساعات': hours,
        'الحالة': getStatusText(record),
        'تاريخ الإنشاء': formatDate(record.created_at)
      }
    })

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الحضور والانصراف')

    // Generate filename with current date
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const filename = `حضور_انصراف_${dateStr}.xlsx`

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

// Load data on mount
onMounted(async () => {
  await Promise.all([
    loadRecords(1),
    loadEmployees()
  ])
})
</script>
