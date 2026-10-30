<script setup lang="ts">
import type { ManagePartiesProps } from '#business/app/interfaces'
import type { ExpandedState } from '@tanstack/vue-table'
import { isEqual, omit } from 'es-toolkit'

const {
  roleType,
  subject,
  tableTitle,
  stateKey = 'manage-parties',
  allowedActions,
  labelOverrides,
  variant = 'default',
  modelName = 'activeSubject',
  preventActions = false,
  actionPreventedSignal = 0,
  showFormerName = true,
  editOptions,
  primaryAction,
  partyFormProps
} = defineProps<ManagePartiesProps>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeSubject = defineModel<ActivePartySchema | undefined>('active-subject')

const expandedState = ref<ExpandedState | undefined>(undefined)
const addingSubject = ref(false)

let editSubjectLabel = ''
// what Reset restores: the party as it is on record (`old`), or as it was added, like the Vue 2 director
// change where Reset put the original name back; limited to the fields of the open edit option
let editSubjectBaseline: ActivePartySchema | undefined
// set when the edit was opened from an edit option (e.g. "Change Address"), limiting the form to those actions
const activeEditActions = ref<ManageAllowedAction[] | undefined>(undefined)

const tableTarget = 'parties-table'
const formTarget = 'party-details-form'

const { t } = useI18n()
const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { messageId, targetId } = attachAlerts(tableTarget, activeSubject)

const {
  tableState,
  addSubject,
  removeSubject,
  undoSubject,
  editSubject
} = useManageParties(stateKey, {
  cleanupFn: cleanupForm
})

const {
  isCorrectVariant,
  shouldPreventActions,
  tableAllowedActions,
  tableLabels,
  setActiveSubjectAlert,
  clearAllAlerts
} = useManageCommon({
  stateKey,
  variant,
  allowedActions,
  labelOverrides,
  preventActions: () => preventActions,
  actionPreventedSignal: () => actionPreventedSignal,
  activeSubjects: {
    subject: activeSubject,
    alertTarget: formTarget
  }
})

const activeSubjectSchema = getActivePartySchema(roleType)

type PartyTab = 'active' | 'ceased'

// ceased parties only apply to corrections - show them in their own tab when correcting a role type that can be ceased
const showCeasedTab = isCorrectVariant.value && hasCeasedTab(roleType)
const selectedTab = ref<PartyTab>('active')
const isCeasedTab = computed(() => selectedTab.value === 'ceased')

// classify by the original state so a party doesn't jump tabs while it's being changed
function isRowCeased(party: TableBusinessState<PartySchema>) {
  return !!roleType && isPartyCeased(party.old ?? party.new, roleType)
}

const displayedTableState = computed(() => showCeasedTab
  ? tableState.value.filter(party => isRowCeased(party) === isCeasedTab.value)
  : tableState.value
)

const partyAllowedActions = computed(() => {
  // a ceased party can only be corrected - it can't be removed or have its roles changed (which would un-cease it).
  // ADD is dropped too since the party form treats it as "allow any edit"
  if (isCeasedTab.value) {
    const notAllowedWhenCeased = [ManageAllowedAction.ADD, ManageAllowedAction.REMOVE, ManageAllowedAction.ROLE_CHANGE]
    return (tableAllowedActions.value ?? Object.values(ManageAllowedAction))
      .filter(a => !notAllowedWhenCeased.includes(a))
  }
  return tableAllowedActions.value
})

// an edit opened from an edit option only shows that part of the form
const partyFormAllowedActions = computed(() => activeEditActions.value ?? partyAllowedActions.value)

