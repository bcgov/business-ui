<script setup lang="ts">
import { z } from 'zod'

const store = useConsentAmalgamationOutStore()
const { initializing } = storeToRefs(store)
const businessStore = useBusinessStore()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

const { filingText, onError, submitFiling } = useFilingPage({
  store,
  filingType: FilingType.CONSENT_AMALGAMATION_OUT,
  formId: 'consent-amalgamation-out-filing',
  i18nPrefix: 'page.consentAmalgamationOut',
  // filing composed from scratch - default guards apply
  watchers: [
    [() => store.initialFormState, () => store.formState]
  ],
  preferApiMessageOnError: true,
  staffPayRef: staffPayFormRef
})
</script>

<template>
  <div>
    <ConnectSpinner v-if="initializing" fullscreen />
    <UForm
      id="consent-amalgamation-out-filing"
      ref="consent-amalgamation-out-filing"
      data-testid="consent-amalgamation-out-form"
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

      <!-- FUTURE: replace with FormForeignJurisdiction (the combined jurisdiction menu) -->
      <ConnectPageSection
        :heading="{ label: `1. ${$t('label.jurisdiction')}` }"
        ui-body="px-4 py-4 sm:px-6"
        data-testid="jurisdiction-section"
      >
        <p data-testid="jurisdiction-placeholder">
          {{ $t('page.consentAmalgamationOut.jurisdictionDesc') }}
        </p>
      </ConnectPageSection>

      <FormDocumentDelivery
        v-if="store.formState.documentDelivery"
        v-model="store.formState.documentDelivery"
        data-testid="form-section-document-delivery"
        name="documentDelivery"
        :order="2"
        :loading="initializing"
        :registered-office-email="businessStore.businessContact?.email"
      />

      <FormFolio
        v-if="!store.isStaff && store.formState.folio"
        v-model="store.formState.folio"
        data-testid="form-section-folio-number"
        :disabled="initializing"
        name="folio"
        :order="3"
      />

      <!-- NB: unlike the consent to continue out there is no completing party confirmation -
        the standard corps authorization applies (certifiedBy is not sent) -->
      <FormConfirmAuthorization
        v-if="store.formState.authorization"
        v-model="store.formState.authorization"
        data-testid="form-section-authorization"
        :entity-type="getCorpFullDescription(businessStore.business?.legalType, businessStore.business?.legalType)"
        name="authorization"
        :order="store.isStaff ? 3 : 4"
      />

      <!-- FUTURE: the staff court order section -->

      <StaffPaymentFieldset
        v-if="store.isStaff && store.formState.staffPayment"
        ref="staff-pay-ref"
        v-model="store.formState.staffPayment"
        :order="4"
        :initializing
      />
    </UForm>
  </div>
</template>
