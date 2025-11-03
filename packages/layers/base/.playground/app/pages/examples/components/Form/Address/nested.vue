<script setup lang="ts">
import type { FormSubmitEvent, Form, FormError } from '@nuxt/ui'
import * as z from 'zod'
import type { FormAddress } from '#components'

definePageMeta({
  layout: 'connect-auth'
})

const schema = z.object({
  name: z.object({
    first: z.string().min(2),
    middle: z.string().min(2),
    last: z.string().min(2)
  })
})

type Schema = z.output<typeof schema>
type FullSchema = AddressSchema & Schema

const state = reactive<FullSchema>({
  deliveryAddress: {
    street: '',
    streetAdditional: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'CA',
    locationDescription: ''
  },
  mailingAddress: {
    street: '',
    streetAdditional: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'CA',
    locationDescription: ''
  },
  sameAsDelivery: false,
  name: {
    first: '',
    middle: '',
    last: ''
  }
})

const formRef = useTemplateRef<Form<FullSchema>>('form-ref')
const addressRef = useTemplateRef<InstanceType<typeof FormAddress>>('address-ref')

const formErrors = computed<{
  exists: boolean | undefined
  name: FormError<string> | undefined
}>(() => {
  const errors = formRef.value?.getErrors()
  const nameError = errors?.find(e => e.name?.startsWith('name'))

  // nested doesnt propagate errors reactively
  // but will propagate on submit
  // workaround - check nested ref as well
  const addressErrors = addressRef.value?.formRef?.getErrors()

  return {
    exists: (errors && errors.length > 0) || (addressErrors && addressErrors.length > 0),
    name: nameError
  }
})

// loses typing here
// only accepts FormSubmitEvent<Schema> (not FullSchema)
// maybe okay but need to cast to get type completion
async function onSubmit(event: FormSubmitEvent<unknown>) {
  const data = event.data as FullSchema
  console.info('Form data: ', data)
}
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Address Form (nested)' }"
      :ui-body="formErrors.exists ? 'p-10 border-l-2 border-error' : 'p-10'"
      class="max-w-3xl"
    >
      <UForm
        ref="form-ref"
        :state="state"
        :schema="schema"
        class="gap-6 flex flex-col"
        @submit="onSubmit"
        @error="onFormError"
      >
        <ConnectFieldset label="Legal Name" :error="formErrors.name">
          <div class="flex gap-4">
            <ConnectFormInput
              v-model="state.name.first"
              label="First Name"
              input-id="first-name-input"
              name="name.first"
            />
            <ConnectFormInput
              v-model="state.name.middle"
              label="Middle Name"
              input-id="middle-name-input"
              name="name.middle"
            />
            <ConnectFormInput
              v-model="state.name.last"
              label="Last Name"
              input-id="last-name-input"
              name="name.last"
            />
          </div>
        </ConnectFieldset>

        <FormAddress
          ref="address-ref"
          v-model="state"
          nested
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
