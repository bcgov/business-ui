<script setup lang="ts">
// The company expro numbers after a Continuation In filing
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
}>()

defineEmits<{
  'done': []
  'cancel': []
  'init-edit': [key: keyof ManageYourCompanyFields]
  'undo': [key: keyof ManageYourCompanyFields]
}>()

const model = defineModel<ActiveYourCompanySchema>()
</script>

<template>
  <!-- The extraprovincial identifier assigned to a company after a Coninuation In filing -->
  <ManageYourCompanyFieldRow
    v-model="model"
    :state-key
    field-key="numberExpro"
    :field-state="fields.numberExpro"
    :label="$t('label.exproNumberInBc')"
    :loading
    :label-overrides
    :is-read-only-variant
    padding-class="py-4 sm:py-5 padding-x-default"
    @init-edit="$emit('init-edit', $event)"
    @undo="$emit('undo', $event)"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  >
    <ConnectInput
      v-if="model && model.key === 'numberExpro'"
      id="number-expro-input"
      v-model="model.value"
      :label="$t('label.enterTheExproNumber')"
    />
  </ManageYourCompanyFieldRow>

  <ManageYourCompanyFieldRow
    v-model="model"
    :state-key
    field-key="numberPreviousJurisdiction"
    :field-state="fields.numberPreviousJurisdiction"
    :label="$t('label.identifyingNumber')"
    :loading
    :label-overrides
    :is-read-only-variant
    indent
    :sub-label="$t('label.previousJurisdiction')"
    @init-edit="$emit('init-edit', $event)"
    @undo="$emit('undo', $event)"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  >
    <ConnectInput
      v-if="model && model.key === 'numberPreviousJurisdiction'"
      id="number-prev-jurisdiction"
      v-model="model.value"
      :label="$t('label.enterNumberInPreviousJurisdiction')"
    />
  </ManageYourCompanyFieldRow>
</template>
