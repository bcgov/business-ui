<script setup lang="ts">
// The company expro numbers after a Continuation Out filing
const {
  stateKey,
  fields,
  loading,
  labelOverrides,
  isReadOnlyVariant
} = defineProps<{
  stateKey: string
  fields: ManageYourCompanyFields
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
  previousJurisdiction?: { country: string, region: string | null }
}>()

const emit = defineEmits<{
  'done': []
  'init-edit': [key: keyof ManageYourCompanyFields]
  'undo': [key: keyof ManageYourCompanyFields]
  'cancel': []
}>()

const model = defineModel<ActiveYourCompanySchema>()
</script>

<template>
  <ManageYourCompanyExproNumberInBC
    v-model="model"
    :field-state="fields.numberExpro"
    :loading
    :state-key
    :is-read-only-variant
    :label-overrides
    @init-edit="$emit('init-edit', 'numberExpro')"
    @undo="$emit('undo', 'numberExpro')"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  />
  
  <ManageYourCompanyExproNumberPreviousJurisdiction
    v-model="model"
    :field-state="fields.numberPreviousJurisdiction"
    :loading
    :state-key
    :is-read-only-variant
    :label-overrides
    :previous-jurisdiction
    @init-edit="$emit('init-edit', 'numberPreviousJurisdiction')"
    @undo="$emit('undo', 'numberPreviousJurisdiction')"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  />
</template>
