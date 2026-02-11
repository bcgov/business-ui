<script setup lang="ts">
import type { FormSubmitEvent, Form, FormError } from '@nuxt/ui'
import * as z from 'zod'

const { t } = useI18n()

definePageMeta({
  layout: 'connect-auth'
})

const schema = z.object({
  name: z.object({
    first: z.string().min(1, t('connect.validation.fieldRequired')),
    middle: z.string().min(1, t('connect.validation.fieldRequired')),
    last: z.string().min(1, t('connect.validation.fieldRequired'))
  })
})

type Schema = z.output<typeof schema>
type FullSchema = { documentId: DocumentIdSchema } & Schema

const state = reactive<FullSchema>({
  name: {
    first: '',
    middle: '',
    last: ''
  },
  documentId: {
    documentIdNumber: ''
  }
})

const formRef = useTemplateRef<Form<FullSchema>>('form-ref')
const docIdRef = useTemplateRef<FormDocumentIdRef>('document-id-ref')

const hasErrors = computed<boolean | undefined>(() => {
  const errors = formRef.value?.getErrors()
  // nested doesnt propagate errors reactively
  // but will propagate on submit
  // workaround - check nested ref as well
  const docIdErrors = docIdRef.value?.formRef?.getErrors()
  return (errors && errors.length > 0) || (docIdErrors && docIdErrors.length > 0)
})
const nameError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => e.name?.startsWith('name'))
})

// loses typing here
// only accepts FormSubmitEvent<Schema> (not FullSchema)
// cast type to get type completion if necessary
async function onSubmit(event: FormSubmitEvent<unknown>) {
  const data = event.data as FullSchema
  console.info('Form data: ', data)
}
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Document Upload (default)' }"
      :ui-body="hasErrors ? 'p-10 border-l-2 border-error' : 'p-10'"
      class="max-w-3xl"
    >
      <FormDocumentUpload
        ref="document-upload-ref"
        v-model="state.documentId"
        name="documentUpload"
        order="1"
      />
    </ConnectPageSection>
  </div>
</template>
