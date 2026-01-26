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
      <!-- Header Section -->
      <div class="bg-gradient-to-l from-primary to-primary-dark text-white rounded-xl p-6 shadow-lg">
        <h1 class="text-2xl font-bold mb-2">الحضور والانصراف</h1>
        <p class="text-white/90">تسجيل الحضور والانصراف باستخدام الموقع الجغرافي</p>
      </div>

      <!-- Attendance Status Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">حالة الحضور اليوم</h2>
          <button
            @click="loadAttendanceStatus"
            :disabled="isLoadingStatus"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw :size="18" :class="{ 'animate-spin': isLoadingStatus }" />
            <span>تحديث</span>
          </button>
        </div>

        <!-- Loading Status -->
        <div v-if="isLoadingStatus" class="text-center py-8">
          <p class="text-gray-600">جاري تحميل حالة الحضور...</p>
        </div>

        <!-- Status Display -->
        <div v-else-if="attendanceStatus" class="space-y-4">
          <div class="flex items-center gap-4 p-4 rounded-lg" :class="attendanceStatus.check_in && !attendanceStatus.check_out ? 'bg-green-50 border border-green-200' : attendanceStatus.check_out ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'">
            <div class="w-16 h-16 rounded-full flex items-center justify-center" :class="attendanceStatus.check_in && !attendanceStatus.check_out ? 'bg-green-100' : attendanceStatus.check_out ? 'bg-blue-100' : 'bg-gray-100'">
              <Clock :size="32" :class="attendanceStatus.check_in && !attendanceStatus.check_out ? 'text-green-600' : attendanceStatus.check_out ? 'text-blue-600' : 'text-gray-600'" />
            </div>
            <div class="flex-1">
              <p class="text-lg font-semibold text-gray-800">
                {{ attendanceStatus.check_out ? 'تم تسجيل الانصراف' : attendanceStatus.check_in ? 'تم تسجيل الحضور' : 'لم يتم تسجيل الحضور' }}
              </p>
              <div class="mt-2 space-y-1 text-sm text-gray-600">
                <div v-if="attendanceStatus.check_in" class="flex items-center gap-2">
                  <span class="font-medium">وقت الحضور:</span>
                  <span>{{ formatTime(attendanceStatus.check_in) }}</span>
                </div>
                <div v-if="attendanceStatus.check_out" class="flex items-center gap-2">
                  <span class="font-medium">وقت الانصراف:</span>
                  <span>{{ formatTime(attendanceStatus.check_out) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium">التاريخ:</span>
                  <span>{{ formatDate(attendanceStatus.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="statusError" class="text-center py-8">
          <p class="text-red-600 mb-4">{{ statusError }}</p>
        </div>
      </div>

      <!-- Action Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-6">تسجيل الحضور/الانصراف</h2>

        <!-- Location Status -->
        <div class="mb-6 p-4 rounded-lg" :class="locationError || !isWithinRange ? 'bg-red-50 border border-red-200' : location ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'">
          <div class="flex items-center gap-3">
            <MapPin :size="24" :class="locationError || !isWithinRange ? 'text-red-600' : location ? 'text-blue-600' : 'text-gray-400'" />
            <div class="flex-1">
              <p class="font-semibold" :class="locationError || !isWithinRange ? 'text-red-800' : location ? 'text-blue-800' : 'text-gray-600'">
                {{ locationError || !isWithinRange ? 'موقع غير صحيح' : location ? 'تم جلب الموقع بنجاح' : 'جاري جلب الموقع...' }}
              </p>
              <p v-if="location" class="text-sm text-gray-600 mt-1">
                خط العرض: {{ location.latitude.toFixed(6) }} | خط الطول: {{ location.longitude.toFixed(6) }}
              </p>
              <p v-if="distanceFromWork !== null" class="text-sm mt-1" :class="isWithinRange ? 'text-green-600' : 'text-red-600'">
                المسافة من موقع العمل: {{ Math.round(distanceFromWork) }} متر
                <span v-if="isWithinRange" class="text-green-600">✓</span>
                <span v-else class="text-red-600">✗ (يجب أن تكون ضمن {{ MAX_DISTANCE_METERS }} متر)</span>
              </p>
              <p v-if="workLocation && workLocation.latitude && workLocation.longitude" class="text-xs text-gray-500 mt-1">
                موقع العمل: {{ Number(workLocation.latitude).toFixed(6) }}, {{ Number(workLocation.longitude).toFixed(6) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            v-if="!attendanceStatus?.check_in"
            @click="handleCheckIn"
            :disabled="isProcessing || !location || isLoadingStatus || !isWithinRange"
            class="flex-1 px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-lg"
          >
            <LogIn :size="24" />
            <span>{{ isProcessing ? 'جاري تسجيل الحضور...' : 'تسجيل الحضور' }}</span>
          </button>

          <button
            v-else-if="attendanceStatus.check_in && !attendanceStatus.check_out"
            @click="handleCheckOut"
            :disabled="isProcessing || !location || isLoadingStatus || !isWithinRange"
            class="flex-1 px-6 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-lg"
          >
            <LogOut :size="24" />
            <span>{{ isProcessing ? 'جاري تسجيل الانصراف...' : 'تسجيل الانصراف' }}</span>
          </button>

          <div v-else class="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center gap-3 font-semibold text-lg">
            <span>تم إكمال الحضور والانصراف لهذا اليوم</span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="actionError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {{ actionError }}
        </div>
      </div>

      <!-- Instructions Card -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Info :size="20" />
          <span>تعليمات</span>
        </h3>
        <ul class="space-y-2 text-sm text-blue-700">
          <li class="flex items-start gap-2">
            <span>•</span>
            <span>يجب السماح للمتصفح بالوصول إلى موقعك الجغرافي</span>
          </li>
          <li class="flex items-start gap-2">
            <span>•</span>
            <span>تأكد من أن GPS مفعل على جهازك</span>
          </li>
          <li class="flex items-start gap-2">
            <span>•</span>
            <span>يجب أن تكون في موقع العمل لتسجيل الحضور</span>
          </li>
        </ul>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Clock, MapPin, LogIn, LogOut, RefreshCw, Info } from 'lucide-vue-next'
import { useAttendance, type AttendanceStatus } from '~/composables/useAttendance'

definePageMeta({
  layout: 'receptionist'
})

const { user } = useAuth()
const { getTodayAttendance, checkIn, checkOut } = useAttendance()
const { settings, fetchPublicSettings } = useData()

// Settings location
const workLocation = computed(() => {
  if (settings.value && settings.value.latitude != null && settings.value.longitude != null) {
    const lat = Number(settings.value.latitude)
    const lng = Number(settings.value.longitude)
    if (!isNaN(lat) && !isNaN(lng)) {
      return {
        latitude: lat,
        longitude: lng
      }
    }
  }
  return null
})

// State
const attendanceStatus = ref<AttendanceStatus | null>(null)
const isLoadingStatus = ref(false)
const statusError = ref('')
const isProcessing = ref(false)
const actionError = ref('')
const location = ref<{ latitude: number; longitude: number } | null>(null)
const locationError = ref('')
const distanceFromWork = ref<number | null>(null)
const isWithinRange = ref(false)
const MAX_DISTANCE_METERS = 100 // 100 متر كحد أقصى للمسافة المسموحة

// Calculate distance between two coordinates in meters (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000 // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Get user location
const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('المتصفح لا يدعم جلب الموقع الجغرافي'))
      return
    }

    locationError.value = ''
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        location.value = coords
        
        // Calculate distance from work location
        if (workLocation.value) {
          const distance = calculateDistance(
            coords.latitude,
            coords.longitude,
            workLocation.value.latitude,
            workLocation.value.longitude
          )
          distanceFromWork.value = distance
          isWithinRange.value = distance <= MAX_DISTANCE_METERS
          
          if (!isWithinRange.value) {
            locationError.value = `أنت بعيد عن موقع العمل. المسافة: ${Math.round(distance)} متر (المسافة المسموحة: ${MAX_DISTANCE_METERS} متر)`
          }
        } else {
          // If no work location set, allow check-in/out
          isWithinRange.value = true
        }
        
        resolve(coords)
      },
      (error) => {
        let errorMessage = 'فشل جلب الموقع الجغرافي'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'تم رفض طلب الوصول إلى الموقع'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'معلومات الموقع غير متوفرة'
            break
          case error.TIMEOUT:
            errorMessage = 'انتهت مهلة طلب الموقع'
            break
        }
        locationError.value = errorMessage
        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

// Load attendance status
const loadAttendanceStatus = async () => {
  isLoadingStatus.value = true
  statusError.value = ''
  
  try {
    const result = await getTodayAttendance()
    
    if (result.success && result.data) {
      attendanceStatus.value = result.data
    } else {
      statusError.value = result.error || 'فشل جلب حالة الحضور'
    }
  } catch (error) {
    console.error('Error loading attendance status:', error)
    statusError.value = 'حدث خطأ أثناء جلب حالة الحضور'
  } finally {
    isLoadingStatus.value = false
  }
}

// Handle check in
const handleCheckIn = async () => {
  if (!location.value) {
    actionError.value = 'يجب جلب الموقع أولاً'
    return
  }

  if (!isWithinRange.value) {
    actionError.value = 'يجب أن تكون قريباً من موقع العمل لتسجيل الحضور'
    return
  }

  isProcessing.value = true
  actionError.value = ''

  try {
    const result = await checkIn(location.value.latitude, location.value.longitude)
    
    if (result.success) {
      await loadAttendanceStatus()
      alert('تم تسجيل الحضور بنجاح')
    } else {
      actionError.value = result.error || 'فشل تسجيل الحضور'
    }
  } catch (error) {
    console.error('Error checking in:', error)
    actionError.value = 'حدث خطأ أثناء تسجيل الحضور'
  } finally {
    isProcessing.value = false
  }
}

// Handle check out
const handleCheckOut = async () => {
  if (!location.value) {
    actionError.value = 'يجب جلب الموقع أولاً'
    return
  }

  if (!isWithinRange.value) {
    actionError.value = 'يجب أن تكون قريباً من موقع العمل لتسجيل الانصراف'
    return
  }

  isProcessing.value = true
  actionError.value = ''

  try {
    const result = await checkOut(location.value.latitude, location.value.longitude)
    
    if (result.success) {
      await loadAttendanceStatus()
      alert('تم تسجيل الانصراف بنجاح')
    } else {
      actionError.value = result.error || 'فشل تسجيل الانصراف'
    }
  } catch (error) {
    console.error('Error checking out:', error)
    actionError.value = 'حدث خطأ أثناء تسجيل الانصراف'
  } finally {
    isProcessing.value = false
  }
}

const formatTime = (timeStr: string) => {
  // Handle both time format (HH:mm:ss) and datetime format
  let time: string = timeStr
  
  // If it's a datetime string, extract time part
  if (timeStr.includes('T') || timeStr.includes(' ')) {
    const date = new Date(timeStr)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const hour12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
    const period = hours >= 12 ? 'م' : 'ص'
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
  }
  
  // If it's time format (HH:mm:ss)
  const parts = time.split(':')
  const hours = parseInt(parts[0] || '0', 10)
  const minutes = parseInt(parts[1] || '0', 10)
  const hour12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
  const period = hours >= 12 ? 'م' : 'ص'
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
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

// Load status and location on mount
onMounted(async () => {
  // Load settings first to get work location
  await fetchPublicSettings()
  
  await loadAttendanceStatus()
  
  // Get location automatically
  try {
    await getLocation()
  } catch (error) {
    console.error('Error getting location:', error)
  }
})
</script>
