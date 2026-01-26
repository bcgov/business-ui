<script setup lang="ts">
const {
  roleType,
  stateKey = 'manage-parties',
  allowedActions
} = defineProps<{
  loading?: boolean
  emptyText?: string
  addLabel: string
  editLabel: string
  roleType?: RoleTypeUi
  stateKey?: string
  allowedActions?: ManageAllowedAction[]
}>()

const activeParty = defineModel<ActivePartySchema | undefined>('active-party', { required: true })

const {
  addingParty,
  expandedState,
  tableState,
  addNewParty,
  removeParty,
  undoParty,
  applyTableEdits
} = useManageParties(stateKey)

const { t } = useI18n()
const { setAlert, clearAlert } = useFilingAlerts(stateKey)
const activePartySchema = getActivePartySchema()

function setActiveFormAlert() {
  setAlert('party-details-form', t('text.finishTaskBeforeOtherChanges'))
}

function initAddParty() {
  if (activeParty.value !== undefined) {
    setActiveFormAlert()
    return
  }
  activeParty.value = activePartySchema.parse({})
  addingParty.value = true
}

function cleanupPartyForm() {
  addingParty.value = false
  expandedState.value = undefined
  activeParty.value = undefined
}

function addParty(party: ActivePartySchema) {
  addNewParty(party, roleType)
  cleanupPartyForm()
}

function initEditParty(row: TableBusinessRow<PartySchema>) {
  activeParty.value = activePartySchema.parse({ ...row.original.new })
  expandedState.value = { [row.index]: true }
}

function applyEdits(party: ActivePartySchema, row: TableBusinessRow<PartySchema>) {
  applyTableEdits(party, row)
  cleanupPartyForm()
}
</script>

<template>
  <div
    class="space-y-4"
    @pointerdown="clearAlert('party-details-form')"
    @keydown="clearAlert('party-details-form')"
  >
    <UButton
      v-if="!allowedActions || allowedActions.includes(ManageAllowedAction.ADD)"
      :label="addLabel"
      variant="outline"
      icon="i-mdi-account-plus-outline"
      class="w-min"
      @click="initAddParty"
    />

    <FormPartyDetails
      v-if="addingParty && activeParty"
      v-model="activeParty"
      :title="addLabel"
      name="activeParty"
      variant="add"
      :state-key="stateKey"
      @done="() => addParty(activeParty)"
      @cancel="cleanupPartyForm"
    />

    <TableParty
      v-model:expanded="expandedState"
      :data="tableState"
      :loading
      :empty-text="emptyText"
      :allowed-actions="allowedActions"
      :prevent-actions="!!activeParty"
      @init-edit="initEditParty"
      @remove="removeParty"
      @undo="undoParty"
      @action-prevented="setActiveFormAlert"
    >
      <template #expanded="{ row }">
        <FormPartyDetails
          v-if="activeParty"
          v-model="activeParty"
          :title="editLabel"
          :allowed-actions="allowedActions"
          name="activeParty"
          variant="edit"
          :state-key="stateKey"
          @cancel="cleanupPartyForm"
          @done="() => applyEdits(activeParty, row)"
        />
      </template>
    </TableParty>
  </div>
</template>
