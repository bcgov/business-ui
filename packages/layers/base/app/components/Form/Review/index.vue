<script setup lang="ts">
defineProps<{
  viewOnly?: boolean
}>()
</script>

<template>
  <div class="space-y-6 sm:space-y-10">
    <slot />
    <slot v-if="!viewOnly" name="submission-fields" />
  </div>
</template>
