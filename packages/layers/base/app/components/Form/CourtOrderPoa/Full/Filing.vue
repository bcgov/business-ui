<script setup lang="ts">
import type { Form, FormError } from '@nuxt/ui'

// Page section for the standalone court order filing.
defineProps<{
  name?: string
  order?: string | number
  disabled?: boolean
  identifier?: string
  entityType: CorpTypeCd
  filingId: string | number
}>()

const model = defineModel<CourtOrderPoaFullFilingSchema>({ required: true })

const schema = getCourtOrderPoaFullFilingSchema()

const formRef = useTemplateRef<Form<CourtOrderPoaFullFilingSchema>>('court-order-filing-form')

const sectionError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => ['fileNumber', 'orderDetails', 'files'].some(name => e.name?.includes(name)))
})
</script>

<template>
  <UForm
    ref="court-order-filing-form"
    :schema
    nested
    :name
  >
    <ConnectFieldset
      :label="order ? `${order}. ${$t('label.courtOrderAndPoa')}` : $t('label.courtOrderAndPoa')"
      :description="$t('text.courtOrderAndPoaDescription')"
      body-variant="card"
      orientation="vertical"
      :error="sectionError"
    >
      <FormCourtOrderPoaFields
        v-model="model"
        variant="section"
        is-court-order
        :disabled
        :filing-id="filingId"
        :identifier
        :entity-type="entityType"
        @poa-change="formRef?.clear()"
      />
    </ConnectFieldset>
  </UForm>
</template>
