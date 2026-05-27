<script setup lang="ts">
const {
  stateKey = 'manage-name-translations',
  labelOverrides,
  variant = 'default',
  allowedActions,
  preventActions = false,
  actionPreventedSignal = 0
} = defineProps<{
  loading?: boolean
  emptyText?: string
  stateKey?: string
  variant?: ManageVariant
  allowedActions?: ManageAllowedAction[]
  labelOverrides?: TableLabelOverrides
  preventActions?: boolean
  actionPreventedSignal?: number
}>()

const emit = defineEmits<{
  'action-prevented': []
}>()

let editSubject = ''
let currentEditingRow: NameTranslationSchema | null = null

const shouldPreventActions = computed(() => {
  return !!activeNameTranslation.value || preventActions
})

watch(() => actionPreventedSignal, (value) => {
  if (value) {
    setActiveFormAlert()
  }
})

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

const showAddButton = computed(() => {
  if (variant === 'readonly') {
    return false
  }
  return !allowedActions || allowedActions.includes(ManageAllowedAction.ADD)
})

function setActiveFormAlert() {
  if (activeNameTranslation.value !== undefined) {
    setAlert('name-translation-form', $t('text.finishTaskBeforeOtherChanges'))
  }
}

function initAddNameTranslation() {
  if (shouldPreventActions.value) {
    setActiveFormAlert()
    emit('action-prevented')
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

  editSubject = row.original.new.name
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

function getExpandedFormVariant(row: TableBusinessRow<NameTranslationSchema>): FormVariant {
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
  <div
    class="space-y-4"
    data-testid="manage-name-translations"
    @pointerdown="clearAllAlerts"
    @keydown="clearAllAlerts"
  >
    <UButton
      v-if="showAddButton"
      :label="$t('label.addNameTranslation')"
      variant="outline"
      icon="i-mdi-plus"
      class="w-min"
      @click="initAddNameTranslation"
    />

    <FormNameTranslation
      v-if="addingNameTranslation && activeNameTranslation"
      v-model="activeNameTranslation"
      :subject="$t('label.nameTranslation')"
      name="activeNameTranslation"
      variant="add"
      :state-key="stateKey"
      @done="() => addNameTranslation(activeNameTranslation)"
      @cancel="cleanupNameTranslationForm"
    />

    <p v-if="tableState.length" class="font-bold text-neutral-highlighted">
      {{ $t('label.nameTranslation') }}
    </p>

    <TableNameTranslation
      v-if="tableState.length"
      v-model:expanded="expandedState"
      :data="tableState"
      :loading
      :empty-text="emptyText"
      :allowed-actions="allowedActions"
      :hide-actions-when="() => variant === 'readonly'"
      :prevent-actions="shouldPreventActions"
      :label-overrides="{ editLabel: $t('label.correct'), ...labelOverrides }"
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
            :subject="editSubject"
            name="activeNameTranslation"
            :variant="getExpandedFormVariant(row)"
            :state-key="stateKey"
            @cancel="cleanupNameTranslationForm"
            @done="() => applyEdits(activeNameTranslation, row)"
            @remove="() => { cleanupNameTranslationForm(); removeNameTranslation(row) }"
          />
        </div>
      </template>
    </TableNameTranslation>
  </div>
</template>
