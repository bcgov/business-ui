<script setup lang="ts">
import { z } from 'zod'

const { t } = useI18n()
const store = useAddressChangeStore()
const { initializing } = storeToRefs(store)
const businessStore = useBusinessStore()
const { setAlert: setOfficesAlert } = useFilingAlerts('manage-offices')
const { hasChanges: hasOfficeChanges } = useManageOffices()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

// an office open in the address sub form must be completed before saving or submitting
function checkActiveSubForm() {
  if (store.formState.activeOffice !== undefined) {
    setOfficesAlert('office-address-form', t('text.finishTaskBeforeOtherChanges'))
    return true
  }
  return false
}

const { filingText, onError, submitFiling } = useFilingPage({
  store,
  filingType: FilingType.CHANGE_OF_ADDRESS,
  formId: 'address-change-filing',
  i18nPrefix: 'page.changeOfAddress',
  watchers: [
    [() => store.initialFormState, () => store.formState],
    [() => store.initialOffices, () => store.offices]
  ],
  // filing must change at least one office address to be submittable
  submitCondition: hasOfficeChanges,
  preTaskGuard: checkActiveSubForm,
  staffPayRef: staffPayFormRef
})
</script>

<template>
  <div>
    <ConnectSpinner v-if="initializing" fullscreen />
    <UForm
      id="address-change-filing"
      ref="address-change-filing"
      data-testid="address-change-form"
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

      <!-- corps only: legal-api forces the filing effective 00:01 PT the day after submission -->
      <UAlert
        data-testid="effective-tomorrow-alert"
        icon="i-mdi-information-outline"
        color="info"
        variant="subtle"
        :description="$t('text.addressUpdateEffectiveTomorrow')"
      />

      <!-- FUTURE: the offices table (ManageOffices with the address change preset) -->
      <ConnectPageSection
        :heading="{ label: `1. ${$t('label.officeAddresses')}` }"
        ui-body="px-4 py-4 sm:px-6"
        data-testid="office-addresses-section"
      >
        <p data-testid="office-addresses-placeholder">
          {{ store.offices.map(office => $t(`officeType.${office.new.type}`)).join(', ') }}
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
