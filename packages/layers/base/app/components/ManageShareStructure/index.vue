<script setup lang="ts">
import type { ManageShareStructureProps } from '#business/app/interfaces'
import type { ExpandedState } from '@tanstack/vue-table'

const {
  stateKey = 'manage-share-structure',
  allowedActions,
  labelOverrides,
  variant = 'default',
  preventActions = false,
  actionPreventedSignal = 0
} = defineProps<ManageShareStructureProps & { preventActions?: boolean, actionPreventedSignal?: number }>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeClass = defineModel<ActiveShareClassSchema | undefined>('active-class')
const activeSeries = defineModel<ActiveShareSeriesSchema | undefined>('active-series')
const shouldPreventActions = computed(() => {
  return !!activeClass.value || !!activeSeries.value || preventActions
})
const addingShareClass = ref(false)
const addingSeriesToClassId = ref<string | undefined>(undefined)
let currentEditingRow: ShareClassSchema | ShareSeriesSchema | null = null
let editSubject = ''

const expandedResolutionDate = ref<ExpandedState | undefined>(undefined)
const resolutionDateSchema = getResolutionDateSchema()
const activeResolutionDate = defineModel<ResolutionDateSchema | undefined>('active-rd')

const {
  expandedState,
  shareClasses,
  resolutionDates,
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
  alerts,
  setAlert,
  clearAlert,
  attachAlerts
} = useFilingAlerts(stateKey)
const tableTarget = 'share-structure-table'
const { messageId, targetId } = attachAlerts(tableTarget, activeClass)
const { setAlertText } = useConnectButtonControl()
const { baseModal } = useModal()
const activeClassSchema = getActiveShareClassSchema()
const activeSeriesSchema = getActiveShareSeriesSchema()

watch(() => actionPreventedSignal, (value) => {
  if (value) {
    setActiveFormAlert()
  }
})

const showAddButton = computed(() => {
  if (variant === 'readonly' || variant === 'correct-readonly') {
    return false
  }
  return !allowedActions || allowedActions.includes(ManageAllowedAction.ADD)
})

const tableLabels = computed(() => {
  if (labelOverrides) {
    return labelOverrides
  }
  if (variant === 'correct' || variant === 'correct-readonly') {
    return getCorrectionLabelOverrides()
  }
  return undefined
})

const tableAllowedActions = computed(() => {
  if (allowedActions) {
    return allowedActions
  }
  if (variant === 'readonly' || variant === 'correct-readonly') {
    return []
  }
  return undefined
})

const classValidationContext = computed(() => {
  const currentId = activeClass.value?.id
  const existingNames = shareClasses.value
    .filter(item => item.new.id !== currentId)
    .map(item => item.new.name.toLowerCase())

  return { existingNames }
})

function setActiveFormAlert() {
  if (activeClass.value !== undefined) {
    setAlert('share-class-form', t('text.finishTaskBeforeOtherChanges'))
  }
  if (activeSeries.value !== undefined) {
    setAlert('share-series-form', t('text.finishTaskBeforeOtherChanges'))
  }
}

