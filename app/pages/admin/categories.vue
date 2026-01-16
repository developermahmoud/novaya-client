<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">الأقسام</h1>
          <p class="text-gray-600 mt-1">إدارة أقسام الخدمات</p>
        </div>
        <button @click="showAddModal = true"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
          <Plus :size="20" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">جاري تحميل الأقسام...</p>
      </div>

      <!-- Categories Table -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">أضيف بواسطة
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ
                  الإضافة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full font-semibold',
                      category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ category.status === 'active' ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getCreatedBy(category) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ formatDate(category.created_at) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <button @click="editCategory(category)" class="text-primary hover:text-primary-dark"
                      :disabled="isLoading">
                      <Edit :size="18" />
                    </button>
                    <button @click="deleteCategory(category.id)" class="text-red-600 hover:text-red-800"
                      :disabled="isLoading">
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="categories.length === 0 && !isLoading">
                <td colspan="5" class="px-6 py-12 text-center">
                  <FolderOpen :size="48" class="mx-auto text-gray-400 mb-4" />
                  <p class="text-gray-600">لا توجد أقسام</p>
                  <button @click="showAddModal = true"
                    class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    إضافة قسم جديد
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <UiModal :is-open="showAddModal || showEditModal" :title="showEditModal ? 'تعديل القسم' : 'إضافة قسم جديد'"
      size="sm" @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UiInput v-model="categoryForm.name" label="اسم القسم" type="text" required
          placeholder="مثال: شعر، حواجب، رموش..." />
        <div v-if="showEditModal" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">الحالة</label>
          <select
            v-model="categoryForm.status"
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
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-vue-next'
import type { Category } from '~/composables/useCategories'
import { useCategories } from '~/composables/useCategories'
import { formatDate } from '~/utils/helpers'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()
const { getCategories, createCategory, updateCategory, deleteCategory: deleteCategoryApi } = useCategories()
const { success: showSuccess, error: showError } = useToast()

const categories = ref<Category[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingCategory = ref<Category | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const categoryForm = ref<{
  name: string
  status: 'active' | 'inactive'
}>({
  name: '',
  status: 'active'
})

// Fetch categories from API
const fetchCategories = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const fetchedCategories = await getCategories()
    categories.value = fetchedCategories
  } catch (err: any) {
    error.value = err.message || 'فشل جلب الأقسام'
  } finally {
    isLoading.value = false
  }
}

// Load categories on mount
onMounted(() => {
  fetchCategories()
})

const getCreatedBy = (category: Category) => {
  return category.created_by?.name || user.value?.name || 'مدير النظام'
}

const editCategory = (category: Category) => {
  editingCategory.value = category
  categoryForm.value.name = category.name
  categoryForm.value.status = category.status
  showEditModal.value = true
}

const deleteCategory = async (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) {
    return
  }

  try {
    await deleteCategoryApi(id)
    // Remove from local state
    categories.value = categories.value.filter(c => c.id !== id)
    showSuccess('تم حذف القسم بنجاح')
  } catch (err: any) {
    showError(err.message || 'فشل حذف القسم')
  }
}

const handleSubmit = async () => {
  if (!categoryForm.value.name.trim()) {
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    if (showEditModal.value && editingCategory.value) {
      // Update existing category
      const updated = await updateCategory(
        editingCategory.value.id,
        categoryForm.value.name,
        categoryForm.value.status
      )
      showSuccess('تم تحديث القسم بنجاح')
    } else {
      // Add new category
      const newCategory = await createCategory(categoryForm.value.name)
      categories.value.push(newCategory)
      showSuccess('تم إضافة القسم بنجاح')
    }
    fetchCategories()
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
  editingCategory.value = null
  categoryForm.value.name = ''
  categoryForm.value.status = 'active'
  error.value = ''
}
</script>
