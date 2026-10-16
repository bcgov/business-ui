<script setup lang="ts">
import { z } from 'zod'

const store = useContinuationOutStore()
const { initializing } = storeToRefs(store)
const businessStore = useBusinessStore()

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

const { filingText, submitFiling } = useFilingPage({
  store,
  filingType: FilingType.CONTINUATION_OUT,
  formId: 'continuation-out-filing',
  i18nPrefix: 'page.continuationOut',
  watchers: [
    [() => store.initialFormState, () => store.formState]
  ],
  // NB: draft always pre-created so the 'resumed draft' submit rule does not apply
  submitCondition: () => true,
  draftIdSource: 'route-param',
  preferApiMessageOnError: true
})
</script>

<template>
  <div>
    <ConnectSpinner v-if="initializing" fullscreen />
    <UForm
      id="continuation-out-filing"
      ref="continuation-out-filing"
      data-testid="continuation-out-form"
      :state="store.formState"
      :schema="z.any()"
      novalidate
      class="py-6 space-y-6 sm:py-10 sm:space-y-10"
      :aria-label="filingText.h1"
      @error="onFormSubmitError"
      @submit="submitFiling"
    >
      <div class="space-y-4">
        <h1>{{ filingText.h1 }}</h1>
        <p>{{ filingText.desc }}</p>
      </div>

      <!-- FUTURE: show only when the stashed consent window has expired (store.consentInfo) -
        the warning never blocks the filing. The date/jurisdiction mismatch alerts and their
        manager approval checkboxes land with their sections. -->
      <UAlert
        data-testid="expired-consent-alert"
        icon="i-mdi-alert"
        color="warning"
        variant="subtle"
      >
        <template #description>
          <p data-testid="expired-consent-placeholder">
            {{ $t('page.continuationOut.consentExpiredWarning') }}
          </p>
        </template>
      </UAlert>

      <!-- FUTURE: the continuation out date, the foreign jurisdiction, the business name in the new
        jurisdiction, the document upload and the staff detail sections are added above (document
        delivery is renumbered then) -->
      <FormDocumentDelivery
        v-model="store.formState.documentDelivery"
        data-testid="form-section-document-delivery"
        name="documentDelivery"
        :order="1"
        :loading="initializing"
        :registered-office-email="businessStore.businessContact?.email"
      />

      <!-- FUTURE: the completing party confirmation (FormConfirmCompletingParty) and the staff
        court order section -->
    </UForm>
  </div>
</template>
