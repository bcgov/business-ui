<script setup lang="ts">
import type { FormSubmitEvent, Form, FormError, InputMenuItem } from '@nuxt/ui'
import * as z from 'zod'

const { t } = useI18n()

definePageMeta({
  layout: 'connect-auth'
})

const amalSchema = getAmalgamationCorrectSchema()
const defaultData = amalSchema.parse({})

const schema = z.object({
  name: z.object({
    first: z.string().min(1, t('connect.validation.fieldRequired')),
    middle: z.string().min(1, t('connect.validation.fieldRequired')),
    last: z.string().min(1, t('connect.validation.fieldRequired'))
  })
})

type Schema = z.output<typeof schema>
type FullSchema = { amalBusiness: AmalgamationCorrectSchema } & Schema

const state = reactive<FullSchema>({
  name: {
    first: '',
    middle: '',
    last: ''
  },
  amalBusiness: { ...defaultData }
})

const formRef = useTemplateRef<Form<FullSchema>>('form-ref')

const hasErrors = computed<boolean | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return (errors && errors.length > 0)
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

onMounted(async () => {
  await useBusinessService().getBusinessExtended('BC3000190')
})
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Amalgamation Correct Form (default/nested)' }"
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
          <FormAmalgamationCorrect
            v-model="state.amalBusiness"
            name="amalBusiness"
            order="X"
            variant="correct"
            subject="Amalgamation"
            state-key="manage-amalgamation"
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
