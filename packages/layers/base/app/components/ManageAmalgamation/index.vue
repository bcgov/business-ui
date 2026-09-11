<script setup lang="ts">
import type { ManageAmalgamationProps } from '#business/app/interfaces'
import type { ExpandedState } from '@tanstack/vue-table'

const {
  stateKey = 'manage-amalgamation',
  allowedActions = [ManageAllowedAction.CHANGE],
  labelOverrides,
  modelName = 'activeAmal',
  variant = 'default',
  preventActions = false,
  actionPreventedSignal = 0
} = defineProps<ManageAmalgamationProps & { preventActions?: boolean, actionPreventedSignal?: number }>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeAmal = defineModel<ActiveAmalgamationCorrectSchema | undefined>('active-amal')
const activeAmalStmnt = defineModel<ActiveAmalgamationCorrectStatementSchema | undefined>('active-amal-stmnt')

const expandedState = ref<ExpandedState | undefined>(undefined)
const addingAmal = ref(false)

let editSubjectLabel = ''
let currentEditingRow: AmalgamationCorrectSchema | null = null

const { t } = useI18n()
const { setAlertText } = useConnectButtonControl()
const { setAlert, clearAlert, alerts, attachAlerts } = useFilingAlerts(stateKey)

const tableTarget = 'amalgamation-table'
const { messageId, targetId } = attachAlerts(tableTarget, activeAmal)
const activeSchema = getActiveAmalgamationCorrectSchema()
const activeStmntSchema = getActiveAmalgamationCorrectStatementSchema()

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

const isReadOnly = computed(() => variant === 'readonly' || variant === 'correct-readonly')
const shouldPreventActions = computed(() => !!activeAmal.value || !!activeAmalStmnt.value || preventActions)

const allowAddAmal = computed(() => {
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
  if (activeAmal.value !== undefined) {
    setAlert('amalgamation-correct-form', t('text.finishTaskBeforeOtherChanges'))
  }
  if (activeAmalStmnt.value !== undefined) {
    setAlert('amalgamation-correct-statement-form', t('text.finishTaskBeforeOtherChanges'))
  }
}

function initAddAmal() {
  if (shouldPreventActions.value) {
    setActiveFormAlert()
    emit('action-prevented')
    return
  }
  activeAmal.value = activeSchema.parse({})
  addingAmal.value = true
}

function initEditRow(row: TableBusinessRow<AmalgamationCorrectSchema>) {
  const parsed = activeSchema.safeParse({ ...row.original.new })
  const subject = parsed.success
    ? parsed.data
    : JSON.parse(JSON.stringify({ ...row.original.new }))

  activeAmal.value = subject

  currentEditingRow = row.original.new
  currentEditingRow.isEditing = true

  editSubjectLabel = row.original.new.legalName

  expandedState.value = { [row.id]: true }
}

function initEditStatement() {
  const data = { ...statementState.value.new, isEditing: true }
  const parsed = activeStmntSchema.safeParse(data)
  const subject = parsed.success
    ? parsed.data
    : JSON.parse(JSON.stringify(data))

  activeAmalStmnt.value = subject
}

function cleanupForm() {
  if (currentEditingRow) {
    currentEditingRow.isEditing = false
  }
  currentEditingRow = null
  expandedState.value = undefined
  activeAmal.value = undefined
  addingAmal.value = false
  activeAmalStmnt.value = undefined
}

function clearAllAlerts() {
  clearAlert('amalgamation-correct-form') // clear alert in sub form
  clearAlert('amalgamation-correct-statement-form') // clear alert in sub form
  setAlertText(undefined) // clear alert in button control
}

function getExpandedFormVariant(row: TableBusinessRow<AmalgamationTableRow>): FormVariant {
  // old is always undefined for newly added items
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
      :actions="allowAddAmal
        ? [
          {
            'label': $t('label.addSubject', { subject: $t('label.business') }),
            'variant': 'outline',
            'icon': 'i-mdi-plus',
            // @ts-expect-error - data-alert-focus-target not valid attr on type ButtonProps
            'data-alert-focus-target': targetId,
            'aria-describedby': messageId,
            'onClick': initAddAmal
          }
        ]
        : undefined
      "
    >
      <template #default>
        <FormAmalgamationCorrect
          v-if="addingAmal && activeAmal"
          v-model="activeAmal"
          variant="add"
          :name="modelName"
          :subject="$t('label.business')"
          :state-key="stateKey"
          class="p-6"
          @done="addSubject(activeAmal)"
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
          :hide-actions-when="
            (row: TableBusinessRow<AmalgamationTableRow>) =>
              !row.original.new.foreignJurisdiction?.country || isReadOnly
          "
          :task-guard-config="{
            messageId,
            targetId,
            message: alerts[tableTarget]
          }"
          @action-prevented="$emit('action-prevented')"
          @init-edit="initEditRow"
          @remove="removeSubject"
          @undo="undoSubject"
        >
          <template #expanded="{ row }">
            <div class="px-4 sm:px-6">
              <FormAmalgamationCorrect
                v-if="activeAmal"
                v-model="activeAmal"
                :variant="getExpandedFormVariant(row)"
                :name="modelName"
                :subject="editSubjectLabel"
                :state-key="stateKey"
                hide-remove
                @done="editSubject(activeAmal, row)"
                @cancel="cleanupForm"
                @remove="removeSubject(row)"
              />
            </div>
          </template>
        </TableAmalgamation>
      </template>
    </ConnectPageSection>

    <ManageAmalgamationStatement
      v-model="activeAmalStmnt"
      :variant
      :label-overrides="tableLabels"
      :prevent-actions="shouldPreventActions"
      :is-read-only
      @init-edit="initEditStatement"
      @done="updateStatement(activeAmalStmnt)"
      @cancel="cleanupForm"
      @undo="undoStatement"
      @action-prevented="$emit('action-prevented')"
    />
  </component>
</template>
