<script setup lang="ts">
// The identifier in a companies previous jurisdiction - after a Continuation In filing
const {
  stateKey,
  fieldState,
  loading,
  labelOverrides,
  isReadOnlyVariant,
  previousJurisdiction
} = defineProps<{
  stateKey: string
  fieldState?: ManageYourCompanyFields['numberPreviousJurisdiction']
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
  previousJurisdiction?: { country: string, region: string | null }
}>()

const emit = defineEmits<{
  'init-edit': []
  'done': []
  'cancel': []
  'undo': []
}>()

const model = defineModel<ActiveYourCompanySchema>()

const alertTarget = 'number-prev-jurisdiction'
const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { targetId, messageId } = attachAlerts(alertTarget, model)

const { t } = useI18n()

const jurisdictionLabel = computed(() => {
  const country = previousJurisdiction?.country
  const region = previousJurisdiction?.region

  if (!country) { return '' }

  if (country === 'CA') {
    if (region === 'FEDERAL') {
      return t('label.federal')
    }
    const provinceDisplay = countrySubdivisions.ca.find(p => p.code === region)?.name || region
    return `${provinceDisplay}, Canada`
  }

  const countryDisplay = isoCountriesListSortedByName.find(c => c.alpha_2 === country)?.name || country
  return countryDisplay
})
</script>

<template>
  <ConnectFieldset>
    <template #label>
      <div class="ml-4">
        <div>Identifying Number</div>
        <div
          v-if="previousJurisdiction?.country"
          class="font-normal text-sm italic"
        >
          ({{ jurisdictionLabel }})
        </div>
        <ManageYourCompanyBadge
          :actions="fieldState?.actions"
          :label-overrides
          class="mt-1"
        />
      </div>
    </template>
    <template #default>
      <USkeleton v-if="loading" class="h-6 w-2/3 sm:w-1/3" />

      <SubFormFieldWrapper
        v-else-if="model && model.key === 'numberPreviousJurisdiction'"
        name="value"
        :task-guard-config="{
          message: alerts[alertTarget],
          messageId,
          targetId
        }"
        @done="$emit('done')"
        @cancel="$emit('cancel')"
      >
        <ConnectInput
          id="number-prev-jurisdiction"
          v-model="model.value"
          label="Enter number in previous jurisdiction"
          @keydown.enter.stop="$emit('done')"
        />
      </SubFormFieldWrapper>

      <div
        v-else-if="fieldState?.value"
        class="flex items-center justify-between -mt-4 sm:-mt-1.5 ml-4 sm:ml-0"
      >
        <span>{{ fieldState.value }}</span>
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
