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
  <UTextarea
    :id
    v-model.trim="model"
    :data-testid="id"
    placeholder="&nbsp;"
    :aria-required="required"
    :disabled
    :maxlength
    class="w-full grow"
    :ui="{
      base: invalid ? 'ring-0 shadow-bcGovInputError focus:shadow-bcGovInputError resize-none' : 'resize-none'
    }"
  >
    <label
      class="floating-label-textarea bg-bcGovGray-100 w-[96%] flex-1 pt-1 -mt-1"
      :class="invalid ? 'text-red-600' : ''"
      :for="id"
    >
      {{ label }}
    </label>
  </UTextarea>
</template>
