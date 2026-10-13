<script setup lang="ts">
import { z } from 'zod'

const { t } = useI18n()
const store = useAddressChangeStore()
const { initializing } = storeToRefs(store)
const { setAlert: setSubFormAlert } = useFilingAlerts('manage-offices')
const { hasChanges: hasOfficeChanges } = useManageOffices()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

// an office open in the address sub form must be completed before saving or submitting
function checkActiveSubForm(action: 'submit' | 'save') {
  if (store.formState.activeOffice !== undefined) {
    setSubFormAlert(
      'office-address-form',
      action === 'submit' ? t('text.finishTaskBeforeSubmit') : t('text.finishTaskBeforeSave')
    )
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
  // an address change must change the registered office address to be submittable
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
        <p>{{ $t('page.changeOfAddress.desc') }}</p>
      </div>

      <!-- FUTURE: replace this placeholder with the registered office ManageOffices section -->
      <ConnectFieldset
        :label="`1. ${$t('label.registeredOfficeAddress')}`"
        :description="$t('text.changeRegisteredOfficeAddress')"
        body-variant="card"
        orientation="vertical"
        data-testid="form-section-office-addresses"
      >
        <p class="p-6" data-testid="office-addresses-placeholder">
          {{ store.offices.map(office => $t(`officeType.${office.new.type}`)).join(', ') }}
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