// the fields an edit option covers; undefined means the whole party
function getResetFields(actions?: ManageAllowedAction[]): (keyof PartySchema)[] | undefined {
  if (!actions) {
    return undefined
  }
  const fields: (keyof PartySchema)[] = []
  if (actions.includes(ManageAllowedAction.NAME_CHANGE)) {
    fields.push('name')
  }
  if (actions.includes(ManageAllowedAction.ADDRESS_CHANGE)) {
    fields.push('address')
  }
  if (actions.includes(ManageAllowedAction.EMAIL_CHANGE)) {
    fields.push('email')
  }
  if (actions.includes(ManageAllowedAction.ROLE_CHANGE)
    || actions.includes(ManageAllowedAction.EFFECTIVE_DATE_CHANGE)
    || actions.includes(ManageAllowedAction.CESSATION_DATE_CHANGE)) {
    fields.push('roles')
  }
  return fields
}

const canResetActiveSubject = computed(() => {
  const subject = activeSubject.value
  const baseline = editSubjectBaseline
  if (!subject || !baseline) {
    return false
  }
  const fields = getResetFields(activeEditActions.value)
  return fields
    ? fields.some(field => !isEqual(subject[field], baseline[field]))
    : !isEqual(subject, baseline)
})

const headerActions = computed(() => {
  const allowAddSubject = !tableAllowedActions.value || tableAllowedActions.value.includes(ManageAllowedAction.ADD)
  if (!allowAddSubject) {
    return undefined
  }

  return [
    {
      'label': tableLabels.value?.addLabel ?? t('label.addSubject', { subject }),
      'variant': 'outline' as const,
      'icon': 'i-mdi-plus',
      'data-alert-focus-target': targetId,
      'aria-describedby': messageId,
      'onClick': initAddSubject
    }
  ]
})

const tabs = computed<{ value: PartyTab, label?: string, icon?: string }[]>(() => [
  { value: 'active', label: tableTitle, icon: 'i-mdi-account-supervisor-circle-outline' },
  { value: 'ceased', label: t('label.ceasedSubject', { subject: tableTitle }) }
])

