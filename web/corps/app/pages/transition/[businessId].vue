<script setup lang="ts">
const { t } = useI18n()
const store = useTransitionStore()
const { initializing } = storeToRefs(store)
const urlParams = useUrlSearchParams('history')
const route = useRoute()
const { setAlert: setPartiesAlert } = useFilingAlerts('manage-parties')
const { setAlert: setSharesAlert } = useFilingAlerts('manage-share-structure')
const { breadcrumbs, dashboardUrl } = useFilingNavigation(t('page.transition.h1'))
const modal = useFilingModals()
const {
  handleButtonLoading
  // setAlertText: setBtnCtrlAlert
} = useConnectButtonControl()

const businessId = route.params.businessId as string
const FILING_TYPE = FilingType.TRANSITION

definePageMeta({
  layout: 'connect-pay-tombstone-buttons-stacked',
  middleware: ['connect-auth']
})

useHead({
  title: t('page.transition.title')
})

function checkActiveSubForm() {
  const hasActiveSubForm
    = (store.formState.activeDirector && setPartiesAlert('party-details-form', t('text.finishTaskBeforeOtherChanges')))
      || (store.formState.activeClass && setSharesAlert('share-class-form', t('text.finishTaskBeforeOtherChanges')))
      || (store.formState.activeSeries && setSharesAlert('share-series-form', t('text.finishTaskBeforeOtherChanges')))

  return hasActiveSubForm
}

function reviewAndConfirm() {
  if (checkActiveSubForm()) {
    return
  }
  if (store.shareClasses.length == 0) {
    return setSharesAlert('manage-share-structure', t('text.shareStructureMustContainAtleastOneClass'))
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
  filingSubType: undefined,
  filingType: FILING_TYPE,
  draftId: urlParams.draft as string | undefined,
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
        form: 'transition-filing-step-1',
        type: 'submit',
        onClick: undefined
      }
    },
    { submitFiling: { form: 'transition-filing-step-2', type: 'submit' } }
  ],
  buttonLayout: 'stackedDefault'
})
</script>

<template>
  <div class="py-6 space-y-6 sm:py-10 sm:space-y-10">
    <ConnectSpinner v-if="initializing" fullscreen />
    <div class="space-y-2">
      <h1 id="filing-h1">
        {{ $t('page.transition.h1') }}
      </h1>
      <ConnectI18nHelper
        as="p"
        translation-path="page.transition.desc"
      />
    </div>
    <FormTransitionStep1
      v-if="currentStep === 1"
      id="transition-filing-step-1"
      @submit="reviewAndConfirm"
    />
    <FormTransitionStep2
      v-if="currentStep === 2"
      id="transition-filing-step-2"
      @submit="submitFiling"
    />
  </div>
</template>
