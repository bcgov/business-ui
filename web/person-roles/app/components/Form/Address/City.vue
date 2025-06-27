<script setup lang="ts">
const model = defineModel<string>({ default: '' })

const props = defineProps<{
  id: string
  schemaPrefix: string
  disabled?: boolean
}>()

const inputId = props.id + '-city'
</script>

<template>
  <FormFieldInput
    v-model="model"
    :name="schemaPrefix + 'city'"
    :input-id="inputId"
    required
    :label="$t('label.city')"
    :disabled
  />
</template>
