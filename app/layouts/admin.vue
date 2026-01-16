<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 lg:translate-x-0 flex flex-col" :class="{ 'translate-x-0': sidebarOpen, 'translate-x-full': !sidebarOpen }">
      <div class="p-6 border-b border-gray-200">
        <NuxtLink to="/" class="flex items-center gap-3">
          <img src="/logo.png" alt="نوفايا" class="h-12 w-auto" />
          <span class="text-xl font-bold text-gray-800">نوفايا - إدارة</span>
        </NuxtLink>
      </div>
      <nav class="p-4 space-y-2 flex-1">
        <NuxtLink to="/admin/dashboard" class="nav-item" active-class="bg-secondary text-primary border-r-4 border-primary">
          <span class="text-xl">📊</span>
          <span>لوحة التحكم</span>
        </NuxtLink>
        <NuxtLink to="/admin/customers" class="nav-item" active-class="bg-secondary text-primary border-r-4 border-primary">
          <span class="text-xl">👥</span>
          <span>العملاء</span>
        </NuxtLink>
        <NuxtLink to="/admin/bookings" class="nav-item" active-class="bg-secondary text-primary border-r-4 border-primary">
          <span class="text-xl">📅</span>
          <span>الحجوزات</span>
        </NuxtLink>
        <NuxtLink to="/admin/categories" class="nav-item" active-class="bg-secondary text-primary border-r-4 border-primary">
          <span class="text-xl">📁</span>
          <span>الأقسام</span>
        </NuxtLink>
        <NuxtLink to="/admin/services" class="nav-item" active-class="bg-secondary text-primary border-r-4 border-primary">
          <span class="text-xl">💅</span>
          <span>الخدمات</span>
        </NuxtLink>
        <NuxtLink to="/admin/employees" class="nav-item" active-class="bg-secondary text-primary border-r-4 border-primary">
          <span class="text-xl">👨‍💼</span>
          <span>الموظفين</span>
        </NuxtLink>
        <NuxtLink to="/admin/reports" class="nav-item" active-class="bg-secondary text-primary border-r-4 border-primary">
          <span class="text-xl">📈</span>
          <span>التقارير</span>
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="nav-item" active-class="bg-secondary text-primary border-r-4 border-primary">
          <span class="text-xl">⚙️</span>
          <span>الإعدادات</span>
        </NuxtLink>
      </nav>
      
      <!-- User Info -->
      <div v-if="user" class="p-4 border-t border-gray-200 bg-white">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {{ user.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 text-sm truncate">{{ user.name }}</p>
            <p class="text-xs text-gray-600 truncate">{{ user.email }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
        >
          تسجيل الخروج
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="lg:mr-64">
      <!-- Top Bar -->
      <header class="bg-white shadow-sm sticky top-0 z-30">
        <div class="px-6 py-4 flex items-center justify-between">
          <button @click="toggleSidebar" class="lg:hidden text-gray-600 hover:text-gray-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <div class="flex items-center gap-4">
            <div class="text-sm text-gray-600">
              <span class="font-semibold text-gray-800">لوحة تحكم المدير</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>

    <!-- Mobile Overlay -->
    <div v-if="sidebarOpen" @click="toggleSidebar" class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"></div>
  </div>
</template>

<script setup>
import { getDashboardRoute } from '~/utils/routes'

const { user, logout } = useAuth()
const sidebarOpen = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleLogout = async () => {
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    await logout()
    await navigateTo('/', { replace: true })
  }
}

onMounted(() => {
  // Auto-close sidebar on mobile
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
})
</script>

<style scoped>
.nav-item {
  @apply flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium;
}
</style>
