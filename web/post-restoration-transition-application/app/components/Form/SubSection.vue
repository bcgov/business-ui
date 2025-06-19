<script lang="ts">
export default {
  name: 'FormSubSection'
}
</script>

<script setup lang="ts">
defineProps<{
  title: string
  description: string | undefined
  icon: string | undefined
}>()
</script>

<template>
  <section :aria-labelledby="title">
    <div class="w-full bg-bcGovColor-gray2">
      <!-- todo: add icon here -->
      <h2 class="text-lg font-semibold">
        {{ title }}
      </h2>
    </div>
  </section>
</template>

<style scoped>

</style>
