<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Form Effective Date' }]
})

type FullSchema = { effectiveDate: EffectiveDateSchema }

const state = reactive<FullSchema>({
  effectiveDate: {
    effectiveDate: ''
  }
})

const formRef = useTemplateRef<Form<FullSchema>>('form-ref')
const effectiveDateRef = useTemplateRef<FormEffectiveDateRef>('effective-date-ref')

const hasErrors = computed<boolean | undefined>(() => {
  const errors = formRef.value?.getErrors()
  // nested doesnt propagate errors reactively
  // but will propagate on submit
  // workaround - check nested ref as well
  const effectiveDateErrors = effectiveDateRef.value?.formRef?.getErrors()
  return (errors && errors.length > 0) || (effectiveDateErrors && effectiveDateErrors.length > 0)
})

async function onSubmit(event: FormSubmitEvent<unknown>) {
  const data = event.data as FullSchema
  console.info('Form data: ', data)
}
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Effective Date Form (default/nested)' }"
      :ui-body="hasErrors ? 'p-10 border-l-2 border-error' : 'p-10'"
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
        <FormEffectiveDate
          ref="effective-date-ref"
          v-model="state.effectiveDate"
          name="effectiveDate"
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
