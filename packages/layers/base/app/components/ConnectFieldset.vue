<script setup lang="ts">
import type { FormError } from '@nuxt/ui'

const {
  orientation = 'horizontal',
  bodyVariant = 'none',
  paddingClass = 'x-default'
} = defineProps<{
  label?: string
  description?: string
  error?: FormError | boolean
  showErrorMsg?: boolean
  orientation?: 'vertical' | 'horizontal'
  bodyVariant?: FieldsetBodyVariant
  paddingClass?: 'x-default' | 'xy-default' | string
}>()

const id = useId()
const legendId = id + '-legend'
const descriptionId = id + '-description'

const bodyClassMap: Record<FieldsetBodyVariant, string> = {
  none: '',
  card: 'bg-white rounded shadow-xs'
}

const bodyClass = bodyClassMap[bodyVariant]

const padding = paddingClass === 'x-default'
  ? 'px-4 sm:px-8'
  : paddingClass === 'xy-default'
    ? 'py-6 px-4 sm:py-10 sm:px-8'
    : paddingClass
</script>

<template>
  <fieldset :aria-labelledby="legendId" :aria-describedby="descriptionId">
    <div
      :class="[
        'flex gap-4 sm:gap-6',
        bodyVariant === 'none' ? padding : '',
        orientation === 'horizontal' ? 'flex-col sm:flex-row' : 'flex-col',
        (error && bodyVariant === 'none') ? 'border-error border-l-3' : 'border-transparent border-l-3'
      ]"
    >
      <div
        class="flex flex-col gap-1"
        :class="{ 'w-full sm:basis-1/4 pb-0': orientation === 'horizontal' }"
      >
        <legend
          :id="legendId"
          class="text-base text-neutral-highlighted font-bold"
        >
          <slot name="label">
            <div class="flex flex-wrap gap-4">
              <span>{{ label }}</span>
              <span
                v-if="error && typeof error === 'object' && 'message' in error && showErrorMsg"
                class="font-normal text-error"
              >
                {{ error.message }}
              </span>
            </div>
          </slot>
        </legend>
        <div v-if="description || $slots.description" id="descriptionId">
          <slot name="description">
            <p>
              {{ description }}
            </p>
          </slot>
        </div>
      </div>

      <div
        class="flex-1"
        :class="bodyClass"
      >
        <slot />
      </div>
    </div>
  </fieldset>
</template>
