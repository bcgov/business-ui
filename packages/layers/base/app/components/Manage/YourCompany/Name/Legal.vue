<script setup lang="ts">
// The current company name
const {
  stateKey,
  fieldState,
  loading,
  labelOverrides,
  isReadOnlyVariant,
  correctNameOptions,
  nrAllowedActionsTypes
} = defineProps<{
  stateKey: string
  business?: BusinessData | BusinessDataPublic
  fieldState?: ManageYourCompanyFields['nameRequest']
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
  correctNameOptions?: CorrectNameOption[]
  nrAllowedActionsTypes?: NrRequestActionCode[]
}>()

const emit = defineEmits<{
  'init-edit': []
  'done': []
  'cancel': []
  'undo': []
  'action-prevented': []
}>()

const model = defineModel<ActiveYourCompanySchema>()

const alertTarget = 'name-request'
const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { targetId, messageId } = attachAlerts(alertTarget, model)

const filingName = computed(() => getFilingName(FilingType.CORRECTION)!)

const nameOptions = computed(() => {
  if (isReadOnlyVariant) {
    return []
  }
  return correctNameOptions
})

const nrTypes = computed(() => {
  if (isReadOnlyVariant) {
    return []
  }
  return nrAllowedActionsTypes
})
</script>

<template>
  <ConnectFieldset padding-class="py-4 sm:py-5 padding-x-default">
    <template #label>
      <div class="space-y-1">
        <div>{{ $t('label.companyName') }}</div>
        <ManageYourCompanyBadge :actions="fieldState?.actions" :label-overrides />
      </div>
    </template>
    <template #default>
      <USkeleton v-if="loading" class="h-8 w-3/4 sm:w-1/2" />

        <FormBusinessName
          v-else-if="business && model && model.key === 'nameRequest'"
          ref="business-name-form"
          v-model="model.value"
          variant="correct"
          :subject="$t('label.companyName')"
          name="value"
          :state-key="stateKey"
          :initial-company-name="fieldState?.value?.legalName || ''"
          :business-identifier="business.identifier"
          :business-type="business.legalType"
          :correct-name-options="nameOptions!"
          :filing-name
          :nr-allowed-action-types="nrTypes!"
          @cancel="$emit('cancel')"
          @done="$emit('done')"
        />

      <div
        v-else-if="fieldState?.value"
        class="flex items-center justify-between"
      >
        <span>{{ fieldState.value.legalName }}</span>
        <ManageYourCompanyActions
          v-if="!isReadOnlyVariant"
          :actions="fieldState.actions"
          @init-edit="$emit('init-edit')"
          @undo="$emit('undo')"
        />
      </div>
      </template>
  </ConnectFieldset>
</template>