<script setup lang="ts">
const {
  stateKey = 'manage-offices',
  allowedActions,
  allowAddOfficeType,
  readonly,
  labelOverrides
} = defineProps<{
  loading?: boolean
  emptyText?: string
  addLabel: string
  sectionLabel: string
  stateKey?: string
  allowedActions?: ManageAllowedAction[]
  labelOverrides?: TableLabelOverrides
  allowAddOfficeType?: OfficeType
  readonly?: boolean
}>()

const activeOffice = defineModel<ActiveOfficesSchema | undefined>('active-office', { required: true })

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
const { setAlert, clearAlert } = useFilingAlerts(stateKey)
const { setAlertText } = useConnectButtonControl()
const activeOfficeSchema = getActiveOfficesSchema()

let editLabel = ''
let currentEditingRow: OfficesSchema | null = null

const tableHasAddType = computed(() => {
  return allowAddOfficeType ? tableState.value.some(o => o.new.type === allowAddOfficeType) : false
})
const allowAddOffice = computed(() => {
  if (readonly) {
    return false
  }
  const hasAllowedActions = !allowedActions || allowedActions.includes(ManageAllowedAction.ADD)
  if (!allowAddOfficeType) {
    return hasAllowedActions
  }
  return !tableHasAddType.value && hasAllowedActions
})

function hideRowActionsWhen() {
  return !!readonly
}

function setActiveFormAlert() {
  setAlert('office-address-form', t('text.finishTaskBeforeOtherChanges'))
}

function initAddOffice() {
  if (activeOffice.value !== undefined) {
    setActiveFormAlert()
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
  editLabel = t('label.editingItemName', { name: t(`officeType.${row.original.new.type}`) })
  if (activeOfficeSchema.safeParse({ ...row.original.new })?.success) {
    activeOffice.value = activeOfficeSchema.parse({ ...row.original.new })
  } else {
    activeOffice.value = JSON.parse(JSON.stringify({ ...row.original.new }))
  }

  currentEditingRow = row.original.new
  currentEditingRow.isEditing = true

  expandedState.value = { [row.index]: true }
}

function applyEdits(office: ActiveOfficesSchema, row: TableBusinessRow<OfficesSchema>) {
  applyTableEdits(office, row)
  cleanupOfficeForm()
}

// OFFICE FORM HEADING AND TEXT COLOUR -- HIDE ROW BEING EDITED - THEN DO THE SAME TO SHARE STRUCTURE

function clearAllAlerts() {
  clearAlert('office-address-form') // clear alert in sub form
  setAlertText(undefined) // clear alert in button control
}
</script>

<template>
  <div
    class="space-y-4"
    @pointerdown="clearAllAlerts"
    @keydown="clearAllAlerts"
  >
    <UButton
      v-if="allowAddOffice"
      :label="addLabel"
      variant="outline"
      icon="i-mdi-plus"
      class="w-min"
      @click="initAddOffice"
    />

    <FormOfficeDetails
      v-if="addingOffice && activeOffice"
      v-model="activeOffice"
      variant="add"
      name="activeOffice"
      :title="addLabel"
      :state-key="stateKey"
      @done="() => addOffice(activeOffice)"
      @cancel="cleanupOfficeForm"
    />

    <ConnectPageSection
      :heading="{
        label: sectionLabel,
        icon: 'i-mdi-domain',
        ui: 'bg-shade-secondary px-4 py-4 sm:px-6 rounded-t-md'
      }"
    >
      <TableOffices
        v-model:expanded="expandedState"
        :data="tableState"
        :loading
        :empty-text="emptyText"
        :allowed-actions="allowedActions"
        :prevent-actions="!!activeOffice"
        :label-overrides="labelOverrides"
        :hide-actions-when="hideRowActionsWhen"
        @action-prevented="setActiveFormAlert"
        @init-edit="initEditOffice"
        @remove="removeOffice"
        @undo="undoOffice"
      >
        <template #expanded="{ row }">
          <div class="px-4 sm:px-6">
            <FormOfficeDetails
              v-if="activeOffice"
              v-model="activeOffice"
              variant="edit"
              name="activeOffice"
              :title="editLabel"
              :state-key="stateKey"
              @done="() => applyEdits(activeOffice, row)"
              @cancel="cleanupOfficeForm"
            />
          </div>
        </template>
      </TableOffices>
    </ConnectPageSection>
  </div>
</template>
