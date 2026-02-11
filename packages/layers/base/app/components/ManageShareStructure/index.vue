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
  tableState
  // addNewParty,
  // removeParty,
  // undoParty,
  // applyTableEdits
} = useManageShareStructure(stateKey)

// const { t } = useI18n()
const {
  // setAlert,
  clearAlert
} = useFilingAlerts(stateKey)
const { setAlertText } = useConnectButtonControl()
const activeClassSchema = getActiveShareClassSchema()
const activeSeriesSchema = getActiveShareSeriesSchema()

function setActiveFormAlert() {
  console.info('action prevented, set sub form alert here')
  // setAlert('party-details-form', t('text.finishTaskBeforeOtherChanges'))
}

function initAddItem(addSeriesToRow?: TableBusinessRow<ShareClassSchema>) {
  // prevent actions if a sub form is open
  if (!!activeClass.value || !!activeSeries.value) {
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

// consolidate?
// function addClass(shareClass: ActiveShareClassSchema) {
//   // addNewParty(party, roleType)
//   cleanupForm()
// }
// function addSeries(series: ActiveShareSeriesSchema, row: TableBusinessRow<ShareClassSchema | ShareSeriesSchema>) {
//   // addNewParty(party, roleType)
//   cleanupForm()
// }

function onInitEdit(row: TableBusinessRow<ShareClassSchema | ShareSeriesSchema>) {
  if (row.depth === 1) {
    activeSeries.value = activeSeriesSchema.parse({ ...row.original.new })
  } else {
    activeClass.value = activeClassSchema.parse({ ...row.original.new })
  }
  expandedState.value = { [row.id]: true, ...expandedState.value as object }
}

// function applyEdits(party: ActivePartySchema, row: TableBusinessRow<PartySchema>) {
// applyTableEdits(party, row)
//   cleanupForm()
// }

function isRowEditing(rowId: string, depth: number) {
  if (depth === 1) {
    return activeSeries.value?.id === rowId
  }
  return activeClass.value?.id === rowId
}

function changePriority(row: TableBusinessRow<ShareClassSchema>, direction: 'up' | 'down') {
  const selectedRow = row.original.new
  const isClass = row.depth === 0
  const parentRowId = row.getParentRow()?.original.new.id

  const classOrSeriesList = isClass
    ? tableState.value
    : tableState.value.find(item => item.new.id === parentRowId)?.new.series

  if (!classOrSeriesList || classOrSeriesList.length < 2) {
    return
  }

  const flattenedList: Array<{ id: string, priority: number }> = isClass
    ? (classOrSeriesList as TableBusinessState<ShareClassSchema>[]).map(item => item.new)
    : (classOrSeriesList as ShareSeriesSchema[])

  // find the nearest item above or below the selectedRow
  const targetRow = flattenedList
    .filter(item => direction === 'up' ? item.priority < selectedRow.priority : item.priority > selectedRow.priority)
    .sort((a, b) => direction === 'up' ? b.priority - a.priority : a.priority - b.priority)[0]

  if (targetRow) {
    [selectedRow.priority, targetRow.priority] = [targetRow.priority, selectedRow.priority]
  }
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
    <!-- addingShareClass &&  -->
    <FormShareClass
      v-if="activeClass"
      v-model="activeClass"
      :title="'Add Share Class'"
      :state-key="stateKey"
      variant="add"
      name="activeClass"
      @done="() => console.log('done clicked')"
      @cancel="cleanupForm"
    />
    <div v-if="addingShareClass && activeClass" class="p-10 border border-black space-y-4">
      <div>Add share class form here</div>
      <pre>{{ activeClass }}</pre>
      <UButton label="Cancel" @click="cleanupForm" />
    </div>

    <!-- TODO: create share class form -->
    <!-- <FormShareClass
      v-if="addingShareClass && activeClass"
      v-model="activeClass"
      :title="addLabel"
      name="activeClass"
      variant="add"
      :state-key="stateKey"
      @done="() => addClass(activeClass)"
      @cancel="cleanupForm"
    /> -->

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
      @remove="(e: TableBusinessRow<ShareClassSchema | ShareSeriesSchema>) => console.log('remove row: ', e)"
      @undo="(e: TableBusinessRow<ShareClassSchema | ShareSeriesSchema>) => console.log('undo row: ', e)"
      @action-prevented="setActiveFormAlert"
    >
      <template #expanded="{ row }">
        <div
          v-if="isRowEditing(row.original.new.id, row.depth) || addingSeriesToClassId === row.original.new.id"
          class="p-10 border border-black space-y-4"
        >
          <div v-if="addingSeriesToClassId">
            <div>Adding New Series to {{ row.original.new.name }}</div>
            <pre>{{ activeSeries }}</pre>
          </div>
          <div v-else>
            <div>Editing {{ row.original.new.name }}</div>
            <div>Class or series: {{ row.depth === 1 ? 'Series' : 'Class' }}</div>
            <pre>{{ row.original.new }}</pre>
          </div>
          <UButton label="Cancel" @click="cleanupForm" />
        </div>
        <!-- <FormShareClass
        <FormShareSeries
      v-if="activeSeries"
      v-model="activeSeries"
      :title="editLabel"
      name="activeSeries"
      variant="edit"
      :state-key="stateKey"
      @done="() => addSeries(activeSeries)"
      @cancel="cleanupForm"
    /> -->
      </template>
    </TableShareStructure>
  </div>
</template>
