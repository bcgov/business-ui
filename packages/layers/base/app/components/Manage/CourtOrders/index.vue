<script setup lang="ts">
import type { ManageCourtOrdersProps } from '#business/app/interfaces'
import type { ExpandedState } from '@tanstack/vue-table'
import { cloneDeep } from 'es-toolkit'

const {
  stateKey = 'manage-court-orders',
  allowedActions = [ManageAllowedAction.ADD, ManageAllowedAction.CHANGE],
  labelOverrides,
  modelName = 'activeSubject',
  variant = 'default',
  preventActions = false,
  actionPreventedSignal = 0,
  addDefaultValues
} = defineProps<ManageCourtOrdersProps>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeSubject = defineModel<ActiveCourtOrderPoaFullSchema | undefined>('active-subject')

const expandedState = ref<ExpandedState | undefined>(undefined)
const addingSubject = ref(false)

let editSubjectLabel = ''

const tableTarget = 'court-orders-table'
const formTarget = 'court-order-poa-form'

const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { messageId, targetId } = attachAlerts(tableTarget, activeSubject)

const {
  tableState,
  addSubject,
  removeSubject,
  undoSubject,
  editSubject
} = useManageCourtOrders(stateKey, {
  cleanupFn: cleanupForm
})

const {
  isReadOnlyVariant,
  shouldPreventActions,
  tableAllowedActions,
  tableLabels,
  setActiveSubjectAlert,
  clearAllAlerts
} = useManageCommon({
  stateKey,
  variant: () => variant,
  allowedActions: () => allowedActions,
  labelOverrides: () => labelOverrides,
  preventActions: () => preventActions,
  actionPreventedSignal: () => actionPreventedSignal,
  activeSubjects: {
    subject: activeSubject,
    alertTarget: formTarget
  }
})

const activeSubjectSchema = getActiveCourtOrderPoaFullSchema()

const allowAddSubject = computed(() => {
  const defaultFilingIdExists = addDefaultValues?.filingId !== undefined
    && tableState.value.some(co => co.new.filingId === addDefaultValues.filingId)

  if (defaultFilingIdExists) {
    return false
  }
  return !tableAllowedActions.value || tableAllowedActions.value.includes(ManageAllowedAction.ADD)
})

function initAddSubject() {
  if (shouldPreventActions.value) {
    onActionPrevented()
    return
  }
  activeSubject.value = activeSubjectSchema.parse({ ...addDefaultValues })
  addingSubject.value = true
}

function cleanupForm() {
  expandedState.value = undefined
  addingSubject.value = false
  activeSubject.value = undefined
}

function initEditSubject(row: TableBusinessRow<CourtOrderPoaFullSchema>) {
  const subject = cloneDeep(row.original.new)
  activeSubject.value = subject
  editSubjectLabel = row.original.new.fileNumber
  expandedState.value = { [row.id]: true }
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
      :actions="allowAddSubject
        ? [
          {
            'label': $t('label.addSubject', { subject: $t('label.courtOrder') }),
            'variant': 'outline',
            'icon': 'i-mdi-plus',
            // @ts-expect-error - data-alert-focus-target not valid attr on type ButtonProps
            'data-alert-focus-target': targetId,
            'aria-describedby': messageId,
            'onClick': initAddSubject
          }
        ]
        : undefined
      "
    >
      <template #default>
        <FormCourtOrderPoaFull
          v-if="addingSubject && activeSubject"
          v-model="activeSubject"
          variant="add"
          :name="modelName"
          :subject="$t('label.courtOrder')"
          :state-key="stateKey"
          class="p-6"
          :is-court-order="activeSubject.filingType === FilingType.COURT_ORDER"
          :identifier
          :entity-type="entityType!"
          @done="() => addSubject(activeSubject)"
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
          :hide-actions-when="() => isReadOnlyVariant"
          :task-guard-config="{
            messageId,
            targetId,
            message: alerts[tableTarget]
          }"
          @action-prevented="onActionPrevented"
          @init-edit="initEditSubject"
          @remove="removeSubject"
          @undo="undoSubject"
        >
          <template #expanded="{ row }">
            <div class="px-4 sm:px-6">
              <FormCourtOrderPoaFull
                v-if="activeSubject"
                v-model="activeSubject"
                :variant="getExpandedFormVariant(variant, row)"
                :name="modelName"
                :subject="editSubjectLabel"
                :state-key="stateKey"
                hide-remove
                :is-court-order="activeSubject.filingType === FilingType.COURT_ORDER"
                :identifier
                :entity-type="entityType!"
                @done="() => editSubject(activeSubject, row)"
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
