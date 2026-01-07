<script setup lang="ts">
import type { Form, RadioGroupItem } from '@nuxt/ui'

const staffPayment = defineModel<StaffPaymentSchema>({ required: true })
const { enableAutoReset = true } = defineProps<{
  showPriority?: boolean
  enableAutoReset?: boolean
}>()

const { t } = useI18n()

const feeStore = useConnectFeeStore()

const staffPayStore = useStaffPaymentStore()

const schema = getStaffPaymentSchema()

const resetOptionData = () => {
  staffPayment.value = {
    ...staffPayStore.getEmptyStaffPayment(),
    isPriority: staffPayment.value.isPriority,
    option: staffPayment.value.option
  }
}

const radioItems: RadioGroupItem[] = [
  { label: t('label.cashOrCheque'), value: StaffPaymentOption.FAS },
  { label: t('label.bcOnLine'), value: StaffPaymentOption.BCOL },
  { label: t('label.noFee'), value: StaffPaymentOption.NO_FEE }
]

const staffPaymentForm = useTemplateRef<Form<StaffPaymentSchema>>('staffPaymentForm')
watch(() => staffPayment.value.option, async (val) => {
  feeStore.updateAllFees(staffPayment.value.isPriority, val === StaffPaymentOption.NO_FEE)

  if (enableAutoReset) {
    resetOptionData()
  }
  // NB: needs to render in the dom before clearing the validation.
  await nextTick()
  staffPaymentForm.value?.clear()
})

watch(() => staffPayment.value.isPriority, (val) => {
  feeStore.updateAllFees(val, staffPayment.value.option === StaffPaymentOption.NO_FEE)
})

function setFocusOnError() {
  // @ts-expect-error - $el not typed on form ref // TODO: this should be fixed in th elatest verison of nuxt ui
  // shouldn't need to use .$el anymore
  const form = staffPaymentForm.value?.$el as HTMLDivElement | undefined

  if (form) {
    const radio = form.querySelector('button[role="radio"][value="NO_FEE"]')
    if (radio) {
      radio.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        (radio as HTMLButtonElement).focus({ preventScroll: true })
      }, 0)
    }
  }
}

defineExpose({
  setFocusOnError
})
</script>

<template>
  <UForm
    ref="staffPaymentForm"
    class="space-y-4"
    :schema
    nested
  >
    <Divide class="*:pt-8" orientation="vertical">
      <UFormField name="option" :ui="{ error: 'text-base p-0' }">
        <URadioGroup
          v-model="staffPayment.option"
          :items="radioItems"
          size="xl"
          required
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
