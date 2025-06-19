<script lang="ts">
export default {
  name: 'FormSection'
}
</script>

<script setup lang="ts">
title: string
defineProps<{
  description: string | undefined
  icon: string | undefined
}>()
</script>

<template>
  <section :aria-labelledby="title">
    <h2 class="text-lg font-semibold">
      {{ title }}
    </h2>
  </section>
</template>

<style scoped>

</style>
