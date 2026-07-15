<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  variant: FormVariant
  name?: string
  stateKey: string
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

const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const formTarget = 'resolution-date-form'
const schema = computed(() => getResolutionDateSchema(props.validationContext))

const model = defineModel<ResolutionDateSchema>({ required: true })
const formRef = useTemplateRef<Form<ResolutionDateSchema>>('resolution-date-form')

async function onDone() {
  try {
    await formRef.value?.validate()
    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}

const { targetId, messageId } = attachAlerts(formTarget, model)
</script>

<template>
  <UForm
    ref="resolution-date-form"
    :data-testid="`${variant}-resolution-date-form`"
    :schema
    :name
    nested
    :state="model as any"
    @keydown.enter.prevent.stop="onDone"
  >
    <SubFormFieldWrapper
      :task-guard-config="{
        message: alerts[formTarget],
        messageId,
        targetId
      }"
      @done="onDone"
      @cancel="$emit('cancel')"
    >
      <UFormField :help="$t('text.formatYYYYMMDD')" name="date">
        <ConnectInputDate
          id="resolution-date"
          v-model="model.date"
          :label="$t('label.resolutionOrCourtOrderDate')"
          autofocus
        />
      </UFormField>
    </SubFormFieldWrapper>
  </UForm>
</template>
