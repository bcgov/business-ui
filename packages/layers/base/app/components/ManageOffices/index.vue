<!-- FUTURE: Refactor other methods into useManageCommon -->
<script setup lang="ts">
import type { ManageOfficesProps } from '#business/app/interfaces'
import type { ExpandedState } from '@tanstack/vue-table'
import { cloneDeep } from 'es-toolkit'

const {
  stateKey = 'manage-offices',
  allowedActions,
  allowAddOfficeType,
  labelOverrides,
  modelName = 'activeOffice',
  variant = 'default',
  preventActions = false,
  actionPreventedSignal = 0
} = defineProps<ManageOfficesProps & { preventActions?: boolean, actionPreventedSignal?: number }>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeSubject = defineModel<ActiveOfficeSchema | undefined>('active-office')

const expandedState = ref<ExpandedState | undefined>(undefined)
const addingSubject = ref(false)

let editSubjectLabel = ''

const tableTarget = 'offices-table'
const formTarget = 'office-address-form'

const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { messageId, targetId } = attachAlerts(tableTarget, activeSubject)

const {
  tableState,
  addSubject,
  removeSubject,
  undoSubject,
  editSubject
} = useManageOffices(stateKey, {
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
  variant,
  allowedActions,
  labelOverrides,
  preventActions,
  actionPreventedSignal,
  activeSubjects: {
    subject: activeSubject,
    alertTarget: formTarget
  }
})

const { t } = useI18n()

// enable/disable the 'Add Office' button
const allowAddOffice = computed(() => {
  // 1. If no office type is configured to add, return false
  if (!allowAddOfficeType) {
    return false
  }

  // 2. Check the allowed actions defined by the variants and/or props
  const canAdd = !tableAllowedActions.value || tableAllowedActions.value.includes(ManageAllowedAction.ADD)
  if (!canAdd) {
    return false
  }

  // 3. Check if the table already contains the type configured to add
  const tableHasAddType = allowAddOfficeType ? tableState.value.some(o => o.new.type === allowAddOfficeType) : false

  return !tableHasAddType
})

function initAddSubject() {
  if (shouldPreventActions.value) {
    setActiveSubjectAlert()
    emit('action-prevented')
    return
  }
  const overrides = allowAddOfficeType ? { type: allowAddOfficeType } : {}
  const defaultState = createDefaultOffice(overrides)

  activeSubject.value = defaultState
  addingSubject.value = true
}

function cleanupForm() {
  expandedState.value = undefined
  addingSubject.value = false
  activeSubject.value = undefined
}

function initEditSubject(row: TableBusinessRow<OfficeSchema>) {
  const subject = cloneDeep(row.original.new)
  activeSubject.value = subject
  editSubjectLabel = t(`officeType.${row.original.new.type}`)
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
    data-testid="manage-offices"
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
        label: tableTitle,
        icon: 'i-mdi-domain',
        ui: 'bg-shade-secondary px-4 py-3 sm:px-6 rounded-t-md text-base',
        level: sectionTitle ? 'h3' : 'h2'
      }"
      :actions="allowAddOffice
        ? [
          {
            'label': $t('label.addSubject', { subject }),
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
        <FormOfficeDetails
          v-if="addingSubject && activeSubject"
          v-model="activeSubject"
          variant="add"
          :name="modelName"
          :subject="subject!"
          :state-key
          class="p-6"
          @done="() => addSubject(activeSubject)"
          @cancel="cleanupForm"
        />
        <USeparator />
        <TableOffices
          v-model:expanded="expandedState"
          :data="tableState"
          :loading
          :empty-text="emptyText"
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
              <FormOfficeDetails
                v-if="activeSubject"
                v-model="activeSubject"
                :variant="getExpandedFormVariant(variant, row)"
                :name="modelName"
                :subject="editSubjectLabel"
                :state-key
                :hide-remove="variant === 'correct'"
                @done="() => editSubject(activeSubject, row)"
                @cancel="cleanupForm"
                @remove="removeSubject(row)"
              />
            </div>
          </template>
        </TableOffices>
      </template>
    </ConnectPageSection>
  </component>
</template>
