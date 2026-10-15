<script setup lang="ts">
import { z } from 'zod'

const store = useAnnualReportStore()
const { initializing } = storeToRefs(store)
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
  i18nParams: () => ({ year: store.arYear }),
  watchers: [
    [() => store.initialFormState, () => store.formState]
  ],
  // an annual report on its own is a legitimate filing (changes are optional), but one dated
  // outside the filing window cannot be submitted - the alert explains why the button does nothing
  submitCondition: () => !store.isArDateInvalid,
  submitGuard: 'silent',
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

      <!-- a resumed draft keeps its own AR date - it may no longer be inside the filing window -->
      <UAlert
        v-if="store.isArDateInvalid"
        data-testid="ar-date-invalid-alert"
        icon="i-mdi-alert"
        color="warning"
        variant="subtle"
      >
        <template #description>
          <p>{{ $t('text.arDateOutOfRange') }}</p>
        </template>
      </UAlert>

      <!-- FUTURE: Replace this placeholder with the AGM date, registered office and director sections -->
      <ConnectFieldset
        :label="`1. ${$t('label.agmDate')}`"
        :description="$t('page.annualReport.agmDateDesc')"
        body-variant="card"
        orientation="vertical"
        data-testid="form-section-agm-date"
      >
        <p class="p-6">
          {{ $t('text.agmDateNotAvailable') }}
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

      <!-- FUTURE: add the certify section (base FormCertify needs to support coop version too) -->

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
