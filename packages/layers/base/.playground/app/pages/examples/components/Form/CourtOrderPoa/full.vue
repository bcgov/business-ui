<script setup lang="ts">
import type { FormSubmitEvent, Form, FormError } from '@nuxt/ui'
import * as z from 'zod'

const { t } = useI18n()

definePageMeta({
  layout: 'connect-auth'
})

const courtOrderSchema = getCourtOrderPoaFullSchema()
const defaultData = courtOrderSchema.parse({})

const schema = z.object({
  name: z.object({
    first: z.string().min(1, t('connect.validation.fieldRequired')),
    middle: z.string().min(1, t('connect.validation.fieldRequired')),
    last: z.string().min(1, t('connect.validation.fieldRequired'))
  })
})

type Schema = z.output<typeof schema>
type FullSchema = { courtOrder: CourtOrderPoaFullSchema } & Schema

const state = reactive<FullSchema>({
  name: {
    first: '',
    middle: '',
    last: ''
  },
  courtOrder: { ...defaultData }
})

const formRef = useTemplateRef<Form<FullSchema>>('form-ref')
const courtOrderRef = useTemplateRef<FormCourtOrderPoaRef>('court-order-poa-ref')

const hasErrors = computed<boolean | undefined>(() => {
  const errors = formRef.value?.getErrors()
  // nested doesnt propagate errors reactively
  // but will propagate on submit
  // workaround - check nested ref as well
  const folioErrors = courtOrderRef.value?.formRef?.getErrors()
  return (errors && errors.length > 0) || (folioErrors && folioErrors.length > 0)
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

type FileType = {
  id: string
  fileKey: string
  name: string
  type?: string
  action: 'NONE' | 'ADDED' | 'DELETED'
  status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'
}

const files: FileType[] = [
  {
    id: crypto.randomUUID(),
    fileKey: 'CORP-DS0000102187',
    name: 'BC1200839 Summary - 2026-07-02.pdf',
    type: 'SUPP',
    action: 'NONE',
    status: 'IDLE'
  },
  {
    id: crypto.randomUUID(),
    fileKey: 'CORP-DS0000102188',
    name: 'BC1200823 Summary - 2026-06-29.pdf',
    type: 'CRTO',
    action: 'NONE',
    status: 'IDLE'
  },
  {
    id: crypto.randomUUID(),
    fileKey: 'CORP-DS0000102189',
    name: 'BC1200839 Summary - 2026-07-02 (1).pdf',
    type: 'SUPP',
    action: 'NONE',
    status: 'IDLE'
  },
  {
    id: crypto.randomUUID(),
    fileKey: 'CORP-DS0000102190',
    name: 'BC1200839 Summary - 2026-07-02 (2).pdf',
    type: 'SUPP',
    action: 'NONE',
    status: 'IDLE'
  }
]

state.courtOrder.files = files
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Court Order and Plan of Arrangement Form (default/nested)' }"
      :ui-body="hasErrors ? 'p-10 border-l-2 border-error' : 'p-10'"
      class="max-w-4xl"
    >
      <UForm
        ref="form-ref"
        :state="state"
        :schema="schema"
        novalidate
        class="gap-6 flex flex-col"
        @submit="onSubmit"
        @error="onFormSubmitError"
      >
        <ConnectFieldset
          label="Legal Name"
          :error="nameError"
          class="min-w-0 w-full"
        >
          <div class="flex gap-4">
            <ConnectFormInput
              v-model="state.name.first"
              label="First Name"
              input-id="first-name-input"
              name="name.first"
              required
            />
            <ConnectFormInput
              v-model="state.name.middle"
              label="Middle Name"
              input-id="middle-name-input"
              name="name.middle"
              required
            />
            <ConnectFormInput
              v-model="state.name.last"
              label="Last Name"
              input-id="last-name-input"
              name="name.last"
              required
            />
          </div>
        </ConnectFieldset>

        <div class="p-10 bg-shade">
          <FormCourtOrderPoaFull
            ref="court-order-poa-ref"
            v-model="state.courtOrder"
            name="courtOrder"
            order="X"
            variant="add"
            subject="Court Order"
            state-key="manage-court-orders"
            is-court-order
            identifier="BC1234567"
            class="min-w-0 w-full"
          />
        </div>
        <div class="flex gap-6 justify-end">
          <UButton type="submit" :label="$t('label.done')" />
          <UButton
            variant="outline"
            :label="$t('label.cancel')"
            @click="formRef?.clear()"
          />
        </div>
      </UForm>
    </ConnectPageSection>
  </div>
</template>
