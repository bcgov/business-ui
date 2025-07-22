<script setup lang="ts">
defineProps({
  labels: {
    type: Array<string>,
    required: true
  },
  value: {
    type: String,
    required: true
  }
})

const model = defineModel<string>()
</script>

<template>
  
</template>
