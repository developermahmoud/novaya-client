<template>
  <UiModal :is-open="isOpen" title="إضافة حجز جديد" size="lg" @close="$emit('close')">
    <div v-if="customerName" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p class="text-sm text-blue-800">
        <span class="font-semibold">العميل:</span> {{ customerName }}
      </p>
    </div>

    <div v-if="step === 'day'">
      <h3 class="text-xl font-semibold mb-4">اختر اليوم</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          v-for="(day, idx) in weekDays"
          :key="idx"
          @click="handleDaySelect(day)"
          :class="[
            'p-4 rounded-lg border-2 transition-colors',
            selectedDay && isSameDay(selectedDay, day)
              ? 'border-primary bg-primary text-white'
              : 'border-color hover:border-primary'
          ]"
        >
          <div class="font-semibold">{{ daysOfWeek[day.getDay()] }}</div>
          <div class="text-sm">{{ format(day, 'dd/MM') }}</div>
        </button>
      </div>
    </div>

    <div v-if="step === 'time'">
      <div class="flex items-center gap-4 mb-4">
        <button @click="step = 'day'" class="text-primary hover:underline">
          ← العودة
        </button>
        <h3 class="text-xl font-semibold">اختر الوقت</h3>
      </div>
      <div v-if="availableTimes.length === 0" class="text-center py-8 text-text-secondary">
        <p>لا توجد أوقات متاحة لهذا اليوم</p>
      </div>
      <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <button
          v-for="hour12 in availableTimes"
          :key="hour12"
          @click="handleTimeSelect(hour12)"
          :class="[
            'p-3 rounded-lg border-2 transition-colors text-sm',
            selectedTime === time12To24Map[hour12]
              ? 'border-primary bg-primary text-white'
              : 'border-color hover:border-primary'
          ]"
        >
          {{ hour12 }}
        </button>
      </div>
    </div>

    <div v-if="step === 'service'">
      <div class="flex items-center gap-4 mb-4">
        <button @click="step = 'time'" class="text-primary hover:underline">
          ← العودة
        </button>
        <h3 class="text-xl font-semibold">اختر الخدمات</h3>
      </div>
      <div class="space-y-3">
        <label
          v-for="service in services"
          :key="service.id"
          :class="[
            'flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors',
            selectedServices.includes(service.id)
              ? 'border-primary bg-secondary'
              : 'border-color hover:border-primary'
          ]"
        >
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              :checked="selectedServices.includes(service.id)"
              @change="handleServiceToggle(service.id)"
              class="w-5 h-5 text-primary"
            />
            <div>
              <div class="font-semibold">{{ service.name }}</div>
              <div class="text-sm text-text-secondary">{{ service.duration }} دقيقة</div>
            </div>
          </div>
          <div class="font-bold text-primary">{{ service.price }} ريال</div>
        </label>
      </div>
      <div v-if="selectedServices.length > 0" class="mt-6 p-4 bg-light-bg rounded-lg">
        <div class="mb-4">
          <label class="block text-sm font-medium text-text-secondary mb-2">
            ملاحظات (اختياري)
          </label>
          <textarea
            v-model="notes"
            placeholder="أضف أي ملاحظات أو طلبات خاصة..."
            rows="3"
            class="w-full px-4 py-2 border border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
          ></textarea>
        </div>
        <div class="flex justify-between items-center mb-2">
          <span class="font-semibold">الإجمالي:</span>
          <span class="text-xl font-bold text-primary">
            {{ totalPrice }} ريال
          </span>
        </div>
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {{ error }}
        </div>
        <button
          @click="handleConfirm"
          :disabled="isLoading"
          class="w-full mt-4 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'جاري إنشاء الحجز...' : 'تأكيد الحجز' }}
        </button>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { format, addDays, isSameDay } from 'date-fns'

interface Props {
  isOpen: boolean
  customerId: number | null
  customerName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  bookingCreated: []
}>()

const { services, createCustomerBooking, workingHours } = useData()

const selectedDay = ref<Date | null>(null)
const selectedTime = ref<string>('')
const selectedServices = ref<string[]>([])
const notes = ref<string>('')
const step = ref<'day' | 'time' | 'service'>('day')
const isLoading = ref(false)
const error = ref('')

const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

// Map API day names to JavaScript day numbers (0 = Sunday)
const dayNameToJsDay: Record<string, number> = {
  'sunday': 0,
  'monday': 1,
  'tuesday': 2,
  'wednesday': 3,
  'thursday': 4,
  'friday': 5,
  'saturday': 6,
}

const hours12Format = [
  '12:00 م', '1:00 م', '2:00 م', '3:00 م', '4:00 م', '5:00 م', '6:00 م',
  '7:00 م', '8:00 م', '9:00 م', '10:00 م', '11:00 م', '12:00 ص'
]

const time12To24Map: Record<string, string> = {
  '12:00 م': '12:00',
  '1:00 م': '13:00',
  '2:00 م': '14:00',
  '3:00 م': '15:00',
  '4:00 م': '16:00',
  '5:00 م': '17:00',
  '6:00 م': '18:00',
  '7:00 م': '19:00',
  '8:00 م': '20:00',
  '9:00 م': '21:00',
  '10:00 م': '22:00',
  '11:00 م': '23:00',
  '12:00 ص': '00:00',
}

