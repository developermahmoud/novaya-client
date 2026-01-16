<template>
  <Teleport to="body">
    <div class="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto min-w-[300px] max-w-md mx-auto shadow-lg rounded-lg p-4 flex items-center gap-3',
            getToastClasses(toast.type)
          ]"
        >
          <div class="flex-shrink-0">
            <CheckCircle v-if="toast.type === 'success'" :size="20" class="text-white" />
            <XCircle v-else-if="toast.type === 'error'" :size="20" class="text-white" />
            <Info v-else-if="toast.type === 'info'" :size="20" class="text-white" />
            <AlertTriangle v-else-if="toast.type === 'warning'" :size="20" class="text-white" />
          </div>
          <p class="flex-1 text-sm font-medium text-white">{{ toast.message }}</p>
          <button
            @click="removeToast(toast.id)"
            class="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          >
            <X :size="18" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()

const getToastClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-500'
    case 'error':
      return 'bg-red-500'
    case 'info':
      return 'bg-blue-500'
    case 'warning':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
