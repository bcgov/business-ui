<script setup lang="ts">
import type { ManageShareStructureProps } from '#business/app/interfaces'
import type { ExpandedState } from '@tanstack/vue-table'
import type { ButtonProps } from '@nuxt/ui'

const props = withDefaults(
  defineProps<ManageShareStructureProps>(),
  {
    stateKey: 'manage-share-structure',
    variant: 'default',
    preventActions: false,
    actionPreventedSignal: 0,
    collectResolutionDate: true,
    modelName: 'activeSubject'
  }
)

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeSubject = defineModel<ActiveShareStructureSchema>('active-subject')
const resolutionDate = defineModel<ResolutionDateSchema | null>('rd')

const addingShareClass = ref(false)
const addingSeriesToClassId = ref<string | undefined>(undefined)

let currentEditingRow: ShareClassSchema | ShareSeriesSchema | ResolutionDateSchema | null = null
let editSubjectLabel = ''

const expandedResolutionDate = ref<ExpandedState | undefined>(undefined)
const expandedState = ref<ExpandedState | undefined>(undefined)

const { t } = useI18n()
const { baseModal } = useModal()
const classSchema = getShareClassSchema()
const seriesSchema = getShareSeriesSchema()
const dateSchema = getResolutionDateSchema()

const {
  shareClasses,
  resolutionDates,
  hasChangedShares,
  hasRightsOrRestrictions,
  existingResolutionDates,
  hasExistingResolutionDates,
  addSubject,
  editSubject,
  removeSubject,
  undoSubject,
  changePriority,
  isClassData,
  isSeriesData,
  isDateData
} = useManageShareStructure(props.stateKey, {
  cleanupFn: cleanupForm,
  resolutionDate
})

const {
  isReadOnlyVariant,
  isCorrectVariant,
  shouldPreventActions,
  tableAllowedActions,
  tableLabels,
  setActiveSubjectAlert,
  clearAllAlerts
} = useManageCommon({
  stateKey: props.stateKey,
  variant: () => props.variant,
  allowedActions: () => props.allowedActions,
  labelOverrides: () => props.labelOverrides,
  preventActions: () => props.preventActions,
  actionPreventedSignal: () => props.actionPreventedSignal,
  activeSubjects: {
    subject: activeSubject,
    alertTarget: ['share-class-form', 'share-series-form', 'resolution-date-form']
  }
})

const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const sharesAlertGroup = 'share-structure-table'
const { messageId: sharesAlertMessageId, targetId: sharesAlertTargetId } = attachAlerts(sharesAlertGroup, activeSubject)
const datesAlertGroup = 'resolution-date-table'
const { messageId: datesAlertMessageId, targetId: datesAlertTargetId } = attachAlerts(datesAlertGroup, activeSubject)

const addClassButton = computed<ButtonProps[] | undefined>(() => {
  if (!isReadOnlyVariant.value
    && (!props.allowedActions || props.allowedActions.includes(ManageAllowedAction.ADD))
  ) {
    return [{
      'label': t('label.addSubject', { subject: t('label.shareClass') }),
      'variant': 'outline',
      'icon': 'i-mdi-plus',
      'data-alert-focus-target': sharesAlertTargetId,
      'aria-describedby': sharesAlertMessageId,
      'onClick': () => initAddSubject()
    }]
  }
  return undefined
})

// share class names must be unique
const classValidationContext = computed(() => {
  if (activeSubject.value?.key !== 'shareClass') {
    return undefined
  }

  const activeId = activeSubject.value.value.id
  const existingNames = shareClasses.value
    .filter(item => item.new.id !== activeId)
    .map(item => item.new.name.toLowerCase().trim())

  return { existingNames }
})

// a resolution date is only mandatory when this session's edits changed rights/restrictions —
// never mandatory in corrections, where staff may add one at their discretion
const resolutionDateRequired = computed(() => !isCorrectVariant.value
  && hasChangedShares.value
  && hasRightsOrRestrictions.value
  && !isReadOnlyVariant.value
  && props.collectResolutionDate
)

// Show section if in corrections, if edits require it, if history exists,
// OR if a draft date was pre-populated on load
const showResolutionDateSection = computed(() =>
  isCorrectVariant.value
  || resolutionDateRequired.value
  || hasExistingResolutionDates.value
  || !!resolutionDate.value?.date?.trim()
)

watch(showResolutionDateSection, (v) => {
  if (v) {
    if (!resolutionDate.value?.id) {
      resolutionDate.value = dateSchema.parse({})
    }
  } else {
    resolutionDate.value = undefined
  }
}, { immediate: true })

