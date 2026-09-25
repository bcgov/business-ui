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
}>()

const model = defineModel<ActiveYourCompanySchema>()

const query = useBusinessQuery()

const { data: nrData } = query.linkedNameRequest(
  fieldState?.value?.nrNumber || '',
  {
    enabled: !!fieldState?.value?.nrNumber && fieldState.value.changeOption === CorrectNameOption.CORRECT_NEW_NR
  }
)

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

const showNrData = computed(() => nrData.value && fieldState?.value?.changeOption === CorrectNameOption.CORRECT_NEW_NR)
</script>

<template>
  <ConnectFieldset padding-class="padding-x-default py-4 sm:py-5">
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
        class="flex items-center justify-between -mt-4 sm:-mt-1.5"
      >
        <ManageYourCompanyNameRequestDetails
          v-if="showNrData"
          class="mt-1.5"
          :field-state
          :nr-data
        />
        <span v-else class="text-xl font-bold">{{ fieldState.value.legalName }}</span>
        <ManageYourCompanyActions
          v-if="!isReadOnlyVariant"
          :class="{ 'self-start': showNrData }"
          :actions="fieldState.actions"
          @init-edit="$emit('init-edit')"
          @undo="$emit('undo')"
        />
      </div>
    </template>
  </ConnectFieldset>
</template>
