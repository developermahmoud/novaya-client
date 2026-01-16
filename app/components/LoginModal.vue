<template>
  <UiModal :is-open="isOpen" title="تسجيل الدخول" size="sm" @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <UiInput
        v-model="phone"
        label="رقم الهاتف"
        type="tel"
        placeholder="05xxxxxxxx"
        :error="error"
        required
      />
      <UiInput
        v-model="password"
        label="كلمة المرور"
        type="password"
        required
      />
      <UiButton type="submit" full-width :disabled="isLoading">
        {{ isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول' }}
      </UiButton>
    </form>
    <p class="mt-4 text-center text-sm text-text-secondary">
      ليس لديك حساب؟
      <button @click="$emit('switchToRegister')" class="text-primary hover:underline">
        سجل الآن
      </button>
    </p>
  </UiModal>
</template>

<script setup lang="ts">
import { validateSaudiMobile, normalizeSaudiMobile } from '~/utils/validation'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  switchToRegister: []
}>()

const phone = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const { login } = useAuth()

const handleSubmit = async () => {
  error.value = ''
  
  // Validate mobile
  const mobileValidation = validateSaudiMobile(phone.value)
  if (!mobileValidation.isValid) {
    error.value = mobileValidation.error || 'رقم الجوال غير صحيح'
    return
  }
  
  if (!password.value || password.value.trim() === '') {
    error.value = 'كلمة المرور مطلوبة'
    return
  }
  
  isLoading.value = true
  
  try {
    // Normalize mobile number
    const normalizedMobile = normalizeSaudiMobile(phone.value)
    
    const result = await login(normalizedMobile, password.value)
    if (result.success) {
      emit('close')
      await nextTick()
      await navigateTo('/dashboard', { replace: true })
    } else {
      error.value = result.error || 'رقم الهاتف أو كلمة المرور غير صحيحة'
    }
  } catch (err) {
    error.value = 'حدث خطأ أثناء تسجيل الدخول'
  } finally {
    isLoading.value = false
  }
}
</script>
