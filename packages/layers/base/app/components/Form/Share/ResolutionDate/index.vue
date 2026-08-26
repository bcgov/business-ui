<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  variant: FormVariant
  name?: string
  stateKey?: string
  standalone?: boolean
  validationContext?: {
    hasRightsOrRestrictions?: boolean
    isEditingExisting?: boolean
    existingResolutions?: { id: string, date: string, type?: string }[]
  }
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const schema = computed(() => getResolutionDateSchema(props.validationContext))
const model = defineModel<ResolutionDateSchema>()
const formRef = useTemplateRef<Form<ResolutionDateSchema>>('resolution-date-form')

// mirrors the superRefine rules in getResolutionDateSchema: dates can't be in the future,
// and are required when there are rights/restrictions or an existing date is being edited
const maxDate = getToday('America/Vancouver')
const isDateRequired = computed(() =>
  !!(props.validationContext?.hasRightsOrRestrictions || props.validationContext?.isEditingExisting)
)

const formTarget = 'resolution-date-form'
const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const { targetId, messageId } = props.standalone ? { targetId: '', messageId: '' } : attachAlerts(formTarget, model)

async function onDone() {
  try {
    await formRef.value?.validate()
    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}

watch(
  [() => props.standalone, model],
  ([isStandalone, val]) => {
    if (isStandalone && val) {
      val.actions = [ActionType.ADDED]
    }
  },
  { immediate: true }
)
</script>

<template>
  <UForm
    v-if="model"
    ref="resolution-date-form"
    :data-testid="`${variant}-resolution-date-form`"
    :schema
    :name
    nested
    :state="model as any"
    @keydown.enter.prevent.stop="onDone"
  >
    <SubFormFieldWrapper
      v-if="!standalone"
      :help="$t('text.formatYYYYMMDD')"
      name="date"
      :task-guard-config="{
        message: alerts[formTarget],
        messageId,
        targetId
      }"
      @done="onDone"
      @cancel="$emit('cancel')"
    >
      <ConnectInputDatePicker
        v-model="model.date"
        :label="$t('label.resolutionOrCourtOrderDate')"
        :max-date="maxDate"
        :required="isDateRequired"
      />
    </SubFormFieldWrapper>
    <UFormField
      v-else
      name="date"
      :help="$t('text.formatYYYYMMDD')"
      class="grow flex-1"
    >
      <ConnectInputDatePicker
        v-model="model.date"
        :label="$t('label.resolutionOrCourtOrderDate')"
        :max-date="maxDate"
        :required="isDateRequired"
      />
    </UFormField>
  </UForm>
</template>
