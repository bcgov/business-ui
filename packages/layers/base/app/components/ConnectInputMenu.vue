<script setup lang="ts">
import type { InputMenuProps } from '@nuxt/ui'

const props = defineProps<{
  id: string
  label: string
}>()

const labelId = props.id + '-label'
const model = defineModel<InputMenuProps['modelValue']>()

const hasValue = computed(() => {
  const val = model.value
  if (Array.isArray(val)) {
    return val.length > 0
  }
  return val === 0 || !!val
})

defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="relative group">
    <span
      :id="labelId"
      :class="[
        'absolute left-0 z-10 px-2.5 pointer-events-none text-neutral transition-all duration-200 w-fit line-clamp-1',
        'top-1/2 -translate-y-1/2',
        'group-focus-within:top-3 group-focus-within:text-xs group-focus-within:text-primary',
        'group-has-aria-invalid:text-error',
        hasValue ? 'top-3 text-xs' : ''
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
