<script setup lang="ts">
import { z } from 'zod'

const { t } = useI18n()
const store = useDirectorsStore()
const { initializing } = storeToRefs(store)
const businessStore = useBusinessStore()
const { setAlert: setSubFormAlert } = useFilingAlerts('manage-parties')
const { hasChanges: hasDirectorChanges } = useManageParties()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')
const effectiveDateFormRef = useTemplateRef<FormEffectiveDateRef>('effective-date-form')

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

const directorChangeProps = computed(() => {
  const legalType = businessStore.business?.legalType
  return getDirectorChangeManagePartiesProps(legalType !== 'CP', getRegisterCorrectionFormUrl(legalType))
})

// a director open in the party details sub form must be completed before saving or submitting
async function checkActiveSubForm() {
  if (store.formState.activeParty !== undefined) {
    setSubFormAlert('party-details-form', t('text.finishTaskBeforeOtherChanges'))
    return true
  }
  try {
    await effectiveDateFormRef.value?.formRef?.validate()
  } catch {
    return true
  }
  return false
}

const { filingText, onError, submitFiling } = useFilingPage({
  store,
  filingType: FilingType.CHANGE_OF_DIRECTORS,
  formId: 'manage-directors-filing',
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

/** Effective date model bridging store.effectiveDate ↔ FormEffectiveDate's EffectiveDateSchema. */
const effectiveDateModel = ref<EffectiveDateSchema>({ dateInput: store.effectiveDate })

// sync the local model when init completes (e.g. draft restores a date)
watch(() => store.initializing, (isInitializing) => {
  if (!isInitializing) {
    effectiveDateModel.value = { dateInput: store.effectiveDate }
  }
})

// keep store.effectiveDate in sync as the user edits the date picker
watch(effectiveDateModel, (val) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(val.dateInput)) {
    store.effectiveDate = val.dateInput as IsoDatePacific
  }
})

/** Min/max bounds for the effective date picker, driven by the business type config. */
const effectiveDateBounds = computed<DateBounds>(() => {
  const business = businessStore.business as BusinessData | undefined
  if (!business) {
    return { max: { date: getToday('America/Vancouver') } }
  }

  let minDate: string | undefined
  if (store.config.minDateSource === 'latestOfCodAr') {
    // coops: latest of last director change or last annual report
    const candidates = [business.lastDirectorChangeDate, business.lastAnnualReportDate].filter(Boolean)
    minDate = candidates.sort().at(-1) ?? business.foundingDate?.split('T')[0]
  }
  else {
    // corps: last director change, or founding date when the backdating flag allows
    minDate = business.lastDirectorChangeDate || business.foundingDate?.split('T')[0]
  }

  return {
    min: minDate ? { date: minDate } : undefined,
    max: { date: getToday('America/Vancouver') }
  }
})

const warning = computed(() => getDirectorWarning(store.directors, store.config.warnings))

// sync paid/free fee when the directors table changes
watch(() => store.directors, async (directors) => {
  await syncDirectorChangeFee(directors, {
    paidCode: store.config.paidFeeCode,
    freeCode: store.config.freeFeeCode
  })
}, { deep: true })
</script>

<template>
  <div>
    <ConnectSpinner v-if="initializing" fullscreen />
    <UForm
      id="manage-directors-filing"
      ref="manage-directors-filing"
      data-testid="manage-directors-form"
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

      <!-- Director Change Date (the design has no numbered sections on this page) -->
      <ConnectPageSection
        ui-body="px-4 py-4 sm:px-6"
        data-testid="effective-date-section"
      >
        <FormEffectiveDate
          v-if="!initializing"
          ref="effective-date-form"
          v-model="effectiveDateModel"
          :bounds="effectiveDateBounds"
          :label="$t('label.directorChangeDate')"
          :input-label="$t('label.directorChangeDate')"
          data-testid="effective-date-input"
        />
      </ConnectPageSection>

      <!-- Directors -->
      <UAlert
        v-if="warning"
        color="warning"
        variant="subtle"
        icon="i-mdi-alert"
        :description="warning.message"
        data-testid="director-warning"
      />
      <ManageParties
        v-model:active-party="store.formState.activeParty"
        v-bind="directorChangeProps"
        :loading="initializing"
        :empty-text="initializing ? $t('label.loading') : $t('label.noDirectors')"
        :table-title="$t('label.directors')"
        subject="Director"
        data-testid="manage-directors"
      />

      <FormFolio
        v-if="!store.isStaff && store.formState.folio"
        v-model="store.formState.folio"
        data-testid="form-section-folio-number"
        :disabled="initializing"
        name="folio"
      />

      <FormConfirmAuthorization
        v-if="store.formState.authorization"
        v-model="store.formState.authorization"
        data-testid="form-section-authorization"
        :entity-type="getCorpFullDescription(businessStore.business?.legalType, businessStore.business?.legalType)"
        name="authorization"
      />

      <!-- coops certify with a legal name instead of the authorization checkbox -->
      <FormCertify
        v-if="!store.isStaff && store.config.certify === 'certified-by' && store.formState.certify"
        v-model="store.formState.certify"
        :entity-type="getCorpFullDescription(businessStore.business?.legalType, businessStore.business?.legalType)"
        data-testid="form-section-certify"
        name="certify"
      />

      <StaffPaymentFieldset
        v-if="store.isStaff && store.formState.staffPayment"
        ref="staff-pay-ref"
        v-model="store.formState.staffPayment"
        data-testid="form-section-staff-payment"
        :initializing
      />
    </UForm>
  </div>
</template>
