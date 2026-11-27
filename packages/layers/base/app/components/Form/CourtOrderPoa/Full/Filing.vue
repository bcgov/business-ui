<script setup lang="ts">
import type { Form, FormError } from '@nuxt/ui'

// Page section for the standalone court order filing.
defineProps<{
  name?: string
  disabled?: boolean
  identifier?: string
  entityType: CorpTypeCd
  filingId: string | number
}>()

const model = defineModel<CourtOrderPoaFullSchema>({ required: true })

const schema = getCourtOrderPoaFullSchema({ isFileAndDetailsRequired: true })

const formRef = useTemplateRef<Form<CourtOrderPoaFullSchema>>('court-order-filing-form')

const sectionError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => ['fileNumber', 'orderDetails', 'files', 'hasSupportingDocs']
    .some(name => e.name?.includes(name)))
})

const supportingDocsError = computed(() => formRef.value?.getErrors('hasSupportingDocs')[0]?.message)
const courtOrderFileError = computed(() => formRef.value?.getErrors('files')[0]?.message)

// retrigger validation on the order details and files when one changes
watch(
  () => [model.value.orderDetails, model.value.files, model.value.hasSupportingDocs],
  () => {
    if (!formRef.value?.getErrors()?.length) {
      return
    }
    // the checkbox rule only revalidates once shown: checking the box to add documents must not raise it
    formRef.value.validate({
      // @ts-expect-error - field names not being inferred correctly
      name: supportingDocsError.value ? ['orderDetails', 'files', 'hasSupportingDocs'] : ['orderDetails', 'files'],
      silent: true
    })
  },
  { deep: true }
)
</script>

<template>
  <UForm
    ref="court-order-filing-form"
    :schema
    nested
    :name
  >
    <fieldset :aria-label="$t('label.courtOrderAndPoa')">
      <div
        class="bg-white rounded shadow-xs overflow-hidden"
        :class="sectionError ? 'shadow-section-error' : ''"
      >
        <FormCourtOrderPoaFields
          v-model="model"
          variant="section"
          is-court-order
          is-file-and-details-required
          supporting-docs-checkbox
          :supporting-docs-error="supportingDocsError"
          :court-order-file-error="courtOrderFileError"
          :disabled
          :filing-id="filingId"
          :identifier
          :entity-type="entityType"
          @poa-change="formRef?.clear()"
        />
      </div>
    </fieldset>
  </UForm>
</template>
