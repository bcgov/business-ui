<script setup lang="ts">
import type { ManagePartiesProps } from '#business/app/interfaces'

const {
  roleType,
  stateKey = 'manage-parties',
  allowedActions,
  labelOverrides,
  variant = 'default',
  modelName = 'activeParty'
} = defineProps<ManagePartiesProps>()

// {
//   tableTitle: string
//   subject: string
//   variant?: ManageVariant
//   loading?: boolean
//   emptyText?: string
//   sectionTitle?: string
//   sectionDescription?: string
//   roleType?: RoleTypeUi
//   stateKey?: string
//   modelName?: string
//   allowedActions?: ManageAllowedAction[]
//   labelOverrides?: TableLabelOverrides
//   columnsToDisplay?: TablePartyColumnName[]
//   partyFormProps?: {
//     hideRemove?: boolean
//     partyNameProps?: {
//       allowBusinessName?: boolean
//       allowPreferredName?: boolean
//     }
//     partyRoleProps?: {
//       allowedRoles: RoleTypeUi[]
//       roleClass?: RoleClass
//     }
//   }
// }

let editSubject = ''
let currentEditingRow: PartySchema | null = null

const activeParty = defineModel<ActivePartySchema | undefined>('active-party')

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
const { setAlert, clearAlert, alerts, attachAlerts } = useFilingAlerts(stateKey)
const tableTarget = 'parties-table'
const { messageId, targetId } = attachAlerts(tableTarget, activeParty)
const { setAlertText } = useConnectButtonControl()
const activePartySchema = getActivePartySchema(roleType)

const tableLabels = computed(() => {
  if (labelOverrides) {
    return labelOverrides
  }
  if (variant === 'correct' || variant === 'correct-readonly') {
    return getCorrectionLabelOverrides()
  }
  return undefined
})

const partyAllowedActions = computed(() => {
  if (allowedActions) {
    return allowedActions
  }
  if (variant === 'readonly' || variant === 'correct-readonly') {
    return []
  }
  return undefined
})

const showAddButton = computed(() => {
  return !partyAllowedActions.value || partyAllowedActions.value.includes(ManageAllowedAction.ADD)
})

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
  if (currentEditingRow) {
    currentEditingRow.isEditing = false
  }
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
  const parsedParty = activePartySchema.safeParse({ ...row.original.new })
  activeParty.value = parsedParty.success
    ? parsedParty.data
    : JSON.parse(JSON.stringify({ ...row.original.new }))

  currentEditingRow = row.original.new
  currentEditingRow.isEditing = true

  editSubject = ''
  const nameProps = row.original.new.name
  if (nameProps) {
    const name = nameProps.partyType === PartyType.PERSON
      ? `${nameProps.firstName} ${nameProps.middleName} ${nameProps.lastName}`.toUpperCase()
      : nameProps.businessName?.toUpperCase() || ''

    editSubject = name
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

function getExpandedFormVariant(row: TableBusinessRow<PartySchema>): FormVariant {
  // old is always undefined for newly added parties
  const isAdded = row.original.old === undefined
  if (isAdded) {
    return 'edit'
  }
  if (variant === 'correct') {
    return 'correct'
  }
  return 'change'
}
</script>

<template>
  <component
    :is="sectionTitle ? 'section' : 'div'"
    class="space-y-4 sm:space-y-6"
    data-testid="manage-parties"
    @pointerdown="clearAllAlerts"
    @keydown="clearAllAlerts"
  >
    <div v-if="sectionTitle">
      <h2 class="text-base">
        {{ sectionTitle }}
      </h2>
      <p v-if="sectionDescription">
        {{ sectionDescription }}
      </p>
    </div>
    <ConnectPageSection
      :heading="{
        label: tableTitle,
        icon: 'i-mdi-account-supervisor',
        ui: 'bg-shade-secondary px-4 py-3 sm:px-6 rounded-t-md text-base',
        level: sectionTitle ? 'h3' : 'h2'
      }"
      :actions="showAddButton
        ? [
          {
            'label': $t('label.addSubject', { subject }),
            'variant': 'outline',
            'icon': 'i-mdi-plus',
            // @ts-expect-error - data-alert-focus-target not valid attr on type ButtonProps
            'data-alert-focus-target': targetId,
            'aria-describedby': messageId,
            'onClick': initAddParty
          }
        ]
        : undefined
      "
    >
      <template #default>
        <FormPartyDetails
          v-if="addingParty && activeParty"
          v-model="activeParty"
          v-bind="partyFormProps"
          :subject="subject!"
          :name="modelName"
          variant="add"
          :state-key="stateKey"
          class="p-6"
          @done="() => addParty(activeParty)"
          @cancel="cleanupPartyForm"
        />
        <USeparator />
        <TableParty
          v-model:expanded="expandedState"
          :data="tableState"
          :loading
          :empty-text
          :allowed-actions="partyAllowedActions"
          :prevent-actions="!!activeParty"
          :label-overrides="tableLabels"
          :columns="columnsToDisplay"
          :task-guard-config="{
            messageId,
            targetId,
            message: alerts[tableTarget]
          }"
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
              :allowed-actions="allowedActions"
              :name="modelName"
              :variant="getExpandedFormVariant(row)"
              :subject="editSubject"
              :state-key="stateKey"
              class="px-4 sm:px-6"
              @cancel="cleanupPartyForm"
              @done="() => applyEdits(activeParty, row)"
              @remove="cleanupPartyForm(); removeParty(row)"
            />
          </template>
        </TableParty>
      </template>
    </ConnectPageSection>
  </component>
</template>
