<script setup lang="ts">
const model = defineModel<string>()
defineProps({
  name: { type: String, required: true },
  help: { type: String, default: '' },
  error: { type: String, default: '' },
  invalid: { type: Boolean, default: false },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
</script>

<template>
  <UFormField
    :name
    :help
    :error="$te(error) ? $t(error) : error"
    class="pb-[22px]"
    :class="error ? 'mb-[-22px]' : ''"
  >
    <ConnectInput
      :id="name"
      v-model="model"
      :label
      :invalid="invalid"
      :aria-placeholder="placeholder"
      :disabled="disabled"
    />
  </UFormField>
</template>
