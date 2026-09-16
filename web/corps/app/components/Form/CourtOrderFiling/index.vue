<script setup lang="ts">
import type { Form, FormError } from '@nuxt/ui'

// FUTURE: Consider moving to base layer when corps/firms are moved over
// Page section for the standalone court order filing.
defineProps<{
  name?: string
  order?: string | number
  disabled?: boolean
  identifier?: string
  entityType: CorpTypeCd
  filingId: string | number
}>()

const model = defineModel<CourtOrderFilingSchema>({ required: true })

const schema = getCourtOrderFilingSchema()

const formRef = useTemplateRef<Form<CourtOrderFilingSchema>>('court-order-filing-form')

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
      <div class="flex flex-col">
        <div class="flex flex-col gap-6 py-6">
          <ConnectFormFieldWrapper
            :label="$t('label.planOfArrangement')"
            orientation="horizontal"
            details-aria-hidden
          >
            <UFormField name="effectOfOrder">
              <UCheckbox
                v-model="model.effectOfOrder"
                data-testid="court-order-poa-checkbox"
                :disabled
                :label="$t('label.filingPursuantToPlanOfArrangement')"
                @update:model-value="formRef?.clear()"
              />
            </UFormField>
          </ConnectFormFieldWrapper>
          <ConnectFormFieldWrapper
            :label="$t('label.courtOrderNumber')"
            orientation="horizontal"
            details-aria-hidden
          >
            <ConnectFormInput
              v-model="model.fileNumber"
              input-id="court-order-number-input"
              :disabled
              :label="$t('label.courtOrderNumber')"
              name="fileNumber"
              required
            />
          </ConnectFormFieldWrapper>
        </div>
        <USeparator class="padding-x-default" />
        <ConnectFormFieldWrapper
          :label="$t('label.courtOrderText')"
          orientation="horizontal"
          details-aria-hidden
          class="padding-xy-default"
        >
          <UFormField
            name="orderDetails"
            :help="`${(model.orderDetails?.length) || 0} / 2000`"
            :ui="{
              help: 'text-right'
            }"
          >
            <template #default>
              <ConnectInput
                id="court-order-text-input"
                v-model="model.orderDetails"
                :disabled
                :label="$t('label.addCourtOrderTextOpt')"
                maxlength="2000"
              />
            </template>
          </UFormField>
        </ConnectFormFieldWrapper>
        <USeparator class="padding-x-default" />
        <FormCourtOrderPoaFullFileUpload
          v-model="model.files"
          data-testid="court-order-file-upload"
          :filing-id="filingId"
          :identifier
          :entity-type="entityType"
        />
      </div>
    </ConnectFieldset>
  </UForm>
</template>
