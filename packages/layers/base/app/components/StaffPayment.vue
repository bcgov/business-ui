<script setup lang="ts">
import type { RadioGroupItem } from '@nuxt/ui'

const staffPayment = defineModel<StaffPayment>({ required: true })
defineProps<{ showPriority?: boolean }>()

const { t } = useI18n()

const feeStore = useConnectFeeStore()

const staffPayStore = useStaffPaymentStore()
// const { staffPayment } = storeToRefs(staffPayStore)

const radioItems = ref<RadioGroupItem[]>(
  [
    { label: t('label.cashOrCheque'), value: StaffPaymentOption.FAS },
    { label: t('label.bcOnLine'), value: StaffPaymentOption.BCOL },
    { label: t('label.noFee'), value: StaffPaymentOption.NO_FEE }
  ]
)

const staffPaymentForm = useTemplateRef('staffPaymentForm')
watch(() => staffPayment.value.option, async (val) => {
  feeStore.updateAllFees(staffPayment.value.isPriority, val === StaffPaymentOption.NO_FEE)
  staffPayStore.$clearOptionData()
  // NB: needs to render in the dom before clearing the validation.
  await nextTick()
  staffPaymentForm.value?.clear()
})

watch(() => staffPayment.value.isPriority, (val) => {
  feeStore.updateAllFees(val, staffPayment.value.option === StaffPaymentOption.NO_FEE)
})
</script>

<template>
  <UForm
    ref="staffPaymentForm"
    class="space-y-4"
    :schema="staffPayStore.staffPaymentSchema"
    nested
  >
    <Divide class="*:pt-8" orientation="vertical">
      <UFormField name="option" :ui="{ error: 'text-base p-0' }">
        <URadioGroup
          v-model="staffPayment.option"
          :items="radioItems"
          size="xl"
          :ui="{ base: 'cursor-pointer', label: 'cursor-pointer w-fit' }"
        >
          <template #description="{ item }">
            <div class="py-3">
              <template v-if="item.value === StaffPaymentOption.FAS">
                <ConnectFormInput
                  v-model="staffPayment.routingSlipNumber"
                  :disabled="staffPayment.option !== item.value"
                  :class="{ 'opacity-75': staffPayment.option !== item.value }"
                  input-id="routingslipinput"
                  :label="$t('label.routingSlipNumber')"
                  name="routingSlipNumber"
                  required
                />
              </template>
              <template v-else-if="item.value === StaffPaymentOption.BCOL">
                <div class="space-y-3">
                  <ConnectFormInput
                    v-model="staffPayment.bcolAccountNumber"
                    :disabled="staffPayment.option !== item.value"
                    :class="{ 'opacity-75': staffPayment.option !== item.value }"
                    input-id="bcolnumberinput"
                    :label="$t('label.bcOnLineAccountNumber')"
                    name="bcolAccountNumber"
                    required
                  />
                  <ConnectFormInput
                    v-model="staffPayment.datNumber"
                    :disabled="staffPayment.option !== item.value"
                    :class="{ 'opacity-75': staffPayment.option !== item.value }"
                    input-id="datnumberinput"
                    :label="$t('label.datNumber')"
                    name="datNumber"
                    required
                  />
                  <ConnectFormInput
                    v-model="staffPayment.folioNumber"
                    :disabled="staffPayment.option !== item.value"
                    :class="{ 'opacity-75': staffPayment.option !== item.value }"
                    input-id="folionumber"
                    :label="$t('label.folioNumberOpt')"
                    name="folioNumber"
                    required
                  />
                </div>
              </template>
            </div>
          </template>
        </URadioGroup>
      </UFormField>
      <UCheckbox
        v-if="showPriority"
        v-model="staffPayment.isPriority"
        :label="$t('label.priorityStaffPay')"
        :ui="{ label: 'text-base' }"
      />
    </Divide>
  </UForm>
</template>
