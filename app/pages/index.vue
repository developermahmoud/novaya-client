<template>
  <div>
    <!-- Hero Section -->
    <section class="container mx-auto px-4 py-16 text-center">
      <div class="mb-8">
        <img
          src="/logo.png"
          alt="نوفايا"
          class="mx-auto object-contain w-48 h-24"
        />
      </div>
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4 px-4">مرحباً بكم في نوفايا</h1>
      <p class="text-base sm:text-lg md:text-xl text-text-secondary mb-8 max-w-2xl mx-auto px-4">
        صالون نسائي متخصص في تقديم أجود الخدمات التجميلية للشعر والحواجب والرموش والمانيكير والباديكير
      </p>
      <button
        @click="handleBookClick"
        class="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-primary text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-lg"
      >
        <Calendar :size="20" class="sm:w-6 sm:h-6" />
        <span>احجز موعدك الآن</span>
      </button>
    </section>

    <!-- Services Section -->
    <section class="container mx-auto px-4 py-8 sm:py-12 md:py-16">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-text-primary mb-8 sm:mb-12">خدماتنا</h2>
      <div v-if="isLoadingServices" class="text-center py-12">
        <p class="text-text-secondary">جاري تحميل الخدمات...</p>
      </div>
      <div v-else-if="services.length === 0" class="text-center py-12">
        <p class="text-text-secondary">لا توجد خدمات متاحة حالياً</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="service in services"
          :key="service.id"
          class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-secondary rounded-full">
              <component :is="getServiceIcon(service.category)" :size="32" class="text-primary" />
            </div>
            <div>
              <h3 class="text-xl font-semibold text-text-primary">{{ service.name }}</h3>
              <p class="text-text-secondary">{{ service.duration }} دقيقة</p>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-2xl font-bold text-primary">{{ service.price }} ريال</span>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="bg-white py-8 sm:py-12 md:py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-text-primary mb-6 sm:mb-8">من نحن</h2>
        <div class="max-w-3xl mx-auto text-center text-base sm:text-lg text-text-secondary leading-relaxed px-4">
          <p class="mb-4">
            نوفايا هو صالون نسائي راقي يقدم مجموعة شاملة من الخدمات التجميلية المتخصصة.
            نحن ملتزمون بتقديم أفضل تجربة تجميلية لعملائنا الكرام.
          </p>
          <p class="mb-4">
            فريقنا المحترف من الخبراء يستخدم أحدث التقنيات وأجود المنتجات لضمان رضاكم التام.
          </p>
          <p>
            نفتخر بخدمة عملائنا في المملكة العربية السعودية ونحرص على تقديم خدمة متميزة تلبي جميع احتياجاتكم التجميلية.
          </p>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="bg-light-bg py-8 sm:py-12 md:py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-text-primary mb-4">آراء العملاء</h2>
        <p class="text-center text-text-secondary mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base px-4">
          نفتخر بثقة عملائنا الكرام. إليك بعض آراء عملائنا المميزين
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          <div
            v-for="testimonial in testimonials"
            :key="testimonial.id"
            class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div class="flex items-center gap-1 mb-4 text-yellow-400 text-xl">
              <span v-for="i in 5" :key="i">★</span>
            </div>
            <p class="text-text-secondary mb-6 leading-relaxed">{{ testimonial.text }}</p>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                {{ testimonial.initial }}
              </div>
              <div>
                <p class="font-semibold text-text-primary">{{ testimonial.name }}</p>
                <p class="text-sm text-text-secondary">عميلة منذ {{ testimonial.since }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="bg-white py-8 sm:py-12 md:py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-text-primary mb-4">اتصل بنا</h2>
        <p class="text-center text-text-secondary mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base px-4">
          نحن هنا لخدمتك في أي وقت. تواصل معنا عبر الطرق التالية
        </p>
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            <div class="bg-light-bg rounded-xl p-6 sm:p-8 text-center">
              <div class="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Phone :size="24" class="text-white sm:w-8 sm:h-8" />
              </div>
              <h3 class="text-lg sm:text-xl font-semibold text-text-primary mb-2">اتصل بنا</h3>
              <p class="text-text-secondary mb-3 sm:mb-4 text-sm sm:text-base">
                {{ settings?.mobile || 'نحن متاحون من الساعة 12 ظهراً حتى 12 ليلاً' }}
              </p>
              <a
                :href="`tel:${formatPhoneForTel(settings?.mobile || '0500000000')}`"
                class="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm sm:text-base"
              >
                <Phone :size="18" class="sm:w-5 sm:h-5" />
                <span>اتصل الآن</span>
              </a>
            </div>
            <div class="bg-light-bg rounded-xl p-6 sm:p-8 text-center">
              <div class="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MessageCircle :size="24" class="text-white sm:w-8 sm:h-8" />
              </div>
              <h3 class="text-lg sm:text-xl font-semibold text-text-primary mb-2">واتساب</h3>
              <p class="text-text-secondary mb-3 sm:mb-4 text-sm sm:text-base">تواصل معنا مباشرة عبر الواتساب</p>
              <a
                :href="`https://wa.me/${formatPhoneForWhatsApp(settings?.whatsapp || settings?.mobile || '0500000000')}`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm sm:text-base"
              >
                <MessageCircle :size="18" class="sm:w-5 sm:h-5" />
                <span>فتح الواتساب</span>
              </a>
            </div>
          </div>
          <div class="bg-secondary rounded-xl p-4 sm:p-6 lg:p-8 text-center">
            <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary mb-3 sm:mb-4">معلومات التواصل</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-text-secondary text-xs sm:text-sm lg:text-base">
              <div>
                <p class="font-semibold mb-1">العنوان</p>
                <p class="text-sm">{{ settings?.address || 'المملكة العربية السعودية' }}</p>
              </div>
              <div>
                <p class="font-semibold mb-1">الهاتف</p>
                <p class="text-sm">{{ settings?.mobile || '+966 50 000 0000' }}</p>
              </div>
              <div>
                <p class="font-semibold mb-1">البريد الإلكتروني</p>
                <p class="text-sm">{{ settings?.email || 'info@novaya.com' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gradient-to-b from-light-bg to-white border-t-2 border-primary/20">
      <div class="container mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 mb-8 sm:mb-10">
          <!-- Logo and Description -->
          <div class="text-center sm:text-right">
            <div class="mb-4 sm:mb-6">
              <img
                src="/logo.png"
                alt="نوفايا"
                class="mx-auto sm:mx-0 mb-3 sm:mb-4 object-contain w-30 h-15"
              />
            </div>
            <p class="text-text-secondary text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 px-4 sm:px-0">
              صالون نسائي متخصص في أجود الخدمات التجميلية والعناية بالجمال
            </p>
            <div class="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-4 sm:mt-6 flex-wrap">
              <a
                v-if="settings?.facebook_link"
                :href="settings.facebook_link"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center w-9 h-9 bg-white border border-color rounded-full hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Facebook"
              >
                <Facebook :size="16" class="flex-shrink-0" />
              </a>
              <a
                v-if="settings?.instagram_link"
                :href="settings.instagram_link"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center w-9 h-9 bg-white border border-color rounded-full hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Instagram"
              >
                <Instagram :size="16" class="flex-shrink-0" />
              </a>
              <a
                v-if="settings?.twitter_link"
                :href="settings.twitter_link"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center w-9 h-9 bg-white border border-color rounded-full hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Twitter"
              >
                <Twitter :size="16" class="flex-shrink-0" />
              </a>
              <a
                v-if="settings?.youtube_link"
                :href="settings.youtube_link"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center w-9 h-9 bg-white border border-color rounded-full hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="YouTube"
              >
                <Youtube :size="16" class="flex-shrink-0" />
              </a>
              <a
                v-if="settings?.whatsapp || settings?.mobile"
                :href="`https://wa.me/${formatPhoneForWhatsApp(settings?.whatsapp || settings?.mobile || '0500000000')}`"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center w-9 h-9 bg-green-500 rounded-full hover:bg-green-600 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="WhatsApp"
              >
                <MessageCircle :size="16" class="flex-shrink-0" />
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="text-center sm:text-right">
            <h3 class="font-bold text-text-primary mb-4 sm:mb-6 text-base sm:text-lg relative pb-2 sm:pb-3 inline-block sm:block">
              <span class="relative">
                روابط سريعة
                <span class="absolute bottom-0 right-0 w-8 sm:w-12 h-0.5 bg-primary"></span>
              </span>
            </h3>
            <div class="flex flex-col gap-2 sm:gap-3 mt-4 sm:mt-0">
              <a
                href="#contact"
                class="text-text-secondary hover:text-primary transition-all duration-200 hover:translate-x-[-4px] text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-2 py-1"
              >
                <span class="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100"></span>
                اتصل بنا
              </a>
              <a
                href="#testimonials"
                class="text-text-secondary hover:text-primary transition-all duration-200 hover:translate-x-[-4px] text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-2 py-1"
              >
                <span class="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100"></span>
                آراء العملاء
              </a>
              <NuxtLink
                to="/dashboard"
                class="text-text-secondary hover:text-primary transition-all duration-200 hover:translate-x-[-4px] text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-2 py-1"
              >
                <span class="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100"></span>
                لوحة التحكم
              </NuxtLink>
              <a
                href="#services"
                class="text-text-secondary hover:text-primary transition-all duration-200 hover:translate-x-[-4px] text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-2 py-1"
              >
                <span class="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100"></span>
                خدماتنا
              </a>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="text-center sm:text-right">
            <h3 class="font-bold text-text-primary mb-4 sm:mb-6 text-base sm:text-lg relative pb-2 sm:pb-3 inline-block sm:block">
              <span class="relative">
                معلومات التواصل
                <span class="absolute bottom-0 right-0 w-8 sm:w-12 h-0.5 bg-primary"></span>
              </span>
            </h3>
            <div class="flex flex-col gap-3 sm:gap-4 mt-4 sm:mt-0">
              <div v-if="settings?.mobile" class="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-text-secondary hover:text-primary transition-colors">
                <div class="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex-shrink-0">
                  <Phone :size="14" class="text-primary sm:w-4 sm:h-4" />
                </div>
                <a :href="`tel:${formatPhoneForTel(settings.mobile)}`" class="text-xs sm:text-sm break-all">{{ settings.mobile }}</a>
              </div>
              <div v-if="settings?.whatsapp || settings?.mobile" class="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-text-secondary hover:text-primary transition-colors">
                <div class="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex-shrink-0">
                  <MessageCircle :size="14" class="text-primary sm:w-4 sm:h-4" />
                </div>
                <a :href="`https://wa.me/${formatPhoneForWhatsApp(settings?.whatsapp || settings?.mobile || '0500000000')}`" target="_blank" rel="noopener noreferrer" class="text-xs sm:text-sm">واتساب</a>
              </div>
              <div v-if="settings?.email" class="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-text-secondary hover:text-primary transition-colors">
                <div class="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex-shrink-0">
                  <Mail :size="14" class="text-primary sm:w-4 sm:h-4" />
                </div>
                <a :href="`mailto:${settings.email}`" class="text-xs sm:text-sm break-all">{{ settings.email }}</a>
              </div>
              <div v-if="settings?.address" class="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-text-secondary">
                <div class="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex-shrink-0">
                  <MapPin :size="14" class="text-primary sm:w-4 sm:h-4" />
                </div>
                <span class="text-xs sm:text-sm">{{ settings.address }}</span>
              </div>
            </div>
          </div>

          <!-- Working Hours -->
          <div class="text-center sm:text-right">
            <h3 class="font-bold text-text-primary mb-4 sm:mb-6 text-base sm:text-lg relative pb-2 sm:pb-3 inline-block sm:block">
              <span class="relative">
                ساعات العمل
                <span class="absolute bottom-0 right-0 w-8 sm:w-12 h-0.5 bg-primary"></span>
              </span>
            </h3>
            <div class="flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm text-text-secondary mt-4 sm:mt-0">
              <template v-if="workingHours && workingHours.length > 0">
                <div
                  v-for="(wh, idx) in workingHours"
                  :key="idx"
                  class="flex items-center justify-center sm:justify-start gap-2"
                >
                  <Clock :size="14" class="text-primary sm:w-4 sm:h-4 flex-shrink-0" />
                  <span class="break-words">
                    {{ ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(wh.day)] }}: 
                    {{ wh.isOpen ? `${formatTimeForDisplay(wh.startTime)} - ${formatTimeForDisplay(wh.endTime)}` : 'مغلق' }}
                  </span>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center justify-center sm:justify-start gap-2">
                  <Clock :size="14" class="text-primary sm:w-4 sm:h-4 flex-shrink-0" />
                  <span class="break-words">السبت - الخميس: 12:00 م - 12:00 ص</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-t border-color pt-4 sm:pt-6 mt-6 sm:mt-8">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p class="text-text-secondary text-xs sm:text-sm text-center sm:text-right">
              © {{ new Date().getFullYear() }} نوفايا. جميع الحقوق محفوظة.
            </p>
            <div class="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm justify-center">
              <a href="#" class="text-text-secondary hover:text-primary transition-colors">سياسة الخصوصية</a>
              <a href="#" class="text-text-secondary hover:text-primary transition-colors">شروط الاستخدام</a>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Booking Modal -->
    <BookingModal
      v-if="showBooking"
      :is-open="showBooking"
      @close="showBooking = false"
      @require-login="() => { showBooking = false; showLogin = true; }"
    />
    
    <!-- Login/Register Modals -->
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
import { Calendar, Phone, MessageCircle, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Youtube, Scissors, Eye, Sparkles, Hand, Footprints } from 'lucide-vue-next'
import type { Component } from 'vue'

const { user } = useAuth()
const { services: dataServices, fetchPublicServices, isLoadingServices, settings, fetchPublicSettings, workingHours } = useData()
const showLogin = ref(false)
const showRegister = ref(false)
const showBooking = ref(false)

// Fetch services and settings from API on mount
onMounted(async () => {
  await Promise.all([fetchPublicServices(), fetchPublicSettings()])
})

// Helper functions for phone formatting
const formatPhoneForTel = (phone: string) => {
  if (!phone) return ''
  // Remove any non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  // If it doesn't start with +, assume it's a Saudi number and add +966
  if (!cleaned.startsWith('+')) {
    const digits = cleaned.replace(/\D/g, '')
    if (digits.startsWith('0')) {
      return `+966${digits.substring(1)}`
    }
    return `+966${digits}`
  }
  return cleaned
}

const formatPhoneForWhatsApp = (phone: string) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    return `966${cleaned.substring(1)}`
  }
  if (cleaned.startsWith('966')) {
    return cleaned
  }
  return `966${cleaned}`
}

