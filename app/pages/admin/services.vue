<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">الخدمات</h1>
          <p class="text-gray-600 mt-1">إدارة خدمات الصالون</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="exportToExcel"
            :disabled="isExporting || services.length === 0"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download :size="18" />
            <span v-if="isExporting">جاري التصدير...</span>
            <span v-else>تصدير Excel</span>
          </button>
          <button
            @click="showAddModal = true"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus :size="20" />
            <span>إضافة خدمة جديدة</span>
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">جاري تحميل الخدمات...</p>
      </div>

      <!-- Services Table -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القسم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم الخدمة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المدة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">أضيف بواسطة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الإضافة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="service in services" :key="service.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ getCategoryName(service) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ service.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full font-semibold',
                      service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ service.status === 'active' ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ service.price }} ريال</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ service.duration }} دقيقة</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500 max-w-xs truncate">{{ service.description || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getCreatedBy(service) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ formatDate(service.created_at) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <button
                      @click="editService(service)"
                      class="text-primary hover:text-primary-dark"
                      :disabled="isLoading"
                      title="تعديل"
                    >
                      <Edit :size="18" />
                    </button>
                    <button
                      @click="deleteService(service.id)"
                      class="text-red-600 hover:text-red-800"
                      :disabled="isLoading"
                      title="حذف"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="services.length === 0 && !isLoading">
                <td colspan="9" class="px-6 py-12 text-center">
                  <Scissors :size="48" class="mx-auto text-gray-400 mb-4" />
                  <p class="text-gray-600">لا توجد خدمات</p>
                  <button
                    @click="showAddModal = true"
                    class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    إضافة خدمة جديدة
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Service Modal -->
    <UiModal :is-open="showAddModal || showEditModal" :title="showEditModal ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'" size="lg" @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput
            v-model="serviceForm.name"
            label="اسم الخدمة"
            type="text"
            required
            placeholder="مثال: قص شعر"
          />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">القسم</label>
            <select
              v-model.number="serviceForm.category_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              required
            >
              <option :value="0">اختر القسم</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">السعر (ريال)</label>
            <input
              v-model.number="serviceForm.price"
              type="number"
              required
              min="0"
              step="0.01"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">المدة (دقيقة)</label>
            <input
              v-model.number="serviceForm.duration"
              type="number"
              required
              min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
          <textarea
            v-model="serviceForm.description"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="وصف الخدمة..."
          ></textarea>
        </div>
        <div v-if="showEditModal" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">الحالة</label>
          <select
            v-model="serviceForm.status"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
          >
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ error }}
        </div>
        <div class="flex gap-2">
          <UiButton type="submit" full-width :disabled="isSubmitting">
            {{ isSubmitting ? 'جاري الحفظ...' : (showEditModal ? 'حفظ التعديلات' : 'إضافة') }}
          </UiButton>
          <UiButton type="button" @click="closeModal" variant="outline" full-width :disabled="isSubmitting">
            إلغاء
          </UiButton>
        </div>
      </form>
    </UiModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Plus, Edit, Trash2, Scissors, Download } from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import type { Service } from '~/composables/useServices'
import { useServices } from '~/composables/useServices'
import type { Category } from '~/composables/useCategories'
import { useCategories } from '~/composables/useCategories'
import { formatDate } from '~/utils/helpers'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()
const { getServices, createService, updateService, deleteService: deleteServiceApi } = useServices()
const { getCategories } = useCategories()
const { success: showSuccess, error: showError } = useToast()

const services = ref<Service[]>([])
const categories = ref<Category[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingService = ref<Service | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const isExporting = ref(false)
const error = ref('')
const serviceForm = ref<{
  name: string
  category_id: number
  price: number
  duration: number
  description: string
  status: 'active' | 'inactive'
}>({
  name: '',
  category_id: 0,
  price: 0,
  duration: 0,
  description: '',
  status: 'active'
})

// Fetch services from API
const fetchServices = async () => {
  isLoading.value = true
  error.value = ''
  try {
    services.value = await getServices()
  } catch (err: any) {
    error.value = err.message || 'فشل جلب الخدمات'
  } finally {
    isLoading.value = false
  }
}

// Fetch categories for dropdown
const fetchCategories = async () => {
  try {
    categories.value = await getCategories()
  } catch (err: any) {
    console.error('Failed to fetch categories:', err)
  }
}

// Load data on mount
onMounted(() => {
  fetchCategories()
  fetchServices()
})

const getCreatedBy = (service: Service) => {
  return service.created_by?.name || user.value?.name || 'مدير النظام'
}

const getCategoryName = (service: Service) => {
  return service.category?.name || '-'
}

const editService = (service: Service) => {
  editingService.value = service
  serviceForm.value = {
    name: service.name,
    category_id: service.category_id,
    price: service.price,
    duration: service.duration,
    description: service.description || '',
    status: service.status
  }
  showEditModal.value = true
}

const deleteService = async (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
    return
  }

  try {
    await deleteServiceApi(id)
    services.value = services.value.filter(s => s.id !== id)
    showSuccess('تم حذف الخدمة بنجاح')
  } catch (err: any) {
    showError(err.message || 'فشل حذف الخدمة')
  }
}

const handleSubmit = async () => {
  if (!serviceForm.value.name.trim() || !serviceForm.value.category_id || serviceForm.value.price <= 0 || serviceForm.value.duration <= 0) {
    error.value = 'يرجى ملء جميع الحقول المطلوبة'
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    if (showEditModal.value && editingService.value) {
      // Update existing service
      await updateService(editingService.value.id, {
        name: serviceForm.value.name,
        category_id: serviceForm.value.category_id,
        price: serviceForm.value.price,
        duration: serviceForm.value.duration,
        description: serviceForm.value.description,
        status: serviceForm.value.status
      })
      showSuccess('تم تحديث الخدمة بنجاح')
    } else {
      // Add new service
      await createService({
        name: serviceForm.value.name,
        category_id: serviceForm.value.category_id,
        price: serviceForm.value.price,
        duration: serviceForm.value.duration,
        description: serviceForm.value.description
      })
      showSuccess('تم إضافة الخدمة بنجاح')
    }
    fetchServices()
    closeModal()
  } catch (err: any) {
    error.value = err.message || 'حدث خطأ'
    showError(err.message || 'حدث خطأ')
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingService.value = null
  serviceForm.value = {
    name: '',
    category_id: 0,
    price: 0,
    duration: 0,
    description: '',
    status: 'active'
  }
  error.value = ''
}

// Export to Excel
const exportToExcel = async () => {
  if (services.value.length === 0) {
    alert('لا توجد بيانات للتصدير')
    return
  }

  isExporting.value = true

  try {
    // Prepare data for Excel
    const excelData = services.value.map(service => {
      return {
        'رقم الخدمة': service.id,
        'اسم الخدمة': service.name,
        'القسم': getCategoryName(service),
        'السعر': service.price,
        'المدة (دقيقة)': service.duration,
        'الوصف': service.description || '-',
        'الحالة': service.status === 'active' ? 'نشط' : 'غير نشط',
        'أضيف بواسطة': getCreatedBy(service),
        'تاريخ الإضافة': formatDate(service.created_at)
      }
    })

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الخدمات')

    // Generate filename with current date
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const filename = `خدمات_${dateStr}.xlsx`

    // Write file
    XLSX.writeFile(workbook, filename)

    alert('تم تصدير البيانات بنجاح')
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    alert('حدث خطأ أثناء تصدير البيانات')
  } finally {
    isExporting.value = false
  }
}
</script>
