<script setup lang="ts">
const FEE_CODE = 'TRANP'
const filingStore = usePostRestorationTransitionApplicationStore()
const feeStore = useConnectFeeStore()
const {
  feeOptions,
  fees
} = storeToRefs(feeStore)
const errorStore = usePostRestorationErrorsStore()
const {
  staffPayErrors
} = storeToRefs(errorStore)
  
const { staffPay } = storeToRefs(filingStore)

const revalidateIfHasErrors = (errorField: string) => {
  if (staffPayErrors.value[errorField]?.[0]) {
    errorStore.verifyStaffPay(staffPay.value)
  }
}

const getError = (errorField: string) => {
  return staffPayErrors.value[errorField]?.[0]
}

const updatePriority = async () => {
  feeOptions.value.showPriorityFees = staffPay.value.priority
  const fee = JSON.parse(JSON.stringify(fees.value[FEE_CODE]))
  fee.priorityFees = staffPay.value.priority ? 100 : 0
  fee.serviceFees = 0
  fee.total = fee.filingFees + fee.priorityFees
  feeStore.addReplaceFee(fee)
}

const updatePaymentMethod = () => {
  const fee = JSON.parse(JSON.stringify(fees.value[FEE_CODE]))
  if (staffPay.value.paymentMethod === STAFF_PAY_PAYMENT_METHODS[2]) {
    fee.waived = true
  }
  else {
    fee.waived = false
  }
  feeStore.addReplaceFee(fee)
}

</script>

<template>
  <div class="space-y-3">
    <!-- Cash or cheque-->
    <URadioGroup
      v-model="staffPay.paymentMethod"
      size="xl"
      :items="[{label: $t('label.cashOrCheque'), value: STAFF_PAY_PAYMENT_METHODS[0]}]"
      :ui="{
        label: 'text-base'
      }"
      @change="updatePaymentMethod()"
    />
    <UFormField 
      :error="$te(getError('routingSlipNumber')) ? $t(getError('routingSlipNumber')) : getError('routingSlipNumber')"
      class="ml-6 mb-6"
    >
      <UInput
        v-model="staffPay.routingSlipNumber"
        :placeholder="$t('label.routingSlipNumber')"
        class="w-full"
        @blur="revalidateIfHasErrors('routingSlipNumber')"
      />
    </UFormField>

    <!-- BC Online -->
    <URadioGroup
      v-model="staffPay.paymentMethod"
      size="xl"
      :items="[{label: $t('label.bcOnline'), value: STAFF_PAY_PAYMENT_METHODS[1]}]"
      :ui="{
        label: 'text-base'
      }"
      @change="updatePaymentMethod()"
    />
    <UFormField 
      :error="$te(getError('bcOnlineAccountNumber')) ? $t(getError('bcOnlineAccountNumber')) : getError('bcOnlineAccountNumber')"
      class="ml-6 mb-6"
    >
      <UInput
        v-model="staffPay.bcOnlineAccountNumber"
        :placeholder="$t('label.bcOnlineAccountNumber')"
        class="w-full"
        @blur="revalidateIfHasErrors('bcOnlineAccountNumber')"
      />
    </UFormField>
    <UFormField 
      :error="$te(getError('datNumber')) ? $t(getError('datNumber')) : getError('datNumber')"
      class="ml-6 mb-6"
    >
      <UInput
        v-model="staffPay.datNumber"
        :placeholder="$t('label.datNumber')"
        class="w-full"
        @blur="revalidateIfHasErrors('datNumber')"
      />
    </UFormField>
    <UFormField 
      :error="$te(getError('folioNumber')) ? $t(getError('folioNumber')) : getError('folioNumber')"
      class="ml-6 mb-6"
    >
      <UInput
        v-model="staffPay.folioNumber"
        :placeholder="$t('label.folioNumber')"
        class="w-full"
        @blur="revalidateIfHasErrors('folioNumber')"
      />
    </UFormField>

    <!-- No Fee -->
    <URadioGroup
      v-model="staffPay.paymentMethod"
      size="xl"
      :items="[{label: $t('label.noFee'), value: STAFF_PAY_PAYMENT_METHODS[2]}]"
      :ui="{
        label: 'text-base'
      }"
      @change="updatePaymentMethod()"
    />
    
    <hr class="border-bcGovGray-300" />

    <UCheckbox
      v-model="staffPay.priority"
      size="xl"
      :label="$t('label.priority')"
      :ui="{
        label: 'ml-2 text-base'
      }"
      @update:modelValue="updatePriority"
    />
  </div>
</template>