// Helper function to format time for display
const formatTimeForDisplay = (time24: string) => {
  if (!time24) return ''
  const [hours, minutes] = time24.split(':')
  if (!hours || !minutes) return time24
  const hour = parseInt(hours)
  const period = hour >= 12 ? 'م' : 'ص'
  const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
  return `${hour12}:${minutes} ${period}`
}

// Get working hours display text
const getWorkingHoursText = computed(() => {
  if (!workingHours.value || workingHours.value.length === 0) {
    return 'السبت - الخميس: 12:00 م - 12:00 ص'
  }
  
  const openDays = workingHours.value.filter(wh => wh.isOpen)
  if (openDays.length === 0) return 'مغلق'
  
  // Group consecutive days with same hours
  const dayNames: Record<string, string> = {
    'saturday': 'السبت',
    'sunday': 'الأحد',
    'monday': 'الإثنين',
    'tuesday': 'الثلاثاء',
    'wednesday': 'الأربعاء',
    'thursday': 'الخميس',
    'friday': 'الجمعة',
  }
  
  // For now, show all open days with their times
  return openDays.map(wh => {
    const dayName = dayNames[wh.day] || wh.day
    return `${dayName}: ${formatTimeForDisplay(wh.startTime)} - ${formatTimeForDisplay(wh.endTime)}`
  }).join(' | ')
})

