<script setup lang="ts">
/**
 * Fields only core of the court order forms, shared by:
 * - `FormCourtOrderPoaFull` - the sub form rendered in `ManageCourtOrders` table rows (`variant="subform"`)
 * - `FormCourtOrderPoaFullFiling` - the standalone court order filing page section (`variant="section"`)
 */
const { variant = 'section', isFileOrDetailsRequired = false } = defineProps<{
  isCourtOrder: boolean
  entityType: CorpTypeCd
  filingId: string | number
  identifier?: string
  disabled?: boolean
  fileNumberError?: boolean
  variant?: 'section' | 'subform'
  isFileOrDetailsRequired?: boolean
}>()

defineEmits<{
  'poa-change': []
}>()

const model = defineModel<CourtOrderPoaFullSchema>({ required: true })

const fileUploadRef = useTemplateRef<{ cleanupFilesOnSessionCancel: () => void }>('file-upload-ref')

// the two existing layouts - the sub form spaces each field itself, the page section uses a flex column
const styleVariants = {
  subform: {
    root: '',
    topFields: '',
    poaField: 'padding-x-default pt-6 sm:pt-10 pb-3 sm:pb-5',
    fileNumberField: 'padding-x-default pb-6 sm:pb-10 pt-3 sm:pt-5'
  },
  section: {
    root: 'flex flex-col',
    topFields: 'flex flex-col gap-6 py-6',
    poaField: '',
    fileNumberField: ''
  }
}

const styles = computed(() => styleVariants[variant])

defineExpose({
  fileUploadRef
})
</script>

<template>
  <div :class="styles.root">
    <div :class="styles.topFields">
      <ConnectFormFieldWrapper
        :label="$t('label.planOfArrangement')"
        orientation="horizontal"
        details-aria-hidden
        :error="fileNumberError"
        :class="styles.poaField"
      >
        <UFormField name="effectOfOrder">
          <UCheckbox
            v-model="model.effectOfOrder"
            data-testid="court-order-poa-checkbox"
            :disabled
            :label="$t('label.filingPursuantToPlanOfArrangement')"
            @update:model-value="$emit('poa-change')"
          />
        </UFormField>
      </ConnectFormFieldWrapper>
      <ConnectFormFieldWrapper
        :label="$t('label.courtOrderNumber')"
        orientation="horizontal"
        details-aria-hidden
        :error="fileNumberError"
        :class="styles.fileNumberField"
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
    <template v-if="isCourtOrder">
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
              :label="$t(isFileOrDetailsRequired ? 'label.addCourtOrderText' : 'label.addCourtOrderTextOpt')"
              maxlength="2000"
            />
          </template>
        </UFormField>
      </ConnectFormFieldWrapper>
      <USeparator class="padding-x-default" />
      <FormCourtOrderPoaFullFileUpload
        ref="file-upload-ref"
        v-model="model.files"
        data-testid="court-order-file-upload"
        :filing-id="filingId"
        :identifier
        :entity-type="entityType"
        :disabled
        :is-file-or-details-required="isFileOrDetailsRequired"
      />
    </template>
  </div>
</template>
