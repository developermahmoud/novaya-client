<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-secondary to-white">
    <!-- Header -->
    <header class="bg-white shadow-lg sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div class="container mx-auto px-4 py-1.5">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <NuxtLink to="/" class="flex items-center">
              <img
                src="/logo.png"
                alt="نوفايا"
                class="object-contain w-20 sm:w-24 md:w-[100px] h-auto"
              />
            </NuxtLink>
          </div>
          <div class="flex items-center gap-1 sm:gap-2">
            <a
              href="#contact"
              class="flex items-center gap-1.5 px-3 py-1.5 text-text-secondary hover:text-primary transition-colors font-medium text-sm"
            >
              <Phone :size="16" />
              <span class="hidden md:inline">اتصل بنا</span>
            </a>
            <a
              href="#testimonials"
              class="flex items-center gap-1.5 px-3 py-1.5 text-text-secondary hover:text-primary transition-colors font-medium text-sm"
            >
              <MessageCircle :size="16" />
              <span class="hidden md:inline">آراء العملاء</span>
            </a>
            <template v-if="user">
              <NuxtLink
                :to="dashboardRoute"
                class="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm"
              >
                <span>لوحة التحكم</span>
              </NuxtLink>
            </template>
            <template v-else>
              <button
                @click="showLogin = true"
                class="px-4 py-1.5 text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200 font-semibold hover:shadow-md text-sm"
              >
                تسجيل الدخول
              </button>
              <button
                @click="showRegister = true"
                class="px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm"
              >
                تسجيل جديد
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>
    
    <main class="flex-grow">
      <slot />
    </main>
    
    <!-- Footer will be in the page component -->
    
    <!-- Modals -->
    <LoginModal
      :is-open="showLogin"
      @close="showLogin = false"
      @switch-to-register="() => { showLogin = false; showRegister = true; }"
    />
    <RegisterModal
      :is-open="showRegister"
      @close="showRegister = false"
      @switch-to-login="() => { showRegister = false; showLogin = true; }"
    />
  </div>
</template>

<script setup lang="ts">
import { Phone, MessageCircle } from 'lucide-vue-next'
import { getDashboardRoute } from '~/utils/routes'

const { user } = useAuth()
const showLogin = ref(false)
const showRegister = ref(false)

const dashboardRoute = computed(() => {
  if (!user.value) return '/customer/dashboard'
  return getDashboardRoute(user.value.role)
})
</script>
