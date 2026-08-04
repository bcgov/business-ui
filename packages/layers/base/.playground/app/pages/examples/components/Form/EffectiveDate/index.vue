<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Form Effective Date' }]
})

type FullSchema = {
  restrictedDate: EffectiveDateSchema
  optionalDate: EffectiveDateSchema
  disabledDate: EffectiveDateSchema
}

const state = reactive<FullSchema>({
  restrictedDate: {
    dateInput: ''
  },
  optionalDate: {
    dateInput: ''
  },
  disabledDate: {
    dateInput: '2026-07-15'
  }
})

const formRef = useTemplateRef<Form<FullSchema>>('form-ref')

async function onSubmit(event: FormSubmitEvent<unknown>) {
  const data = event.data as FullSchema
  console.info('Form data: ', data)
}
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Effective Date Form (default/nested)' }"
      class="max-w-3xl"
    >
      <UForm
        ref="form-ref"
        :state="state"
        novalidate
        class="gap-6 flex flex-col"
        @submit="onSubmit"
        @error="onFormSubmitError"
      >
        <ConnectPageSection
          :heading="{
            label: 'Basic Example with min and max date restrictions'
          }"
          ui-body="p-4 space-y-4"
        >
          <FormEffectiveDate
            ref="effective-date-ref"
            v-model="state.restrictedDate"
            name="restrictedDate"
            min-date="2026-06-01"
            max-date="2026-07-30"
          />
        </ConnectPageSection>

        <ConnectPageSection
          :heading="{
            label: 'Effective Date is not required and has no date restrictions'
          }"
          ui-body="p-4 space-y-4"
        >
          <FormEffectiveDate
            ref="effective-date-ref"
            v-model="state.optionalDate"
            name="optionalDate"
            :required="false"
          />
        </ConnectPageSection>

        <ConnectPageSection
          :heading="{
            label: 'Effective Date is disabled/readonly'
          }"
          ui-body="p-4 space-y-4"
        >
          <FormEffectiveDate
            ref="effective-date-ref"
            v-model="state.disabledDate"
            name="disabledDate"
            :required="false"
            :disabled="true"
          />
        </ConnectPageSection>
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
