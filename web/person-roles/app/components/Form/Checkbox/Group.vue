<script setup lang="ts">
// https://reka-ui.com/examples/checkbox-group
import { CheckboxGroupRoot, type AcceptableValue } from 'reka-ui'

defineProps<{
  items: Array<{
    value: AcceptableValue
    label: string
  }>
}>()

const model = defineModel<AcceptableValue[]>({ required: true })
</script>

<template>
  <CheckboxGroupRoot
    v-model="model"
    class="grid grid-cols-2 gap-4"
  >
    <!-- TODO: confirm key type -->
    <div
      v-for="item in items"
      :key="item.value as string"
      class="flex items-center gap-3"
    >
      <FormCheckboxItem
        :item
        :checked="model.includes(item.value)"
      />
    </div>
  </CheckboxGroupRoot>
</template>
