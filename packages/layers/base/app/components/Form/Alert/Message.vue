<script setup lang="ts">
defineProps<{
  message: string | undefined
  id: string | undefined
}>()
</script>

<template>
  <div
    v-if="message"
    :id
    role="alert"
    class="text-error"
  >
    {{ message }}
  </div>
</template>
