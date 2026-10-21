<script setup lang="ts">
const { t } = useI18n()
const store = useReviewImportedDataStore()
const { initializing } = storeToRefs(store)
const { setAlert: setOfficesAlert } = useFilingAlerts('manage-offices')
const { setAlert: setPartiesAlert } = useFilingAlerts('manage-parties')
const { setAlertText: setBtnCtrlAlert } = useConnectButtonControl()

const FORM_ID = 'review-imported-data-filing'

definePageMeta({
  layout: 'connect-pay-tombstone-buttons-stacked',
  middleware: ['connect-auth']
})

// an office or director open in its address sub form must be completed before moving on
function checkActiveSubForm() {
  if (store.formState.activeOffice !== undefined) {
    setOfficesAlert('office-address-form', t('text.finishTaskBeforeOtherChanges'))
    return true
  }
  if (store.formState.activeDirector !== undefined) {
    setPartiesAlert('party-details-form', t('text.finishTaskBeforeOtherChanges'))
    return true
  }
  return false
}

function reviewAndConfirm() {
  setBtnCtrlAlert(undefined)
  if (checkActiveSubForm()) {
    return
  }
  if (!store.hasChanges) {
    setBtnCtrlAlert(t('text.noChangesToSubmit'), 'right')
    return
  }
  // legal-api rejects an office delivery address outside BC (same rule as a change of address)
  if (getOfficesDeliveryOutsideBc(store.offices).length > 0) {
    setOfficesAlert('offices-table', t('text.officeDeliveryAddressMustBeInBc'))
    return
  }
  nextStep()
}

const { currentStep, filingText, nextStep, submitFiling } = useFilingPage({
  store,
  filingType: FilingType.REVIEW_IMPORTED_DATA,
  formId: FORM_ID,
  i18nPrefix: 'page.reviewImportedData',
  watchers: [
    [() => store.initialFormState, () => store.formState],
    [() => store.initialOffices, () => store.offices],
    [() => store.initialDirectors, () => store.directors]
  ],
  // at least one office or director address must change (schema anyOf)
  submitCondition: () => store.hasChanges,
  preTaskGuard: checkActiveSubForm,
  watcher: {
    buttonLayout: 'stackedDefault',
    steps: [
      { submitFiling: { label: t('label.reviewAndConfirm'), onClick: reviewAndConfirm } },
      { submitFiling: { form: FORM_ID, type: 'submit' } }
    ]
  }
})
</script>

<template>
  <div class="py-6 space-y-6 sm:py-10 sm:space-y-10">
    <ConnectSpinner v-if="initializing" fullscreen />
    <div class="space-y-2">
      <h1 id="filing-h1">
        {{ filingText.h1 }}
      </h1>
      <p>{{ filingText.desc }}</p>
    </div>
    <FormReviewImportedDataStep1
      v-if="currentStep === 1"
      id="review-imported-data-step-1"
    />
    <FormReviewImportedDataStep2
      v-if="currentStep === 2"
      :id="FORM_ID"
      @submit="submitFiling"
    />
  </div>
</template>
