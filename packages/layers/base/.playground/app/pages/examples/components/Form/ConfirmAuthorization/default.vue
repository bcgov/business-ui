<script setup lang="ts">
import type { FormSubmitEvent, Form, FormError } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ to: '/', label: 'Examples' }, { label: 'Form Confirm Authorization' }]
})

const schema = z.object({
  entityType: z.string().min(1, $t('connect.validation.fieldRequired'))
})

type Schema = z.output<typeof schema>
type FullSchema = { confirmAuthorization: ConfirmAuthorizationSchema } & Schema

const state = reactive<FullSchema>({
  entityType: 'Corporation',
  confirmAuthorization: {
    isAuthorized: false
  }
})

const formRef = useTemplateRef<Form<FullSchema>>('form-ref')

const entityTypeError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => e.name?.startsWith('entityType'))
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
      :heading="{ label: 'Confirm Authorization' }"
      :ui-body="'p-10'"
      class="w-full max-w-5xl"
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
        <ConnectFieldset label="Entity Type" :error="entityTypeError">
          <ConnectFormInput
            v-model="state.entityType"
            label="Entity Type"
            input-id="entity-type-input"
            name="entityType"
            required
          />
        </ConnectFieldset>
        <FormConfirmAuthorization
          ref="confirm-authorization-ref"
          v-model="state.confirmAuthorization"
          :entity-type="state.entityType"
          order="X"
          name="confirmAuthorization"
        />
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
