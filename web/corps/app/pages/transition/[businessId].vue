<script setup lang="ts">
import { z } from 'zod'
import { onFormSubmitError } from '#imports' // auto imports causing type error for this util

const { t } = useI18n()
const store = useTransitionStore()
const { initializing } = storeToRefs(store)
const urlParams = useUrlSearchParams('history')
const route = useRoute()
// const modal = useFilingModals()
// const { handleButtonLoading, setAlertText: setBtnCtrlAlert } = useConnectButtonControl()

const businessId = route.params.businessId as string
const FILING_TYPE = FilingType.TRANSITION

const {
  breadcrumbs
  // dashboardUrl
} = useFilingNavigation(t('page.transition.h1'))

definePageMeta({
  layout: 'connect-pay-tombstone-buttons-stacked',
  middleware: ['connect-auth']
})

useHead({
  title: t('page.transition.title')
})

async function submitFiling() {
  console.info('submit filing')
  // try {
  //   handleButtonLoading(true, 'right', 1)
  //   console.info('Data: ', e.data)
  //   await store.submit(true)
  //   await navigateTo(dashboardUrl.value, { external: true })
  // } catch {
  //   handleButtonLoading(false)
  // }
}

async function saveFiling(_disableActiveFormCheck = false) {
  console.info('save filing')
  // try {
  //   await store.submit(false)
  //   // if resume later, navigate back to business dashboard
  //   if (resumeLater) {
  //     await navigateTo(dashboardUrl.value, { external: true })
  //   }
  // } catch (error) {
  //   await modal.openSaveFilingErrorModal(error)
  // }
}

async function cancelFiling() {
  console.info('cancel filing')
  // await navigateTo(dashboardUrl.value, { external: true })
}

const { currentStep } = useFilingPageWatcher({
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
    { cancelFiling: { class: 'min-w-[300px] justify-center' }, submitFiling: { label: t('label.reviewAndConfirm') } },
    { submitFiling: { form: 'transition-filing' } }
  ],
  buttonLayout: 'stackedDefault'
})
</script>

<template>
  <div>
    <ConnectSpinner v-if="initializing" fullscreen />
    <UForm
      id="transition-filing"
      ref="transition-filing"
      :state="store.formState"
      :schema="z.any()"
      novalidate
      class="py-6 space-y-6 sm:py-10 sm:space-y-10"
      aria-labelledby="filing-h1"
      @error="onFormSubmitError"
      @submit="submitFiling"
    >
      <div class="space-y-2">
        <h1 id="filing-h1">
          {{ $t('page.transition.h1') }}
        </h1>
        <ConnectI18nHelper
          as="p"
          translation-path="page.transition.desc"
        />
      </div>

      <FormTransitionStep1 v-if="currentStep === 1" />
      <FormTransitionStep2 v-if="currentStep === 2" />
    </UForm>
  </div>
</template>
