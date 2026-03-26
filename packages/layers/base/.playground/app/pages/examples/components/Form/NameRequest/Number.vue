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
      :heading="{ label: 'Name Request Number Form' }"
      :ui-body="hasErrors ? 'p-10 border-l-2 border-error' : 'p-10'"
      class="max-w-3xl"
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
        <div class="p-10 bg-shade-inverted">
          <FormNameRequestNumber
            ref="nr-number-form"
            v-model="state.nameRequest"
            name="nameRequest"
            :business-type="CorpTypeCd.BC_COMPANY"
            :filing-name="useFiling().getFilingName(FilingType.CORRECTION)!"
            :nr-allowed-action-types="[NrRequestActionCode.CHANGE_NAME]"
          />
        </div>
        <div class="flex gap-6 justify-end">
          <UButton type="submit" :label="$t('label.done')" />
          <UButton
            variant="outline"
            :label="$t('label.cancel')"
            @click="state.nameRequest.nrNumber = ''; formRef?.clear()"
          />
        </div>
      </UForm>
    </ConnectPageSection>
  </div>
</template>
