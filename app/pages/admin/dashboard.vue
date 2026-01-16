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
              <p class="text-2xl font-bold text-gray-800">0</p>
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
              <p class="text-2xl font-bold text-green-600">0</p>
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
              <p class="text-2xl font-bold text-purple-600">0</p>
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
              <p class="text-2xl font-bold text-yellow-600">0 ريال</p>
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NuxtLink to="/admin/users" class="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
            <h3 class="font-semibold text-gray-800 mb-2">إدارة المستخدمين</h3>
            <p class="text-sm text-gray-600">عرض وإدارة جميع المستخدمين</p>
          </NuxtLink>
          <NuxtLink to="/admin/bookings" class="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
            <h3 class="font-semibold text-gray-800 mb-2">إدارة الحجوزات</h3>
            <p class="text-sm text-gray-600">عرض وإدارة جميع الحجوزات</p>
          </NuxtLink>
          <NuxtLink to="/admin/services" class="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
            <h3 class="font-semibold text-gray-800 mb-2">إدارة الخدمات</h3>
            <p class="text-sm text-gray-600">إضافة وتعديل الخدمات</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Calendar, Users, Briefcase, DollarSign } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()

// Middleware will handle authentication check
</script>
