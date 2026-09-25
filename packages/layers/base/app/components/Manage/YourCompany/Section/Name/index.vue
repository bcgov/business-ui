<script setup lang="ts">
// The legal company name in the new jurisdiction after an Amalgamation Out or Continuation Out filing
const {
  stateKey,
  fields,
  loading,
  labelOverrides,
  isReadOnlyVariant,
  correctNameOptions,
  nrAllowedActionsTypes
} = defineProps<{
  stateKey: string
  fields: ManageYourCompanyFields
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
  correctNameOptions?: CorrectNameOption[]
  nrAllowedActionsTypes?: NrRequestActionCode[]
  business?: BusinessData | BusinessDataPublic
}>()

defineEmits<{
  'done': []
  'cancel': []
  'init-edit': [key: keyof ManageYourCompanyFields]
  'undo': [key: keyof ManageYourCompanyFields]
}>()

const model = defineModel<ActiveYourCompanySchema>()

watchEffect(() => console.log(isReadOnlyVariant))
</script>

<template>
  <ManageYourCompanySectionNameLegal
    v-model="model"
    :field-state="fields.nameRequest"
    :loading
    :state-key
    :is-read-only-variant
    :label-overrides
    :business
    :correct-name-options
    :nr-allowed-actions-types
    @init-edit="$emit('init-edit', 'nameRequest')"
    @undo="$emit('undo', 'nameRequest')"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  />

  <!-- The legal company name in the new jurisdiction after an Amalgamation Out or Continuation Out filing -->
  <ManageYourCompanyFieldRow
    v-model="model"
    :state-key
    field-key="nameNewJurisdiction"
    :field-state="fields.nameNewJurisdiction"
    :label="$t('label.nameInNewJurisdiction')"
    :loading
    :label-overrides
    :is-read-only-variant
    indent
    @init-edit="$emit('init-edit', $event)"
    @undo="$emit('undo', $event)"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  >
    <ConnectInput
      v-if="model && model.key === 'nameNewJurisdiction'"
      id="new-jurisdiction-name"
      v-model="model.value"
      :label="$t('label.enterNameInNewJurisdiction')"
    />
  </ManageYourCompanyFieldRow>

  <!-- The legal company name in the previous jurisdiction after a Continuation In filing -->
  <ManageYourCompanyFieldRow
    v-model="model"
    :state-key
    field-key="namePreviousJurisdiction"
    :field-state="fields.namePreviousJurisdiction"
    :label="$t('label.nameInPreviousJurisdiction')"
    :loading
    :label-overrides
    :is-read-only-variant
    indent
    @init-edit="$emit('init-edit', $event)"
    @undo="$emit('undo', $event)"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  >
    <ConnectInput
      v-if="model && model.key === 'namePreviousJurisdiction'"
      id="previous-jurisdiction-name"
      v-model="model.value"
      :label="$t('label.enterNameInPreviousJurisdiction')"
    />
  </ManageYourCompanyFieldRow>
</template>
