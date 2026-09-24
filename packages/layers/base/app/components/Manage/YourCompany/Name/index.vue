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

const emit = defineEmits<{
  'done': []
  'init-edit': [key: keyof ManageYourCompanyFields | 'nameRequest']
  'undo': [key: keyof ManageYourCompanyFields]
  'cancel': []
}>()

const model = defineModel<ActiveYourCompanySchema>()
</script>

<template>
  <ManageYourCompanyNameLegal
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

  <ManageYourCompanyNameNewJurisdiction
    v-model="model"
    :field-state="fields.nameNewJurisdiction"
    :loading
    :state-key
    :is-read-only-variant
    :label-overrides
    @init-edit="$emit('init-edit', 'nameNewJurisdiction')"
    @undo="$emit('undo', 'nameNewJurisdiction')"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  />
  
  <ManageYourCompanyNamePreviousJurisdiction
    v-model="model"
    :field-state="fields.namePreviousJurisdiction"
    :loading
    :state-key
    :is-read-only-variant
    :label-overrides
    @init-edit="$emit('init-edit', 'namePreviousJurisdiction')"
    @undo="$emit('undo', 'namePreviousJurisdiction')"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  />
</template>
