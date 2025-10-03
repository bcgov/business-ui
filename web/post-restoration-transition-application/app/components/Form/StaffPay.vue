<script setup lang="ts">
import { STAFF_PAY_PAYMENT_METHODS } from '~/enum/staff_pay_methods'

const FEE_CODE = 'TRANP'
const filingStore = usePostRestorationTransitionApplicationStore()
const feeStore = useConnectFeeStore()
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
  feeStore.addReplaceFee(FEE_CODE, { priority: staffPay.value.priority })
}

const updatePaymentMethod = () => {
  feeStore.addReplaceFee(FEE_CODE, { waived: staffPay.value.paymentMethod === STAFF_PAY_PAYMENT_METHODS.NONE })
}
</script>

<template>
  <div class="space-y-3">
    <!-- Cash or cheque -->
    <URadioGroup
      v-model="staffPay.paymentMethod"
      size="xl"
      :items="[{ label: $t('label.cashOrCheque'), value: STAFF_PAY_PAYMENT_METHODS.CASH }]"
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
        :disabled="staffPay.paymentMethod !== STAFF_PAY_PAYMENT_METHODS.CASH"
        :placeholder="$t('label.routingSlipNumber')"
        class="w-full"
        @blur="revalidateIfHasErrors('routingSlipNumber')"
      />
    </UFormField>

    <!-- BC Online -->
    <URadioGroup
      v-model="staffPay.paymentMethod"
      size="xl"
      :items="[{ label: $t('label.bcOnline'), value: STAFF_PAY_PAYMENT_METHODS.BCONLINE }]"
      :ui="{
        label: 'text-base'
      }"
      @change="updatePaymentMethod()"
    />
    <UFormField
      :error="$te(getError('bcOnlineAccountNumber'))
        ? $t(getError('bcOnlineAccountNumber'))
        : getError('bcOnlineAccountNumber')"
      class="ml-6 mb-6"
    >
      <UInput
        v-model="staffPay.bcOnlineAccountNumber"
        :placeholder="$t('label.bcOnlineAccountNumber')"
        :disabled="staffPay.paymentMethod !== STAFF_PAY_PAYMENT_METHODS.BCONLINE"
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
        :disabled="staffPay.paymentMethod !== STAFF_PAY_PAYMENT_METHODS.BCONLINE"
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
        :disabled="staffPay.paymentMethod !== STAFF_PAY_PAYMENT_METHODS.BCONLINE"
        :placeholder="$t('label.folioNumber')"
        class="w-full"
        @blur="revalidateIfHasErrors('folioNumber')"
      />
    </UFormField>

    <!-- No Fee -->
    <URadioGroup
      v-model="staffPay.paymentMethod"
      size="xl"
      :items="[{ label: $t('label.noFee'), value: STAFF_PAY_PAYMENT_METHODS.NONE }]"
      :ui="{
        label: 'text-base'
      }"
      @change="updatePaymentMethod()"
    />

    <hr class="border-bcGovGray-300">

    <UCheckbox
      v-model="staffPay.priority"
      size="xl"
      :label="$t('label.priority')"
      :ui="{
        label: 'ml-2 text-base'
      }"
      @update:model-value="updatePriority"
    />
  </div>
</template>
