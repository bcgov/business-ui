<script setup lang="ts">
import type { FormError } from '@nuxt/ui'

const {
  orientation = 'horizontal'
} = defineProps<{
  label: string
  error?: FormError | boolean
  showErrorMsg?: boolean
  orientation?: 'vertical' | 'horizontal'
  nested?: boolean
}>()
</script>

<template>
  <div
    :class="[
      'flex gap-4 sm:gap-6',
      { 'py-6 px-4 sm:py-10 sm:px-8': nested },
      orientation === 'horizontal' ? 'flex-col sm:flex-row' : 'flex-col',
      error ? 'border-error border-l-3' : 'border-transparent border-l-3'
    ]"
  >
    <span
      aria-hidden="true"
      class="text-base text-neutral-highlighted font-bold"
      :class="{ 'w-full sm:basis-1/4': orientation === 'horizontal' }"
    >
      <div class="flex gap-2.5" :class="orientation === 'horizontal' ? 'flex-col' : 'flex-wrap'">
        <span>{{ label }}</span>
        <span
          v-if="error && typeof error === 'object' && 'message' in error && showErrorMsg"
          class="font-normal text-error"
        >
          {{ error.message }}
        </span>
      </div>
    </span>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>
