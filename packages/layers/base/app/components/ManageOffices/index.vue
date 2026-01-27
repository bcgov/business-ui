<script setup lang="ts">
const {
  stateKey = 'manage-offices',
  allowedActions
} = defineProps<{
  loading?: boolean
  emptyText?: string
  addLabel: string
  editLabel: string
  stateKey?: string
  allowedActions?: ManageAllowedAction[]
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

function setActiveFormAlert() {
  setAlert('office-address-form', t('text.finishTaskBeforeOtherChanges'))
}

function initAddOffice() {
  if (activeOffice.value !== undefined) {
    setActiveFormAlert()
    return
  }
  activeOffice.value = activeOfficeSchema.parse({})
  addingOffice.value = true
}

function cleanupOfficeForm() {
  addingOffice.value = false
  expandedState.value = undefined
  activeOffice.value = undefined
}

function addOffice(office: ActiveOfficesSchema) {
  addNewOffice(office)
  cleanupOfficeForm()
}

function initEditOffice(row: TableBusinessRow<OfficesSchema>) {
  activeOffice.value = activeOfficeSchema.parse({ ...row.original.new })
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
</script>

<template>
  <div
    class="space-y-4"
    @pointerdown="clearAllAlerts"
    @keydown="clearAllAlerts"
  >
    <UButton
      v-if="!allowedActions || allowedActions.includes(ManageAllowedAction.ADD)"
      :label="addLabel"
      variant="outline"
      icon="i-mdi-account-plus-outline"
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

    <TableOffices
      v-model:expanded="expandedState"
      :data="tableState"
      :loading
      :empty-text="emptyText"
      :allowed-actions="allowedActions"
      :prevent-actions="!!activeOffice"
      @action-prevented="setActiveFormAlert"
      @init-edit="initEditOffice"
      @remove="removeOffice"
      @undo="undoOffice"
    >
      <template #expanded="{ row }">
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
      </template>
    </TableOffices>
  </div>
</template>
