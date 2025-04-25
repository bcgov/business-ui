<script setup lang="ts">
const { t } = useI18n()
const rtc = useRuntimeConfig().public
const officerStore = useOfficerStore()
const feeStore = useConnectFeeStore()
const accountStore = useConnectAccountStore()
const { setButtonControl, handleButtonLoading } = useButtonControl()
const route = useRoute()
const modal = useModal()

useHead({
  title: t('page.officerChange.title')
})

definePageMeta({
  layout: 'form',
  middleware: () => {
    // redirect to reg home with return url if user unauthenticated
    const { $keycloak, $config } = useNuxtApp()
    if (!$keycloak.authenticated) {
      const returnUrl = encodeURIComponent(window.location.href)
      return navigateTo(
        `${$config.public.registryHomeUrl}login?return=${returnUrl}`,
        { external: true }
      )
    }
  }
})

const businessId = route.params.businessId as string

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

async function cancelFiling() {
  if (officerStore.hasChanges) {
    await modal.openBaseModal(
      t('modal.unsavedChanges.title'),
      t('modal.unsavedChanges.description'),
      false,
      [
        { label: t('btn.keepEditing'), variant: 'outline', size: 'xl', shouldClose: true },
        {
          label: t('btn.exitWithoutSaving'),
          size: 'xl',
          to: `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`,
          external: true
        }
      ]
    )
  }
}

// TODO: Implement after API ready
setButtonControl({
  leftButtons: [
    { onClick: () => console.info('save'), label: t('btn.save'), variant: 'outline' },
    { onClick: () => console.info('save exit'), label: t('btn.saveExit'), variant: 'outline' }
  ],
  rightButtons: [
    { onClick: cancelFiling, label: t('btn.cancel'), variant: 'outline' },
    { onClick: submitFiling, label: t('btn.submit'), trailingIcon: 'i-mdi-chevron-right' }
  ]
})

// init officers on mount and when account changes
// update breadcrumbs when account changes
watch(
  () => accountStore.currentAccount.id,
  async (id) => {
    await officerStore.initOfficerStore(businessId)

    setBreadcrumbs([
      {
        label: t('label.bcRegistriesDashboard'),
        to: `${rtc.registryHomeUrl}dashboard`,
        external: true
      },
      {
        label: t('label.myBusinessRegistry'),
        to: `${rtc.brdUrl}account/${id}`,
        external: true
      },
      {
        label: officerStore.activeBusiness.legalName,
        to: `${rtc.businessDashboardUrl + businessId}`,
        appendAccountId: true,
        external: true
      },
      {
        label: t('page.officerChange.h1')
      }
    ])
  },
  { immediate: true }
)

// show browser error if unsaved changes
function onBeforeUnload(event: BeforeUnloadEvent) {
  if (officerStore.hasChanges) {
    event.preventDefault()
    // legacy browsers
    event.returnValue = true
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', onBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
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
