<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

defineProps<{
  name?: string
  order?: string | number
}>()

const schema = getCourtOrderPoaSchema()

const model = defineModel<CourtOrderPoaSchema>({ required: true })

const formRef = useTemplateRef<Form<CourtOrderPoaSchema>>('court-order-poa-form')

const courtOrderNumberError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => e.name === 'courtOrderNumber')
})

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="court-order-poa-form"
    :schema
    nested
    :name
  >
    <ConnectFieldset
      :label="order ? `${order}. ${$t('label.courtOrderAndPoa')}` : $t('label.courtOrderAndPoa')"
      :description="$t('text.courtOrderAndPoaDescription')"
      body-variant="card"
    >
      <div class="flex flex-col gap-4">
        <ConnectFormFieldWrapper
          :label="$t('label.planOfArrangement')"
          orientation="horizontal"
        >
          <UFormField name="hasPoa">
            <UCheckbox
              v-model="model.hasPoa"
              :label="$t('label.filingPursuantToPlanOfArrangement')"
            />
          </UFormField>
        </ConnectFormFieldWrapper>
        <ConnectFormFieldWrapper
          :label="$t('label.courtOrderNumber')"
          orientation="horizontal"
          :error="courtOrderNumberError"
        >
          <ConnectFormInput
            v-model="model.courtOrderNumber"
            input-id="court-order-number-input"
            :label="model.hasPoa ? $t('label.courtOrderNumber') : $t('label.courtOrderNumberOpt')"
            name="courtOrderNumber"
            :required="model.hasPoa"
          />
        </ConnectFormFieldWrapper>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
