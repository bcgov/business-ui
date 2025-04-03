<script setup lang="ts">
const model = defineModel<string>({ default: '' })

const props = defineProps<{
  id: string
  schemaPrefix: string
  disabled?: boolean
}>()

const inputId = props.id + '-deliveryInstructions'
</script>

<template>
  <UFormField
    v-slot="{ error }"
    :name="schemaPrefix + 'deliveryInstructions'"
    class="grow"
  >
    <ConnectTextarea
      :id="inputId"
      v-model="model"
      :invalid="!!error"
      :disabled
      :label="$t('label.deliveryInstructions')"
    />
  </UFormField>
</template>