// when editing dates, date must not match an existing date
const changeResolutionDateValidationContext = computed(() => ({
  isEditingExisting: true,
  existingResolutions: existingResolutionDates.value
}))

// when adding a date, must not match existing dates and may be required per the share structure changes
const addResolutionDateValidationContext = computed(() => ({
  hasRightsOrRestrictions: resolutionDateRequired.value,
  existingResolutions: existingResolutionDates.value
}))

const displayedResolutionDates = computed(() => {
  // In readonly, return all resolution dates
  if (isReadOnlyVariant.value) {
    return resolutionDates.value
  }

  // in edit mode, filter out the standalone resolution date
  return resolutionDates.value.filter(rd => rd.new.id !== resolutionDate.value?.id)
})

/** handles opening a conditionally shown 'Add' share class or series form */
function initAddSubject(addSeriesToRow?: TableBusinessRow<ShareClassSchema>) {
  // prevent actions if a sub form is open
  if (shouldPreventActions.value) {
    onActionPrevented()
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
    const newSeries = seriesSchema.parse({})
    if (newSeries) {
      newSeries.hasMaximumShares = true
      activeSubject.value = {
        key: 'shareSeries',
        value: newSeries
      }
      addingSeriesToClassId.value = addSeriesToRow.original.new.id
      editSubjectLabel = t('label.shareSeries')
      return
    }
  }

  // if no row given, add a new class
  const newClass = classSchema.parse({})
  if (newClass) {
    newClass.hasMaximumShares = true
    newClass.hasParValue = true
    activeSubject.value = {
      key: 'shareClass',
      value: newClass
    }
    addingShareClass.value = true
  }
}

/** handles opening a conditionally shown 'Edit/Change/Correct' share class/series or resolution date form */
function initEditSubject(
  row: TableBusinessRow<ShareClassSchema | ShareSeriesSchema | ResolutionDateSchema>
): void {
  if (shouldPreventActions.value) {
    onActionPrevented()
    return
  }

  const rowData = cloneDeep(row.original.new)
  rowData.isEditing = true

  if (isDateData(rowData)) {
    activeSubject.value = {
      key: 'resolutionDate',
      value: rowData
    }
    expandedResolutionDate.value = { [row.id]: true }
  } else if (isClassData(rowData)) {
    activeSubject.value = {
      key: 'shareClass',
      value: rowData
    }
    editSubjectLabel = `${rowData.name} ${t('label.shares')}`
    expandedState.value = { [row.id]: true, ...expandedState.value as object }
  } else if (isSeriesData(rowData)) {
    activeSubject.value = {
      key: 'shareSeries',
      value: rowData
    }
    editSubjectLabel = `${rowData.name} ${t('label.shares')}`
    expandedState.value = { [row.id]: true, ...expandedState.value as object }
  }

  currentEditingRow = row.original.new
  currentEditingRow.isEditing = true
}

