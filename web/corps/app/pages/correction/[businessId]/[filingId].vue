<script setup lang="ts">
/* eslint-disable max-len */
const { t } = useI18n()
const store = useCorrectionStore()
const route = useRoute()
const { breadcrumbs, dashboardUrl } = useFilingNavigation(t('page.correction.h1'))
const modal = useFilingModals()
const { handleButtonLoading, setAlertText: setBtnCtrlAlert } = useConnectButtonControl()
const { getFilingName } = useFiling()

const businessId = route.params.businessId as string
const filingId = route.params.filingId as string // the pre-created correction draft filing ID
const FILING_TYPE = FilingType.CORRECTION

const {
  canSubmit,
  canSave,
  canCancel,
  initBeforeUnload,
  revokeBeforeUnload
} = useFilingTaskGuards(
  [
    [() => store.initialFormState, () => store.formState],
    [() => store.initialDirectors, () => store.directors],
    [() => store.initialReceivers, () => store.receivers],
    [() => store.initialLiquidators, () => store.liquidators],
    [() => store.initialOffices, () => store.offices],
    [() => store.initialShareClasses, () => store.shareClasses],
    [() => store.initialNameTranslations, () => store.nameTranslations],
    [() => store.companyName.old.legalName, () => store.companyName.new.legalName],
    [() => store.initialResolutionDates, () => store.resolutionDates],
    [() => store.initialCourtOrders, () => store.courtOrders]
  ],
  // At least one correctable section must have changes to allow submission
  () => {
    return store.directors.some(d => d.new.actions.length > 0)
      || store.receivers.some(r => r.new.actions.length > 0)
      || store.liquidators.some(l => l.new.actions.length > 0)
      || store.offices.some(o => o.new.actions?.length > 0)
      || store.shareClasses.some(sc => sc.new.actions.length > 0)
      || store.resolutionDates.some(rd => rd.new.actions.length > 0)
      || store.nameTranslations.some(nt => nt.new.actions.length > 0)
      || store.companyName.new.actions.length > 0
      || store.courtOrders.some(co => co.new.actions.length > 0)
  }
)

definePageMeta({
  layout: 'connect-pay-tombstone-buttons-stacked',
  middleware: ['connect-auth']
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

function checkActiveSubForm() {
  if (!store.hasActiveSubForm) {
    return false
  }
  const alertMsg = t('text.finishTaskBeforeOtherChanges')
  return (store.formState.activeOffice && useFilingAlerts('manage-offices').setAlert('office-address-form', alertMsg))
    || (store.formState.activeDirector && useFilingAlerts('manage-parties').setAlert('party-details-form', alertMsg))
    || (store.formState.activeReceiver && useFilingAlerts('manage-receivers').setAlert('party-details-form', alertMsg))
    || (store.formState.activeLiquidator && useFilingAlerts('manage-liquidators').setAlert('party-details-form', alertMsg))
    || (store.formState.activeClass && useFilingAlerts('manage-share-structure').setAlert('share-class-form', alertMsg))
    || (store.formState.activeSeries && useFilingAlerts('manage-share-structure').setAlert('share-series-form', alertMsg))
    || (store.formState.activeResolutionDate && useFilingAlerts('manage-share-structure').setAlert('resolution-date-form', alertMsg))
    || (store.formState.activeNameTranslation && useFilingAlerts('manage-name-translations').setAlert('name-translation-form', alertMsg))
    || (store.formState.activeNameRequest && useFilingAlerts('manage-company-name').setAlert('company-name-form', alertMsg))
    || (store.formState.activeCourtOrder && useFilingAlerts('manage-court-orders').setAlert('court-order-poa-form', alertMsg))
}

function reviewAndConfirm() {
  setBtnCtrlAlert(undefined)
  if (checkActiveSubForm()) {
    return
  }
  if (!canSubmit()) {
    return setBtnCtrlAlert(t('text.noChangesToSubmit'), 'right', 1)
  }
  nextStep()
}

async function submitFiling() {
  try {
    setBtnCtrlAlert(undefined)
    if (checkActiveSubForm()) {
      return
    }
    if (!canSubmit()) {
      return setBtnCtrlAlert(t('text.noChangesToSubmit'), 'right')
    }
    handleButtonLoading(true, 'right', 1)
    await store.submit(true)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
    handleButtonLoading(false)
  } catch (error) {
    modal.openSaveFilingErrorModal(error)
    handleButtonLoading(false)
    initBeforeUnload()
  }
}

async function saveFiling(resumeLater = false, enableUnsavedChangesBlock = true) {
  try {
    if (enableUnsavedChangesBlock) {
      setBtnCtrlAlert(undefined)
      if (checkActiveSubForm()) {
        return
      }
      if (!canSave()) {
        return setBtnCtrlAlert(t('text.noChangesToSave'), 'left')
      }
    }
    await store.submit(false)
    revokeBeforeUnload()
    if (resumeLater) {
      await navigateTo(dashboardUrl.value, { external: true })
    }
  } catch (error) {
    if (enableUnsavedChangesBlock) {
      modal.openSaveFilingErrorModal(error)
      initBeforeUnload()
    }
  }
}

async function cancelFiling() {
  if (!canCancel()) {
    return
  }
  await navigateTo(dashboardUrl.value, { external: true })
}

const { currentStep, nextStep } = useFilingPageWatcher({
  store,
  businessId,
  filingType: FILING_TYPE,
  draftId: filingId, // route param filingId = the pre-created correction draft's filing ID
  breadcrumbs,
  setOnBeforeSessionExpired: async () => {
    if (canSave()) {
      await saveFiling(false, false)
    }
  },
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

watch(currentStep, (step) => {
  store.syncResolutionTableState(step === 2)
}, { immediate: true })
</script>

<template>
  <div class="py-6 space-y-6 sm:py-10 sm:space-y-10">
    <ConnectSpinner v-if="store.initializing" fullscreen />
    <div class="space-y-2">
      <h1 id="filing-h1">
        {{ $t('page.correction.h1') }}
      </h1>
      <p v-if="store.correctedFilingDateDisplay">
        <strong>{{ $t('label.originalFilingDate') }}:</strong> {{ store.correctedFilingDateDisplay }}
      </p>
      <ConnectI18nHelper
        as="p"
        translation-path="page.correction.desc"
        :filing-type="originalFilingName"
        :filing-date="store.correctedFilingDateDisplay"
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
