<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import type { FetchError } from 'ofetch'
import type { FormTransitionStep1 } from '#components'
import { omit } from 'es-toolkit'

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
  handleButtonLoading,
  setAlertText: setBtnCtrlAlert
} = useConnectButtonControl()
const step1Ref = useTemplateRef<InstanceType<typeof FormTransitionStep1>>('step-1-ref')

const businessId = route.params.businessId as string
const FILING_TYPE = FilingType.TRANSITION

const {
  canSave,
  canCancel,
  initBeforeUnload,
  revokeBeforeUnload
} = useFilingTaskGuards(
  [
    [
      () => omit(store.initialFormState, ['confirmDirectors', 'confirmOffices']),
      () => omit(store.formState, ['confirmDirectors', 'confirmOffices'])
    ],
    [() => store.initialDirectors, () => store.directors],
    [() => store.initialShareClasses, () => store.shareClasses]
  ]
)

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

async function reviewAndConfirm() {
  try {
    await step1Ref.value?.formRef?.validate()
    if (checkActiveSubForm()) {
      return
    }
    if (store.shareClasses.filter(sc => !sc.new.actions.includes(ActionType.REMOVED)).length === 0) {
      setSharesAlert('manage-share-structure', t('text.shareStructureMustContainAtleastOneClass'))
      throw new Error('missing-share-structure')
    }
    nextStep()
  } catch (e) {
    if (e && typeof e === 'object' && 'errors' in e) {
      onFormSubmitError(e as FormErrorEvent)
    }
    setBtnCtrlAlert(t('validation.pleaseCompleteRequiredInfo'), 'right', 1)
  }
}

async function submitFiling() {
  try {
    handleButtonLoading(true, 'right', 1)
    await store.submit(true)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    const e = error as FetchError<TransitionDraftState>
    // in case there was a failure and it saved a draft
    const filingResp = e.response?._data
    const urlParams = useUrlSearchParams()
    urlParams.draft = String(filingResp?.filing?.header?.filingId)
    modal.openSaveFilingErrorModal(error)
    handleButtonLoading(false)
    initBeforeUnload()
  }
}

async function saveFiling(enableUnsavedChangesBlock = true) {
  try {
    if (enableUnsavedChangesBlock) {
      if (checkActiveSubForm()) {
        return
      }
      if (!canSave()) {
        return setBtnCtrlAlert(t('text.noChangesToSave'), 'right', 0)
      }
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
  filingSubType: undefined,
  filingType: FILING_TYPE,
  draftId: urlParams.draft as string | undefined,
  breadcrumbs,
  setOnBeforeSessionExpired: async () => {
    if (canSave()) {
      await saveFiling(false)
    }
  },
  backButton: { removeAlertSpacing: true },
  saveFiling: { onClick: () => saveFiling(true), removeAlertSpacing: true, class: 'min-w-[300px] justify-center' },
  cancelFiling: { onClick: cancelFiling, removeAlertSpacing: true },
  submitFiling: { removeAlertSpacing: true, class: 'min-w-[300px] justify-center' },
  steps: [
    {
      cancelFiling: { class: 'min-w-[300px] justify-center' },
      submitFiling: { label: t('label.reviewAndConfirm'), onClick: reviewAndConfirm }
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
      ref="step-1-ref"
    />
    <FormTransitionStep2
      v-if="currentStep === 2"
      id="transition-filing-step-2"
      @submit="submitFiling"
    />
  </div>
</template>
