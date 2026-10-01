<script setup lang="ts">
// The legal company name in the new jurisdiction after an Amalgamation Out or Continuation Out filing
const {
  stateKey,
  fieldState,
  loading,
  labelOverrides,
  correctedFilingType
} = defineProps<{
  stateKey: string
  fieldState?: ManageYourCompanyFields['outDate']
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
  correctedFilingType?: FilingType
}>()

defineEmits<{
  'done': []
  'cancel': []
  'init-edit': [key: keyof ManageYourCompanyFields]
  'undo': [key: keyof ManageYourCompanyFields]
}>()

const model = defineModel<ActiveYourCompanySchema>()

const { t } = useI18n()

const displayValue = computed(() => fieldState?.value ? toReadableDate(fieldState.value) : '')
const fieldsetLabel = computed(() =>
  correctedFilingType === FilingType.AMALGAMATION_OUT
    ? t('label.dateOfAmalgamationOut')
    : t('label.dateOfContinuationOut')
)
</script>

<template>
  <ManageYourCompanyFieldRow
    v-model="model"
    :state-key
    field-key="outDate"
    :field-state
    :label="fieldsetLabel"
    :loading
    :label-overrides
    :is-read-only-variant
    :display-value
    padding-class="py-4 sm:py-5 padding-x-default"
    @init-edit="$emit('init-edit', $event)"
    @undo="$emit('undo', $event)"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  >
    <ConnectInputDatePicker
      v-if="model && model.key === 'outDate'"
      v-model="model.value"
      :label="$t('label.enterOrSelectDate')"
      required
      class="w-full"
    />
  </ManageYourCompanyFieldRow>
</template>
