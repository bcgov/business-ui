<script setup lang="ts">
type ClearButtonProps =
  | { show: true; tooltip: string; aria: string }
  | { show: false }

defineProps<{
  label: string
  clearButton: ClearButtonProps
}>()

defineEmits(['clear'])
</script>
<template>
  <div class="flex flex-col gap-2 font-normal">
    <span class="border-b border-gray-200 p-2 font-semibold">{{ label }}</span>
    <div class="inline-flex -space-x-px px-2 pt-2">
      <div class="grow">
        <slot />
      </div>
      <UTooltip v-if="clearButton.show" :text="clearButton.tooltip">
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
