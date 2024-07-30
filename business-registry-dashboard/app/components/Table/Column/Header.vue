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
  <!-- eslint-disable vue/attribute-hyphenation required for ariaLabel -->
  <div class="flex flex-col gap-2 font-normal">
    <span class="font-semibold">{{ label }}</span>
    <div class="inline-flex -space-x-px ">
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
