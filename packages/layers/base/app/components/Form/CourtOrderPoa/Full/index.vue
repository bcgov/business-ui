<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  variant: FormVariant
  subject: string
  hideRemove?: boolean
  name?: string
  stateKey: string
  isCourtOrder: boolean
}>()
// validationContext?: { existingNumbers: string[] } // Do we need to pass this to the schema?

const emit = defineEmits<{
  done: []
  cancel: []
  remove: []
}>()

const model = defineModel<CourtOrderPoaFullSchema>({ required: true })
const formRef = useTemplateRef<Form<CourtOrderPoaFullSchema>>('court-order-poa-form')

const formTarget = 'court-order-poa-form'
const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
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
    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
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
    nested
    :schema
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
      @cancel="$emit('cancel')"
      @remove="$emit('remove')"
      @done="onDone"
    >
      <template #default>
        <div>
          <ConnectFormFieldWrapper
            :label="$t('label.planOfArrangement')"
            orientation="horizontal"
            details-aria-hidden
            :error="formErrors.fileNumber"
            class="padding-x-default pt-6 sm:pt-10 pb-3 sm:pb-5"
          >
            <UFormField name="effectOfOrder">
              <UCheckbox
                v-model="model.effectOfOrder"
                :label="$t('label.filingPursuantToPlanOfArrangement')"
                @update:model-value="formRef?.clear()"
              />
            </UFormField>
          </ConnectFormFieldWrapper>
          <ConnectFormFieldWrapper
            :label="$t('label.fileNumber')"
            orientation="horizontal"
            details-aria-hidden
            :error="formErrors.fileNumber"
            class="padding-x-default pb-6 sm:pb-10 pt-3 sm:pt-5"
          >
            <ConnectFormInput
              v-model="model.fileNumber"
              input-id="court-order-number-input"
              :label="$t('label.fileNumber')"
              name="fileNumber"
              required
            />
          </ConnectFormFieldWrapper>
        </div>
        <template v-if="isCourtOrder">
          <USeparator class="padding-x-default" />
          <ConnectFormFieldWrapper
            :label="$t('label.orderDetails')"
            orientation="horizontal"
            details-aria-hidden
            class="padding-xy-default"
          >
            <UFormField
              name="orderDetails"
              :help="`${(model.orderDetails?.length) || 0} / 2000`"
              :ui="{
                help: 'text-right'
              }"
            >
              <template #default>
                <ConnectInput
                  id="court-order-text-input"
                  v-model="model.orderDetails"
                  :label="$t('label.addCourtOrderTextOpt')"
                  maxlength="2000"
                />
              </template>
            </UFormField>
          </ConnectFormFieldWrapper>
          <USeparator class="padding-x-default" />
          <ConnectFormFieldWrapper
            :label="$t('label.uploadFiles')"
            orientation="horizontal"
            details-aria-hidden
            class="padding-xy-default"
          >
            <FormDocumentUpload @converted-files="(files) => model.files = files" />
          </ConnectFormFieldWrapper>
        </template>
      </template>
    </SubFormWrapper>
  </UForm>
</template>
