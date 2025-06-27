<script setup lang="ts">
const model = defineModel({
  set(value) {
    return value.toUpperCase()
  },
  type: String,
  default: ''
})

const props = defineProps<{
  id: string
  schemaPrefix: string
  disabled?: boolean
  country?: string
}>()

const inputId = props.id + '-postalCode'
</script>

<template>
  <FormFieldInput
    v-model="model"
    :name="schemaPrefix + 'postalCode'"
    :input-id="inputId"
    :disabled
    required
    :label="country === 'US'
      ? $t('label.zipCode')
      : $t('label.postalCode')
    "
    :mask="country === 'CA'
      ? 'V#@ #@#'
      : country === 'US'
        ? '#####-####'
        : undefined"
  />
</template>
