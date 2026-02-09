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

const {
  addingShareClass,
  expandedState,
  tableState
  // addNewParty,
  // removeParty,
  // undoParty,
  // applyTableEdits
} = useManageShareStructure(stateKey)

const { t } = useI18n()
const { setAlert, clearAlert } = useFilingAlerts(stateKey)
const { setAlertText } = useConnectButtonControl()
const activeClassSchema = getActiveShareClassSchema()
const activeSeriesSchema = getActiveShareSeriesSchema()

function setActiveFormAlert() {
  setAlert('party-details-form', t('text.finishTaskBeforeOtherChanges'))
}

function initAddShareClass() {
  if (!!activeClass.value || !!activeSeries.value) {
    setActiveFormAlert()
    return
  }
  activeClass.value = activeClassSchema.parse({})
  addingShareClass.value = true
}

function cleanupForm() {
  addingShareClass.value = false
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
  const isSeries = row.depth === 1
  if (isSeries) {
    activeSeries.value = activeSeriesSchema.parse({ ...row.original.new })
  } else {
    activeClass.value = activeClassSchema.parse({ ...row.original.new })
  }
  // row.toggleExpanded(true)
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

function changePriority(row: TableBusinessRow<ShareClassSchema | ShareSeriesSchema>, direction: 'up' | 'down') {
  const isClass = row.depth === 0
  const list = isClass
    ? tableState.value
    : tableState.value.find(item => item.new.id === row.getParentRow()?.original.new.id)?.new.series

  if (!list || list.length < 2) {
    return
  }

  const getPriority = (item: TableBusinessState<ShareClassSchema> | ShareSeriesSchema) =>
    isClass ? (item as TableBusinessState<ShareClassSchema>).new.priority : (item as ShareSeriesSchema).priority
  const currentPriority = row.original.new.priority

  const siblings = list.filter(item =>
    direction === 'up'
      ? getPriority(item) < currentPriority
      : getPriority(item) > currentPriority
  )

  siblings.sort((a, b) => direction === 'up'
    ? getPriority(b) - getPriority(a)
    : getPriority(a) - getPriority(b)
  )

  const nearestRow = siblings[0]

  if (nearestRow) {
    const targetObj = isClass
      ? (nearestRow as TableBusinessState<ShareClassSchema>).new
      : (nearestRow as ShareSeriesSchema)
    const currentObj = row.original.new

    const tempPriority = currentObj.priority
    currentObj.priority = targetObj.priority
    targetObj.priority = tempPriority
  }
}

function clearAllAlerts() {
  clearAlert('party-details-form') // clear alert in sub form
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
      @click="initAddShareClass"
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
      @add-series="(e: TableBusinessRow<ShareClassSchema>) => console.log('add series: ', e)"
      @remove="(e: TableBusinessRow<ShareClassSchema | ShareSeriesSchema>) => console.log('remove row: ', e)"
      @undo="(e: TableBusinessRow<ShareClassSchema | ShareSeriesSchema>) => console.log('undo row: ', e)"
      @action-prevented="setActiveFormAlert"
    >
      <template #expanded="{ row }">
        <div v-if="isRowEditing(row.original.new.id, row.depth)" class="p-10 border border-black space-y-4">
          <div>Editing {{ row.original.new.name }}</div>
          <div>Class or series: {{ row.depth === 1 ? 'Series' : 'Class' }}</div>
          <UButton label="Cancel" @click="cleanupForm" />
        </div>
        <!-- <FormShareClass
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