// Convert any 12-hour format time (with ص/م) to 24-hour format
const convert12To24 = (time12: string): string => {
  if (time12To24Map[time12]) {
    return time12To24Map[time12]
  }
  
  if (!time12.includes('ص') && !time12.includes('م')) {
    return time12
  }
  
  const isPM = time12.includes('م')
  const timePart = time12.replace(/[صم\s]/g, '').trim()
  const [hoursStr, minutesStr] = timePart.split(':')
  let hours = parseInt(hoursStr)
  const minutes = minutesStr ? parseInt(minutesStr) : 0
  
  if (isPM) {
    if (hours !== 12) {
      hours += 12
    }
  } else {
    if (hours === 12) {
      hours = 0
    }
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Convert 24-hour time to minutes for comparison
const timeToMinutes = (time24: string): number => {
  const [hours, minutes] = time24.split(':').map(Number)
  return hours * 60 + minutes
}

// Generate available time slots based on working hours
const getAvailableTimes = (day: Date): string[] => {
  if (!workingHours.value || workingHours.value.length === 0) {
    return hours12Format
  }

  const dayOfWeek = day.getDay()
  const dayName = Object.keys(dayNameToJsDay).find(key => dayNameToJsDay[key] === dayOfWeek)
  
  if (!dayName) return []

  const dayHours = workingHours.value.find(wh => wh.day === dayName)
  
  if (!dayHours || !dayHours.isOpen) {
    return []
  }

  const startMinutes = timeToMinutes(dayHours.startTime)
  let endMinutes = timeToMinutes(dayHours.endTime)
  
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60
  }
  
  const availableTimes: string[] = []
  let currentMinutes = startMinutes
  const maxIterations = 48
  let iterations = 0
  
  while (currentMinutes <= endMinutes && iterations < maxIterations) {
    const totalMinutes = currentMinutes % (24 * 60)
    const hours = Math.floor(totalMinutes / 60) % 24
    const mins = totalMinutes % 60
    const time24 = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    
    const hour12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
    const period = hours >= 12 ? 'م' : 'ص'
    const time12 = `${hour12}:${mins.toString().padStart(2, '0')} ${period}`
    
    if (!availableTimes.includes(time12)) {
      availableTimes.push(time12)
    }
    
    currentMinutes += 30
    iterations++
  }
  
  return availableTimes
}

const weekDays = computed(() => {
  const allDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))
  
  if (!workingHours.value || workingHours.value.length === 0) {
    return allDays
  }
  
  return allDays.filter(day => {
    const dayOfWeek = day.getDay()
    const dayName = Object.keys(dayNameToJsDay).find(key => dayNameToJsDay[key] === dayOfWeek)
    
    if (!dayName) return false
    
    const dayHours = workingHours.value.find(wh => wh.day === dayName)
    return dayHours?.isOpen ?? true
  })
})

const availableTimes = computed(() => {
  if (!selectedDay.value) return []
  return getAvailableTimes(selectedDay.value)
})

const totalPrice = computed(() => {
  return services.value
    .filter(s => selectedServices.value.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    step.value = 'day'
    selectedDay.value = null
    selectedTime.value = ''
    selectedServices.value = []
    notes.value = ''
    error.value = ''
  }
})

const handleDaySelect = (day: Date) => {
  selectedDay.value = day
  step.value = 'time'
}

const handleTimeSelect = (time12: string) => {
  const time24 = convert12To24(time12)
  selectedTime.value = time24
  step.value = 'service'
}

const handleServiceToggle = (serviceId: string) => {
  if (selectedServices.value.includes(serviceId)) {
    selectedServices.value = selectedServices.value.filter(id => id !== serviceId)
  } else {
    selectedServices.value = [...selectedServices.value, serviceId]
  }
}

const handleConfirm = async () => {
  if (!props.customerId) {
    error.value = 'يجب تحديد العميل'
    return
  }

  if (!selectedDay.value || !selectedTime.value || selectedServices.value.length === 0) {
    error.value = 'يرجى إكمال جميع الحقول المطلوبة'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const year = selectedDay.value.getFullYear()
    const month = String(selectedDay.value.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDay.value.getDate()).padStart(2, '0')
    const bookingDate = `${year}-${month}-${day}`

    let time24 = selectedTime.value
    if (time24.includes('ص') || time24.includes('م')) {
      time24 = convert12To24(time24)
    }
    
    const [hours, minutes] = time24.split(':')
    const bookingTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`

    const servicesArray = selectedServices.value.map(serviceId => ({
      service_id: parseInt(serviceId),
    }))

    const payload: any = {
      booking_date: bookingDate,
      booking_time: bookingTime,
      status: 'pending',
      services: servicesArray,
    }
    
    if (notes.value && notes.value.trim()) {
      payload.notes = notes.value.trim()
    }

    const result = await createCustomerBooking(props.customerId, payload)

    if (result.success) {
      emit('close')
      emit('bookingCreated')
      alert('تم إنشاء الحجز بنجاح')
    } else {
      error.value = result.error || 'فشل إنشاء الحجز'
    }
  } catch (err) {
    console.error('Error creating booking:', err)
    error.value = 'حدث خطأ أثناء إنشاء الحجز'
  } finally {
    isLoading.value = false
  }
}
</script>
