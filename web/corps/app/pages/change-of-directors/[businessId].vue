<script setup lang="ts">
const { t } = useI18n()
const store = useChangeOfDirectorsStore()
const { initializing } = storeToRefs(store)
const businessStore = useBusinessStore()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

const directorChangeProps = getDirectorChangeManagePartiesProps()
const activeParty = ref<ActivePartySchema | undefined>(undefined)

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

const warning = computed(() => getDirectorWarning(store.directors, { minCount: 1 }))

/** Minimum date the user can select — the business founding date or last COD date. */
const minDate = computed<string | undefined>(() => {
  const business = businessStore.business as BusinessData | undefined
  return business?.lastDirectorChangeDate || business?.foundingDate?.split('T')[0] || undefined
})

const hasDirectorChanges = computed(() =>
  store.directors.some(row => row.new.actions.length > 0)
)

const { filingText, onError, submitFiling } = useFilingPage({
  store,
  filingType: FilingType.CHANGE_OF_DIRECTORS,
  formId: 'change-of-directors-filing',
  i18nPrefix: 'page.changeOfDirectors',
  watchers: [
    [() => store.initialFormState, () => store.formState],
    [() => store.initialDirectors, () => store.directors]
  ],
  submitCondition: hasDirectorChanges,
  staffPayRef: staffPayFormRef
})
</script>

<template>
  <div>
    <ConnectSpinner v-if="initializing" fullscreen />
    <UForm
      id="change-of-directors-filing"
      ref="change-of-directors-filing"
      data-testid="change-of-directors-form"
      :state="store.formState"
      :schema="getChangeOfDirectorsValidationSchema(minDate)"
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

      <!-- Section 1: Director Change Date -->
      <ConnectPageSection
        :heading="{ label: `1. ${t('page.changeOfDirectors.codDateLabel')}` }"
        ui-body="px-4 py-4 sm:px-6"
        data-testid="cod-date-section"
      >
        <UFormField
          name="codDate"
          :help="t('page.changeOfDirectors.codDateHint')"
        >
          <ConnectInputDatePicker
            v-model="store.formState.codDate"
            data-testid="cod-date-input"
            :label="t('page.changeOfDirectors.codDateLabel')"
            :min-date="minDate"
            :max-date="getToday('America/Vancouver')"
            :disabled="initializing"
          />
        </UFormField>
      </ConnectPageSection>

      <!-- Section 2: Directors -->
      <ConnectPageSection
        :heading="{ label: `2. ${t('page.changeOfDirectors.directorsLabel')}` }"
        ui-body="px-4 py-4 sm:px-6"
        data-testid="directors-section"
      >
        <UAlert
          v-if="warning"
          color="warning"
          variant="subtle"
          icon="i-mdi-alert"
          :description="warning.message"
          data-testid="director-warning"
          class="mb-4"
        />
        <ManageParties
          v-model:active-party="activeParty"
          v-bind="directorChangeProps"
          :loading="initializing"
          :empty-text="initializing ? $t('label.loading') : $t('label.noDirectors')"
          :table-title="t('page.changeOfDirectors.directorsLabel')"
          subject="Director"
          data-testid="manage-directors"
        />
      </ConnectPageSection>

      <FormFolio
        v-if="!store.isStaff && store.formState.folio"
        v-model="store.formState.folio"
        data-testid="form-section-folio-number"
        :disabled="initializing"
        name="folio"
        :order="3"
      />

      <FormConfirmAuthorization
        v-if="store.isStaff && store.formState.authorization"
        v-model="(store.formState as any).authorization"
        :entity-type="getCorpFullDescription(businessStore.business?.legalType, businessStore.business?.legalType)"
        data-testid="form-section-authorization"
        name="authorization"
        :order="4"
      />

      <FormCertify
        v-if="!store.isStaff && store.formState.certify"
        v-model="(store.formState as any).certify"
        :description="t('page.changeOfDirectors.certifyDescription')"
        data-testid="form-section-certify"
        name="certify"
        :order="4"
      />

      <StaffPaymentFieldset
        v-if="store.isStaff && store.formState.staffPayment"
        ref="staff-pay-ref"
        v-model="store.formState.staffPayment"
        :order="5"
        :initializing
      />
    </UForm>
  </div>
</template>
