<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const { t } = useI18n()
const urlParams = useUrlSearchParams()
const route = useRoute()
const modal = useFilingModals()
const receiverStore = useReceiverStore()

const FILING_TYPE = FilingType.CHANGE_OF_RECEIVERS

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: [
    // Check for login redirect
    'connect-auth'
  ],
  alias: ['/manage-receivers/:businessId/:filingSubType']
})

const businessId = route.params.businessId as string
const filingSubType = route.params.filingSubType as ReceiverType

useHead({
  title: t(`page.${FILING_TYPE}.${filingSubType}.title`)
})

const filingHeading = t(`page.${FILING_TYPE}.${filingSubType}.h1`)
const filingDescription = t(`page.${FILING_TYPE}.${filingSubType}.desc`)
const { dashboardUrl, breadcrumbs } = useFilingNavigation(t(`page.${FILING_TYPE}.${filingSubType}.h1`))

const staffPayFormRef = useTemplateRef<StaffPaymentFormRef>('staff-pay-ref')

// submit final filing
async function submitFiling() {
  try {
    await receiverStore.submit(true)
  } catch (error) {
    await modal.openSaveFilingErrorModal(error)
  }
}

async function cancelFiling() {
  // TODO: should checkHasChanges to common parties code? Effects quite a few things across the code
  // if (officerStore.checkHasChanges('save')) {
  //   await modal.openUnsavedChangesModal(revokeBeforeUnloadEvent)
  // } else {
  //   await navigateTo(dashboardOrEditUrl.value, { external: true })
  // }
}

async function saveFiling(resumeLater = false, _disableActiveFormCheck = false) {
  try {
    await receiverStore.submit(false)

    // if resume later, navigate back to business dashboard
    if (resumeLater) {
      await navigateTo(dashboardUrl.value, { external: true })
    }
  } catch (error) {
    await modal.openSaveFilingErrorModal(error)
  }
}

function onError(event: FormErrorEvent) {
  const firstError = event?.errors?.[0]

  if (firstError?.name === 'staffPayment.option') {
    staffPayFormRef.value?.setFocusOnError()
  } else {
    onFormSubmitError(event)
  }
}

// Watcher to handle filing save, cancel, and navigation
useFilingPageWatcher<ReceiverType>({
  store: receiverStore,
  businessId,
  filingType: FILING_TYPE,
  filingSubType,
  draftId: urlParams.draft as string | undefined,
  formId: 'receiver-filing',
  saveFiling: { clickEvent: () => saveFiling(true), label: t('label.saveResumeLater') },
  cancelFiling: { clickEvent: cancelFiling, label: t('label.cancel') },
  submitFiling: { clickEvent: submitFiling, label: t('label.submit') },
  breadcrumbs
})
</script>

<template>
  <UForm
    id="receiver-filing"
    ref="receiver-filing"
    :state="receiverStore.formState"
    :schema="z.any()"
    novalidate
    class="py-10 space-y-10"
    :aria-label="filingHeading"
    @submit="submitFiling"
    @error="onError"
  >
    <div class="space-y-1">
      <h1>{{ filingHeading }}</h1>
      <p>{{ filingDescription }}</p>
    </div>

    <section class="space-y-4">
      <h2 class="text-base">
        1. {{ $t('label.receiverInfo') }}
      </h2>

      <ManageParties
        v-model:active-party="receiverStore.formState.activeParty"
        :loading="receiverStore.initializing"
        :empty-text="receiverStore.initializing ? `${$t('label.loading')}...` : $t('text.noReceivers')"
        :add-label="$t('label.addReceiver')"
        :edit-label="$t('label.editReceiver')"
      />
    </section>

    <FormCourtOrderPoa
      ref="court-order-poa-ref"
      v-model="receiverStore.formState.courtOrder"
      name="courtOrder"
      order="2"
      :state="receiverStore.formState.courtOrder"
    />

    <FormDocumentId
      ref="document-id-ref"
      v-model="receiverStore.formState.documentId"
      name="documentId"
      order="3"
      :state="receiverStore.formState.documentId"
    />

    <!-- TODO: add text/translation -->
    <ConnectFieldset label="4. Staff Payment" body-variant="card">
      <ConnectFormFieldWrapper label="Payment" orientation="horizontal">
        <StaffPayment
          ref="staff-pay-ref"
          v-model="receiverStore.formState.staffPayment"
          :show-priority="true"
          name="staffPayment"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
