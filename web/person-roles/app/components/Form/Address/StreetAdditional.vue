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
  <UFormField
    v-slot="{ error }"
    :name="schemaPrefix + 'streetAdditional'"
    class="grow"
  >
    <ConnectInput
      :id="inputId"
      v-model="model"
      :invalid="!!error"
      :disabled
      :label="$t('label.streetAdditional')"
    />
  </UFormField>
</template>
