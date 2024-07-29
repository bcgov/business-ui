<script setup lang="ts">
defineProps<{
  heading?: string
}>()
</script>
<template>
  <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
    {{ heading || '' }}
    <slot />
  </h1>
</template>
