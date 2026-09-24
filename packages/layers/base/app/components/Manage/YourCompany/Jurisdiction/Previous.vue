<script setup lang="ts">
// The new jurisdiction after an Amalgamation Out or Continuation Out filing
import type { InputMenuItem } from '@nuxt/ui'

const {
  stateKey,
  fieldState,
  loading,
  labelOverrides
} = defineProps<{
  stateKey: string
  fieldState?: ManageYourCompanyFields['previousJurisdiction']
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
}>()

const emit = defineEmits<{
  'init-edit': []
  'done': []
  'cancel': []
  'undo': []
}>()

const model = defineModel<ActiveYourCompanySchema>()

const alertTarget = 'previous-jurisdiction'
const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { targetId, messageId } = attachAlerts(alertTarget, model)

const { t } = useI18n()

function getJurisdictionLabel(country?: string, region?: string | null): string {
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
}

const caOpts: InputMenuItem[] = [
  { type: 'label', label: t('label.canadian') },
  ...countrySubdivisions.ca
    .filter(p => p.code !== 'BC')
    .map(p => ({
      label: `${p.name}, Canada`,
      region: p.code,
      country: 'CA'
    })),
  { type: 'separator' },
  { region: 'FEDERAL', country: 'CA', label: t('label.federal') }
]

const internationalOpts: InputMenuItem[] = [
  { type: 'label', label: t('label.international') },
  ...isoCountriesListSortedByName
    .filter(c => c.alpha_2 !== 'CA')
    .sort((a, b) => {
      if (a.alpha_2 === 'US') {
        return -1
      }
      if (b.alpha_2 === 'US') {
        return 1
      }
      return 0
    })
    .map(c => ({
      label: c.name,
      region: null,
      country: c.alpha_2
    }))
]

const jurisdictionOpts: InputMenuItem[][] = [
  caOpts,
  internationalOpts
]

// normalize jurisdiction to match InputMenuItem
const selectedJurisdiction = computed({
  get() {
    if (!model.value || model.value.key !== 'previousJurisdiction' || !model.value.value) {
      return undefined
    }

    const { country, region } = model.value.value
    if (!country) { return undefined }

    return {
      label: getJurisdictionLabel(country, region),
      country,
      region
    }
  },
  set(val: { label?: string, country: string, region: string | null } | undefined) {
    if (!model.value || model.value.key !== 'previousJurisdiction') { return }

    model.value = {
      key: 'previousJurisdiction',
      value: {
        country: val?.country ?? '',
        region: val?.region ?? null
      }
    }
  }
})

const displayValue = computed(() => {
  if (!fieldState?.value) { return '' }
  const { country, region } = fieldState.value
  return getJurisdictionLabel(country, region)
})
</script>

<template>
  <ConnectFieldset>
    <template #label>
      <div class="ml-4 space-y-1">
        <div>Previous Jurisdiction</div>
        <ManageYourCompanyBadge :actions="fieldState?.actions" :label-overrides />
      </div>
    </template>
    <template #default>
      <USkeleton v-if="loading" class="h-6 w-2/3 sm:w-1/3" />

      <SubFormFieldWrapper
        v-else-if="model && model.key === 'previousJurisdiction'"
        name="value"
        :task-guard-config="{
          message: alerts[alertTarget],
          messageId,
          targetId
        }"
        @done="$emit('done')"
        @cancel="$emit('cancel')"
      >
        <ConnectInputMenu
          id="previous-jurisdiction-menu"
          v-model="selectedJurisdiction"
          :label="$t('label.selectPreviousJurisdiction')"
          :items="jurisdictionOpts"
          open-on-focus
          :ui="{
            label: 'font-bold px-4 pb-2 pt-3',
            separator: 'mx-0'
          }"
        />
      </SubFormFieldWrapper>

      <div
        v-else-if="fieldState?.value"
        class="flex items-center justify-between -mt-4 sm:-mt-1.5 ml-4 sm:ml-0"
      >
        <span>{{ displayValue }}</span>
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
