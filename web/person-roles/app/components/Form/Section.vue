<script setup lang="ts">
import type { FormError } from '@nuxt/ui'

const {
  orientation = 'vertical'
} = defineProps<{
  label: string
  error?: FormError
  showErrorMsg?: boolean
  orientation?: 'vertical' | 'horizontal'
}>()

const baseId = useId()
const legendId = baseId + '-legend'
const errorId = baseId + '-error'
</script>

<template>
  <fieldset
    class="flex"
    :class="[orientation === 'horizontal' ? 'flex-col gap-6 sm:flex-row sm:gap-4' : 'flex-col gap-6']"
    :aria-invalid="!!error"
    :aria-labelledby="showErrorMsg ? `${legendId} ${errorId}` : `${legendId}`"
  >
    <div
      :class="{
        'w-full sm:w-1/4': orientation === 'horizontal'
      }"
    >
      <legend
        class="text-base text-bcGovGray-900 font-bold"
        :class="{ 'text-red-600': !!error }"
      >
        <div class="flex gap-4">
          <span :id="legendId">{{ label }}</span>
          <span
            v-if="!!error && showErrorMsg"
            :id="errorId"
            class="font-normal"
          >
            {{ error.message }}
          </span>
        </div>
      </legend>
    </div>

    <div class="flex-1">
      <slot />
    </div>
  </fieldset>
</template>
