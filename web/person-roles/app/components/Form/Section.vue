<script setup lang="ts">
import type { FormError } from '@nuxt/ui'

defineProps<{
  label: string
  error?: FormError
  showErrorMsg?: boolean
}>()

const baseId = useId()
const legendId = baseId + '-legend'
const errorId = baseId + '-error'
</script>

<template>
  <fieldset
    class="flex flex-col gap-6"
    :aria-invalid="!!error"
    :aria-labelledby="showErrorMsg ? `${legendId} ${errorId}` : `${legendId}`"
  >
    <legend
      class="text-base text-bcGovGray-900 font-bold mb-6"
      :class="{
        'text-red-600': !!error
      }"
    >
      <div class="flex gap-4">
        <span :id="legendId">{{ label }}</span>
        <span
          v-if="!!error"
          :id="errorId"
          class="font-normal"
          :class="showErrorMsg ? '' : 'sr-only'"
          aria-hidden="true"
        >
          {{ error.message }}
        </span>
      </div>
    </legend>

    <slot />
  </fieldset>
</template>
