<script setup lang="ts">
const {
  stateKey = 'manage-share-structure',
  allowedActions
} = defineProps<{
  loading?: boolean
  emptyText?: string
  addLabel: string
  // editLabel: string
  stateKey?: string
  allowedActions?: ManageAllowedAction[]
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

function getSeriesValidationContext(row: TableBusinessRow<ShareClassSchema>) {
  const shareClassData = row.depth === 0 ? row.original.new : row.getParentRow()?.original.new

  if (!shareClassData) {
    return { existingNames: [], maxAllowedShares: 0 }
  }

  const currentId = activeSeries.value?.id
  const otherSeries = shareClassData.series.filter(item => item.id !== currentId) || []

  const existingNames = otherSeries.map(item => item.name.toLowerCase())

  const classMaxShares = shareClassData.maxNumberOfShares || 0
  const otherSeriesTotalShares = otherSeries.reduce((a, c) => a + (c.maxNumberOfShares ?? 0), 0)
  const maxAllowedShares = classMaxShares - otherSeriesTotalShares

  return {
    existingNames,
    maxAllowedShares
  }
}

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
    activeSeries.value = activeSeriesSchema.parse({})
    addingSeriesToClassId.value = addSeriesToRow.original.new.id
    return
  }

  // if no row given, add a new class
  activeClass.value = activeClassSchema.parse({})
  addingShareClass.value = true
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

function isRowEditing(rowId: string, depth: number) {
  if (depth === 1) {
    return activeSeries.value?.id === rowId
  }
  return activeClass.value?.id === rowId
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
      The share structure must match exactly what is set out in the company’s current memorandum and articles.
    </p>
    <UButton
      v-if="!allowedActions || allowedActions.includes(ManageAllowedAction.ADD)"
      :label="addLabel"
      variant="outline"
      icon="i-mdi-account-plus-outline"
      class="w-min"
      @click="initAddItem()"
    />
    <FormShareClass
      v-if="addingShareClass && activeClass"
      v-model="activeClass"
      :title="'Add Share Class'"
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
      @init-edit="onInitEdit"
      @move-row="changePriority"
      @add-series="(e: TableBusinessRow<ShareClassSchema>) => initAddItem(e)"
      @remove="
        (row: TableBusinessRow<ShareClassSchema>) => row.depth === 0 ? removeShareClass(row) : removeShareSeries(row)
      "
      @undo="(row: TableBusinessRow<ShareClassSchema>) => row.depth === 0 ? undoShareClass(row) : undoShareSeries(row)"
      @action-prevented="setActiveFormAlert"
    >
      <template #expanded="{ row }">
        <div v-if="isRowEditing(row.original.new.id, row.depth) || addingSeriesToClassId === row.original.new.id">
          <FormShareClass
            v-if="row.depth === 0 && activeClass"
            v-model="activeClass"
            :title="'Edit Share Class'"
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
            :title="addingSeriesToClassId ? 'Add Share Series' : 'Edit Share Series'"
            :variant="addingSeriesToClassId ? 'add' : 'edit'"
            :validation-context="getSeriesValidationContext(row)"
            :state-key="stateKey"
            @done="() => {
              addingSeriesToClassId ? addNewShareSeries(row, activeSeries) : updateShareSeries(row, activeSeries)
              cleanupForm()
            }"
            @cancel="cleanupForm"
            @remove="() => { removeShareSeries(row), cleanupForm() }"
          />
        </div>
      </template>
    </TableShareStructure>
  </div>
</template>
