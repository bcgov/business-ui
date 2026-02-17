<script setup lang="ts">
const {
  stateKey = 'manage-share-structure',
  allowedActions,
  readonly
} = defineProps<{
  loading?: boolean
  emptyText?: string
  addLabel: string
  // editLabel: string
  stateKey?: string
  allowedActions?: ManageAllowedAction[]
  readonly?: boolean
}>()

const activeClass = defineModel<ActiveShareClassSchema | undefined>('active-class', { required: true })
const activeSeries = defineModel<ActiveShareSeriesSchema | undefined>('active-series', { required: true })
const addingShareClass = ref(false)
const addingSeriesToClassId = ref<string | undefined>(undefined)

const {
  expandedState,
  tableState,
  addNewShareClass,
  removeShareClass,
  undoShareClass,
  updateShareClass,
  updateShareSeries,
  undoShareSeries,
  removeShareSeries,
  addNewShareSeries,
  changePriority
} = useManageShareStructure(stateKey)

const { t } = useI18n()
const {
  setAlert,
  clearAlert
} = useFilingAlerts(stateKey)
const { setAlertText } = useConnectButtonControl()
const activeClassSchema = getActiveShareClassSchema()
const activeSeriesSchema = getActiveShareSeriesSchema()

const classValidationContext = computed(() => {
  const currentId = activeClass.value?.id
  const existingNames = tableState.value
    .filter(item => item.new.id !== currentId)
    .map(item => item.new.name.toLowerCase())

  return { existingNames }
})

function setActiveFormAlert() {
  if (activeClass.value) {
    setAlert('share-class-form', t('text.finishTaskBeforeOtherChanges'))
  }
  if (activeSeries.value) {
    setAlert('share-series-form', t('text.finishTaskBeforeOtherChanges'))
  }
}

function initAddItem(addSeriesToRow?: TableBusinessRow<ShareClassSchema>) {
  // prevent actions if a sub form is open
  if (activeClass.value || activeSeries.value) {
    setActiveFormAlert()
    return
  }

  // init add series
  if (addSeriesToRow) {
    const newSeries = activeSeriesSchema.parse({})
    if (newSeries) {
      newSeries.hasMaximumShares = true
      activeSeries.value = newSeries
      addingSeriesToClassId.value = addSeriesToRow.original.new.id
      return
    }
  }

  // if no row given, add a new class
  const newClass = activeClassSchema.parse({})
  if (newClass) {
    newClass.hasMaximumShares = true
    newClass.hasParValue = true
    activeClass.value = newClass
    addingShareClass.value = true
  }
}

function cleanupForm() {
  addingShareClass.value = false
  addingSeriesToClassId.value = undefined
  activeClass.value = undefined
  activeSeries.value = undefined
}

function onInitEdit(row: TableBusinessRow<ShareClassSchema | ShareSeriesSchema>) {
  if (row.depth === 1) {
    activeSeries.value = activeSeriesSchema.parse({ ...row.original.new })
  } else {
    activeClass.value = activeClassSchema.parse({ ...row.original.new })
  }
  expandedState.value = { [row.id]: true, ...expandedState.value as object }
}

function hideRowActionsWhen(row: TableBusinessRow<ShareClassSchema>) {
  if (readonly) {
    return true
  }

  const parentRow = row.getParentRow()
  // never hide parent row actions
  if (!parentRow) {
    return false
  }

  // default hide series actions when parent is removed
  if (getIsRowRemoved(row.getParentRow())) {
    return true
  }

  // hide series actions when a marked invalid by a destructive class change
  return (row as unknown as TableBusinessRow<ShareSeriesSchema>).original.new.isInvalid
}

function clearAllAlerts() {
  clearAlert('share-class-form') // clear alert in sub forms
  clearAlert('share-series-form')
  setAlertText(undefined) // clear alert in button control
}
</script>

<template>
  <div
    class="space-y-4"
    @pointerdown="clearAllAlerts"
    @keydown="clearAllAlerts"
  >
    <p class="pb-4">
      {{ $t('text.shareStructureMustMatchCompanysCurrentState') }}
    </p>
    <UButton
      v-if="(!allowedActions || allowedActions.includes(ManageAllowedAction.ADD)) && !readonly"
      :label="addLabel"
      variant="outline"
      icon="i-mdi-account-plus-outline"
      class="w-min"
      @click="initAddItem()"
    />
    <FormShareClass
      v-if="addingShareClass && activeClass"
      v-model="activeClass"
      :title="$t('label.addShareClass')"
      :state-key="stateKey"
      variant="add"
      name="activeClass"
      :validation-context="classValidationContext"
      @done="() => { addNewShareClass(activeClass), cleanupForm() }"
      @cancel="cleanupForm"
    />

    <TableShareStructure
      v-model:expanded="expandedState"
      :data="tableState"
      :loading
      :empty-text="emptyText"
      :allowed-actions="allowedActions"
      :prevent-actions="!!activeClass || !!activeSeries"
      :hide-actions-when="hideRowActionsWhen"
      @init-edit="onInitEdit"
      @move-row="changePriority"
      @add-series="(row: TableBusinessRow<ShareClassSchema>) => initAddItem(row)"
      @remove="
        (row: TableBusinessRow<ShareClassSchema>) => row.depth === 0 ? removeShareClass(row) : removeShareSeries(row)
      "
      @undo="(row: TableBusinessRow<ShareClassSchema>) => row.depth === 0 ? undoShareClass(row) : undoShareSeries(row)"
      @action-prevented="setActiveFormAlert"
    >
      <template #expanded="{ row }">
        <FormShareClass
          v-if="row.depth === 0 && activeClass?.id === row.original.new.id"
          v-model="activeClass"
          :title="$t('label.editShareClass')"
          :state-key="stateKey"
          variant="edit"
          name="activeClass"
          :validation-context="classValidationContext"
          @done="() => updateShareClass(row, activeClass, cleanupForm)"
          @cancel="cleanupForm"
          @remove="() => removeShareClass(row, cleanupForm)"
        />
        <FormShareSeries
          v-if="activeSeries && (row.depth === 1 || addingSeriesToClassId === row.original.new.id)"
          v-model="activeSeries"
          name="activeSeries"
          :title="addingSeriesToClassId ? $t('label.addShareSeries') : $t('label.editShareSeries')"
          :variant="addingSeriesToClassId ? 'add' : 'edit'"
          :row
          :state-key="stateKey"
          @done="() => {
            addingSeriesToClassId ? addNewShareSeries(row, activeSeries) : updateShareSeries(row, activeSeries)
            cleanupForm()
          }"
          @cancel="cleanupForm"
          @remove="() => { removeShareSeries(row), cleanupForm() }"
        />
      </template>
    </TableShareStructure>
  </div>
</template>