function selectTab(tab: PartyTab) {
  if (tab === selectedTab.value) {
    return
  }
  if (shouldPreventActions.value) {
    onActionPrevented()
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

function initAddSubject() {
  if (shouldPreventActions.value) {
    onActionPrevented()
    return
  }
  activeSubject.value = activeSubjectSchema.parse({})
  addingSubject.value = true
  selectedTab.value = 'active'
}

function cleanupForm() {
  expandedState.value = undefined
  addingSubject.value = false
  activeSubject.value = undefined
  activeEditActions.value = undefined
  editSubjectBaseline = undefined
}

function getPartyLabel(party: PartySchema): string {
  const nameProps = party.name
  if (!nameProps) {
    return ''
  }
  const name = nameProps.partyType === PartyType.PERSON
    ? [nameProps.firstName, nameProps.middleName, nameProps.lastName].filter(Boolean).join(' ')
    : nameProps.businessName || ''

  return name.toUpperCase()
}

// Drops the address ids from an edited party so the submitted payload is unchanged from before
// (the party schema has no address id, so parsing the row used to strip them).
// Unlike offices, the api doesn't need them: the filer finds an existing party by `entity.identifier`
// and updates its current delivery/mailing address in place, ignoring the address id (lear business-filer
// `update_relationship_addresses`). New parties always get new address records.
function omitAddressIds(address: PartySchema['address']): PartySchema['address'] {
  type AddressWithId = PartySchema['address']['deliveryAddress'] & { id?: string }
  return {
    ...address,
    deliveryAddress: omit(address.deliveryAddress as AddressWithId, ['id']),
    mailingAddress: omit(address.mailingAddress as AddressWithId, ['id'])
  }
}

function initEditSubject(row: TableBusinessRow<PartySchema>, actions?: ManageAllowedAction[]) {
  const subject = cloneDeep(row.original.new)
  activeSubject.value = { ...subject, address: omitAddressIds(subject.address) }
  // built from the row, not read back from the model: with a parent v-model the model only
  // reflects the new value once the parent has re-rendered
  const baseline = cloneDeep(row.original.old ?? row.original.new)
  editSubjectBaseline = { ...baseline, address: omitAddressIds(baseline.address) }
  activeEditActions.value = actions
  editSubjectLabel = getPartyLabel(row.original.new)
  expandedState.value = { [row.id]: true }
}

function resetActiveSubject() {
  const subject = activeSubject.value
  const baseline = editSubjectBaseline
  if (!subject || !baseline) {
    return
  }
  const fields = getResetFields(activeEditActions.value)
  if (!fields) {
    activeSubject.value = cloneDeep(baseline)
    return
  }
  const next = cloneDeep(subject)
  for (const field of fields) {
    Object.assign(next, { [field]: cloneDeep(baseline[field]) })
  }
  activeSubject.value = next
}

function onActionPrevented() {
  setActiveSubjectAlert()
  emit('action-prevented')
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
    <!-- the design can ask for the add button alone above the table instead of the heading bar -->
    <div
      v-if="hideTableHeading && !showCeasedTab && headerActions"
      class="flex"
      data-testid="manage-parties-header-actions"
    >
      <UButton
        v-for="(action, i) in headerActions"
        :key="i"
        v-bind="action"
      />
    </div>
    <ConnectPageSection
      :heading="hideTableHeading && !showCeasedTab
        ? undefined
        : {
          label: tableTitle,
          icon: 'i-mdi-account-supervisor',
          ui: showCeasedTab
            ? 'bg-shade-secondary pl-0 pr-4 pt-3 pb-0 sm:pl-0 sm:pr-6 rounded-t-md text-base'
            : 'bg-shade-secondary px-4 py-3 sm:px-6 rounded-t-md text-base',
          level: sectionTitle ? 'h3' : 'h2'
        }"
      :actions="hideTableHeading && !showCeasedTab ? undefined : headerActions"
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
        <component
          :is="sectionTitle ? 'h3' : 'h2'"
          v-if="hideTableHeading && !showCeasedTab"
          class="sr-only"
        >
          {{ tableTitle }}
        </component>
        <FormPartyDetails
          v-if="addingSubject && activeSubject"
          v-model="activeSubject"
          v-bind="partyFormProps"
          :subject="subject!"
          :name="modelName"
          variant="add"
          :state-key="stateKey"
          class="p-6"
          @done="() => addSubject(activeSubject)"
          @cancel="cleanupForm"
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
          :show-former-name="showFormerName"
          :edit-options="editOptions"
          :primary-action="primaryAction"
          :column-options="columnOptions"
          :task-guard-config="{
            messageId,
            targetId,
            message: alerts[tableTarget]
          }"
          @init-edit="initEditSubject"
          @remove="removeSubject"
          @undo="undoSubject"
          @action-prevented="onActionPrevented"
        >
          <template #expanded="{ row }">
            <!-- an inline edit keeps the party's name in the first column, like the row it replaces -->
            <div
              v-if="activeSubject"
              :class="partyFormProps?.inlineEdit
                ? 'flex flex-col gap-4 px-4 sm:px-6 sm:flex-row sm:gap-6'
                : 'px-4 sm:px-6'"
            >
              <span
                v-if="partyFormProps?.inlineEdit"
                class="min-w-36 shrink-0 text-sm font-bold text-neutral-highlighted break-words sm:pt-4"
                data-testid="inline-edit-subject"
              >
                {{ editSubjectLabel }}
              </span>
              <FormPartyDetails
                v-model="activeSubject"
                v-bind="partyFormProps"
                :allowed-actions="partyFormAllowedActions"
                :original-name="row.original.old?.name"
                :hide-remove="partyFormProps?.hideRemove || isCeasedTab"
                :show-reset="partyFormProps?.showReset"
                :reset-disabled="!canResetActiveSubject"
                :container="!partyFormProps?.inlineEdit"
                :name="modelName"
                :variant="getExpandedFormVariant(variant, row)"
                :subject="editSubjectLabel"
                :state-key="stateKey"
                class="grow min-w-0"
                @cancel="cleanupForm"
                @done="() => editSubject(activeSubject, row)"
                @remove="removeSubject(row)"
                @reset="resetActiveSubject"
              />
            </div>
          </template>
        </TableParty>
      </template>
    </ConnectPageSection>
  </component>
</template>
