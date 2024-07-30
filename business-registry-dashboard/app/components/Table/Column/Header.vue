<script setup lang="ts">
defineProps<{
  label: string
  clearButton: boolean
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
      <UTooltip v-if="clearButton" :text="$t('btn.clearFilter', { filter: label })" :popper="{ arrow: true }">
        <UButton
          :ui="{ rounded: 'rounded-l-none rounded-r-md' }"
          class="-ml-1"
          icon="i-mdi-close"
          color="gray"
          :ariaLabel="$t('btn.clearFilter', { filter: label })"
          @click="$emit('clear')"
        />
      </UTooltip>
    </div>
  </div>
</template>
