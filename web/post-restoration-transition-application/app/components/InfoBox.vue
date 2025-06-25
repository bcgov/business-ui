<script setup lang="ts">
defineProps<{
  title: string
  text?: string
  icon?: string
}>()
</script>

<template>
  <div class="flex items-start bg-bcGovColor-white">
    {{ title }}
  </div>
</template>

<style scoped>

</style>
