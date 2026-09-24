<script setup lang="ts">
// The legal company name in the new jurisdiction after an Amalgamation Out or Continuation Out filing
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
  preventActions?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
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
  <ConnectFormFieldWrapper
    padding-class="py-4 sm:py-5 padding-x-default"
    :label="'Jurisdiction'"
  >
    <div class="-mt-2 sm:mt-0">
      British Columbia
    </div>
  </ConnectFormFieldWrapper>

  <ManageYourCompanyJurisdictionNew
    v-model="model"
    :field-state="fields.newJurisdiction"
    :loading
    :state-key
    :is-read-only-variant
    :label-overrides
    @init-edit="$emit('init-edit', 'newJurisdiction')"
    @undo="$emit('undo', 'newJurisdiction')"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  />

  <ManageYourCompanyJurisdictionPrevious
    v-model="model"
    :field-state="fields.previousJurisdiction"
    :loading
    :state-key
    :is-read-only-variant
    :label-overrides
    @init-edit="$emit('init-edit', 'previousJurisdiction')"
    @undo="$emit('undo', 'previousJurisdiction')"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  />
</template>
