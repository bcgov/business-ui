<script setup lang="ts">
import type { ManageCourtOrdersProps } from '#business/app/interfaces'
import type { ExpandedState } from '@tanstack/vue-table'

const {
  stateKey = 'manage-court-orders',
  allowedActions,
  labelOverrides,
  modelName = 'activeCourtOrder',
  variant = 'default',
  preventActions = false,
  actionPreventedSignal = 0,
  addDefaultValues
} = defineProps<ManageCourtOrdersProps & { preventActions?: boolean, actionPreventedSignal?: number }>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeCourtOrder = defineModel<ActiveCourtOrderPoaFullSchema | undefined>('active-co')

const expandedState = ref<ExpandedState | undefined>(undefined)
const addingCourtOrder = ref(false)

let editSubjectLabel = ''
let currentEditingRow: CourtOrderPoaFullSchema | null = null

const { t } = useI18n()
const { setAlertText } = useConnectButtonControl()
const { setAlert, clearAlert, alerts, attachAlerts } = useFilingAlerts(stateKey)

const tableTarget = 'court-orders-table'
const { messageId, targetId } = attachAlerts(tableTarget, activeCourtOrder)
const activeSchema = getActiveCourtOrderPoaFullSchema()

const {
  tableState,
  addSubject,
  removeSubject,
  undoSubject,
  editSubject
} = useManageCourtOrders(stateKey, {
  cleanupFn: cleanupForm
})

const isReadOnly = computed(() => variant === 'readonly' || variant === 'correct-readonly')
const shouldPreventActions = computed(() => !!activeCourtOrder.value || preventActions)

const allowAddCourtOrder = computed(() => {
  const defaultFilingIdExists = addDefaultValues?.filingId !== undefined &&
    tableState.value.some(co => co.new.filingId === addDefaultValues.filingId)

  if (defaultFilingIdExists) {
    return false
  }
  if (isReadOnly.value) {
    return false
  }
  return !allowedActions || allowedActions.includes(ManageAllowedAction.ADD)
})

const tableAllowedActions = computed(() => {
  if (allowedActions) {
    return allowedActions
  }
  if (isReadOnly.value) {
    return []
  }
  return undefined
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

function setActiveFormAlert() {
  if (activeCourtOrder.value !== undefined) {
    setAlert('court-order-poa-form', t('text.finishTaskBeforeOtherChanges'))
  }
}

function initAddCourtOrder() {
  if (shouldPreventActions.value) {
    setActiveFormAlert()
    emit('action-prevented')
    return
  }
  activeCourtOrder.value = activeSchema.parse({ ...addDefaultValues })
  addingCourtOrder.value = true
}

function initEditRow(row: TableBusinessRow<CourtOrderPoaFullSchema>) {
  const parsed = activeSchema.safeParse({ ...row.original.new })
  const subject = parsed.success
    ? parsed.data
    : JSON.parse(JSON.stringify({ ...row.original.new }))

  activeCourtOrder.value = subject

  currentEditingRow = row.original.new
  currentEditingRow.isEditing = true

  editSubjectLabel = row.original.new.fileNumber

  expandedState.value = { [row.id]: true }
}

function cleanupForm() {
  if (currentEditingRow) {
    currentEditingRow.isEditing = false
  }
  currentEditingRow = null
  expandedState.value = undefined
  activeCourtOrder.value = undefined
  addingCourtOrder.value = false
}

function clearAllAlerts() {
  clearAlert('court-order-poa-form') // clear alert in sub form
  setAlertText(undefined) // clear alert in button control
}

function getExpandedFormVariant(row: TableBusinessRow<CourtOrderPoaFullSchema>): FormVariant {
  // old is always undefined for newly added offices
  const isAdded = row.original.old === undefined
  if (isAdded) {
    return 'edit'
  }
  if (variant === 'correct') {
    return 'correct'
  }
  return 'change'
}

watch(() => actionPreventedSignal, (value) => {
  if (value) {
    setActiveFormAlert()
  }
})
</script>

<template>
  <component
    :is="sectionTitle ? 'section' : 'div'"
    class="space-y-4 sm:space-y-6"
    data-testid="manage-court-orders"
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
        label: tableTitle || $t('label.courtOrdersPlanofArrangement'),
        icon: 'i-mdi-gavel',
        ui: 'bg-shade-secondary px-4 py-3 sm:px-6 rounded-t-md text-base',
        level: sectionTitle ? 'h3' : 'h2'
      }"
      :actions="allowAddCourtOrder
        ? [
          {
            'label': $t('label.addSubject', { subject: $t('label.courtOrder') }),
            'variant': 'outline',
            'icon': 'i-mdi-plus',
            // @ts-expect-error - data-alert-focus-target not valid attr on type ButtonProps
            'data-alert-focus-target': targetId,
            'aria-describedby': messageId,
            'onClick': initAddCourtOrder
          }
        ]
        : undefined
      "
    >
      <template #default>
        <FormCourtOrderPoaFull
          v-if="addingCourtOrder && activeCourtOrder"
          v-model="activeCourtOrder"
          variant="add"
          :name="modelName"
          :subject="$t('label.courtOrder')"
          :state-key="stateKey"
          class="p-6"
          :is-court-order="activeCourtOrder.filingType === FilingType.COURT_ORDER"
          @done="() => addSubject(activeCourtOrder)"
          @cancel="cleanupForm"
        />
        <USeparator />
        <TableCourtOrder
          v-model:expanded="expandedState"
          :data="tableState"
          :loading
          :empty-text
          :allowed-actions="tableAllowedActions"
          :prevent-actions="shouldPreventActions"
          :label-overrides="tableLabels"
          :hide-actions-when="() => isReadOnly"
          :task-guard-config="{
            messageId,
            targetId,
            message: alerts[tableTarget]
          }"
          @action-prevented="() => { setActiveFormAlert(); emit('action-prevented'); }"
          @init-edit="initEditRow"
          @remove="removeSubject"
          @undo="undoSubject"
        >
          <template #expanded="{ row }">
            <div class="px-4 sm:px-6">
              <FormCourtOrderPoaFull
                v-if="activeCourtOrder"
                v-model="activeCourtOrder"
                :variant="getExpandedFormVariant(row)"
                :name="modelName"
                :subject="editSubjectLabel"
                :state-key="stateKey"
                hide-remove
                :is-court-order="activeCourtOrder.filingType === FilingType.COURT_ORDER"
                @done="() => editSubject(activeCourtOrder, row)"
                @cancel="cleanupForm"
                @remove="() => removeSubject(row)"
              />
            </div>
          </template>
        </TableCourtOrder>
      </template>
    </ConnectPageSection>
  </component>
</template>
