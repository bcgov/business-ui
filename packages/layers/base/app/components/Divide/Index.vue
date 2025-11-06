<script setup lang="ts">
const props = defineProps<{
  orientation?: 'vertical' | 'horizontal'
}>()

const defaultClass = computed(() => (
  props.orientation === 'vertical'
    ? 'divide-y divide-line-muted *:py-3 *:first:pt-0 *:last:pb-0'
    : 'divide-x divide-line-muted *:px-2 *:first:pl-0 *:last:pr-0'
))
</script>

<template>
  <span :class="defaultClass">
    <slot />
  </span>
</template>
