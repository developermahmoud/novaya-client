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
      <!-- Welcome Section -->
      <div class="bg-gradient-to-l from-primary to-primary-dark text-white rounded-xl p-6 shadow-lg">
        <h1 class="text-2xl font-bold mb-2">مرحباً {{ user.name }} 👋</h1>
        <p class="text-white/90">إدارة الحجوزات والاستقبال</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">حجوزات اليوم</p>
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
              <p class="text-gray-600 text-sm mb-1">حجوزات معلقة</p>
              <p class="text-2xl font-bold text-yellow-600">0</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock :size="24" class="text-yellow-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">العملاء الجدد</p>
              <p class="text-2xl font-bold text-green-600">0</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users :size="24" class="text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Calendar, Clock, Users } from 'lucide-vue-next'

definePageMeta({
  layout: 'receptionist'
})

const { user } = useAuth()

// Middleware will handle authentication check if needed
</script>
