<script setup lang="ts">
import type { FormSubmitEvent, FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const { t } = useI18n()
const urlParams = useUrlSearchParams()
const route = useRoute()
const modal = useFilingModals()
const { dashboardUrl, breadcrumbs } = useFilingNavigation(t('page.manageReceivers.h1'))
const receiverSchema = getReceiversSchema()
const receiverStore = useReceiverStore()

useHead({
  title: t('page.manageReceivers.title')
})

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: [
    // Check for login redirect
    'connect-auth'
  ]
})

const businessId = route.params.businessId as string
const staffPayFormRef = useTemplateRef<StaffPaymentFormRef>('staff-pay-ref')

// submit final filing
async function submitFiling(e: FormSubmitEvent<unknown>) {
  // Todo: Exclude non-edited existing parties from the submission payload
  try {
    console.info('RECEIVER FILING DATA: ', e.data) // This does not include the table data
    // pull draft id from url or mark as undefined
    // const draftId = (urlParams.draft as string) ?? undefined
    // await receiverStore.submit(draftId)
    // navigate to business dashboard if filing does *not* fail
    // await navigateTo(dashboardUrl.value, { external: true })
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
  // TODO: consolidate with officers - break out common functionality
  try {
    // pull draft id from url or mark as undefined
    const result = receiverSchema.safeParse(receiverStore.formState)
    if (result.error) {
      // TODO: do not save if there are validation errors
      return
    }
    const draftId = (urlParams.draft as string) ?? undefined

    await receiverStore.save(draftId)

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
useFilingPageWatcher({
  store: receiverStore,
  businessId,
  draftId: urlParams.draft as string | undefined,
  feeCode: 'NOCOI',
  feeLabel: t('label.receiverChange'),
  pageLabel: t('page.manageReceivers.h1'),
  formId: 'receiver-filing',
  saveFiling,
  cancelFiling,
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
    :aria-label="t('page.manageReceivers.h1')"
    @submit="submitFiling"
    @error="onError"
  >
    <div class="space-y-1">
      <h1>{{ t('page.manageReceivers.h1') }}</h1>
      <!-- TODO: add text/translation -->
      <p>Some receiver descriptive text</p>
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
