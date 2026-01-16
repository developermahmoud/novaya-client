<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-text-secondary mb-2">
      {{ label }}
    </label>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :class="[
        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors',
        error ? 'border-red-300' : 'border-color',
        className
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
    <p v-else-if="helperText" class="mt-1 text-sm text-text-secondary">{{ helperText }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  error?: string
  helperText?: string
  required?: boolean
  className?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  className: ''
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
