<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

const {
  name,
  order,
  registeredOfficeEmail = useNuxtApp().$i18n.t('label.notAvailable'),
  loading
} = defineProps<{
  name?: string
  order?: string | number
  registeredOfficeEmail?: string
  loading?: boolean
}>()

const schema = getDocumentDeliverySchema()

const model = defineModel<DocumentDeliverySchema>({ required: true })

const formRef = useTemplateRef<Form<DocumentDeliverySchema>>('doc-delivery-form')

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
    ref="doc-delivery-form"
    data-testid="document-delivery-section"
    :schema
    :name
    nested
  >
    <ConnectFieldset
      :label="order ? `${order}. ${$t('label.documentDelivery')}` : $t('label.documentDelivery')"
      :description="$t('text.documentDeliveryDescription')"
      body-variant="card"
    >
      <div class="space-y-6">
        <ConnectFormFieldWrapper
          :label="$t('officeType.registeredOffice')"
          orientation="horizontal"
        >
          <USkeleton v-if="loading" class="h-6 w-48" />
          <span v-else>{{ registeredOfficeEmail }}</span>
        </ConnectFormFieldWrapper>
        <ConnectFormFieldWrapper
          :label="$t('label.completingParty')"
          orientation="horizontal"
          :error="formError"
        >
          <ConnectFormInput
            v-model="model.completingPartyEmail"
            input-id="completing-party-email-input"
            :label="$t('label.emailAddressOpt')"
            name="completingPartyEmail"
          />
        </ConnectFormFieldWrapper>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
