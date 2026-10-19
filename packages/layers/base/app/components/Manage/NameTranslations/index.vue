<script setup lang="ts">
import type { ExpandedState } from '@tanstack/vue-table'
import { cloneDeep } from 'es-toolkit'

const {
  stateKey = 'manage-name-translations',
  labelOverrides,
  modelName = 'activeNameTranslation',
  variant = 'default',
  allowedActions,
  preventActions = false,
  actionPreventedSignal = 0
} = defineProps<{
  loading?: boolean
  emptyText?: string
  stateKey?: string
  variant?: ManageVariant
  allowedActions?: ManageAllowedAction[]
  labelOverrides?: TableLabelOverrides
  modelName?: string
  preventActions?: boolean
  actionPreventedSignal?: number
}>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeSubject = defineModel<ActiveNameTranslationSchema | undefined>('active-subject')

const expandedState = ref<ExpandedState | undefined>(undefined)
const addingSubject = ref(false)

let editSubjectLabel = ''

const formTarget = 'name-translation-form'

const {
  tableState,
  addSubject,
  removeSubject,
  undoSubject,
  editSubject
} = useManageNameTranslations(stateKey, {
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
  labelOverrides: () => labelOverrides,
  preventActions: () => preventActions,
  actionPreventedSignal: () => actionPreventedSignal,
  activeSubjects: {
    subject: activeSubject,
    alertTarget: formTarget
  }
})

const activeSubjectSchema = getActiveNameTranslationSchema()

const allowAddSubject = computed(() => {
  return !tableAllowedActions.value || tableAllowedActions.value.includes(ManageAllowedAction.ADD)
})

function initAddSubject() {
  if (shouldPreventActions.value) {
    onActionPrevented()
    return
  }
  activeSubject.value = activeSubjectSchema.parse({})
  addingSubject.value = true
}

function cleanupForm() {
  expandedState.value = undefined
  addingSubject.value = false
  activeSubject.value = undefined
}

function initEditSubject(row: TableBusinessRow<NameTranslationSchema>) {
  const subject = cloneDeep(row.original.new)
  activeSubject.value = subject
  editSubjectLabel = row.original.new.name
  expandedState.value = { [row.id]: true }
}

function onActionPrevented() {
  setActiveSubjectAlert()
  emit('action-prevented')
}
</script>

<template>
  <div
    class="space-y-4"
    data-testid="manage-name-translations"
    @pointerdown="clearAllAlerts"
    @keydown="clearAllAlerts"
  >
    <UButton
      v-if="allowAddSubject"
      :label="$t('label.addNameTranslation')"
      variant="outline"
      icon="i-mdi-plus"
      class="w-min"
      @click="initAddSubject"
    />

    <FormNameTranslation
      v-if="addingSubject && activeSubject"
      v-model="activeSubject"
      :subject="$t('label.nameTranslation')"
      :name="modelName"
      variant="add"
      :state-key="stateKey"
      @done="() => addSubject(activeSubject)"
      @cancel="cleanupForm"
    />

    <p v-if="tableState.length" class="font-bold text-neutral-highlighted">
      {{ $t('label.nameTranslation') }}
    </p>

    <TableNameTranslation
      v-if="tableState.length"
      v-model:expanded="expandedState"
      :data="tableState"
      :loading
      :empty-text="emptyText"
      :allowed-actions="tableAllowedActions"
      :hide-actions-when="() => isReadOnlyVariant"
      :prevent-actions="shouldPreventActions"
      :label-overrides="tableLabels"
      @init-edit="initEditSubject"
      @remove="removeSubject"
      @undo="undoSubject"
      @action-prevented="onActionPrevented"
    >
      <template #expanded="{ row }">
        <FormNameTranslation
          v-if="activeSubject"
          v-model="activeSubject"
          :subject="editSubjectLabel"
          :name="modelName"
          :variant="getExpandedFormVariant(variant, row)"
          :state-key="stateKey"
          @cancel="cleanupForm"
          @done="() => editSubject(activeSubject, row)"
          @remove="removeSubject(row)"
        />
      </template>
    </TableNameTranslation>
  </div>
</template>
