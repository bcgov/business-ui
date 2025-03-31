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
  <UFormField
    :name="schemaPrefix + 'city'"
    class="grow flex-1"
  >
    <template #default="{ error }">
      <ConnectInput
        :id="inputId"
        v-model="model"
        required
        :invalid="!!error"
        :disabled
        :label="$t('label.city')"
      />
    </template>
  </UFormField>
</template>
