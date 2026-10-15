<script setup lang="ts">
import { z } from 'zod'

const store = useAnnualReportStore()
const { initializing } = storeToRefs(store)
const businessStore = useBusinessStore()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

const { filingText, onError, submitFiling } = useFilingPage({
  store,
  filingType: FilingType.ANNUAL_REPORT,
  formId: 'annual-report-filing',
  i18nPrefix: 'page.annualReport',
  i18nParams: () => ({ year: store.arYear ?? '' }),
  watchers: [
    [() => store.initialFormState, () => store.formState]
  ],
  // the filing has no user editable data - it is submittable as soon as the page has initialized
  submitCondition: () => !initializing.value,
  submitGuard: 'silent',
  preferApiMessageOnError: true,
  // there is no user input worth saving - File and Pay / Cancel only
  saveEnabled: false,
  staffPayRef: staffPayFormRef
})
</script>

<template>
  <div>
    <ConnectSpinner v-if="initializing" fullscreen />
    <UForm
      id="annual-report-filing"
      ref="annual-report-filing"
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
        <p>{{ $t('page.annualReport.desc') }}</p>
      </div>

      <!-- FUTURE: port the ArDate display (AR date + filing date) and the readonly directors/offices -->
      <ConnectPageSection
        :heading="{ label: `1. ${$t('page.annualReport.arDate')}` }"
        ui-body="px-4 py-4 sm:px-6"
        data-testid="ar-date-section"
      >
        <p data-testid="ar-date-value">
          {{ store.asOfDate ? toReadableDate(store.asOfDate) : '' }}
        </p>
      </ConnectPageSection>

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
        :entity-type="getCorpFullDescription(businessStore.business?.legalType, businessStore.business?.legalType)"
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
