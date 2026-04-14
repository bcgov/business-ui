<script setup lang="ts">
const { t } = useI18n()
const store = useCorrectionStore()
const { initializing } = storeToRefs(store)
const route = useRoute()
const { setAlert: setPartiesAlert } = useFilingAlerts('manage-parties')
const { setAlert: setOfficesAlert } = useFilingAlerts('manage-offices')
const { setAlert: setReceiversAlert } = useFilingAlerts('manage-receivers')
const { setAlert: setLiquidatorsAlert } = useFilingAlerts('manage-liquidators')
const { setAlert: setSharesAlert } = useFilingAlerts('manage-share-structure')
const { setAlert: setNameTranslationsAlert } = useFilingAlerts('manage-name-translations')
const { breadcrumbs, dashboardUrl } = useFilingNavigation(t('page.correction.h1'))
const modal = useFilingModals()
const {
  handleButtonLoading,
  setAlertText: setBtnCtrlAlert
} = useConnectButtonControl()

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
    [() => store.companyName.old.legalName, () => store.companyName.new.legalName]
  ],
  // At least one correctable section must have changes to allow submission
  () => {
    const hasValidComment = !!store.formState.comment?.detail?.trim()

    return store.directors.some(d => d.new.actions.length > 0)
      || store.receivers.some(r => r.new.actions.length > 0)
      || store.liquidators.some(l => l.new.actions.length > 0)
      || store.offices.some(o => o.new.actions?.length > 0)
      || store.shareClasses.some(sc => sc.new.actions.length > 0)
      || store.nameTranslations.some(nt => nt.new.actions.length > 0)
      || (store.hasCommentChanges && hasValidComment)
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

/** Formatted date of the original filing (e.g. "February 8, 2021") */
const originalFilingDate = computed(() => {
  if (!store.correctedFilingDate) {
    return ''
  }
  return toReadableDate(store.correctedFilingDate)
})

function checkActiveSubForm() {
  const alertMsg = t('text.finishTaskBeforeOtherChanges')
  const hasActiveSubForm
    = (store.formState.activeOffice && setOfficesAlert('office-address-form', alertMsg))
      || (store.formState.activeDirector && setPartiesAlert('party-details-form', alertMsg))
      || (store.formState.activeReceiver && setReceiversAlert('party-details-form', alertMsg))
      || (store.formState.activeLiquidator && setLiquidatorsAlert('party-details-form', alertMsg))
      || (store.formState.activeClass && setSharesAlert('share-class-form', alertMsg))
      || (store.formState.activeSeries && setSharesAlert('share-series-form', alertMsg))
      || (store.formState.activeNameTranslation !== undefined
        && setNameTranslationsAlert('name-translation-form', alertMsg))

  return hasActiveSubForm
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
    console.log(error)
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
</script>

<template>
  <div class="py-6 space-y-6 sm:py-10 sm:space-y-10">
    <ConnectSpinner v-if="initializing" fullscreen />
    <div class="space-y-2">
      <h1 id="filing-h1">
        {{ $t('page.correction.h1') }}
      </h1>
      <p v-if="originalFilingDate">
        <strong>{{ $t('label.originalFilingDate') }}:</strong> {{ originalFilingDate }}
      </p>
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
