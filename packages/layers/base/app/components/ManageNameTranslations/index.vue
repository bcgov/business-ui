<script setup lang="ts">
const {
  stateKey = 'manage-name-translations'
} = defineProps<{
  loading?: boolean
  emptyText?: string
  addLabel: string
  stateKey?: string
  allowedActions?: ManageAllowedAction[]
  labelOverrides?: TableLabelOverrides
}>()

let editLabel = ''
let currentEditingRow: NameTranslationSchema | null = null

const activeNameTranslation = defineModel<ActiveNameTranslationSchema | undefined>
('active-name-translation', { required: true })

const {
  addingNameTranslation,
  expandedState,
  tableState,
  addNewNameTranslation,
  removeNameTranslation,
  undoNameTranslation,
  applyTableEdits
} = useManageNameTranslations(stateKey)

const { setAlert, clearAlert } = useFilingAlerts(stateKey)
const { setAlertText } = useConnectButtonControl()
const activeNameTranslationSchema = getActiveNameTranslationSchema()

function setActiveFormAlert() {
  setAlert('name-translation-form', $t('text.finishTaskBeforeOtherChanges'))
}

function initAddNameTranslation() {
  if (activeNameTranslation.value !== undefined) {
    setActiveFormAlert()
    return
  }
  activeNameTranslation.value = activeNameTranslationSchema.parse({})
  addingNameTranslation.value = true
}

function cleanupNameTranslationForm() {
  if (currentEditingRow) {
    currentEditingRow.isEditing = false
  }
  addingNameTranslation.value = false
  expandedState.value = undefined
  activeNameTranslation.value = undefined
}

function addNameTranslation(nameTranslation: ActiveNameTranslationSchema) {
  addNewNameTranslation(nameTranslation)
  cleanupNameTranslationForm()
}

function initEditNameTranslation(row: TableBusinessRow<NameTranslationSchema>) {
  const parsed = activeNameTranslationSchema.safeParse({ ...row.original.new })
  activeNameTranslation.value = parsed.success
    ? parsed.data
    : JSON.parse(JSON.stringify({ ...row.original.new }))

  currentEditingRow = row.original.new
  currentEditingRow.isEditing = true

  editLabel = $t('label.editingItemName', { name: row.original.new.name.toUpperCase() })
  expandedState.value = { [row.index]: true }
}

function applyEdits(nameTranslation: ActiveNameTranslationSchema, row: TableBusinessRow<NameTranslationSchema>) {
  applyTableEdits(nameTranslation, row)
  cleanupNameTranslationForm()
}

function clearAllAlerts() {
  clearAlert('name-translation-form')
  setAlertText(undefined)
}
</script>

<template>
  <div
    class="space-y-4"
    data-testid="manage-name-translations"
    @pointerdown="clearAllAlerts"
    @keydown="clearAllAlerts"
  >
    <UButton
      v-if="!allowedActions || allowedActions.includes(ManageAllowedAction.ADD)"
      :label="addLabel"
      variant="outline"
      icon="i-mdi-plus"
      class="w-min"
      @click="initAddNameTranslation"
    />

    <FormNameTranslation
      v-if="addingNameTranslation && activeNameTranslation"
      v-model="activeNameTranslation"
      :title="addLabel"
      name="activeNameTranslation"
      variant="add"
      :state-key="stateKey"
      @done="() => addNameTranslation(activeNameTranslation)"
      @cancel="cleanupNameTranslationForm"
    />

    <ConnectPageSection
      :heading="{
        label: $t('label.nameTranslations'),
        icon: 'i-mdi-domain',
        ui: 'bg-shade-secondary px-4 py-4 sm:px-6 rounded-t-md'
      }"
    >
      <TableNameTranslation
        v-model:expanded="expandedState"
        :data="tableState"
        :loading
        :empty-text="emptyText"
        :allowed-actions="allowedActions"
        :prevent-actions="!!activeNameTranslation"
        :label-overrides="labelOverrides"
        @init-edit="initEditNameTranslation"
        @remove="removeNameTranslation"
        @undo="undoNameTranslation"
        @action-prevented="setActiveFormAlert"
      >
        <template #expanded="{ row }">
          <div class="px-4 sm:px-6">
            <FormNameTranslation
              v-if="activeNameTranslation"
              v-model="activeNameTranslation"
              :title="editLabel"
              name="activeNameTranslation"
              variant="edit"
              :state-key="stateKey"
              @cancel="cleanupNameTranslationForm"
              @done="() => applyEdits(activeNameTranslation, row)"
            />
          </div>
        </template>
      </TableNameTranslation>
    </ConnectPageSection>
  </div>
</template>
