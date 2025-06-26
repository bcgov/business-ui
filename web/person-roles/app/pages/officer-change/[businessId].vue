<script setup lang="ts">
import { FetchError } from 'ofetch'

const { t } = useI18n()
const rtc = useRuntimeConfig().public
const urlParams = useUrlSearchParams()
const route = useRoute()
const officerStore = useOfficerStore()
const feeStore = useConnectFeeStore()
const accountStore = useConnectAccountStore()
const { setButtonControl, handleButtonLoading } = useButtonControl()
const modal = useModal()
const legalApi = useLegalApi()

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

// TODO: how to not run this if the users sessions was expired, save draft automatically? ignore changes and logout?
// show browser error if unsaved changes
function onBeforeUnload(event: BeforeUnloadEvent) {
  if (officerStore.hasChanges) {
    event.preventDefault()
    // legacy browsers
    event.returnValue = true
  }
}

const { revoke: revokeBeforeUnloadEvent } = useWindowEventListener('beforeunload', onBeforeUnload)

async function onFormSubmit(data: Partial<Officer>) {
  officerStore.addNewOfficer(data as Officer)
  officerStore.addingOfficer = false
}

async function submitFiling() {
  try {
    handleButtonLoading(false, 'right', 1)

    const payload = {
      relationships: formatOfficerPayload(JSON.parse(JSON.stringify(officerStore.officerTableState)))
    }

    // submit filing
    const res = await legalApi.postFiling(officerStore.activeBusiness, 'changeOfOfficers', payload)
    revokeBeforeUnloadEvent()
    // TODO: remove log before prod
    console.info('POST RESPONSE: ', res)
    // navigate to business dashboard if filing does *not* fail
    await navigateTo(
      `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`,
      {
        external: true
      }
    )
  } catch (error) {
    const statusCode = error instanceof FetchError
      ? error.response?.status
      : undefined

    modal.openBaseErrorModal(
      statusCode,
      'error.submitFiling'
    )
  } finally {
    // await sleep(1000)
    handleButtonLoading(true)
  }
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
  } else {
    await navigateTo(
      `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`,
      {
        external: true
      }
    )
  }
}

// FILING ID: 199208
// REMOVED NANCY
async function saveFiling(resumeLater = false) {
  try {
    handleButtonLoading(false, 'left', 0)

    // const payload = {
    //   relationships: formatOfficerPayload(JSON.parse(JSON.stringify(officerStore.officerTableState)))
    // }

    const draftId = (urlParams.draft as string) ?? undefined

    // submit filing
    const res = await legalApi.saveOrUpdateDraftFiling(
      officerStore.activeBusiness,
      'changeOfOfficers',
      JSON.parse(JSON.stringify(officerStore.officerTableState)),
      false,
      draftId
    )
    // TODO: remove log before prod
    console.info('RESPONSE: ', res)

    urlParams.draft = String(res.filing.header.filingId)

    if (resumeLater) {
      revokeBeforeUnloadEvent()
      await navigateTo(
        `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`,
        {
          external: true
        }
      )
    }
  } catch (error) {
    logFetchError(error, 'Error submitting officer filing')

    const statusCode = error instanceof FetchError
      ? error.response?.status
      : undefined

    modal.openBaseErrorModal(
      statusCode,
      'error.submitFiling'
    )
  } finally {
    // await sleep(2000)
    handleButtonLoading(true)
  }
}

// TODO: Implement after API ready
setButtonControl({
  leftButtons: [
    { onClick: () => saveFiling(), label: t('btn.save'), variant: 'outline' },
    { onClick: () => saveFiling(true), label: t('btn.saveExit'), variant: 'outline' }
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
    const draftId = (urlParams.draft as string) ?? undefined
    await officerStore.initOfficerStore(businessId, draftId)

    setBreadcrumbs([
      {
        label: t('label.bcRegistriesDashboard'),
        to: `${rtc.registryHomeUrl}dashboard`,
        external: true,
        appendAccountId: true
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
