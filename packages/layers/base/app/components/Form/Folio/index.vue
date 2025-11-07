<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

defineProps<{
  name?: string
}>()

const folioSchema = getFolioSchema()

const model = defineModel<FolioSchema>({ required: true })

const formRef = useTemplateRef<Form<FolioSchema>>('folio-form')

const formError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors && errors[0]
})

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="folio-form"
    :schema="folioSchema"
    nested
    :name
  >
    <ConnectFieldset
      label="1. Folio or Reference Number"
      description="This is meant for your own tracking purposes and will appear on your receipt."
      body-variant="card"
    >
      <ConnectFormFieldWrapper
        label="Folio or Reference Number"
        orientation="horizontal"
        :error="formError"
      >
        <ConnectFormInput
          v-model="model.folioNumber"
          input-id="folio-input"
          label="Folio or Reference Number (Optional)"
          name="folioNumber"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
