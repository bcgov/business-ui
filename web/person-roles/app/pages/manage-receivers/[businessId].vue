<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'
import { RoleTypeUi } from '#imports'

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth'],
  path: '/manage-receivers/:businessId/:filingSubType'
})

const { t } = useI18n()
const urlParams = useUrlSearchParams()
const route = useRoute()
const modal = useFilingModals()
const receiverStore = useReceiverStore()

const FILING_TYPE = FilingType.CHANGE_OF_RECEIVERS

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
    const hasUpdatedReceiver = receiverStore.receivers.find(receiver => receiver.new.actions.length)
    if (!hasUpdatedReceiver) {
      // TODO: temporary text - update in lang file or change this to scroll etc.
      useConnectButtonControl().setAlertText('Please update at least one Receiver above', 'right')
      return
    }
    await receiverStore.submit(true)
    await navigateTo(dashboardUrl.value, { external: true })
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
  await navigateTo(dashboardUrl.value, { external: true })
}

async function saveFiling(resumeLater = false, disableActiveFormCheck = false) {
  try {
    if (!disableActiveFormCheck && useManageParties().addingParty.value) {
      // TODO: temporary text - update in lang file or change this to scroll etc.
      useConnectButtonControl().setAlertText('Please complete your expanded Receiver above', 'left', 0)
      return
    }

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
  saveFiling: { onClick: () => saveFiling(true) },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'receiver-filing' },
  breadcrumbs,
  setOnBeforeSessionExpired: () => saveFiling(false, true)
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
        :role-type="RoleTypeUi.RECEIVER"
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
