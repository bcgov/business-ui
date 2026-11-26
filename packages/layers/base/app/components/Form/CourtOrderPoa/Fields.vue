<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

/**
 * Fields only core of the court order forms, shared by:
 * - `FormCourtOrderPoaFull` - the sub form rendered in `ManageCourtOrders` table rows (`variant="subform"`)
 * - `FormCourtOrderPoaFullFiling` - the standalone court order filing page section (`variant="section"`)
 */
const { variant = 'section', isFileAndDetailsRequired = false } = defineProps<{
  isCourtOrder: boolean
  entityType: CorpTypeCd
  filingId: string | number
  identifier?: string
  disabled?: boolean
  fileNumberError?: boolean
  variant?: 'section' | 'subform'
  isFileAndDetailsRequired?: boolean
  supportingDocsCheckbox?: boolean // gates the supporting documents upload behind a checkbox
  supportingDocsError?: string
  courtOrderFileError?: string
}>()

defineEmits<{
  'poa-change': []
}>()

const model = defineModel<CourtOrderPoaFullSchema>({ required: true })

const fileUploadRef = useTemplateRef<{ cleanupFilesOnSessionCancel: () => void }>('file-upload-ref')

// the textarea model can't be null, the schema stores empty details as null
const orderDetailsModel = computed({
  get: () => model.value.orderDetails ?? '',
  set: (val: string) => { model.value.orderDetails = val || null }
})

// grows the details textarea to fit typed, pasted or resumed text - never shrinks it, so a user resize is kept
const orderDetailsRef = useTemplateRef<ComponentPublicInstance>('order-details-ref')
function growOrderDetails() {
  const textarea = (orderDetailsRef.value?.$el as HTMLElement | undefined)?.querySelector('textarea')
  if (textarea && textarea.scrollHeight > textarea.clientHeight) {
    const borderHeight = textarea.offsetHeight - textarea.clientHeight
    textarea.style.height = `${textarea.scrollHeight + borderHeight}px`
  }
}
watch(() => model.value.orderDetails, growOrderDetails, { flush: 'post' })
onMounted(growOrderDetails)

// the two existing layouts - the sub form spaces the top row itself, the page section uses a flex column
const styleVariants = {
  subform: {
    root: '',
    topField: 'py-6 sm:py-10'
  },
  section: {
    root: 'flex flex-col',
    topField: 'py-6'
  }
}

const styles = computed(() => styleVariants[variant])

defineExpose({
  fileUploadRef
})
</script>

<template>
  <div :class="styles.root">
    <ConnectFormFieldWrapper
      :label="$t('label.courtOrder')"
      orientation="horizontal"
      details-aria-hidden
      :error="fileNumberError"
      :class="styles.topField"
    >
      <div class="flex flex-col gap-1">
        <ConnectFormInput
          v-model="model.fileNumber"
          input-id="court-order-number-input"
          :disabled
          :label="$t('label.courtOrderNumber')"
          name="fileNumber"
          required
        />
        <UFormField name="effectOfOrder">
          <UCheckbox
            v-model="model.effectOfOrder"
            data-testid="court-order-poa-checkbox"
            :disabled
            :label="$t('label.filingPursuantToPlanOfArrangement')"
            @update:model-value="$emit('poa-change')"
          />
        </UFormField>
      </div>
    </ConnectFormFieldWrapper>
    <template v-if="isCourtOrder">
      <USeparator class="padding-x-default" />
      <ConnectFormFieldWrapper
        :label="$t('label.courtOrderDetails')"
        orientation="horizontal"
        details-aria-hidden
        class="padding-xy-default"
      >
        <UFormField
          ref="order-details-ref"
          name="orderDetails"
          :help="`${(model.orderDetails?.length) || 0} / 2000`"
          :ui="{
            help: 'text-right'
          }"
        >
          <template #default>
            <ConnectTextarea
              id="court-order-text-input"
              v-model="orderDetailsModel"
              :aria-required="isFileAndDetailsRequired"
              :disabled
              :label="$t(isFileAndDetailsRequired ? 'label.courtOrderDetails' : 'label.courtOrderDetailsOpt')"
              maxlength="2000"
              :rows="4"
              :ui="{ base: 'resize-y' }"
              @keydown.enter.stop
            />
          </template>
        </UFormField>
      </ConnectFormFieldWrapper>
      <USeparator class="padding-x-default" />
      <FormCourtOrderPoaFullFileUpload
        ref="file-upload-ref"
        v-model="model.files"
        v-model:has-supporting-docs="model.hasSupportingDocs"
        data-testid="court-order-file-upload"
        :filing-id="filingId"
        :identifier
        :entity-type="entityType"
        :disabled
        :is-file-and-details-required="isFileAndDetailsRequired"
        :supporting-docs-checkbox="supportingDocsCheckbox"
        :supporting-docs-error="supportingDocsError"
        :court-order-file-error="courtOrderFileError"
      />
    </template>
  </div>
</template>
