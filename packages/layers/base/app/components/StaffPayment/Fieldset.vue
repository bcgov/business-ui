<script setup lang="ts">
defineProps<{
  order?: number | string
  initializing: boolean
}>()

const formRef = useTemplateRef<StaffPaymentFormRef>('staff-pay-ref')
const staffPayment = defineModel<StaffPaymentSchema>({ required: true })

defineExpose({
  setFocusOnError: () => formRef.value?.setFocusOnError(),
  formRef: formRef.value?.formRef
})
</script>

<template>
  <ConnectFieldset
    data-testid="staff-payment-section"
    :label="order ? `${order}. ${$t('label.staffPayment')}` : $t('label.staffPayment')"
    body-variant="card"
    orientation="vertical"
  >
    <ConnectFieldset
      :label="$t('label.payment')"
      orientation="horizontal"
      padding-class="xy-default"
      :show-error-msg="formRef?.formRef?.getErrors()[0]?.message === $t('validation.selectAPaymentOption')"
      :error="formRef?.formRef?.getErrors()[0]"
    >
      <StaffPayment
        ref="staff-pay-ref"
        v-model="staffPayment"
        :disabled="initializing"
        :show-priority="true"
        name="staffPayment"
        :enable-auto-reset="!initializing"
        :hide-no-option-error-text="true"
      />
    </ConnectFieldset>
  </ConnectFieldset>
</template>
