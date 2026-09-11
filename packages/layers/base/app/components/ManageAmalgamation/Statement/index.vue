<script setup lang="ts">
const {
  stateKey = 'manage-amalgamation',
  labelOverrides,
  modelName = 'activeAmalStmnt',
  variant = 'default',
  preventActions = false,
  isReadOnly
} = defineProps<ManageAmalgamationProps & {
  preventActions?: boolean
  isReadOnly: boolean
}>()

const emit = defineEmits<{
  'done': []
  'cancel': []
  'init-edit': []
  'undo': []
  'action-prevented': []
}>()

const model = defineModel<ActiveAmalgamationCorrectStatementSchema | undefined>()

const { statementState } = useManageAmalgamation(stateKey)
const newState = computed(() => statementState.value.new)

const { t } = useI18n()

const actionProps = computed(() => {
  if (newState.value?.actions.includes(ActionType.CHANGED)) {
    return {
      label: t('label.undo'),
      icon: 'i-mdi-undo',
      onClick: () => {
        if (preventActions) {
          emit('action-prevented')
          return
        }
        emit('undo')
      }
    }
  }
  return {
    label: labelOverrides?.editLabel || t('label.change'),
    icon: 'i-mdi-edit',
    onClick: () => {
      if (preventActions) {
        emit('action-prevented')
        return
      }
      emit('init-edit')
    }
  }
})

const expandedFormVariant = computed<FormVariant>(() => {
  if (variant === 'correct' || variant === 'correct-readonly') {
    return 'correct'
  }
  return 'change'
})
</script>

<template>
  <ConnectFieldset
    class="border border-shade-secondary rounded bg-white"
    padding-class="p-4 sm:p-7.5"
  >
    <template #label>
      <div class="flex flex-col gap-1">
        <span>{{ $t('label.amalgamationStatement') }}</span>
        <UBadge
          v-if="newState.actions.length"
          :label="labelOverrides?.badges?.CHANGED || t('badge.changed')"
          class="w-min"
        />
      </div>
    </template>
    <template #default>
      <FormAmalgamationCorrectStatement
        v-if="model"
        v-model="model"
        :variant="expandedFormVariant"
        :state-key
        :name="modelName"
        @cancel="$emit('cancel')"
        @done="$emit('done')"
      />
      <div v-else class="flex justify-between">
        <div>{{ newState?.courtApproval ? $t('label.withCourtApproval') : $t('label.withoutCourtApproval') }}</div>
        <UButton
          v-if="!isReadOnly"
          v-bind="actionProps"
          variant="ghost"
          class="px-2 py-1 h-min"
        />
      </div>
    </template>
  </ConnectFieldset>
</template>
