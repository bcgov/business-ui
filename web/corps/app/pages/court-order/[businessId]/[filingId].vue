<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const { t } = useI18n()
const store = useCourtOrderStore()
const { initializing } = storeToRefs(store)
const route = useRoute()
const businessStore = useBusinessStore()
const modal = useFilingModals()
const { handleButtonLoading, setAlertText: setBtnCtrlAlert } = useConnectButtonControl()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

const businessId = route.params.businessId as string
const filingId = route.params.filingId as string // the pre-created court order draft filing ID
const FILING_TYPE = FilingType.COURT_ORDER

const filingText = {
  h1: t('page.courtOrder.h1'),
  title: t('page.courtOrder.title')
}

const { breadcrumbs, dashboardUrl } = useFilingNavigation(filingText.h1)

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

useHead({
  title: filingText.title
})

// no canSubmit check - the court order schema enforces the required filing data
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

function onError(event: FormErrorEvent) {
  const firstError = event?.errors?.[0]

  if (firstError?.name === 'staffPayment.option') {
    staffPayFormRef.value?.setFocusOnError()
  } else {
    onFormSubmitError(event)
  }
}

async function submitFiling() {
  try {
    handleButtonLoading(true, 'right', 1)
    await store.submit(true)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
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
  draftId: filingId, // route param filingId = the pre-created court order draft's filing ID
  saveFiling: { onClick: () => saveFiling(true) },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'court-order-filing' },
  breadcrumbs,
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
      id="court-order-filing"
      ref="court-order-filing"
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
        <p>{{ $t('page.courtOrder.desc') }}</p>
      </div>

      <!-- v-if: the nested file-upload composable snapshots identifier/entityType at mount,
        so this section must not mount until the business data has loaded -->
      <FormCourtOrderPoaFullFiling
        v-if="!initializing"
        v-model="store.formState.courtOrder"
        data-testid="form-section-court-order"
        name="courtOrder"
        order="1"
        :identifier="businessStore.businessIdentifier"
        :entity-type="businessStore.business?.legalType as CorpTypeCd"
        :filing-id="filingId"
      />

      <StaffPaymentFieldset
        ref="staff-pay-ref"
        v-model="store.formState.staffPayment"
        order="2"
        :initializing="initializing"
      />
    </UForm>
  </div>
</template>
