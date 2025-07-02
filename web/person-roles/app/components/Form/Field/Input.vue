<script setup lang="ts">
const model = defineModel<string>({ required: true })

defineProps<{
  name: string
  label: string
  help?: string
  inputId: string
  required?: boolean
  autofocus?: boolean
  mask?: string
  disabled?: boolean
}>()
</script>

<template>
  <UFormField
    :name
    :help
    class="grow flex-1"
  >
    <template #default="{ error }">
      <ConnectInput
        :id="inputId"
        v-model="model"
        v-maska="mask"
        :required
        :invalid="!!error"
        :label
        :autofocus
        :disabled
      />
      <div
        v-if="!help && !error"
        class="h-4 mt-1"
      />
    </template>
  </UFormField>
</template>
