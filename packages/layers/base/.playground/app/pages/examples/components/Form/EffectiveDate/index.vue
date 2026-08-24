<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Form Effective Date' }]
})

type FullSchema = {
  restrictedDate: EffectiveDateSchema
  restrictedMinDate: EffectiveDateSchema
  restrictedMaxDate: EffectiveDateSchema
  optionalDate: EffectiveDateSchema
  disabledDate: EffectiveDateSchema
}

const state = reactive<FullSchema>({
  restrictedDate: {
    dateInput: ''
  },
  restrictedMinDate: {
    dateInput: ''
  },
  restrictedMaxDate: {
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

const restrictedDateRef = useTemplateRef<FormEffectiveDateRef>('restricted-date-ref')
const restrictedMinDateRef = useTemplateRef<FormEffectiveDateRef>('restricted-min-date-ref')
const restrictedMaxDateRef = useTemplateRef<FormEffectiveDateRef>('restricted-max-date-ref')
const optionalDateRef = useTemplateRef<FormEffectiveDateRef>('optional-date-ref')
const disabledDateRef = useTemplateRef<FormEffectiveDateRef>('disabled-date-ref')

async function onSubmit(event: FormSubmitEvent<unknown>) {
  // FormEffectiveDate keeps its own local state (for debounced input
  // normalization) rather than binding directly to the parent's state, so it
  // can't use UForm's `nested` auto-validation — validate each instance manually.
  const results = await Promise.allSettled([
    restrictedDateRef.value?.formRef?.validate(),
    restrictedMinDateRef.value?.formRef?.validate(),
    restrictedMaxDateRef.value?.formRef?.validate(),
    optionalDateRef.value?.formRef?.validate(),
    disabledDateRef.value?.formRef?.validate()
  ])

  if (results.some(result => result.status === 'rejected')) {
    return
  }

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
            ref="restricted-date-ref"
            v-model="state.restrictedDate"
            name="restrictedDate"
            min-date="2026-06-01"
            max-date="2026-07-30"
          />
        </ConnectPageSection>

        <ConnectPageSection
          :heading="{
            label: 'Basic Example with min date restrictions'
          }"
          ui-body="p-4 space-y-4"
        >
          <FormEffectiveDate
            ref="restricted-min-date-ref"
            v-model="state.restrictedMinDate"
            name="restrictedMinDate"
            min-date="2026-06-01"
          />
        </ConnectPageSection>

        <ConnectPageSection
          :heading="{
            label: 'Basic Example with max date restrictions'
          }"
          ui-body="p-4 space-y-4"
        >
          <FormEffectiveDate
            ref="restricted-max-date-ref"
            v-model="state.restrictedMaxDate"
            name="restrictedMaxDate"
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
            ref="optional-date-ref"
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
            ref="disabled-date-ref"
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
