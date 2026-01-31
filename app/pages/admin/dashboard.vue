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
        <p class="text-white/90">لوحة تحكم المدير</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">إجمالي الحجوزات</p>
              <p v-if="isLoadingStats" class="text-2xl font-bold text-gray-800">...</p>
              <p v-else class="text-2xl font-bold text-gray-800">{{ statistics.total_bookings || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar :size="24" class="text-blue-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">العملاء</p>
              <p v-if="isLoadingStats" class="text-2xl font-bold text-green-600">...</p>
              <p v-else class="text-2xl font-bold text-green-600">{{ statistics.total_customers || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users :size="24" class="text-green-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">الموظفين</p>
              <p v-if="isLoadingStats" class="text-2xl font-bold text-purple-600">...</p>
              <p v-else class="text-2xl font-bold text-purple-600">{{ statistics.total_employees || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Briefcase :size="24" class="text-purple-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">الإيرادات</p>
              <p v-if="isLoadingStats" class="text-2xl font-bold text-yellow-600">...</p>
              <p v-else class="text-2xl font-bold text-yellow-600">{{ formatCurrency(statistics.total_revenue || 0) }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign :size="24" class="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink to="/admin/customers" class="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
            <h3 class="font-semibold text-gray-800 mb-2">إدارة العملاء</h3>
            <p class="text-sm text-gray-600">عرض وإدارة جميع العملاء</p>
          </NuxtLink>
          <NuxtLink to="/admin/bookings" class="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
            <h3 class="font-semibold text-gray-800 mb-2">إدارة الحجوزات</h3>
            <p class="text-sm text-gray-600">عرض وإدارة جميع الحجوزات</p>
          </NuxtLink>
          <NuxtLink to="/admin/services" class="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
            <h3 class="font-semibold text-gray-800 mb-2">إدارة الخدمات</h3>
            <p class="text-sm text-gray-600">إضافة وتعديل الخدمات</p>
          </NuxtLink>
          <NuxtLink to="/admin/employees" class="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
            <h3 class="font-semibold text-gray-800 mb-2">إدارة الموظفين</h3>
            <p class="text-sm text-gray-600">عرض وإدارة الموظفين</p>
          </NuxtLink>
          <NuxtLink to="/admin/attendance" class="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
            <h3 class="font-semibold text-gray-800 mb-2">الحضور والانصراف</h3>
            <p class="text-sm text-gray-600">مراقبة حضور وانصراف الموظفين</p>
          </NuxtLink>
          <NuxtLink to="/admin/categories" class="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
            <h3 class="font-semibold text-gray-800 mb-2">إدارة الأقسام</h3>
            <p class="text-sm text-gray-600">عرض وإدارة أقسام الخدمات</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Calendar, Users, Briefcase, DollarSign } from 'lucide-vue-next'
import { useData } from '~/composables/useData'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()
const { fetchStatistics } = useData()

// Statistics state
const statistics = ref({
  total_bookings: 0,
  total_customers: 0,
  total_employees: 0,
  total_revenue: 0
})
const isLoadingStats = ref(false)
const statsError = ref('')

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount) + ' ريال'
}

// Load statistics
const loadStatistics = async () => {
  isLoadingStats.value = true
  statsError.value = ''
  
  try {
    const result = await fetchStatistics()
    
    if (result.success && result.data) {
      statistics.value = result.data
    } else {
      statsError.value = result.error || 'فشل جلب الإحصائيات'
      console.error('Failed to load statistics:', statsError.value)
    }
  } catch (error) {
    console.error('Error loading statistics:', error)
    statsError.value = 'حدث خطأ أثناء جلب الإحصائيات'
  } finally {
    isLoadingStats.value = false
  }
}

// Load statistics on mount
onMounted(async () => {
  await loadStatistics()
})
</script>
