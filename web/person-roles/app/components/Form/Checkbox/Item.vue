<script setup lang="ts">
// https://reka-ui.com/examples/checkbox-group
import type { AcceptableValue } from 'reka-ui'
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'

defineProps<{
  item: {
    value: AcceptableValue
    label: string
  }
  checked: boolean
}>()
</script>

<template>
  <CheckboxRoot
    :value="item.value"
    class="group flex items-center gap-4 p-4 appearance-none rounded-sm
    bg-bcGovGray-100 border border-gray-300 size-full cursor-pointer"
  >
    <div
      v-if="!checked"
      class="-mb-1.25 relative before:absolute before:size-10 before:rounded-full group-hover:before:bg-[#C7C7C7]/80
      group-active:before:bg-[#454545]/40 before:left-1/2 before:top-5/12
      before:-translate-1/2 before:transition-colors"
    >
      <UIcon
        name="i-mdi-checkbox-blank-outline"
        class="size-6 text-gray-700 shrink-0"
      />
    </div>

    <CheckboxIndicator
      class="-mb-1.25 relative before:absolute before:size-10 before:rounded-full
      group-hover:before:bg-[#7AA1D2]/40 group-active:before:bg-[#155fb7]/40 before:left-1/2 before:top-5/12
      before:-translate-1/2 before:transition-colors"
    >
      <UIcon
        name="i-mdi-checkbox-marked"
        class="size-6 text-blue-500 shrink-0"
      />
    </CheckboxIndicator>
    <label class="flex flex-row gap-4 items-center cursor-pointer text-left">
      {{ item.label }}
    </label>
  </CheckboxRoot>
</template>
