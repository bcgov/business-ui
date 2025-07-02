<script setup lang="ts">
const model = defineModel<string>({ default: '' })

const props = defineProps<{
  id: string
  schemaPrefix: string
  disabled?: boolean
}>()

const inputId = props.id + '-locationDescription'
</script>

<template>
  <FormFieldTextarea
    v-model="model"
    :input-id="inputId"
    :name="schemaPrefix + 'locationDescription'"
    :disabled
    :label="$t('label.deliveryInstructionsOpt')"
  />
</template>
