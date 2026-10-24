<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import type { FetchError } from 'ofetch'

const { t, tm, rt } = useI18n()
const store = useAgmLocationChangeStore()
const { initializing } = storeToRefs(store)
const route = useRoute()
const modal = useFilingModals()
const { handleButtonLoading, setAlertText: setBtnCtrlAlert } = useConnectButtonControl()
const urlParams = useUrlSearchParams('history')

const businessId = route.params.businessId as string
const FILING_TYPE = FilingType.AGM_LOCATION_CHANGE

const filingText = {
  h1: t('page.agmLocationChange.h1'),
  reviewH1: t('page.agmLocationChange.reviewH1'),
  title: t('page.agmLocationChange.title')
}

const { breadcrumbs, dashboardUrl } = useFilingNavigation(filingText.h1)

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

useHead({
  title: filingText.title
})

const {
  canSave,
  canCancel,
  initBeforeUnload,
  revokeBeforeUnload
} = useFilingTaskGuards(
  [
    [() => store.initialFormState, () => store.formState]
  ]
)

function onStepError(event: FormErrorEvent) {
  onFormSubmitError(event)
  setBtnCtrlAlert(t('validation.pleaseCompleteRequiredInfo'), 'right', 1)
}

function reviewAndConfirm() {
  setBtnCtrlAlert(undefined)
  nextStep()
}

async function submitFiling() {
  try {
    setBtnCtrlAlert(undefined)
    handleButtonLoading(true, 'right', 1)
    await store.submit(true)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    const e = error as FetchError<AgmLocationChangeDraftState>
    const filingResp = e.response?._data
    urlParams.draft = String(filingResp?.filing?.header?.filingId)
    modal.openSaveFilingErrorModal(error)
    handleButtonLoading(false)
    initBeforeUnload()
  }
}

async function saveFiling(enableUnsavedChangesBlock = true) {
  try {
    if (enableUnsavedChangesBlock && !canSave()) {
      return setBtnCtrlAlert(t('text.noChangesToSave'), 'left')
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
  draftId: urlParams.draft as string | undefined,
  breadcrumbs,
  saveFiling: { onClick: () => saveFiling(true) },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'agm-location-change-filing-step-2' },
  steps: [
    {
      submitFiling: {
        label: t('label.reviewAndConfirm'),
        form: 'agm-location-change-filing-step-1',
        type: 'submit',
        onClick: undefined
      }
    },
    { submitFiling: { label: t('label.fileAndPay') } }
  ],
  setOnBeforeSessionExpired: async () => {
    if (canSave()) {
      await saveFiling(false)
    }
  }
})
</script>

<template>
  <div class="py-6 space-y-6 sm:py-10 sm:space-y-10">
    <ConnectSpinner v-if="initializing" fullscreen />

    <div class="space-y-4">
      <h1>{{ currentStep === 1 ? filingText.h1 : filingText.reviewH1 }}</h1>
      <HelpExpansion v-if="currentStep === 1" :label="$t('page.agmLocationChange.helpLabel')">
        <p>{{ $t('page.agmLocationChange.helpText') }}</p>
        <p>{{ $t('page.agmLocationChange.helpExceptionsTitle') }}</p>
        <ul class="list-disc pl-6 space-y-1">
          <li v-for="(item, i) in (tm('page.agmLocationChange.helpExceptions') as unknown[])" :key="i">
            {{ rt(item as string) }}
          </li>
        </ul>
      </HelpExpansion>
    </div>

    <FormAgmLocationChangeStep1
      v-if="currentStep === 1"
      id="agm-location-change-filing-step-1"
      :aria-label="filingText.h1"
      @submit="reviewAndConfirm"
      @error="onStepError"
    />
    <FormAgmLocationChangeStep2
      v-if="currentStep === 2"
      id="agm-location-change-filing-step-2"
      :aria-label="filingText.reviewH1"
      @submit="submitFiling"
      @error="onStepError"
    />
  </div>
</template>
