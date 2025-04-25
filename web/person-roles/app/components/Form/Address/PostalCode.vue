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
  <UFormField
    :name="schemaPrefix + 'postalCode'"
    class="grow flex-1"
  >
    <template #default="{ error }">
      <ConnectInput
        :id="inputId"
        v-model.trim="model"
        v-maska="country === 'CA'
          ? 'V#@ #@#'
          : country === 'US'
            ? '#####-####'
            : undefined"
        required
        :invalid="!!error"
        :disabled
        :label="country === 'US'
          ? $t('label.zipCode')
          : $t('label.postalCode')
        "
      />
    </template>
  </UFormField>
</template>
