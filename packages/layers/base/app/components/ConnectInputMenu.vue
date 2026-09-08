<script setup lang="ts">
import type { InputMenuProps } from '@nuxt/ui'

const props = defineProps<{
  id: string
  label: string
}>()

const labelId = props.id + '-label'
const model = defineModel<InputMenuProps['modelValue']>()

function isPopulated(val: unknown): boolean {
  if (val === null || val === undefined) {
    return false
  }

  if (typeof val === 'string') {
    return val.trim().length > 0
  }

  if (typeof val === 'number') {
    return !Number.isNaN(val)
  }

  if (typeof val === 'boolean' || typeof val === 'bigint') {
    return true
  }

  if (val instanceof Date) {
    return !Number.isNaN(val.getTime())
  }

  if (Array.isArray(val)) {
    return val.some(isPopulated)
  }

  if (typeof val === 'object') {
    return Object.values(val).some(isPopulated)
  }

  return false
}

const hasValue = computed(() => isPopulated(model.value))

defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="relative group">
    <span
      :id="labelId"
      :class="[
        'absolute text-neutral transition-transform duration-200 ease-out origin-left text-base line-clamp-1',
        'top-1/2 left-2.5 z-10 pointer-events-none -translate-y-1/2',
        'group-focus-within:translate-y-[-115%] group-focus-within:scale-75 group-focus-within:text-primary',
        'group-has-aria-invalid:text-error',
        hasValue ? 'translate-y-[-115%] scale-75' : ''
      ]"
    >
      {{ label }}
    </span>
    <UInputMenu
      v-bind="$attrs"
      :id
      v-model="model"
      :aria-labelledby="labelId"
    />
  </div>
</template>
