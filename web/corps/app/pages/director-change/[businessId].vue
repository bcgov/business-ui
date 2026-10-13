<script setup lang="ts">
import { z } from 'zod'

const { t } = useI18n()
const store = useDirectorChangeStore()
const { initializing } = storeToRefs(store)
const businessStore = useBusinessStore()
const { setAlert: setPartiesAlert } = useFilingAlerts('manage-parties')
const { hasChanges: hasDirectorChanges } = useManageParties()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

// a director open in the party details sub form must be completed before saving or submitting
function checkActiveSubForm() {
  if (store.formState.activeParty !== undefined) {
    setPartiesAlert('party-details-form', t('text.finishTaskBeforeOtherChanges'))
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
  // filing must change at least one director to be submittable
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
        <p>{{ filingText.desc }}</p>
      </div>

      <!-- FUTURE: replace with FormEffectiveDate (min = last director change / founding, max = today) -->
      <ConnectPageSection
        :heading="{ label: `1. ${$t('label.effectiveDate')}` }"
        ui-body="px-4 py-4 sm:px-6"
        data-testid="effective-date-section"
      >
        <p data-testid="effective-date-value">
          {{ toReadableDate(store.effectiveDate) }}
        </p>
      </ConnectPageSection>

      <!-- FUTURE: the directors table (ManageParties with the director change preset) -->

      <FormFolio
        v-if="!store.isStaff && store.formState.folio"
        v-model="store.formState.folio"
        data-testid="form-section-folio-number"
        :disabled="initializing"
        name="folio"
        :order="2"
      />

      <FormConfirmAuthorization
        v-if="store.formState.authorization"
        v-model="store.formState.authorization"
        data-testid="form-section-authorization"
        :entity-type="getLegalTypeDescription(businessStore.business?.legalType)"
        name="authorization"
        :order="store.isStaff ? 2 : 3"
      />

      <StaffPaymentFieldset
        v-if="store.isStaff && store.formState.staffPayment"
        ref="staff-pay-ref"
        v-model="store.formState.staffPayment"
        :order="3"
        :initializing
      />
    </UForm>
  </div>
</template>
