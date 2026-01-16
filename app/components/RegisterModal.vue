<template>
  <UiModal :is-open="isOpen" title="تسجيل عضوية جديدة" size="sm" @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <UiInput
        v-model="name"
        label="الاسم الكامل"
        type="text"
        :error="errors.name"
        required
        @input="errors.name = ''"
      />
      <UiInput
        v-model="email"
        label="البريد الإلكتروني"
        type="email"
        :error="errors.email || error"
        required
        @input="errors.email = ''; error = ''"
      />
      <UiInput
        v-model="mobile"
        label="رقم الجوال (سعودي)"
        type="tel"
        placeholder="05xxxxxxxx"
        :error="errors.mobile"
        required
        @input="errors.mobile = ''"
      />
      <UiInput
        v-model="password"
        label="كلمة المرور"
        type="password"
        :error="errors.password"
        required
        @input="errors.password = ''"
      />
      <UiButton type="submit" full-width :disabled="isLoading">
        {{ isLoading ? 'جاري التسجيل...' : 'تسجيل' }}
      </UiButton>
    </form>
    <p class="mt-4 text-center text-sm text-text-secondary">
      لديك حساب بالفعل؟
      <button @click="$emit('switchToLogin')" class="text-primary hover:underline">
        تسجيل الدخول
      </button>
    </p>
  </UiModal>
</template>

<script setup lang="ts">
import { validateName, validateEmail, validateSaudiMobile, validatePassword, normalizeSaudiMobile } from '~/utils/validation'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  switchToLogin: []
}>()

const name = ref('')
const email = ref('')
const mobile = ref('')
const password = ref('')
const error = ref('')
const errors = ref({
  name: '',
  email: '',
  mobile: '',
  password: '',
})
const isLoading = ref(false)
const { register } = useAuth()

const validateForm = (): boolean => {
  errors.value = {
    name: '',
    email: '',
    mobile: '',
    password: '',
  }

  // Validate name
  const nameValidation = validateName(name.value)
  if (!nameValidation.isValid) {
    errors.value.name = nameValidation.error || ''
    return false
  }

  // Validate email
  const emailValidation = validateEmail(email.value)
  if (!emailValidation.isValid) {
    errors.value.email = emailValidation.error || ''
    return false
  }

  // Validate mobile
  const mobileValidation = validateSaudiMobile(mobile.value)
  if (!mobileValidation.isValid) {
    errors.value.mobile = mobileValidation.error || ''
    return false
  }

  // Validate password
  const passwordValidation = validatePassword(password.value)
  if (!passwordValidation.isValid) {
    errors.value.password = passwordValidation.error || ''
    return false
  }

  return true
}

const handleSubmit = async () => {
  error.value = ''
  
  // Validate form
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  
  try {
    // Normalize mobile number
    const normalizedMobile = normalizeSaudiMobile(mobile.value)
    
    const result = await register(name.value, email.value, normalizedMobile, password.value)
    if (result.success) {
      emit('close')
      await nextTick()
      await navigateTo('/dashboard', { replace: true })
    } else {
      // Set field-specific errors if available
      if (result.fieldErrors) {
        if (result.fieldErrors.email) {
          errors.value.email = result.fieldErrors.email[0] || ''
        }
        if (result.fieldErrors.mobile) {
          errors.value.mobile = result.fieldErrors.mobile[0] || ''
        }
        if (result.fieldErrors.name) {
          errors.value.name = result.fieldErrors.name[0] || ''
        }
        if (result.fieldErrors.password) {
          errors.value.password = result.fieldErrors.password[0] || ''
        }
      }
      
      // Set general error message
      error.value = result.error || 'فشل التسجيل'
    }
  } catch (err) {
    error.value = 'حدث خطأ أثناء التسجيل'
  } finally {
    isLoading.value = false
  }
}
</script>
