<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">العملاء</h1>
          <p class="text-gray-600 mt-1">إدارة عملاء الصالون</p>
        </div>
        <button
          @click="showAddModal = true"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <Plus :size="20" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">جاري تحميل العملاء...</p>
      </div>

      <!-- Customers Table -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الجوال</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">أضيف بواسطة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الإضافة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="customer in customers" :key="customer.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ customer.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ customer.mobile }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full font-semibold',
                      customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ customer.status === 'active' ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getCreatedBy(customer) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ formatDate(customer.created_at) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <button
                      @click="editCustomer(customer)"
                      class="text-primary hover:text-primary-dark"
                      :disabled="isLoading"
                      title="تعديل"
                    >
                      <Edit :size="18" />
                    </button>
                    <button
                      @click="deleteCustomer(customer.id)"
                      class="text-red-600 hover:text-red-800"
                      :disabled="isLoading"
                      title="حذف"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="customers.length === 0 && !isLoading">
                <td colspan="7" class="px-6 py-12 text-center">
                  <Users :size="48" class="mx-auto text-gray-400 mb-4" />
                  <p class="text-gray-600">لا يوجد عملاء</p>
                  <button
                    @click="showAddModal = true"
                    class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    إضافة عميل جديد
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Customer Modal -->
    <UiModal
      :is-open="showAddModal || showEditModal"
      :title="showEditModal ? 'تعديل العميل' : 'إضافة عميل جديد'"
      size="lg"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput
            v-model="customerForm.name"
            label="الاسم"
            type="text"
            required
            placeholder="اسم العميل"
          />
          <UiInput
            v-model="customerForm.email"
            label="البريد الإلكتروني"
            type="email"
            required
            placeholder="example@email.com"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput
            v-model="customerForm.mobile"
            label="رقم الجوال"
            type="tel"
            required
            placeholder="05xxxxxxxx"
          />
          <div v-if="showEditModal" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">الحالة</label>
            <select
              v-model="customerForm.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            >
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>
        <div v-if="!showEditModal" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput
            v-model="customerForm.password"
            label="كلمة المرور"
            type="password"
            required
            placeholder="كلمة المرور"
          />
          <UiInput
            v-model="customerForm.passwordConfirmation"
            label="تأكيد كلمة المرور"
            type="password"
            required
            placeholder="تأكيد كلمة المرور"
          />
        </div>
        <div v-if="showEditModal" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">تغيير كلمة المرور (اختياري)</label>
          <UiInput
            v-model="customerForm.password"
            type="password"
            placeholder="اتركه فارغاً إذا لم ترد تغيير كلمة المرور"
          />
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
import { Plus, Edit, Trash2, Users } from 'lucide-vue-next'
import type { Customer } from '~/composables/useCustomers'
import { useCustomers } from '~/composables/useCustomers'
import { formatDate } from '~/utils/helpers'
import { validateSaudiMobile, validateEmail, validatePassword, normalizeSaudiMobile } from '~/utils/validation'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()
const { getCustomers, createCustomer, updateCustomer, deleteCustomer: deleteCustomerApi } = useCustomers()
const { success: showSuccess, error: showError } = useToast()

const customers = ref<Customer[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingCustomer = ref<Customer | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const customerForm = ref<{
  name: string
  email: string
  mobile: string
  password: string
  passwordConfirmation: string
  status: 'active' | 'inactive'
}>({
  name: '',
  email: '',
  mobile: '',
  password: '',
  passwordConfirmation: '',
  status: 'active'
})

// Fetch customers from API
const fetchCustomers = async () => {
  isLoading.value = true
  error.value = ''
  try {
    customers.value = await getCustomers()
  } catch (err: any) {
    error.value = err.message || 'فشل جلب العملاء'
  } finally {
    isLoading.value = false
  }
}

// Load customers on mount
onMounted(() => {
  fetchCustomers()
})

const getCreatedBy = (customer: Customer) => {
  return customer.created_by?.name || user.value?.name || 'مدير النظام'
}

const editCustomer = (customer: Customer) => {
  editingCustomer.value = customer
  customerForm.value = {
    name: customer.name,
    email: customer.email,
    mobile: customer.mobile,
    password: '',
    passwordConfirmation: '',
    status: customer.status
  }
  showEditModal.value = true
}

const deleteCustomer = async (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) {
    return
  }

  try {
    await deleteCustomerApi(id)
    customers.value = customers.value.filter(c => c.id !== id)
    showSuccess('تم حذف العميل بنجاح')
  } catch (err: any) {
    showError(err.message || 'فشل حذف العميل')
  }
}

const handleSubmit = async () => {
  // Validation
  error.value = ''

  if (!customerForm.value.name.trim()) {
    error.value = 'الاسم مطلوب'
    return
  }

  const emailValidation = validateEmail(customerForm.value.email)
  if (!emailValidation.isValid) {
    error.value = emailValidation.error || 'البريد الإلكتروني غير صحيح'
    return
  }

  const mobileValidation = validateSaudiMobile(customerForm.value.mobile)
  if (!mobileValidation.isValid) {
    error.value = mobileValidation.error || 'رقم الجوال غير صحيح'
    return
  }

  if (!showEditModal.value) {
    // Create validation
    if (!customerForm.value.password) {
      error.value = 'كلمة المرور مطلوبة'
      return
    }

    const passwordValidation = validatePassword(customerForm.value.password)
    if (!passwordValidation.isValid) {
      error.value = passwordValidation.error || 'كلمة المرور غير صحيحة'
      return
    }

    if (customerForm.value.password !== customerForm.value.passwordConfirmation) {
      error.value = 'كلمة المرور وتأكيدها غير متطابقين'
      return
    }
  } else if (customerForm.value.password && customerForm.value.password !== customerForm.value.passwordConfirmation) {
    error.value = 'كلمة المرور وتأكيدها غير متطابقين'
    return
  }

  isSubmitting.value = true

  try {
    const normalizedMobile = normalizeSaudiMobile(customerForm.value.mobile)

    if (showEditModal.value && editingCustomer.value) {
      // Update existing customer
      const updateData: any = {
        name: customerForm.value.name,
        email: customerForm.value.email,
        mobile: normalizedMobile,
        status: customerForm.value.status
      }

      if (customerForm.value.password) {
        updateData.password = customerForm.value.password
      }

      await updateCustomer(editingCustomer.value.id, updateData)
      showSuccess('تم تحديث العميل بنجاح')
    } else {
      // Add new customer
      await createCustomer({
        name: customerForm.value.name,
        email: customerForm.value.email,
        mobile: normalizedMobile,
        password: customerForm.value.password
      })
      showSuccess('تم إضافة العميل بنجاح')
    }
    fetchCustomers()
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
  editingCustomer.value = null
  customerForm.value = {
    name: '',
    email: '',
    mobile: '',
    password: '',
    passwordConfirmation: '',
    status: 'active'
  }
  error.value = ''
}
</script>
