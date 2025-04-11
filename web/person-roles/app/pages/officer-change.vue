<script setup lang="ts">
const { t } = useI18n()
const officerStore = useOfficerStore()
const feeStore = useConnectFeeStore()
// const legalApi = useLegalApi()
// const authApi = useAuthApi()
const { setButtonControl, handleButtonLoading } = useButtonControl()

useHead({
  title: t('page.officerChange.title')
})

definePageMeta({
  layout: 'form'
})

// TODO: get fee from pay api?
// set empty fee
feeStore.feeOptions.showServiceFees = false
feeStore.fees = {
  OFFICER_CHANGE: {
    filingFees: 0,
    filingType: 'Officer change fee',
    filingTypeCode: 'OFFICER_CHANGE',
    futureEffectiveFees: 0,
    priorityFees: 0,
    processingFees: 0,
    serviceFees: 0,
    tax: {
      gst: 0,
      pst: 0
    },
    total: 0,
    waived: true
  }
}

async function onFormSubmit(data: Partial<Officer>) {
  officerStore.addNewOfficer(data as Officer)
  officerStore.addingOfficer = false
}

// TODO: Implement after API ready
async function submitFiling() {
  console.info('submit')
  handleButtonLoading(false, 'right', 1)
  await sleep(1000)
  handleButtonLoading(true)
}

// TODO: Implement after API ready
setButtonControl({
  leftButtons: [
    { onClick: () => console.info('save'), label: t('btn.save'), variant: 'outline' },
    { onClick: () => console.info('save exit'), label: t('btn.saveExit'), variant: 'outline' }
  ],
  rightButtons: [
    { onClick: () => console.info('cancel'), label: t('btn.cancel'), variant: 'outline' },
    { onClick: submitFiling, label: t('btn.submit'), trailingIcon: 'i-mdi-chevron-right' }
  ]
})

// TODO: load from legal api
onMounted(async () => {
  // const { $authApi } = useNuxtApp()

  // BC0489906
  // BC0357453
  // BC0146898

  //   // const res = await $legalApi('/businesses/BC0871274/filings').catch()
  // const res = await $legalApi('/businesses/BC0871274/parties').catch()
  // const res2 = await $legalApi('/businesses/BC0871274/addresses').catch()
  // const res2 = await legalApi.getBusiness('BC1239315', true).catch()
  // const res3 = await legalApi.getParties('BC1239315', 'officer').catch()
  // const res4 = await $authApi('/orgs/3879/affiliations').catch()
  // const res5 = await authApi.getAuthInfo('BC1239315').catch()

  await officerStore.initOfficerStore('BC1239315')

  // console.log(res)
  // console.log(res2)
  // console.log(res3)
  // console.log(res4)
  // console.log(res5)
})
</script>

<template>
  <div class="py-10 space-y-10">
    <h1>{{ $t('page.officerChange.h1') }}</h1>

    <UButton
      :label="$t('label.addOfficer')"
      class="px-5 py-3"
      color="primary"
      icon="i-mdi-account-plus"
      variant="outline"
      :disabled="officerStore.disableActions"
      @click="officerStore.addingOfficer = true"
    />

    <FormOfficerChange
      v-if="officerStore.addingOfficer"
      :title="$t('label.addOfficer')"
      @officer-change="onFormSubmit"
      @cancel="officerStore.addingOfficer = false"
    />

    <TableOfficerChange />
  </div>
</template>
