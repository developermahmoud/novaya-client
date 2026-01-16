<template>
  <UiModal v-if="isOpen && booking" :is-open="isOpen" title="فاتورة نوفايا" size="lg" @close="$emit('close')">
    <div class="print:hidden flex justify-end gap-2 mb-6">
      <button
        @click="handlePrint"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        <Printer :size="20" />
        طباعة
      </button>
    </div>

    <!-- Invoice Content - Printable -->
    <div class="invoice-content">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary mb-2">نوفايا</h1>
        <p class="text-text-secondary">صالون نسائي</p>
        <p class="text-text-secondary mt-2">المملكة العربية السعودية</p>
      </div>

      <div class="border-t border-b border-color py-4 mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-text-secondary">رقم الفاتورة:</span>
          <span class="font-semibold">#{{ booking.id }}</span>
        </div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-text-secondary">التاريخ:</span>
          <span class="font-semibold">{{ format(bookingDate, 'EEEE، d MMMM yyyy') }}</span>
        </div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-text-secondary">الوقت:</span>
          <span class="font-semibold">{{ formatTime12Hour(booking.time) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-text-secondary">العميل:</span>
          <span class="font-semibold">{{ clientName }}</span>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-xl font-semibold text-text-primary mb-4">الخدمات:</h3>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-light-bg">
              <th class="border border-color px-4 py-3 text-right text-sm font-semibold text-text-primary">الخدمة</th>
              <th class="border border-color px-4 py-3 text-right text-sm font-semibold text-text-primary">المدة</th>
              <th class="border border-color px-4 py-3 text-right text-sm font-semibold text-text-primary">السعر</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in bookingServices" :key="service.id">
              <td class="border border-color px-4 py-3 text-sm">{{ service.name }}</td>
              <td class="border border-color px-4 py-3 text-sm text-center">{{ service.duration }} دقيقة</td>
              <td class="border border-color px-4 py-3 text-sm text-left">{{ service.price }} ريال</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border-t-2 border-gray-400 pt-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-lg font-semibold text-text-primary">الإجمالي:</span>
          <span class="text-2xl font-bold text-primary">{{ booking.totalPrice }} ريال</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-text-secondary">الحالة:</span>
          <span :class="[
            'px-3 py-1 rounded-full text-sm font-semibold',
            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          ]">
            {{ booking.status === 'completed' ? 'مكتمل' :
               booking.status === 'cancelled' ? 'إلغاء' :
               'في الانتظار' }}
          </span>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-color text-center text-text-secondary text-sm">
        <p>شكراً لاختيارك نوفايا</p>
        <p class="mt-2">© {{ new Date().getFullYear() }} نوفايا. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { Printer } from 'lucide-vue-next'
import { format } from 'date-fns'
import type { Booking, Service } from '~/composables/useData'
import { formatTime12Hour } from '~/utils/helpers'

interface Props {
  isOpen: boolean
  booking: Booking | null
  services: Service[]
  clientName: string
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const bookingServices = computed(() => {
  if (!props.booking) return []
  return props.services.filter(s => props.booking!.services.includes(s.id))
})

const bookingDate = computed(() => {
  if (!props.booking) return new Date()
  return new Date(props.booking.date)
})

const handlePrint = () => {
  if (typeof window !== 'undefined' && window.print) {
    window.print()
  }
}
</script>

<style scoped>
@media print {
  @page {
    margin: 20mm;
  }
  body * {
    visibility: hidden;
  }
  .invoice-content,
  .invoice-content * {
    visibility: visible;
  }
  .invoice-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0;
    background: white;
  }
}
</style>
