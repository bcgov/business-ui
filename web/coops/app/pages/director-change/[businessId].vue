<script setup lang="ts">
import { z } from 'zod'

const { t } = useI18n()
const store = useDirectorChangeStore()
const { initializing } = storeToRefs(store)
const { setAlert: setSubFormAlert } = useFilingAlerts('manage-parties')
const { hasChanges: hasDirectorChanges } = useManageParties()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

// a director open in the party details sub form must be completed before saving or submitting
function checkActiveSubForm(action: 'submit' | 'save') {
  if (store.formState.activeParty !== undefined) {
    setSubFormAlert(
      'party-details-form',
      action === 'submit' ? t('text.finishTaskBeforeSubmit') : t('text.finishTaskBeforeSave')
    )
    return true
  }
  return false
}

const { filingText, onError, submitFiling } = useFilingPage({
  store,
  filingType: FilingType.CHANGE_OF_DIRECTORS,
  formId: 'director-change-filing',
  i18nPrefix: 'page.changeOfDirectors',
  watchers: [
    [() => store.initialFormState, () => store.formState],
    [() => store.initialDirectors, () => store.directors]
  ],
  // a director change must change at least one director to be submittable
  submitCondition: hasDirectorChanges,
  preTaskGuard: checkActiveSubForm,
  staffPayRef: staffPayFormRef
})
</script>

<template>
  <div>
    <ConnectSpinner v-if="initializing" fullscreen />
    <UForm
      id="director-change-filing"
      ref="director-change-filing"
      data-testid="director-change-form"
      :state="store.formState"
      :schema="z.any()"
      novalidate
      class="py-6 space-y-6 sm:py-10 sm:space-y-10"
      :aria-label="filingText.h1"
      @error="onError"
      @submit="submitFiling"
    >
      <div class="space-y-4">
        <h1>{{ filingText.h1 }}</h1>
        <p>{{ $t('page.changeOfDirectors.desc') }}</p>
      </div>

      <!-- FUTURE: Replaces this placeholder with the effective date picker and the directors table -->
      <ConnectFieldset
        :label="`1. ${$t('label.effectiveDate')}`"
        :description="$t('page.changeOfDirectors.effectiveDateDesc')"
        body-variant="card"
        orientation="vertical"
        data-testid="form-section-effective-date"
      >
        <p class="p-6">
          {{ $t('text.directorChangeNotAvailable') }}
        </p>
      </ConnectFieldset>

      <FormFolio
        v-if="!store.isStaff && store.formState.folio"
        v-model="store.formState.folio"
        data-testid="form-section-folio-number"
        :disabled="initializing"
        name="folio"
        order="2"
      />

      <!-- FUTURE: add the certify section (base FormCertify needs coop support) -->

      <StaffPaymentFieldset
        v-if="store.isStaff && store.formState.staffPayment"
        ref="staff-pay-ref"
        v-model="store.formState.staffPayment"
        data-testid="form-section-staff-payment"
        :initializing
        order="2"
      />
    </UForm>
  </div>
</template>
