<script setup lang="ts">
const model = defineModel<string>({ default: '' })

const {
  maxlength = '1000'
} = defineProps<{
  id: string
  label: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  maxlength?: string
}>()
</script>

<template>
  <UInput
    :id
    v-model.trim="model"
    :data-testid="id"
    placeholder=""
    :aria-required="required"
    :disabled
    :maxlength
    class="w-full grow"
    :ui="{
      base: invalid ? 'ring-0 shadow-bcGovInputError focus:shadow-bcGovInputError' : ''
    }"
  >
    <label
      :for="id"
      class="floating-label-input"
      :class="invalid ? 'text-red-600' : ''"
    >
      {{ label }}
    </label>
  </UInput>
</template>
