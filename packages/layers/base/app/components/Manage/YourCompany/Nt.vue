<script setup lang="ts">
const {
  stateKey,
  variant,
  labelOverrides,
  preventActions,
  actionPreventedSignal,
  allowedActions
} = defineProps<{
  stateKey: string
  variant: 'default' | 'correct' | 'readonly' | 'correct-readonly'
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  preventActions?: boolean
  actionPreventedSignal?: number
  allowedActions?: ManageAllowedAction[]
}>()

const emit = defineEmits<{
  'action-prevented': []
}>()

// type ManageCompanyNameProps = Omit<ManageBaseProps, 'tableTitle'> & {
//   tableTitle?: string
//   business?: BusinessData | BusinessDataPublic
//   contact?: ContactPoint
//   nameTranslationLabelOverrides?: TableLabelOverrides
// } & (
//   | {
//     variant?: 'default' | 'correct'
//     correctNameOptions: CorrectNameOption[]
//     nrAllowedActionsTypes: NrRequestActionCode[]
//     nameTranslationAllowedActions?: ManageAllowedAction[]
//   }
//   | {
//     variant: 'readonly' | 'correct-readonly'
//     correctNameOptions?: never
//     nrAllowedActionsTypes?: never
//     nameTranslationAllowedActions?: never
//   }
// )

const activeNt = defineModel<ActiveNameTranslationSchema | undefined>('active-nt')

function onActionPrevented() {
  setActiveSubjectAlert()
  emit('action-prevented')
}

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
    subject: activeNt,
    alertTarget: 'name-translation-form'
  }
})
</script>

<template>
  <div class="flex gap-2 lg:gap-6 flex-col lg:flex-row py-4 lg:py-5 padding-x-default">
    <span class="text-neutral-highlighted font-bold w-full lg:basis-1/4">
      {{ $t('label.nameTranslations') }}
    </span>
    <div class="flex flex-col flex-1 gap-4">
      <span v-if="!isReadOnlyVariant">{{ $t('text.addNameTranslation') }}</span>
      <ManageNameTranslations
        v-model:active-name-translation="activeNt"
        :state-key
        :loading
        :variant
        :allowed-actions
        :label-overrides
        :prevent-actions
        :action-prevented-signal
        @action-prevented="onActionPrevented"
      />
    </div>
  </div>
</template>
