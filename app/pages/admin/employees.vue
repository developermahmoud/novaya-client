<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">الموظفين</h1>
          <p class="text-gray-600 mt-1">إدارة موظفي الصالون</p>
        </div>
        <button
          @click="showAddModal = true"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <Plus :size="20" />
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">جاري تحميل الموظفين...</p>
      </div>

      <!-- Employees Table -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الجوال</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الدور</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">أضيف بواسطة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الإضافة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="employee in employees" :key="employee.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ employee.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ employee.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ employee.mobile }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full font-semibold',
                      getRoleColor(employee.role)
                    ]"
                  >
                    {{ getRoleName(employee.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full font-semibold',
                      employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ employee.status === 'active' ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getCreatedBy(employee) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ formatDate(employee.created_at) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <button
                      @click="editEmployee(employee)"
                      class="text-primary hover:text-primary-dark"
                      :disabled="isLoading"
                      title="تعديل"
                    >
                      <Edit :size="18" />
                    </button>
                    <button
                      @click="deleteEmployee(employee.id)"
                      class="text-red-600 hover:text-red-800"
                      :disabled="isLoading"
                      title="حذف"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="employees.length === 0 && !isLoading">
                <td colspan="8" class="px-6 py-12 text-center">
                  <Users :size="48" class="mx-auto text-gray-400 mb-4" />
                  <p class="text-gray-600">لا يوجد موظفين</p>
                  <button
                    @click="showAddModal = true"
                    class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    إضافة موظف جديد
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Employee Modal -->
    <UiModal
      :is-open="showAddModal || showEditModal"
      :title="showEditModal ? 'تعديل الموظف' : 'إضافة موظف جديد'"
      size="lg"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput
            v-model="employeeForm.name"
            label="الاسم"
            type="text"
            required
            placeholder="اسم الموظف"
          />
          <UiInput
            v-model="employeeForm.email"
            label="البريد الإلكتروني"
            type="email"
            required
            placeholder="example@email.com"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput
            v-model="employeeForm.mobile"
            label="رقم الجوال"
            type="tel"
            required
            placeholder="05xxxxxxxx"
          />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">الدور</label>
            <select
              v-model="employeeForm.role"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              required
            >
              <option value="admin">مدير</option>
              <option value="employee">موظف</option>
              <option value="receptionist">استقبال</option>
            </select>
          </div>
        </div>
        <div v-if="!showEditModal" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput
            v-model="employeeForm.password"
            label="كلمة المرور"
            type="password"
            :required="!showEditModal"
            placeholder="كلمة المرور"
          />
          <UiInput
            v-model="employeeForm.passwordConfirmation"
            label="تأكيد كلمة المرور"
            type="password"
            :required="!showEditModal"
            placeholder="تأكيد كلمة المرور"
          />
        </div>
        <div v-if="showEditModal" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">الحالة</label>
          <select
            v-model="employeeForm.status"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
          >
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
        <div v-if="showEditModal" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">تغيير كلمة المرور (اختياري)</label>
            <UiInput
              v-model="employeeForm.password"
              type="password"
              placeholder="اتركه فارغاً إذا لم ترد تغيير كلمة المرور"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
            <UiInput
              v-model="employeeForm.passwordConfirmation"
              type="password"
              placeholder="تأكيد كلمة المرور"
            />
          </div>
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
import type { Employee } from '~/composables/useEmployees'
import { useEmployees } from '~/composables/useEmployees'
import type { UserRole } from '~/composables/useAuth'
import { formatDate } from '~/utils/helpers'
import { validateSaudiMobile, validateEmail, validatePassword, normalizeSaudiMobile } from '~/utils/validation'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()
const { getEmployees, createEmployee, updateEmployee, deleteEmployee: deleteEmployeeApi } = useEmployees()
const { success: showSuccess, error: showError } = useToast()

const employees = ref<Employee[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingEmployee = ref<Employee | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const employeeForm = ref<{
  name: string
  email: string
  mobile: string
  role: UserRole
  password: string
  passwordConfirmation: string
  status: 'active' | 'inactive'
}>({
  name: '',
  email: '',
  mobile: '',
  role: 'employee',
  password: '',
  passwordConfirmation: '',
  status: 'active'
})

// Fetch employees from API
const fetchEmployees = async () => {
  isLoading.value = true
  error.value = ''
  try {
    employees.value = await getEmployees()
  } catch (err: any) {
    error.value = err.message || 'فشل جلب الموظفين'
  } finally {
    isLoading.value = false
  }
}

// Load employees on mount
onMounted(() => {
  fetchEmployees()
})

const getCreatedBy = (employee: Employee) => {
  return employee.created_by?.name || user.value?.name || 'مدير النظام'
}

const getRoleName = (role: UserRole) => {
  const roleNames: Record<UserRole, string> = {
    admin: 'مدير',
    employee: 'موظف',
    customer: 'عميل',
    receptionist: 'استقبال'
  }
  return roleNames[role] || role
}

const getRoleColor = (role: UserRole) => {
  const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800',
    employee: 'bg-blue-100 text-blue-800',
    customer: 'bg-green-100 text-green-800',
    receptionist: 'bg-yellow-100 text-yellow-800'
  }
  return roleColors[role] || 'bg-gray-100 text-gray-800'
}

const editEmployee = (employee: Employee) => {
  editingEmployee.value = employee
  employeeForm.value = {
    name: employee.name,
    email: employee.email,
    mobile: employee.mobile,
    role: employee.role,
    password: '',
    passwordConfirmation: '',
    status: employee.status
  }
  showEditModal.value = true
}

const deleteEmployee = async (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
    return
  }

  try {
    await deleteEmployeeApi(id)
    employees.value = employees.value.filter(e => e.id !== id)
    showSuccess('تم حذف الموظف بنجاح')
  } catch (err: any) {
    showError(err.message || 'فشل حذف الموظف')
  }
}

const handleSubmit = async () => {
  // Validation
  error.value = ''

  if (!employeeForm.value.name.trim()) {
    error.value = 'الاسم مطلوب'
    return
  }

  const emailValidation = validateEmail(employeeForm.value.email)
  if (!emailValidation.isValid) {
    error.value = emailValidation.error || 'البريد الإلكتروني غير صحيح'
    return
  }

  const mobileValidation = validateSaudiMobile(employeeForm.value.mobile)
  if (!mobileValidation.isValid) {
    error.value = mobileValidation.error || 'رقم الجوال غير صحيح'
    return
  }

  if (!showEditModal.value) {
    // Create validation
    if (!employeeForm.value.password) {
      error.value = 'كلمة المرور مطلوبة'
      return
    }

    const passwordValidation = validatePassword(employeeForm.value.password)
    if (!passwordValidation.isValid) {
      error.value = passwordValidation.error || 'كلمة المرور غير صحيحة'
      return
    }

    if (employeeForm.value.password !== employeeForm.value.passwordConfirmation) {
      error.value = 'كلمة المرور وتأكيدها غير متطابقين'
      return
    }
  } else if (employeeForm.value.password) {
    // If password is provided, validate it
    const passwordValidation = validatePassword(employeeForm.value.password)
    if (!passwordValidation.isValid) {
      error.value = passwordValidation.error || 'كلمة المرور غير صحيحة'
      return
    }

    if (!employeeForm.value.passwordConfirmation) {
      error.value = 'يجب إدخال تأكيد كلمة المرور'
      return
    }

    if (employeeForm.value.password !== employeeForm.value.passwordConfirmation) {
      error.value = 'كلمة المرور وتأكيدها غير متطابقين'
      return
    }
  }

  isSubmitting.value = true

  try {
    const normalizedMobile = normalizeSaudiMobile(employeeForm.value.mobile)

    if (showEditModal.value && editingEmployee.value) {
      // Update existing employee
      const updateData: any = {
        name: employeeForm.value.name,
        email: employeeForm.value.email,
        mobile: normalizedMobile,
        role: employeeForm.value.role,
        status: employeeForm.value.status
      }

      if (employeeForm.value.password) {
        updateData.password = employeeForm.value.password
      }

      await updateEmployee(editingEmployee.value.id, updateData)
      showSuccess('تم تحديث الموظف بنجاح')
    } else {
      // Add new employee
      await createEmployee({
        name: employeeForm.value.name,
        email: employeeForm.value.email,
        mobile: normalizedMobile,
        password: employeeForm.value.password,
        role: employeeForm.value.role
      })
      showSuccess('تم إضافة الموظف بنجاح')
    }
    fetchEmployees()
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
  editingEmployee.value = null
  employeeForm.value = {
    name: '',
    email: '',
    mobile: '',
    role: 'employee',
    password: '',
    passwordConfirmation: '',
    status: 'active'
  }
  error.value = ''
}
</script>