/** handles hiding series row actions */
function hideRowActionsWhen<T extends ShareClassSchema | ShareSeriesSchema>(
  row: TableBusinessRow<T>
) {
  if (isReadOnlyVariant.value) {
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
  const rowData = row.original.new
  return isSeriesData(rowData) ? rowData.isInvalid : false
}

function getSeriesExpandedFormVariant(row: TableBusinessRow<ShareClassSchema>): FormVariant {
  if (addingSeriesToClassId.value === row.original.new.id) {
    return 'add'
  }
  return getExpandedFormVariant(props.variant, row)
}

function cleanupForm() {
  if (currentEditingRow) {
    currentEditingRow.isEditing = false
    currentEditingRow = null
  }

  addingShareClass.value = false
  addingSeriesToClassId.value = undefined
  activeSubject.value = undefined
  expandedResolutionDate.value = undefined
}

function onActionPrevented() {
  setActiveSubjectAlert()
  emit('action-prevented')
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
      :actions="addClassButton"
    >
      <template #default>
        <FormShareClass
          v-if="addingShareClass && activeSubject?.key === 'shareClass'"
          v-model="activeSubject.value"
          :subject="$t('label.shareClass')"
          :state-key
          variant="add"
          :name="modelName"
          :validation-context="classValidationContext"
          nested
          class="p-6"
          @done="() => addSubject(activeSubject)"
          @cancel="cleanupForm"
        />
        <TableShareStructure
          v-model:expanded="expandedState"
          :data="shareClasses"
          :loading
          :empty-text
          :allowed-actions="tableAllowedActions"
          :prevent-actions="shouldPreventActions"
          :label-overrides="tableLabels"
          :hide-actions-when="hideRowActionsWhen"
          :task-guard-config="{
            messageId: sharesAlertMessageId,
            targetId: sharesAlertTargetId,
            message: alerts[sharesAlertGroup]
          }"
          @init-edit="initEditSubject"
          @move-row="changePriority"
          @add-series="initAddSubject"
          @remove="removeSubject"
          @undo="undoSubject"
          @action-prevented="onActionPrevented"
        >
          <template #expanded="{ row }">
            <div
              v-if="row.depth === 0
                && activeSubject?.key === 'shareClass'
                && activeSubject.value.id === row.original.new.id
              "
              class="p-4 sm:p-6"
            >
              <FormShareClass
                v-model="activeSubject.value"
                :state-key
                :variant="getExpandedFormVariant(variant, row)"
                :subject="editSubjectLabel"
                :name="modelName"
                :validation-context="classValidationContext"
                nested
                @done="() => editSubject(activeSubject, row)"
                @cancel="cleanupForm"
                @remove="() => removeSubject(row)"
              />
            </div>
            <div
              v-if="activeSubject?.key === 'shareSeries'
                && (
                  (row.depth === 1 && activeSubject.value?.id === row.original.new.id)
                  || addingSeriesToClassId === row.original.new.id
                )
              "
              class="p-4 sm:p-6"
            >
              <FormShareSeries
                v-model="activeSubject.value"
                :name="modelName"
                :subject="editSubjectLabel"
                :variant="getSeriesExpandedFormVariant(row)"
                :row
                :state-key
                nested
                @done="() => {
                  addingSeriesToClassId
                    ? addSubject(activeSubject, addingSeriesToClassId)
                    : editSubject(activeSubject, row, row.getParentRow()?.original.new.id)
                }"
                @cancel="cleanupForm"
                @remove="() => removeSubject(row)"
              />
            </div>
          </template>
        </TableShareStructure>
      </template>
    </ConnectPageSection>

    <div
      v-if="showResolutionDateSection"
      class="w-full rounded-md ring ring-default bg-white"
    >
      <template v-if="resolutionDate && !isReadOnlyVariant">
        <ConnectFieldset
          :label="$t('label.resolutionsOrCourtOrdersRegardingShares')"
          padding-class="xy-default"
        >
          <div class="space-y-4">
            <p>{{ $t('text.enterDateResolutionChangedShares') }}</p>
            <HelpExpansion
              :label="$t('label.helpWithResolutionsOrCourtOrders')"
              :close-label="$t('label.hideHelpWithResolutionsOrCourtOrders')"
              t-key="text.resolutionDateHelp"
            />
            <FormShareResolutionDate
              :key="resolutionDate.id"
              v-model="resolutionDate"
              variant="add"
              standalone
              name="resolutionDate"
              :validation-context="addResolutionDateValidationContext"
            />
          </div>
        </ConnectFieldset>
        <USeparator v-if="displayedResolutionDates.length > 0" class="padding-x-default" />
      </template>
      <ConnectFieldset
        v-if="displayedResolutionDates.length > 0"
        :label="isReadOnlyVariant
          ? $t('label.previousResolutionOrCourtOrderDatesRegardingShares')
          : $t('label.previousDates')
        "
        padding-class="xy-default"
      >
        <div class="-my-4">
          <TableShareStructureResolutionDates
            v-model:expanded="expandedResolutionDate"
            :data="displayedResolutionDates"
            :label-overrides="tableLabels"
            :allowed-actions="tableAllowedActions"
            :prevent-actions="shouldPreventActions"
            :hide-actions-when="() => isReadOnlyVariant"
            :task-guard-config="{
              messageId: datesAlertMessageId,
              targetId: datesAlertTargetId,
              message: alerts[datesAlertGroup]
            }"
            @init-edit="initEditSubject"
            @remove="removeSubject"
            @undo="undoSubject"
            @action-prevented="onActionPrevented"
          >
            <template #expanded="{ row }">
              <FormShareResolutionDate
                v-if="activeSubject?.key === 'resolutionDate'"
                v-model="activeSubject.value"
                :state-key
                :name="modelName"
                :validation-context="changeResolutionDateValidationContext"
                :variant="getExpandedFormVariant(variant, row)"
                @done="() => editSubject(activeSubject, row)"
                @cancel="cleanupForm"
              />
            </template>
          </TableShareStructureResolutionDates>
        </div>
      </ConnectFieldset>
    </div>
  </component>
</template>
