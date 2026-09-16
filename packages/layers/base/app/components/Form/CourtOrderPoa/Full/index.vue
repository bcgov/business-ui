<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'

const {
  stateKey,
  nested = true
} = defineProps<{
  variant: FormVariant
  subject: string
  hideRemove?: boolean
  name?: string
  nested?: boolean
  stateKey: string
  isCourtOrder: boolean
  identifier?: string
  entityType: CorpTypeCd
}>()

const emit = defineEmits<{
  done: []
  cancel: []
  remove: []
}>()

const model = defineModel<CourtOrderPoaFullSchema>({ required: true })
const formRef = useTemplateRef<Form<CourtOrderPoaFullSchema>>('court-order-poa-form')
const fieldsRef = useTemplateRef<FormCourtOrderPoaFieldsRef>('court-order-fields')

const formTarget = 'court-order-poa-form'
const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { targetId, messageId } = attachAlerts(formTarget, model)

const schema = computed(() => getCourtOrderPoaFullSchema())

const formErrors = computed(() => {
  const errors = formRef.value?.getErrors()

  return {
    fileNumber: !!errors?.find(e => e.name?.includes('fileNumber'))
  }
})

async function onDone() {
  try {
    await formRef.value?.validate()

    if (model.value.files?.length) {
      model.value.files = model.value.files.filter(file => file.status !== CourtOrderFileStatus.ERROR)
    }

    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}

function onCancel() {
  fieldsRef.value?.fileUploadRef?.cleanupFilesOnSessionCancel()
  emit('cancel')
}

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="court-order-poa-form"
    :data-testid="`${variant}-court-order-poa-form`"
    :name
    :nested
    :schema
    :state="model"
    @keydown.enter.prevent.stop="onDone"
  >
    <SubFormWrapper
      :subject
      :variant
      :task-guard-config="{
        message: alerts[formTarget],
        messageId,
        targetId
      }"
      :hide-remove
      @cancel="onCancel"
      @remove="$emit('remove')"
      @done="onDone"
    >
      <template #default>
        <FormCourtOrderPoaFields
          ref="court-order-fields"
          v-model="model"
          variant="subform"
          :is-court-order="isCourtOrder"
          :file-number-error="formErrors.fileNumber"
          :filing-id="model.filingId"
          :identifier
          :entity-type
          @poa-change="formRef?.clear()"
        />
      </template>
    </SubFormWrapper>
  </UForm>
</template>
