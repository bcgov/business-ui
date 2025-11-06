<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { FormAddress } from '#components'

definePageMeta({
  layout: 'connect-auth'
})

const state = reactive<AddressSchema>({
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
  sameAs: false
})

const formRef = useTemplateRef<InstanceType<typeof FormAddress>>('form-ref')
const hasErrors = computed(() => {
  const errors = formRef.value?.formRef?.getErrors()
  return errors && errors.length > 0
})

async function onSubmit(event: FormSubmitEvent<AddressSchema>) {
  const data = event.data
  console.info('Form data: ', data)
}

function onCancel() {
  formRef.value?.formRef?.clear()
}
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Address Form (default)' }"
      :ui-body="hasErrors ? 'p-10 border-l-2 border-error' : 'p-10'"
      class="max-w-3xl"
    >
      <FormAddress
        ref="form-ref"
        v-model="state"
        @submit="onSubmit"
        @error="onFormSubmitError"
        @cancel="onCancel"
      />
    </ConnectPageSection>
  </div>
</template>
