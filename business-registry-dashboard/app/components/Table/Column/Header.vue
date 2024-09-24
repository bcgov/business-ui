<script setup lang="ts">
type ClearButtonProps =
  | { show: true; tooltip: string; aria: string; hideTooltip: boolean }
  | { show: false }

defineProps<{
  label: string
  clearButton: ClearButtonProps
}>()

defineEmits(['clear'])
</script>
<template>
  <div class="flex flex-col border-b border-gray-200 font-normal">
    <span class="border-b border-gray-200 p-4 font-semibold">{{ label }}</span>
    <div class="inline-flex -space-x-px p-4">
      <div class="grow">
        <slot />
      </div>
      <UTooltip v-if="clearButton.show" :text="clearButton.tooltip" :prevent="clearButton.hideTooltip">
        <UButton
          :ui="{ rounded: 'rounded-l-none rounded-r-md' }"
          class="-ml-1"
          icon="i-mdi-close"
          variant="table_header_clear"
          :aria-label="clearButton.aria"
          @click="$emit('clear')"
        />
      </UTooltip>
    </div>
  </div>
</template>
