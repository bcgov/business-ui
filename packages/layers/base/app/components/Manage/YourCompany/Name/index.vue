<script setup lang="ts">
// The legal company name in the new jurisdiction after an Amalgamation Out or Continuation Out filing
const {
  stateKey,
  fields,
  loading,
  preventActions,
  labelOverrides,
  isReadOnlyVariant,
  correctNameOptions,
  nrAllowedActionsTypes
} = defineProps<{
  stateKey: string
  fields: ManageYourCompanyFields
  loading?: boolean
  preventActions?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
  correctNameOptions?: CorrectNameOption[]
  nrAllowedActionsTypes?: NrRequestActionCode[]
  business?: BusinessData | BusinessDataPublic
}>()

const emit = defineEmits<{
  'action-prevented': []
  'done': []
  'init-edit': [key: keyof ManageYourCompanyFields | 'nameRequest']
  'undo': [key: keyof ManageYourCompanyFields]
  'cancel': []
}>()

const model = defineModel<ActiveYourCompanySchema>()

function onInitEdit(key: keyof ManageYourCompanyFields) {
  if (preventActions) {
    emit('action-prevented')
    return
  }
  emit('init-edit', key)
}

function onUndo(key: keyof ManageYourCompanyFields) {
  if (preventActions) {
    emit('action-prevented')
    return
  }
  emit('undo', key)
}
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
    @init-edit="onInitEdit('nameRequest')"
    @undo="onUndo('nameRequest')"
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
    @init-edit="onInitEdit('nameNewJurisdiction')"
    @undo="onUndo('nameNewJurisdiction')"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  />
</template>