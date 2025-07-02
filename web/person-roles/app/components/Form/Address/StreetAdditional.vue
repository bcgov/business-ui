<script setup lang="ts">
const model = defineModel<string>({ default: '' })

const props = defineProps<{
  id: string
  schemaPrefix: string
  disabled?: boolean
}>()

const inputId = props.id + '-streetAdditional'
</script>

<template>
  <FormFieldInput
    v-model="model"
    :name="schemaPrefix + 'streetAdditional'"
    :input-id="inputId"
    :label="$t('label.streetAdditional')"
    :disabled
  />
</template>
