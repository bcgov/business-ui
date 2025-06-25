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
    <div>
      <h2
        class="text-base"
        :class="hasErrors ? 'text-outcomes-error' : ''"
      >
        {{ title }}
      </h2>
      <p v-if="description">
        {{ description }}
      </p>
    </div>
    <!-- This slot will accept any HTML/components -->
    <slot />
  </section>
</template>

<style scoped>

</style>
