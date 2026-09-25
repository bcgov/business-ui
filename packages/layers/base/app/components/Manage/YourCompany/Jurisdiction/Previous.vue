<script setup lang="ts">
// The new jurisdiction after an Amalgamation Out or Continuation Out filing
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

const jurisdictionOpts = getJurisdictionMenuItems()

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
</script>

<template>
  <ConnectFieldset padding-class="padding-x-default pb-4 sm:pb-5">
    <template #label>
      <div class="ml-4 space-y-1">
        <div>{{ $t('label.previousJurisdiction') }}</div>
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
        <span>{{ selectedJurisdiction?.label || '' }}</span>
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