const handleBookClick = () => {
  if (user.value) {
    showBooking.value = true
  } else {
    showLogin.value = true
  }
}

const categoryIcons: Record<string, Component> = {
  'شعر': Scissors,
  'حواجب': Eye,
  'رموش': Sparkles,
  'مانيكير': Hand,
  'باديكير': Footprints,
}

const getServiceIcon = (category: string) => {
  return categoryIcons[category] || Scissors
}

const services = computed(() => dataServices.value)

const testimonials = [
  {
    id: 1,
    text: 'تجربة رائعة! الخدمة ممتازة والموظفين محترفين جداً. أنصح الجميع بزيارة نوفايا. النتائج دائماً تتجاوز التوقعات.',
    name: 'سارة أحمد',
    since: '2023',
    initial: 'س'
  },
  {
    id: 2,
    text: 'أفضل صالون في المنطقة، النتائج دائماً رائعة والخدمة سريعة ومنظمة، المكان نظيف جداً، والطاقم ودود ومحترف.',
    name: 'فاطمة محمد',
    since: '2022',
    initial: 'ف'
  },
  {
    id: 3,
    text: 'خدمة متميزة وأسعار مناسبة. المكان نظيف والموظفين ودودين. أنصح كل من يبحث عن صالون راقي بزيارة نوفايا.',
    name: 'نورا خالد',
    since: '2024',
    initial: 'ن'
  }
]
</script>
