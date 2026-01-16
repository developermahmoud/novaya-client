<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className
    ]"
    @click="$emit('click')"
  >
    <component
      v-if="icon && iconPosition === 'left'"
      :is="icon"
      :size="iconSize"
    />
    <slot />
    <component
      v-if="icon && iconPosition === 'right'"
      :is="icon"
      :size="iconSize"
    />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: Component
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  className?: string
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  iconPosition: 'left',
  className: ''
})

defineEmits<{
  click: []
}>()

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg',
  secondary: 'bg-secondary text-text-primary hover:bg-gray-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-text-secondary hover:bg-light-bg',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

const iconSize = computed(() => {
  return props.size === 'sm' ? 16 : props.size === 'lg' ? 24 : 20
})
</script>
