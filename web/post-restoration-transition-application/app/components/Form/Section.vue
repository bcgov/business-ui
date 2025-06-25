<script lang="ts">
export default {
  name: 'FormSection'
}
</script>

<script setup lang="ts">
defineProps<{
  title: string
  hasErrors: boolean
  description?: string
  icon?: string
}>()
</script>

<template>
  <section :aria-labelledby="title">
    <h2 class="text-base">
      {{ title }}
    </h2>
    <p>
      {{ description }}
    </p>
    <!-- This slot will accept any HTML/components -->
    <slot />
  </section>
</template>

<style scoped>

</style>
