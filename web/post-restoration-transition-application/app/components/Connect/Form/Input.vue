<script setup lang="ts">
const model = defineModel<string>()
defineProps({
  name: { type: String, required: true },
  help: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' }
})
</script>

<template>
  <UFormField :name :help>
    <ConnectInput
      :id="name"
      v-model="model"
      :label
      :aria-placeholder="placeholder"
    />
  </UFormField>
</template>
