<template>
  <Teleport v-if="isClient" to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="$emit('close')"
    >
      <div
        :class="[sizeClasses[size], 'bg-white rounded-lg p-6 w-full mx-4 max-h-[90vh] overflow-y-auto']"
        @click.stop
      >
        <div v-if="title || showCloseButton" class="flex justify-between items-center mb-6">
          <h2 v-if="title" class="text-2xl font-bold text-text-primary">{{ title }}</h2>
          <button
            v-if="showCloseButton"
            @click="$emit('close')"
            class="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="إغلاق"
          >
            <X :size="24" />
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

const isClient = typeof window !== 'undefined'

interface Props {
  isOpen: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showCloseButton: true
})

defineEmits<{
  close: []
}>()

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}
</script>
