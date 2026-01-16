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

      <!-- Today's Schedule -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">مواعيد اليوم</h2>
        <div class="text-center py-12">
          <Calendar :size="48" class="mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600">لا توجد مواعيد اليوم</p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Calendar } from 'lucide-vue-next'

definePageMeta({
  layout: 'employee'
})

const { user } = useAuth()

// Middleware will handle authentication check if needed
</script>
