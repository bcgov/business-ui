<script setup lang="ts">
import { omit } from 'es-toolkit'

const { t } = useI18n()
const store = useCourtOrderStore()
const { initializing } = storeToRefs(store)
const route = useRoute()
const modal = useFilingModals()
const { handleButtonLoading, setAlertText: setBtnCtrlAlert } = useConnectButtonControl()

const businessId = route.params.businessId as string
const filingId = route.params.filingId as string // the pre-created court order draft filing ID
const FILING_TYPE = FilingType.COURT_ORDER

const filingText = {
  h1: t('page.courtOrder.h1'),
  title: t('page.courtOrder.title')
}

const { breadcrumbs, dashboardUrl } = useFilingNavigation(filingText.h1)

definePageMeta({
  layout: 'connect-pay-tombstone-buttons-stacked',
  middleware: ['connect-auth']
})

useHead({
  title: filingText.title
})

// the supporting documents checkbox is UI only: checking it alone is not an unsaved change
function withoutUiOnlyFields(state: CourtOrderFormSchema) {
  return state.courtOrder ? { ...state, courtOrder: omit(state.courtOrder, ['hasSupportingDocs']) } : state
}

// no canSubmit check - the court order schema enforces the required filing data
const {
  canSave,
  canCancel,
  initBeforeUnload,
  revokeBeforeUnload
} = useFilingTaskGuards(
  [
    [() => withoutUiOnlyFields(store.initialFormState), () => withoutUiOnlyFields(store.formState)]
  ]
)

// step 1 only submits (and so reaches here) once the court order section validates
function reviewAndConfirm() {
  // an upload still in progress has no file key yet and would be left out of the filing
  if (store.formState.courtOrder.files.some(file => file.status === CourtOrderFileStatus.LOADING)) {
    return setBtnCtrlAlert(t('validation.waitForDocumentUploads'), 'right', 1)
  }
  setBtnCtrlAlert(undefined)
  nextStep()
}

async function submitFiling() {
  try {
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

async function saveFiling(enableUnsavedChangesBlock = true) {
  try {
    if (enableUnsavedChangesBlock && !canSave()) {
      return setBtnCtrlAlert(t('text.noChangesToSave'), 'right', 0)
    }
    await store.submit(false)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    if (enableUnsavedChangesBlock) {
      await modal.openSaveFilingErrorModal(error)
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
  draftId: filingId, // route param filingId = the pre-created court order draft's filing ID
  backButton: { removeAlertSpacing: true },
  saveFiling: { onClick: () => saveFiling(true), removeAlertSpacing: true, class: 'min-w-[300px] justify-center' },
  cancelFiling: { onClick: cancelFiling, removeAlertSpacing: true },
  submitFiling: { removeAlertSpacing: true, class: 'min-w-[300px] justify-center' },
  steps: [
    {
      cancelFiling: { class: 'min-w-[300px] justify-center' },
      submitFiling: {
        label: t('label.reviewAndConfirm'),
        form: 'court-order-filing-step-1',
        type: 'submit',
        onClick: undefined
      }
    },
    { submitFiling: { form: 'court-order-filing-step-2', type: 'submit' } }
  ],
  breadcrumbs,
  setOnBeforeSessionExpired: async () => {
    if (canSave()) {
      await saveFiling(false)
    }
  },
  buttonLayout: 'stackedDefault'
})
</script>

<template>
  <div class="py-6 space-y-6 sm:py-10 sm:space-y-10">
    <ConnectSpinner v-if="initializing" fullscreen />
    <h1 id="filing-h1">
      {{ filingText.h1 }}
    </h1>
    <AlertDraftRebase />
    <!-- v-show (not v-if): keeps the upload session state (hard delete on remove) across Back -->
    <FormCourtOrderStep1
      v-show="currentStep === 1"
      id="court-order-filing-step-1"
      @submit="reviewAndConfirm"
    />
    <FormCourtOrderStep2
      v-if="currentStep === 2"
      id="court-order-filing-step-2"
      @submit="submitFiling"
    />
  </div>
</template>
