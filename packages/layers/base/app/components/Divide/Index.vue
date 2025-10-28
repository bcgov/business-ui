<script setup lang="ts">
const props = defineProps<{ orientation?: 'veritical' | 'horizontal' }>()

const defaultClass = computed(() => (
  props.orientation === 'veritical'
    ? 'divide-y divide-line *:py-3 *:first:pt-0 *:last:pb-0'
    : 'divide-x divide-line *:px-2 *:first:pl-0 *:last:pr-0'
))
</script>

<template>
  <span :class="defaultClass">
    <slot />
  </span>
</template>
