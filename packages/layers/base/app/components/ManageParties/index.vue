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
  columnsToDisplay?: TablePartyColumnName[]
  partyFormProps?: {
    partyNameProps?: {
      allowBusinessName?: boolean
      allowPreferredName?: boolean
    }
    partyRoleProps?: {
      allowedRoles: RoleTypeUi[]
      roleClass?: RoleClass
    }
  }
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
const { setAlertText } = useConnectButtonControl()
const activePartySchema = getActivePartySchema(roleType)

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
  addNewParty(party)
  cleanupPartyForm()
}

function initEditParty(row: TableBusinessRow<PartySchema>) {
  // FUTURE: handle the incomplete address parsing in connect layer
  if (activePartySchema.safeParse({ ...row.original.new })?.success) {
    activeParty.value = activePartySchema.parse({ ...row.original.new })
  } else {
    activeParty.value = JSON.parse(JSON.stringify({ ...row.original.new }))
  }
  expandedState.value = { [row.index]: true }
}

function applyEdits(party: ActivePartySchema, row: TableBusinessRow<PartySchema>) {
  applyTableEdits(party, row)
  cleanupPartyForm()
}

function clearAllAlerts() {
  clearAlert('party-details-form') // clear alert in sub form
  setAlertText(undefined) // clear alert in button control
}
</script>

<template>
  <div
    class="space-y-4"
    data-testid="manage-parties"
    @pointerdown="clearAllAlerts"
    @keydown="clearAllAlerts"
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
      v-bind="partyFormProps"
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
      :columns="columnsToDisplay"
      @init-edit="initEditParty"
      @remove="removeParty"
      @undo="undoParty"
      @action-prevented="setActiveFormAlert"
    >
      <template #expanded="{ row }">
        <FormPartyDetails
          v-if="activeParty"
          v-model="activeParty"
          v-bind="partyFormProps"
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
