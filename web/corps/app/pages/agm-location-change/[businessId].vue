<script setup lang="ts">
import type { FetchError } from 'ofetch'

const { t, tm, rt } = useI18n()
const store = useAgmLocationChangeStore()
const { initializing } = storeToRefs(store)
const route = useRoute()
const modal = useFilingModals()
const { handleButtonLoading, setAlertText: setBtnCtrlAlert } = useConnectButtonControl()
const urlParams = useUrlSearchParams('history')
const businessStore = useBusinessStore()

const businessId = route.params.businessId as string
const FILING_TYPE = FilingType.AGM_LOCATION_CHANGE

const filingText = {
  h1: t('page.agmLocationChange.h1'),
  title: t('page.agmLocationChange.title')
}

const { breadcrumbs, dashboardUrl } = useFilingNavigation(filingText.h1)

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

useHead({
  title: filingText.title
})

const {
  canSave,
  canCancel,
  initBeforeUnload,
  revokeBeforeUnload
} = useFilingTaskGuards(
  [
    [() => store.initialFormState, () => store.formState]
  ]
)

async function submitFiling() {
  try {
    handleButtonLoading(true, 'right', 1)
    await store.submit(true)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    const e = error as FetchError<AgmLocationChangeDraftState>
    const filingResp = e.response?._data
    urlParams.draft = String(filingResp?.filing?.header?.filingId)
    modal.openSaveFilingErrorModal(error)
    handleButtonLoading(false)
    initBeforeUnload()
  }
}

async function saveFiling(enableUnsavedChangesBlock = true) {
  try {
    if (enableUnsavedChangesBlock && !canSave()) {
      return setBtnCtrlAlert(t('text.noChangesToSave'), 'left')
    }
    await store.submit(false)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    if (enableUnsavedChangesBlock) {
      await modal.openSaveFilingErrorModal(error)
      initBeforeUnload()
    }
  }
}

async function cancelFiling() {
  if (!canCancel()) {
    return
  }
  await navigateTo(dashboardUrl.value, { external: true })
}

useFilingPageWatcher({
  store,
  businessId,
  filingType: FILING_TYPE,
  draftId: urlParams.draft as string | undefined,
  breadcrumbs,
  saveFiling: { onClick: () => saveFiling(true) },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'agm-location-change-filing' },
  setOnBeforeSessionExpired: async () => {
    if (canSave()) {
      await saveFiling(false)
    }
  }
})
</script>

<template>
  <div>
    <ConnectSpinner v-if="initializing" fullscreen />
    <UForm
      id="agm-location-change-filing"
      :state="store.formState"
      :schema="getAgmLocationChangeValidationSchema(businessStore.business?.foundingDate)"
      novalidate
      class="py-6 space-y-6 sm:py-10 sm:space-y-10"
      :aria-label="filingText.h1"
      @submit="submitFiling"
    >
      <!-- Title + Help -->
      <div class="space-y-4">
        <h1>{{ filingText.h1 }}</h1>
        <HelpExpansion :label="$t('page.agmLocationChange.helpLabel')">
          <p>{{ $t('page.agmLocationChange.helpText') }}</p>
          <p>{{ $t('page.agmLocationChange.helpExceptionsTitle') }}</p>
          <ul class="list-disc pl-6 space-y-1">
            <li v-for="(item, i) in (tm('page.agmLocationChange.helpExceptions') as unknown[])" :key="i">
              {{ rt(item as string) }}
            </li>
          </ul>
        </HelpExpansion>
      </div>

      <!-- Section 1: Location Change Detail -->
      <ConnectFieldset
        :label="`1. ${$t('page.agmLocationChange.locationChangeDetail')}`"
        :description="$t('page.agmLocationChange.locationChangeDetailDesc')"
        body-variant="card"
        orientation="vertical"
        data-testid="form-section-location-change-detail"
      >
        <div class="divide-y divide-line-muted">
          <!-- AGM Year -->
          <ConnectFormFieldWrapper
            :label="$t('label.agmYear')"
            orientation="horizontal"
            padding-class="xy-default"
            required
          >
            <ConnectFormInput
              v-model="store.formState.year"
              name="year"
              input-id="agm-year-input"
              :label="$t('label.agmYear')"
              :disabled="initializing"
            />
          </ConnectFormFieldWrapper>

          <!-- Reason -->
          <ConnectFormFieldWrapper
            :label="$t('label.reason')"
            orientation="horizontal"
            padding-class="xy-default"
            required
          >
            <ConnectFormTextarea
              v-model="store.formState.reason"
              name="reason"
              input-id="reason-input"
              :label="$t('label.reason')"
              :disabled="initializing"
            />
          </ConnectFormFieldWrapper>

          <!-- AGM Location -->
          <ConnectFormFieldWrapper
            :label="$t('label.agmLocation')"
            orientation="horizontal"
            padding-class="xy-default"
            required
          >
            <ConnectFormInput
              v-model="store.formState.agmLocation"
              name="agmLocation"
              input-id="agm-location-input"
              :label="$t('label.agmLocation')"
              :disabled="initializing"
              :help="$t('text.agmLocationHint')"
            />
          </ConnectFormFieldWrapper>
        </div>
      </ConnectFieldset>

      <!-- Section 2: Certify (non-staff) / Authorization (staff) -->
      <FormCertify
        v-if="!store.isStaff"
        v-model="(store.formState as any).certify"
        data-testid="form-section-certify"
        name="certify"
        :order="2"
      />
      <FormConfirmAuthorization
        v-if="store.isStaff && store.formState.authorization"
        v-model="(store.formState as any).authorization"
        data-testid="form-section-authorization"
        name="authorization"
        :order="2"
      />
    </UForm>
  </div>
</template>
