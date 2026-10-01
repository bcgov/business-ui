<script setup lang="ts">
import type { ManagePartiesProps } from '#business/app/interfaces'

const {
  roleType,
  subject,
  tableTitle,
  stateKey = 'manage-parties',
  allowedActions,
  labelOverrides,
  variant = 'default',
  modelName = 'activeParty',
  preventActions = false,
  actionPreventedSignal = 0
} = defineProps<ManagePartiesProps & { preventActions?: boolean, actionPreventedSignal?: number }>()

const emit = defineEmits<{
  'action-prevented': []
}>()

let editSubject = ''
let currentEditingRow: PartySchema | null = null

const activeParty = defineModel<ActivePartySchema | undefined>('active-party')
const shouldPreventActions = computed(() => {
  return !!activeParty.value || preventActions
})

type PartyTab = 'active' | 'ceased'

// ceased parties only apply to corrections - show them in their own tab when correcting a role type that can be ceased
const showCeasedTab = (variant === 'correct' || variant === 'correct-readonly') && hasCeasedTab(roleType)
const selectedTab = ref<PartyTab>('active')
const isCeasedTab = computed(() => selectedTab.value === 'ceased')

const {
  addingParty,
  expandedState,
  tableState,
  addNewParty,
  removeParty: removeTableParty,
  undoParty: undoTableParty,
  applyTableEdits
} = useManageParties(stateKey)

// classify by the original state so a party doesn't jump tabs while it's being changed
function isRowCeased(party: TableBusinessState<PartySchema>) {
  return !!roleType && isPartyCeased(party.old ?? party.new, roleType)
}

const displayedTableState = computed(() => showCeasedTab
  ? tableState.value.filter(party => isRowCeased(party) === isCeasedTab.value)
  : tableState.value
)

// the table only receives the parties for the selected tab, so map the row back to its index in the full table state
function toTableStateRow(row: TableBusinessRow<PartySchema>): TableBusinessRow<PartySchema> {
  if (!showCeasedTab) {
    return row
  }
  return { ...row, index: tableState.value.indexOf(row.original) } as TableBusinessRow<PartySchema>
}

const { t } = useI18n()
const { setAlert, clearAlert, alerts, attachAlerts } = useFilingAlerts(stateKey)
const tableTarget = 'parties-table'
const { messageId, targetId } = attachAlerts(tableTarget, activeParty)
const { setAlertText } = useConnectButtonControl()
const activePartySchema = getActivePartySchema(roleType)

watch(() => actionPreventedSignal, (value) => {
  if (value) {
    setActiveFormAlert()
  }
})

// existing parties are always corrected (not changed), regardless of variant
const tableLabels = computed(() => labelOverrides ?? getCorrectionLabelOverrides())

const partyAllowedActions = computed(() => {
  // a ceased party can only be corrected - it can't be removed or have its roles changed (which would un-cease it).
  // ADD is dropped too since the party form treats it as "allow any edit"
  if (isCeasedTab.value) {
    const notAllowedWhenCeased = [ManageAllowedAction.ADD, ManageAllowedAction.REMOVE, ManageAllowedAction.ROLE_CHANGE]
    return (allowedActions ?? Object.values(ManageAllowedAction)).filter(a => !notAllowedWhenCeased.includes(a))
  }
  if (allowedActions) {
    return allowedActions
  }
  if (variant === 'readonly' || variant === 'correct-readonly') {
    return []
  }
  return undefined
})

const showAddButton = computed(() => {
  if (variant === 'readonly' || variant === 'correct-readonly') {
    return false
  }
  return !allowedActions || allowedActions.includes(ManageAllowedAction.ADD)
})

const headerActions = computed(() => showAddButton.value
  ? [
    {
      'label': t('label.addSubject', { subject }),
      'variant': 'outline' as const,
      'data-alert-focus-target': targetId,
      'aria-describedby': messageId,
      'onClick': initAddParty
    }
  ]
  : undefined
)

const tabs = computed<{ value: PartyTab, label?: string, icon?: string }[]>(() => [
  { value: 'active', label: tableTitle, icon: 'i-mdi-account-supervisor-circle-outline' },
  { value: 'ceased', label: t('label.ceasedSubject', { subject: tableTitle }) }
])

function selectTab(tab: PartyTab) {
  if (tab === selectedTab.value) {
    return
  }
  if (shouldPreventActions.value) {
    setActiveFormAlert()
    emit('action-prevented')
    return
  }
  selectedTab.value = tab
}

function onTabKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    selectTab(isCeasedTab.value ? 'active' : 'ceased')
    document.getElementById(`${stateKey}-tab-${selectedTab.value}`)?.focus()
  }
}

function setActiveFormAlert() {
  if (activeParty.value !== undefined) {
    setAlert('party-details-form', t('text.finishTaskBeforeOtherChanges'))
  }
}

function initAddParty() {
  if (shouldPreventActions.value) {
    setActiveFormAlert()
    emit('action-prevented')
    return
  }
  activeParty.value = activePartySchema.parse({})
  addingParty.value = true
  selectedTab.value = 'active'
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
      ? [nameProps.firstName, nameProps.middleName, nameProps.lastName].filter(Boolean).join(' ')
      : nameProps.businessName || ''

    editSubject = name
  }
  expandedState.value = { [row.index]: true }
}

function applyEdits(party: ActivePartySchema, row: TableBusinessRow<PartySchema>) {
  applyTableEdits(party, toTableStateRow(row))
  cleanupPartyForm()
}

function removeParty(row: TableBusinessRow<PartySchema>) {
  removeTableParty(toTableStateRow(row))
}

function undoParty(row: TableBusinessRow<PartySchema>) {
  undoTableParty(toTableStateRow(row))
}

function clearAllAlerts() {
  clearAlert('party-details-form') // clear alert in sub form
  setAlertText(undefined) // clear alert in button control
}

function getExpandedFormVariant(row: TableBusinessRow<PartySchema>): FormVariant {
  // old is always undefined for newly added parties
  const isAdded = row.original.old === undefined
  return isAdded ? 'edit' : 'correct'
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
        ui: showCeasedTab
          ? 'bg-shade-secondary pl-0 pr-4 pt-3 pb-0 sm:pl-0 sm:pr-6 rounded-t-md text-base'
          : 'bg-shade-secondary px-4 py-3 sm:px-6 rounded-t-md text-base',
        level: sectionTitle ? 'h3' : 'h2'
      }"
      :actions="headerActions"
    >
      <template v-if="showCeasedTab" #header>
        <component :is="sectionTitle ? 'h3' : 'h2'" class="sr-only">
          {{ tableTitle }}
        </component>
        <div class="flex items-end justify-between gap-2.5">
          <div
            role="tablist"
            class="flex"
            data-testid="parties-tabs"
          >
            <button
              v-for="tab in tabs"
              :id="`${stateKey}-tab-${tab.value}`"
              :key="tab.value"
              type="button"
              role="tab"
              :aria-selected="selectedTab === tab.value"
              :aria-controls="`${stateKey}-tabpanel`"
              :tabindex="selectedTab === tab.value ? 0 : -1"
              :data-testid="`parties-tab-${tab.value}`"
              class="flex items-center gap-2.5 px-4 py-3 text-base font-semibold text-neutral-highlighted"
              :class="[
                // the first tab sits against the card edge, so keep its outer corner square
                'rounded-t-2xl first:rounded-tl-none',
                selectedTab === tab.value
                  ? 'bg-default border-b-3 border-primary'
                  : 'bg-default/50 hover:bg-default/75 border-b-3 border-transparent'
              ]"
              @click="selectTab(tab.value)"
              @keydown="onTabKeydown"
            >
              <UIcon
                v-if="tab.icon"
                :name="tab.icon"
                class="size-6 shrink-0 text-primary"
              />
              {{ tab.label }}
            </button>
          </div>
          <div class="flex items-center gap-2.5 pb-3">
            <UButton
              v-for="(action, i) in headerActions"
              :key="i"
              v-bind="action"
            />
          </div>
        </div>
      </template>
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
          :id="showCeasedTab ? `${stateKey}-tabpanel` : undefined"
          v-model:expanded="expandedState"
          :role="showCeasedTab ? 'tabpanel' : undefined"
          :aria-labelledby="showCeasedTab ? `${stateKey}-tab-${selectedTab}` : undefined"
          :data="displayedTableState"
          :loading
          :empty-text="isCeasedTab ? $t('label.noCeasedSubject', { subject: tableTitle }) : emptyText"
          :allowed-actions="partyAllowedActions"
          :prevent-actions="shouldPreventActions"
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
          @action-prevented="() => { setActiveFormAlert(); emit('action-prevented') }"
        >
          <template #expanded="{ row }">
            <FormPartyDetails
              v-if="activeParty"
              v-model="activeParty"
              v-bind="partyFormProps"
              :allowed-actions="partyAllowedActions"
              :hide-remove="partyFormProps?.hideRemove || isCeasedTab"
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
