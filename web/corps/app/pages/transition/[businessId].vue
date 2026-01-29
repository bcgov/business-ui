<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { onFormSubmitError } from '#imports' // auto imports causing type error for this util

const { t } = useI18n()
const store = useTransitionStore()
const { initializing } = storeToRefs(store)
const urlParams = useUrlSearchParams('history')
const route = useRoute()
const modal = useFilingModals()
const { handleButtonLoading, setButtonControl } = useConnectButtonControl()

const businessId = route.params.businessId as string
const FILING_TYPE = FilingType.TRANSITION

const filingText = computed(() => {
  return {
    h1: t('page.transition.h1'),
    title: t('page.dissolution.delay.titleStaff')
  }
})

const { breadcrumbs, dashboardUrl } = useFilingNavigation(t('page.transition.h1'))

definePageMeta({
  layout: 'connect-pay-tombstone-buttons-stacked', // -stacked
  middleware: ['connect-auth']
  // path: '/transition/:businessId/:filingSubType' // has filing sub type?
})

useHead({
  title: t('page.transition.title')
})

async function submitFiling(e: FormSubmitEvent<unknown>) {
  console.log('submit filing')
  // try {
  //   handleButtonLoading(true, 'right', 1)
  //   console.info('Data: ', e.data)
  //   await store.submit(true)
  //   await navigateTo(dashboardUrl.value, { external: true })
  // } catch {
  //   handleButtonLoading(false)
  // }
}

async function saveFiling(resumeLater = false, _disableActiveFormCheck = false) {
  console.log('save filing')
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
  console.log('cancel filing')
  // TODO: check has changes, display modal if unsaved changes
  // await navigateTo(dashboardUrl.value, { external: true })
}

// useFilingPageWatcher<DissolutionType>({
const { currentStep } = useFilingPageWatcher({
  store,
  businessId,
  filingSubType: undefined,
  filingType: FILING_TYPE,
  draftId: urlParams.draft as string | undefined,
  saveFiling: { onClick: () => saveFiling(true) },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'transition-filing' },
  breadcrumbs,
  setOnBeforeSessionExpired: () => saveFiling(false, true),
  steps: [
    { submitFiling: { label: 'Review and Confirm' } },
    { backButton: { class: 'w-min-full' } }
  ]
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
      :aria-label="filingText.h1"
      @error="onFormSubmitError"
      @submit="() => console.log('form submitted')"
    >
      <!-- @submit="submitFiling" -->
      <div class="space-y-2">
        <h1>{{ $t('page.transition.h1') }}</h1>
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
