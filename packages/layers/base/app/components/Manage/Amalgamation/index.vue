<script setup lang="ts">
import type { ManageAmalgamationProps } from '#business/app/interfaces'
import type { ExpandedState } from '@tanstack/vue-table'

const {
  stateKey = 'manage-amalgamation',
  allowedActions = [ManageAllowedAction.CHANGE],
  labelOverrides,
  modelName = 'activeSubject',
  variant = 'default',
  preventActions = false,
  actionPreventedSignal = 0
} = defineProps<ManageAmalgamationProps>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeSubject = defineModel<ActiveAmalgamationSchema>('active-subject')

const expandedState = ref<ExpandedState | undefined>(undefined)
const addingSubject = ref(false)

let editSubjectLabel = ''

const tableTarget = 'amalgamation-table'
const formTarget = 'amalgamation-correct-form'
const statementFormTarget = 'amalgamation-correct-statement-form'

const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { messageId, targetId } = attachAlerts(tableTarget, activeSubject)

const {
  tableState,
  statementState,
  addSubject,
  removeSubject,
  undoSubject,
  editSubject,
  updateStatement,
  undoStatement
} = useManageAmalgamation(stateKey, {
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
    alertTarget: [formTarget, statementFormTarget]
  }
})

const businessSchema = getAmalgamationCorrectSchema()

const allowAddSubject = computed(() =>
  !tableAllowedActions.value || tableAllowedActions.value.includes(ManageAllowedAction.ADD)
)

function initAddSubject() {
  if (shouldPreventActions.value) {
    onActionPrevented()
    return
  }
  activeSubject.value = { key: 'business', value: businessSchema.parse({}) }
  addingSubject.value = true
}

function cleanupForm() {
  expandedState.value = undefined
  addingSubject.value = false
  activeSubject.value = undefined
}

function initEditSubject(row: TableBusinessRow<AmalgamationCorrectSchema>) {
  activeSubject.value = { key: 'business', value: cloneDeep(row.original.new) }
  editSubjectLabel = row.original.new.legalName
  expandedState.value = { [row.id]: true }
}

function initEditStatement() {
  activeSubject.value = { key: 'statement', value: { ...cloneDeep(statementState.value.new), isEditing: true } }
}

function hideRowActions(row: TableBusinessRow<AmalgamationTableRow>) {
  return !row.original.new.foreignJurisdiction?.country || isReadOnlyVariant.value
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
    data-testid="manage-amalgamation"
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
        label: tableTitle || $t('label.amalgamation'),
        icon: 'i-mdi-set-center',
        ui: 'bg-shade-secondary px-4 py-3 sm:px-6 rounded-t-md text-base',
        level: sectionTitle ? 'h3' : 'h2'
      }"
      :actions="allowAddSubject
        ? [
          {
            'label': $t('label.addSubject', { subject: $t('label.business') }),
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
        <FormAmalgamationCorrect
          v-if="addingSubject && activeSubject?.key === 'business'"
          v-model="activeSubject.value"
          variant="add"
          :name="modelName"
          :subject="$t('label.business')"
          :state-key="stateKey"
          class="p-6"
          @done="() => addSubject(activeSubject)"
          @cancel="cleanupForm"
        />
        <USeparator />
        <TableAmalgamation
          v-model:expanded="expandedState"
          :data="tableState"
          :loading
          :empty-text
          :allowed-actions="tableAllowedActions"
          :prevent-actions="shouldPreventActions"
          :label-overrides="tableLabels"
          :hide-actions-when="hideRowActions"
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
              <FormAmalgamationCorrect
                v-if="activeSubject?.key === 'business'"
                v-model="activeSubject.value"
                :variant="getExpandedFormVariant(variant, row)"
                :name="modelName"
                :subject="editSubjectLabel"
                :state-key="stateKey"
                hide-remove
                @done="() => editSubject(activeSubject, row)"
                @cancel="cleanupForm"
                @remove="() => removeSubject(row)"
              />
            </div>
          </template>
        </TableAmalgamation>
      </template>
    </ConnectPageSection>

    <ManageAmalgamationStatement
      v-model="activeSubject"
      :variant
      :label-overrides="tableLabels"
      :prevent-actions="shouldPreventActions"
      :is-read-only="isReadOnlyVariant"
      :state-key
      :model-name
      @init-edit="initEditStatement"
      @done="() => updateStatement(activeSubject)"
      @cancel="cleanupForm"
      @undo="undoStatement"
      @action-prevented="onActionPrevented"
    />
  </component>
</template>
