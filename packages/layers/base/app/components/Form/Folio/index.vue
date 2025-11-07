<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

defineProps<{
  name?: string
  order?: string | number
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
      :label="order ? `${order}. ${$t('label.folioOrRefNumber')}` : $t('label.folioOrRefNumber')"
      :description="$t('text.folioDescription')"
      body-variant="card"
    >
      <ConnectFormFieldWrapper
        :label="$t('label.folioOrRefNumber')"
        orientation="horizontal"
        :error="formError"
      >
        <ConnectFormInput
          v-model="model.folioNumber"
          input-id="folio-input"
          :label="$t('label.folioOrRefNumberOpt')"
          name="folioNumber"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
