<template>
  <UiModal :is-open="isOpen" title="حجز موعد" size="lg" @close="$emit('close')">
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
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <button
          v-for="hour12 in hours12Format"
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
        <div class="flex justify-between items-center mb-2">
          <span class="font-semibold">الإجمالي:</span>
          <span class="text-xl font-bold text-primary">
            {{ totalPrice }} ريال
          </span>
        </div>
        <button
          @click="handleConfirm"
          class="w-full mt-4 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          تأكيد الحجز
        </button>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { format, addDays, isSameDay } from 'date-fns'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  requireLogin: []
  bookingConfirmed: [booking: any]
}>()

const { services, addBooking } = useData()
const { user } = useAuth()

const selectedDay = ref<Date | null>(null)
const selectedTime = ref<string>('')
const selectedServices = ref<string[]>([])
const step = ref<'day' | 'time' | 'service'>('day')

const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

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

const weekDays = computed(() => {
  return Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))
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
  }
})

const handleDaySelect = (day: Date) => {
  selectedDay.value = day
  step.value = 'time'
}

const handleTimeSelect = (time12: string) => {
  const time24 = time12To24Map[time12] || time12
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
  if (!user.value) {
    emit('close')
    emit('requireLogin')
    return
  }

  if (!selectedDay.value || !selectedTime.value || selectedServices.value.length === 0) return

  const bookingDate = new Date(selectedDay.value)
  const [hours, minutes] = selectedTime.value.split(':')
  bookingDate.setHours(parseInt(hours), parseInt(minutes))

  addBooking({
    clientId: user.value.id,
    date: bookingDate,
    time: selectedTime.value,
    services: selectedServices.value,
    status: 'pending',
    totalPrice: totalPrice.value,
  })

  emit('close')
  await nextTick()
  await navigateTo('/dashboard', { replace: true })
}
</script>
