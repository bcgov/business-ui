<script setup lang="ts">
import type { FormError } from '@nuxt/ui'

const {
  orientation = 'horizontal',
  bodyVariant = 'none'
} = defineProps<{
  label?: string
  description?: string
  error?: FormError | boolean
  showErrorMsg?: boolean
  orientation?: 'vertical' | 'horizontal'
  bodyVariant?: FieldsetBodyVariant
  nested?: boolean
}>()

const id = useId()
const legendId = id + '-legend'
const descriptionId = id + '-description'

const bodyClassMap: Record<FieldsetBodyVariant, string> = {
  none: '',
  card: 'p-4 sm:p-6 bg-white rounded shadow-xs'
}

const bodyClass = bodyClassMap[bodyVariant]
</script>

<template>
  <fieldset :aria-labelledby="legendId" :aria-describedby="descriptionId">
    <div
      :class="[
        'flex gap-4 sm:gap-6',
        { 'py-6 px-4 sm:py-10 sm:px-8': bodyVariant === 'none' || nested },
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
        :class="[
          bodyClass,
          (error && bodyVariant === 'card') ? 'border-error border-l-3' : 'border-transparent border-l-3'
        ]"
      >
        <slot />
      </div>
    </div>
  </fieldset>
</template>
