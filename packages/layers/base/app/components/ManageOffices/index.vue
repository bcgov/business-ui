<script setup lang="ts">
import type { ManageOfficesProps } from '#business/app/interfaces'

const {
  stateKey = 'manage-offices',
  allowedActions,
  allowAddOfficeType,
  labelOverrides,
  modelName = 'activeOffice',
  variant = 'default',
  preventActions = false,
  actionPreventedSignal = 0
} = defineProps<ManageOfficesProps & { preventActions?: boolean, actionPreventedSignal?: number }>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeOffice = defineModel<ActiveOfficesSchema | undefined>('active-office')
const shouldPreventActions = computed(() => {
  return !!activeOffice.value || preventActions
})

const {
  addingOffice,
  expandedState,
  tableState,
  addNewOffice,
  removeOffice,
  undoOffice,
  applyTableEdits
} = useManageOffices(stateKey)

const { t } = useI18n()
const { setAlert, clearAlert, alerts, attachAlerts } = useFilingAlerts(stateKey)
const tableTarget = 'offices-table'
const { messageId, targetId } = attachAlerts(tableTarget, activeOffice)
const { setAlertText } = useConnectButtonControl()
const activeOfficeSchema = getActiveOfficesSchema()

watch(() => actionPreventedSignal, (value) => {
  if (value) {
    setActiveFormAlert()
  }
})

let editSubject = ''
let currentEditingRow: OfficesSchema | null = null

const tableLabels = computed(() => {
  if (labelOverrides) {
    return labelOverrides
  }
  if (variant === 'correct' || variant === 'correct-readonly') {
    return getCorrectionLabelOverrides()
  }
  return undefined
})

const officeAllowedActions = computed(() => {
  if (allowedActions) {
    return allowedActions
  }
  if (variant === 'readonly' || variant === 'correct-readonly') {
    return []
  }
  return undefined
})

const tableHasAddType = computed(() => {
  return allowAddOfficeType ? tableState.value.some(o => o.new.type === allowAddOfficeType) : false
})
const allowAddOffice = computed(() => {
  if (variant === 'readonly' || variant === 'correct-readonly') {
    return false
  }
  const hasAllowedActions = !allowedActions || allowedActions.includes(ManageAllowedAction.ADD)
  if (!allowAddOfficeType) {
    return hasAllowedActions
  }
  return !tableHasAddType.value && hasAllowedActions
})

function setActiveFormAlert() {
  if (activeOffice.value !== undefined) {
    setAlert('office-address-form', t('text.finishTaskBeforeOtherChanges'))
  }
}

function initAddOffice() {
  if (shouldPreventActions.value) {
    setActiveFormAlert()
    emit('action-prevented')
    return
  }
  activeOffice.value = activeOfficeSchema.parse({ type: allowAddOfficeType })
  addingOffice.value = true
}

function cleanupOfficeForm() {
  if (currentEditingRow) {
    currentEditingRow.isEditing = false
  }
  addingOffice.value = false
  expandedState.value = undefined
  activeOffice.value = undefined
}

function addOffice(office: ActiveOfficesSchema) {
  addNewOffice(office)
  cleanupOfficeForm()
}

function initEditOffice(row: TableBusinessRow<OfficesSchema>) {
  const parsedOffice = activeOfficeSchema.safeParse({ ...row.original.new })
  const office = parsedOffice.success
    ? parsedOffice.data
    : JSON.parse(JSON.stringify({ ...row.original.new }))

  activeOffice.value = office

  currentEditingRow = row.original.new
  currentEditingRow.isEditing = true

  editSubject = t(`officeType.${row.original.new.type}`)

  expandedState.value = { [row.index]: true }
}

function applyEdits(office: ActiveOfficesSchema, row: TableBusinessRow<OfficesSchema>) {
  applyTableEdits(office, row)
  cleanupOfficeForm()
}

function clearAllAlerts() {
  clearAlert('office-address-form') // clear alert in sub form
  setAlertText(undefined) // clear alert in button control
}

function getExpandedFormVariant(row: TableBusinessRow<OfficesSchema>): FormVariant {
  // old is always undefined for newly added offices
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
    data-testid="manage-offices"
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
        icon: 'i-mdi-domain',
        ui: 'bg-shade-secondary px-4 py-3 sm:px-6 rounded-t-md text-base',
        level: sectionTitle ? 'h3' : 'h2'
      }"
      :actions="allowAddOffice
        ? [
          {
            'label': $t('label.addSubject', { subject }),
            'variant': 'outline',
            'icon': 'i-mdi-plus',
            // @ts-expect-error - data-alert-focus-target not valid attr on type ButtonProps
            'data-alert-focus-target': targetId,
            'aria-describedby': messageId,
            'onClick': initAddOffice
          }
        ]
        : undefined
      "
    >
      <template #default>
        <FormOfficeDetails
          v-if="addingOffice && activeOffice"
          v-model="activeOffice"
          variant="add"
          :name="modelName"
          :subject="subject!"
          :state-key="stateKey"
          class="p-6"
          @done="() => addOffice(activeOffice)"
          @cancel="cleanupOfficeForm"
        />
        <USeparator />
        <TableOffices
          v-model:expanded="expandedState"
          :data="tableState"
          :loading
          :empty-text="emptyText"
          :allowed-actions="officeAllowedActions"
          :prevent-actions="shouldPreventActions"
          :label-overrides="tableLabels"
          :hide-actions-when="() => variant === 'readonly'"
          :task-guard-config="{
            messageId,
            targetId,
            message: alerts[tableTarget]
          }"
          @action-prevented="() => { setActiveFormAlert(); emit('action-prevented') }"
          @init-edit="initEditOffice"
          @remove="removeOffice"
          @undo="undoOffice"
        >
          <template #expanded="{ row }">
            <div class="px-4 sm:px-6">
              <FormOfficeDetails
                v-if="activeOffice"
                v-model="activeOffice"
                :variant="getExpandedFormVariant(row)"
                :name="modelName"
                :subject="editSubject"
                :state-key="stateKey"
                :hide-remove="variant === 'correct'"
                @done="() => applyEdits(activeOffice, row)"
                @cancel="cleanupOfficeForm"
                @remove="cleanupOfficeForm(); removeOffice(row)"
              />
            </div>
          </template>
        </TableOffices>
      </template>
    </ConnectPageSection>
  </component>
</template>
