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
              <p class="text-2xl font-bold text-gray-800">{{ customerBookings.length }}</p>
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
              <p class="text-2xl font-bold text-yellow-600">{{ pendingBookings.length }}</p>
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
            @click="activeFilter = filter.value"
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

        <!-- Bookings List -->
        <div v-if="filteredBookings.length === 0" class="text-center py-12">
          <Calendar :size="48" class="mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600 text-lg">لا توجد حجوزات {{ activeFilter === 'all' ? '' : filters.find(f => f.value === activeFilter)?.label.toLowerCase() }}</p>
          <NuxtLink
            to="/"
            class="mt-4 inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            احجز موعدك الآن
          </NuxtLink>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="booking in filteredBookings"
            :key="booking.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-800">
                    حجز #{{ booking.id.slice(-6) }}
                  </h3>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      getStatusConfig(booking.status).color
                    ]"
                  >
                    {{ getStatusConfig(booking.status).text }}
                  </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <Calendar :size="16" class="text-gray-400" />
                    <span>{{ formatDate(booking.date) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Clock :size="16" class="text-gray-400" />
                    <span>{{ formatTime12Hour(booking.time) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Scissors :size="16" class="text-gray-400" />
                    <span>{{ getServiceNames(booking.services, services) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <DollarSign :size="16" class="text-gray-400" />
                    <span class="font-semibold text-gray-800">{{ booking.totalPrice }} ريال</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button
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
      </div>
    </div>

    <!-- Invoice Modal -->
    <InvoiceModal
      :is-open="showInvoice"
      :booking="selectedBooking"
      :services="services"
      :client-name="user?.name || ''"
      @close="showInvoice = false"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Calendar, Clock, DollarSign, Scissors, FileText } from 'lucide-vue-next'
import type { Booking } from '~/composables/useData'
import { getStatusConfig, getServiceNames, formatTime12Hour } from '~/utils/helpers'

definePageMeta({
  layout: 'customer'
})

const { user } = useAuth()
const { bookings, services, updateBooking } = useData()

const activeFilter = ref<'all' | 'pending' | 'completed' | 'cancelled'>('all')
const showInvoice = ref(false)
const selectedBooking = ref<Booking | null>(null)

const customerBookings = computed(() => {
  if (!user.value) return []
  return bookings.value
    .filter(b => b.clientId === user.value!.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const pendingBookings = computed(() => {
  return customerBookings.value.filter(b => b.status === 'pending')
})

const totalSpent = computed(() => {
  return customerBookings.value
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0)
})

const filters = computed(() => [
  { value: 'all' as const, label: 'الكل', count: customerBookings.value.length },
  { value: 'pending' as const, label: 'معلقة', count: customerBookings.value.filter(b => b.status === 'pending').length },
  { value: 'completed' as const, label: 'مكتملة', count: customerBookings.value.filter(b => b.status === 'completed').length },
  { value: 'cancelled' as const, label: 'ملغاة', count: customerBookings.value.filter(b => b.status === 'cancelled').length },
])

const filteredBookings = computed(() => {
  if (activeFilter.value === 'all') {
    return customerBookings.value
  }
  return customerBookings.value.filter(b => b.status === activeFilter.value)
})

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  const day = days[dateObj.getDay()]
  const dayNum = dateObj.getDate()
  const month = months[dateObj.getMonth()]
  const year = dateObj.getFullYear()
  return `${day}، ${dayNum} ${month} ${year}`
}

const viewInvoice = (booking: Booking) => {
  selectedBooking.value = booking
  showInvoice.value = true
}

const cancelBooking = (bookingId: string) => {
  if (confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) {
    updateBooking(bookingId, { status: 'cancelled' })
  }
}

// Middleware will handle authentication check if needed
</script>
