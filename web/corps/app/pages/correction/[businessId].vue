<script setup lang="ts">
const { t } = useI18n()
const store = useCorrectionStore()
const { initializing } = storeToRefs(store)
const route = useRoute()
const { setAlert: setPartiesAlert } = useFilingAlerts('manage-parties')
const { setAlert: setReceiversAlert } = useFilingAlerts('manage-receivers')
const { setAlert: setLiquidatorsAlert } = useFilingAlerts('manage-liquidators')
const { setAlert: setSharesAlert } = useFilingAlerts('manage-share-structure')
const { breadcrumbs, dashboardUrl } = useFilingNavigation(t('page.correction.h1'))
const modal = useFilingModals()
const {
  handleButtonLoading
} = useConnectButtonControl()

const { getFilingName } = useFiling()

const businessId = route.params.businessId as string
const filingId = route.params.filingId as string // the pre-created correction draft filing ID
const FILING_TYPE = FilingType.CORRECTION

definePageMeta({
  layout: 'connect-pay-tombstone-buttons-stacked',
  middleware: ['connect-auth'],
  path: '/correction/:businessId/:filingId'
})

useHead({
  title: t('page.correction.title')
})

/** Display name of the original filing being corrected */
const originalFilingName = computed(() => {
  if (!store.correctedFilingType || store.correctedFilingType === FilingType.UNKNOWN) {
    return ''
  }
  return getFilingName(store.correctedFilingType) ?? store.correctedFilingType
})

/** Formatted date of the original filing */
const originalFilingDate = computed(() => {
  if (!store.correctedFilingDate) {
    return ''
  }
  return store.correctedFilingDate
})

function checkActiveSubForm() {
  const alertMsg = t('text.finishTaskBeforeOtherChanges')
  const hasActiveSubForm
    = (store.formState.activeDirector && setPartiesAlert('party-details-form', alertMsg))
      || (store.formState.activeReceiver && setReceiversAlert('party-details-form', alertMsg))
      || (store.formState.activeLiquidator && setLiquidatorsAlert('party-details-form', alertMsg))
      || (store.formState.activeClass && setSharesAlert('share-class-form', alertMsg))
      || (store.formState.activeSeries && setSharesAlert('share-series-form', alertMsg))

  return hasActiveSubForm
}

function reviewAndConfirm() {
  if (checkActiveSubForm()) {
    return
  }
  nextStep()
}

async function submitFiling() {
  try {
    handleButtonLoading(true, 'right', 1)
    await store.submit(true)
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    modal.openSaveFilingErrorModal(error)
    handleButtonLoading(false)
  }
}

async function saveFiling(resumeLater = false, _disableActiveFormCheck = false) {
  try {
    await store.submit(false)
    if (resumeLater) {
      await navigateTo(dashboardUrl.value, { external: true })
    }
  } catch (error) {
    modal.openSaveFilingErrorModal(error)
  }
}

async function cancelFiling() {
  await navigateTo(dashboardUrl.value, { external: true })
}

const { currentStep, nextStep } = useFilingPageWatcher({
  store,
  businessId,
  filingType: FILING_TYPE,
  draftId: filingId, // route param filingId = the pre-created correction draft's filing ID
  breadcrumbs,
  setOnBeforeSessionExpired: () => saveFiling(),
  backButton: { removeAlertSpacing: true },
  saveFiling: { onClick: () => saveFiling(true), removeAlertSpacing: true, class: 'min-w-[300px] justify-center' },
  cancelFiling: { onClick: cancelFiling, removeAlertSpacing: true },
  submitFiling: { removeAlertSpacing: true, class: 'min-w-[300px] justify-center' },
  steps: [
    {
      cancelFiling: { class: 'min-w-[300px] justify-center' },
      submitFiling: {
        label: t('label.reviewAndConfirm'),
        form: 'correction-filing-step-1',
        type: 'submit',
        onClick: undefined
      }
    },
    { submitFiling: { form: 'correction-filing-step-2', type: 'submit' } }
  ],
  buttonLayout: 'stackedDefault'
})
</script>

<template>
  <div class="py-6 space-y-6 sm:py-10 sm:space-y-10">
    <ConnectSpinner v-if="initializing" fullscreen />
    <div class="space-y-2">
      <h1 id="filing-h1">
        {{ $t('page.correction.h1') }}
      </h1>
      <ConnectI18nHelper
        as="p"
        translation-path="page.correction.desc"
        :filing-type="originalFilingName"
        :filing-date="originalFilingDate"
      />
    </div>
    <FormCorrectionStep1
      v-if="currentStep === 1"
      id="correction-filing-step-1"
      @submit="reviewAndConfirm"
    />
    <FormCorrectionStep2
      v-if="currentStep === 2"
      id="correction-filing-step-2"
      @submit="submitFiling"
    />
  </div>
</template>
