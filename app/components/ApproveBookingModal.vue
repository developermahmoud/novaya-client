<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click.self="handleClose"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-800">الموافقة على الحجز</h2>
              <button
                @click="handleClose"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X :size="24" />
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Booking Info -->
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <Calendar :size="16" />
                <span>التاريخ: {{ formatDate(booking?.booking_date || '') }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <Clock :size="16" />
                <span>الوقت: {{ formatTime12Hour(booking?.booking_time || '') }}</span>
              </div>
              <div v-if="booking?.customer" class="flex items-center gap-2 text-sm text-gray-600">
                <User :size="16" />
                <span>العميل: {{ booking.customer.name }}</span>
              </div>
            </div>

            <!-- Services List -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">الخدمات</h3>
              <div class="space-y-4">
                <div
                  v-for="(service, index) in editableServices"
                  :key="service.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-800">{{ service.service_name }}</h4>
                      <p class="text-sm text-gray-600">
                        السعر: {{ service.price }} ريال | المدة: {{ service.duration }} دقيقة
                      </p>
                    </div>
                    <button
                      @click="removeService(index)"
                      :disabled="isDeletingService === service.id"
                      class="text-red-500 hover:text-red-700 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="إزالة الخدمة"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      الموظف المسؤول
                    </label>
                    <select
                      v-model="service.employee_id"
                      @change="handleEmployeeChange(service, index)"
                      :disabled="isUpdatingEmployee === service.id"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option :value="undefined">اختر موظف</option>
                      <option
                        v-for="employee in employees"
                        :key="employee.id"
                        :value="employee.id"
                      >
                        {{ employee.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-600 text-sm">{{ error }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl flex gap-3 justify-end">
            <button
              @click="handleClose"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              @click="handleApprove"
              :disabled="isLoading || !canApprove"
              :class="[
                'px-6 py-2 rounded-lg transition-colors',
                isLoading || !canApprove
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
              ]"
            >
              <span v-if="isLoading">جاري المعالجة...</span>
              <span v-else>موافقة</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Calendar, Clock, User, X, Trash2 } from 'lucide-vue-next'
import type { ApiBooking, ApproveBookingPayload } from '~/composables/useData'
import { useData } from '~/composables/useData'
import type { EmployeeDropdown } from '~/composables/useEmployees'

interface Props {
  isOpen: boolean
  booking: ApiBooking | null
  employees: EmployeeDropdown[]
}

interface Emits {
  (e: 'close'): void
  (e: 'approve', payload: ApproveBookingPayload): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { deleteBookingService, updateBookingServiceEmployee } = useData()

const isLoading = ref(false)
const isDeletingService = ref<number | false>(false)
const isUpdatingEmployee = ref<number | false>(false)
const error = ref('')

// Editable services with employee assignment
const editableServices = ref<Array<{
  id: number
  service_name: string
  price: number
  duration: number
  employee_id?: number
}>>([])

// Watch for booking changes to initialize editable services
watch(() => props.booking, (newBooking) => {
  if (newBooking) {
    editableServices.value = newBooking.services.map(service => ({
      id: service.id,
      service_name: service.service_name,
      price: service.price,
      duration: service.duration,
      employee_id: service.employee_id,
    }))
  }
}, { immediate: true })

// Check if can approve (at least one service with employee assigned)
const canApprove = computed(() => {
  return editableServices.value.length > 0 && 
         editableServices.value.some(s => s.employee_id !== undefined)
})

const removeService = async (index: number) => {
  if (!props.booking) return
  
  const service = editableServices.value[index]
  if (!service) return

  if (editableServices.value.length <= 1) {
    error.value = 'يجب أن يحتوي الحجز على خدمة واحدة على الأقل'
    return
  }

  // If service has an ID (already exists in booking), delete it from API
  if (service.id) {
    isDeletingService.value = service.id
    error.value = ''
    
    try {
      const result = await deleteBookingService(props.booking.id, service.id)
      
      if (result.success) {
        // Remove from local list
        editableServices.value.splice(index, 1)
      } else {
        error.value = result.error || 'فشل حذف الخدمة'
      }
    } catch (err) {
      console.error('Error deleting service:', err)
      error.value = 'حدث خطأ أثناء حذف الخدمة'
    } finally {
      isDeletingService.value = false
    }
  } else {
    // If service doesn't have ID (newly added), just remove from list
    editableServices.value.splice(index, 1)
  }
}

const handleEmployeeChange = async (service: { id: number; employee_id?: number }, index: number) => {
  if (!props.booking || !service.id || !service.employee_id) return

  const currentService = editableServices.value[index]
  if (!currentService) return

  isUpdatingEmployee.value = service.id
  error.value = ''

  try {
    const result = await updateBookingServiceEmployee(
      props.booking.id,
      service.id,
      service.employee_id
    )

    if (!result.success) {
      // Revert the change on error
      const originalService = props.booking.services.find(s => s.id === service.id)
      if (originalService && editableServices.value[index]) {
        editableServices.value[index].employee_id = originalService.employee_id
      }
      error.value = result.error || 'فشل تحديث الموظف'
    }
  } catch (err) {
    console.error('Error updating employee:', err)
    // Revert the change on error
    const originalService = props.booking.services.find(s => s.id === service.id)
    if (originalService && editableServices.value[index]) {
      editableServices.value[index].employee_id = originalService.employee_id
    }
    error.value = 'حدث خطأ أثناء تحديث الموظف'
  } finally {
    isUpdatingEmployee.value = false
  }
}

const handleClose = () => {
  error.value = ''
  emit('close')
}

const handleApprove = async () => {
  if (!props.booking) return
  
  if (editableServices.value.length === 0) {
    error.value = 'يجب أن يحتوي الحجز على خدمة واحدة على الأقل'
    return
  }

  if (!canApprove.value) {
    error.value = 'يجب تحديد موظف لكل خدمة على الأقل'
    return
  }

  isLoading.value = true
  error.value = ''

  const payload: ApproveBookingPayload = {
    services: editableServices.value.map(service => ({
      id: service.id,
      employee_id: service.employee_id,
    }))
  }

  emit('approve', payload)
  isLoading.value = false
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const dateObj = new Date(dateStr)
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  const day = days[dateObj.getDay()]
  const dayNum = dateObj.getDate()
  const month = months[dateObj.getMonth()]
  const year = dateObj.getFullYear()
  return `${day}، ${dayNum} ${month} ${year}`
}

const formatTime12Hour = (time24: string) => {
  if (!time24) return ''
  const parts = time24.split(':')
  const hours = parts[0] ? parseInt(parts[0], 10) : 0
  const minutes = parts[1] ? parseInt(parts[1], 10) : 0
  const hour12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
  const period = hours >= 12 ? 'م' : 'ص'
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
