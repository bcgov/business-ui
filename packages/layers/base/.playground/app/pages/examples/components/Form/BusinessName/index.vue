<script setup lang="ts">
import type { FormSubmitEvent, Form } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({
  layout: 'connect-auth'
})

const schema = z.object({
  nameRequest: getNameRequestSchema()
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  nameRequest: {
    changeToNumbered: false,
    nrNumber: '',
    legalName: ''
  }
})

const formRef = useTemplateRef<Form<Schema>>('form-ref')

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.info('Form data: ', event.data)
}

const hasErrors = computed(() => {
  const errors = formRef.value?.getErrors()
  return errors && errors.length > 0
})
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Business Name Form' }"
      :ui-body="hasErrors ? 'p-10 border-l-2 border-error' : 'p-10'"
      class="max-w-3xl"
    >
      <UForm
        ref="form-ref"
        :state
        :schema
        novalidate
        class="gap-6 flex flex-col"
        @submit="onSubmit"
        @error="onFormSubmitError"
      >
        <div class="p-10 bg-shade-inverted">
          <FormBusinessName
            ref="business-name-form"
            v-model="state.nameRequest"
            name="nameRequest"
            initial-company-name="Test Company Inc"
            business-identifier="BC1234567"
            :business-type="CorpTypeCd.BC_COMPANY"
            company-name="Test Business Name"
            :correct-name-options="[
              CorrectNameOption.CORRECT_NAME,
              CorrectNameOption.CORRECT_NAME_TO_NUMBER,
              CorrectNameOption.CORRECT_NEW_NR
            ]"
            :filing-name="useFiling().getFilingName(FilingType.CORRECTION)!"
            :nr-allowed-action-types="[NrRequestActionCode.CHANGE_NAME]"
          />
        </div>
      </UForm>
    </ConnectPageSection>
  </div>
</template>
