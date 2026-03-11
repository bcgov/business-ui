<script setup lang="ts">
import type { FormSubmitEvent, Form } from '@nuxt/ui'

definePageMeta({
  layout: 'connect-auth'
})

const correctionDate = 'February 26, 2026'

type CorrectionDetail = { detail: string }
type SubmitSchema = { correctionDetail: CorrectionDetail }

const state = reactive<SubmitSchema>({
  correctionDetail: {
    detail: ''
  }
})

const detailRef = useTemplateRef<{ formRef?: Form<CorrectionDetail> }>('detail-ref')

const hasErrors = computed<boolean>(() => {
  const detailErrors = detailRef.value?.formRef?.getErrors() ?? []
  return detailErrors.length > 0
})

async function onSubmit(event: FormSubmitEvent<unknown>) {
  const data = event.data as SubmitSchema
  console.info('Form data: ', data)
}
</script>

<template>
  <div class="py-10 flex w-full flex-col gap-10 items-center px-4">
    <ConnectPageSection
      :heading="{ label: 'Detail (default)' }"
      :ui-body="hasErrors ? 'p-10 border-l-2 border-error' : 'p-10'"
      class="w-full max-w-5xl"
    >
      <UForm
        :state="state"
        novalidate
        class="flex w-full flex-col gap-6"
        @submit="onSubmit"
        @error="onFormSubmitError"
      >
        <div class="p-10 bg-shade">
          <FormDetail
            ref="detail-ref"
            v-model="state.correctionDetail"
            name="correctionDetail"
            order="1"
            :max-length="200"
            :filingDate="correctionDate"
          />
        </div>
        <div class="flex gap-6 justify-end">
          <UButton type="submit" :label="$t('label.done')" />
          <UButton
            variant="outline"
            :label="$t('label.cancel')"
            @click="detailRef?.formRef?.clear()"
          />
        </div>
      </UForm>
    </ConnectPageSection>
  </div>
</template>