function initAddItem(addSeriesToRow?: TableBusinessRow<ShareClassSchema>) {
  // prevent actions if a sub form is open
  if (shouldPreventActions.value) {
    setActiveFormAlert()
    emit('action-prevented')
    return
  }

  // init add series
  if (addSeriesToRow) {
    if (addSeriesToRow.original.new.currency === 'OTHER') {
      baseModal.open({
        title: t('modal.unsupportedCurrencyType.title'),
        description: t('modal.unsupportedCurrencyType.description'),
        dismissible: true,
        buttons: [
          { label: t('label.close'), shouldClose: true }
        ]
      })
      return
    }
    const newSeries = activeSeriesSchema.parse({})
    if (newSeries) {
      newSeries.hasMaximumShares = true
      activeSeries.value = newSeries
      addingSeriesToClassId.value = addSeriesToRow.original.new.id
      editSubject = $t('label.shareSeries')
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
  if (currentEditingRow) {
    currentEditingRow.isEditing = false
  }

  addingShareClass.value = false
  addingSeriesToClassId.value = undefined
  activeClass.value = undefined
  activeSeries.value = undefined
}

function onInitEdit(row: TableBusinessRow<ShareClassSchema | ShareSeriesSchema>) {
  if (row.depth === 1) {
    const parsedSeries = activeSeriesSchema.safeParse({ ...row.original.new })
    activeSeries.value = parsedSeries.success
      ? parsedSeries.data
      : JSON.parse(JSON.stringify({ ...row.original.new }))
  } else {
    const parsedClass = activeClassSchema.safeParse({ ...row.original.new })
    activeClass.value = parsedClass.success
      ? parsedClass.data
      : JSON.parse(JSON.stringify({ ...row.original.new }))
  }
  currentEditingRow = row.original.new
  currentEditingRow.isEditing = true
  editSubject = `${row.original.new.name} ${t('label.shares')}`
  expandedState.value = { [row.id]: true, ...expandedState.value as object }
}

function hideRowActionsWhen(row: TableBusinessRow<ShareClassSchema>) {
  if (variant === 'readonly' || variant === 'correct-readonly') {
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

function getExpandedFormVariant(row: TableBusinessRow<ShareClassSchema>): FormVariant {
  if (addingSeriesToClassId.value === row.original.new.id) {
    return 'add'
  }

  if (variant === 'correct') {
    return 'correct'
  }

  if (row.original.old === undefined) {
    return 'edit'
  }

  return 'change'
}

const date = ref('')

function initEditResolutionDate(row: TableBusinessRow<ResolutionDateSchema>) {
  console.log('INIT EDIT: ', row.original.new)

  const parsedData = resolutionDateSchema.safeParse({ ...row.original.new })
  activeResolutionDate.value = parsedData.success
    ? parsedData.data
    : JSON.parse(JSON.stringify({ ...row.original.new }))

  activeResolutionDate.value!.isEditing = true
  expandedResolutionDate.value = { [row.id]: true, ...expandedResolutionDate.value as object }
}
function removeResolutionDate(row: TableBusinessRow<ResolutionDateSchema>) {
  console.log('REMOVE: ', row.original.new)
}
function undoResolutionDate(row: TableBusinessRow<ResolutionDateSchema>) {
  console.log('UNDO: ', row.original.new)
}
</script>

<template>
  <component
    :is="sectionTitle ? 'section' : 'div'"
    class="space-y-4 sm:space-y-6"
    data-testid="manage-share-structure"
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
        label: tableTitle || $t('label.shareStructure'),
        icon: 'i-mdi-sitemap',
        ui: 'bg-shade-secondary px-4 py-4 sm:px-6 rounded-t-md'
      }"
      :actions="showAddButton
        ? [
          {
            'label': $t('label.addSubject', { subject: $t('label.shareClass') }),
            'variant': 'outline',
            'icon': 'i-mdi-plus',
            // @ts-expect-error - data-alert-focus-target not valid attr on type ButtonProps
            'data-alert-focus-target': targetId,
            'aria-describedby': messageId,
            'onClick': () => initAddItem()
          }
        ]
        : undefined
      "
    >
      <template #default>
        <FormShareClass
          v-if="addingShareClass && activeClass"
          v-model="activeClass"
          :subject="$t('label.shareClass')"
          :state-key="stateKey"
          variant="add"
          name="activeClass"
          :validation-context="classValidationContext"
          nested
          class="p-6"
          @done="() => { addNewShareClass(activeClass), cleanupForm() }"
          @cancel="cleanupForm"
        />
        <TableShareStructure
          v-model:expanded="expandedState"
          :data="shareClasses"
          :loading
          :empty-text="emptyText"
          :allowed-actions="tableAllowedActions"
          :prevent-actions="shouldPreventActions"
          :label-overrides="tableLabels"
          :hide-actions-when="hideRowActionsWhen"
          :task-guard-config="{
            messageId,
            targetId,
            message: alerts[tableTarget]
          }"
          @init-edit="onInitEdit"
          @move-row="changePriority"
          @add-series="(row: TableBusinessRow<ShareClassSchema>) => initAddItem(row)"
          @remove="(row: TableBusinessRow<ShareClassSchema>) =>
            row.depth === 0 ? removeShareClass(row) : removeShareSeries(row)"
          @undo="(row: TableBusinessRow<ShareClassSchema>) =>
            row.depth === 0 ? undoShareClass(row) : undoShareSeries(row)
          "
          @action-prevented="() => { setActiveFormAlert(); emit('action-prevented') }"
        >
          <template #expanded="{ row }">
            <div v-if="row.depth === 0 && activeClass?.id === row.original.new.id" class="p-4 sm:p-6">
              <FormShareClass
                v-model="activeClass"
                :state-key="stateKey"
                :variant="getExpandedFormVariant(row)"
                :subject="editSubject"
                name="activeClass"
                :validation-context="classValidationContext"
                nested
                @done="() => updateShareClass(row, activeClass, cleanupForm)"
                @cancel="cleanupForm"
                @remove="() => removeShareClass(row, cleanupForm)"
              />
            </div>
            <div
              v-if="activeSeries && (
                (row.depth === 1 && activeSeries.id === row.original.new.id)
                || addingSeriesToClassId === row.original.new.id
              )"
              class="p-4 sm:p-6"
            >
              <FormShareSeries
                v-model="activeSeries"
                name="activeSeries"
                :subject="editSubject"
                :variant="getExpandedFormVariant(row)"
                :row
                :state-key="stateKey"
                nested
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
      </template>
    </ConnectPageSection>

    <div class="w-full rounded-md ring ring-default">
      <ConnectFieldset label="Resolutions or Court Orders Regarding Shares" padding-class="xy-default">
        <div class="space-y-4">
          <p>Enter the date of the resolution or court order that altered the company’s share structure.</p>
          <p>Help with Resolutions or Court Orders</p>
          <ConnectInputDate
            id="resolution-date"
            v-model="date"
            label="Resolution or Court Order Date"
          />
        </div>
      </ConnectFieldset>
      <USeparator class="padding-x-default" />
      <ConnectFieldset label="Previous Dates" padding-class="xy-default">
        <TableShareStructureResolutionDates
          v-model:expanded="expandedResolutionDate"
          :data="resolutionDates"
          @init-edit="initEditResolutionDate"
          @remove="removeResolutionDate"
          @undo="undoResolutionDate"
          @action-prevented="() => { setActiveFormAlert(); emit('action-prevented') }"
        >
          <template #expanded="{ row }">
            <SubFormFieldWrapper>
              <ConnectInputDate
                v-if="activeResolutionDate"
                id="resolution-date"
                v-model="activeResolutionDate.date"
                label="Resolution or Court Order Date"
              />
            </SubFormFieldWrapper>
          </template>
        </TableShareStructureResolutionDates>
      </ConnectFieldset>
    </div>
  </component>
</template>
