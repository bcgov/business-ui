<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'
import { RoleTypeUi } from '#imports'

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth'],
  path: '/manage-receivers/:businessId/:filingSubType',
  validate(route) {
    const filingSubType = route.params.filingSubType as string
    return Object.values(ReceiverType).includes(filingSubType as ReceiverType)
  }
})

const { t } = useI18n()
const urlParams = useUrlSearchParams()
const route = useRoute()
const modal = useFilingModals()
const receiverStore = useReceiverStore()
const { initializing } = storeToRefs(receiverStore)
const { handleButtonLoading, setAlertText: setBtnCtrlAlert } = useConnectButtonControl()
const { setAlert: setSubFormAlert } = useFilingAlerts('manage-parties')

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

const allowedPartyActions = computed(() => {
  const actionMap: Record<ReceiverType, ManageAllowedAction[] | undefined> = {
    [ReceiverType.ADDRESS]: [ManageAllowedAction.ADDRESS_CHANGE],
    [ReceiverType.APPOINT]: [ManageAllowedAction.ADD],
    [ReceiverType.CEASE]: [ManageAllowedAction.REMOVE],
    [ReceiverType.AMEND]: undefined
  }
  return actionMap[filingSubType]
})

const {
  hasChanges,
  initBeforeUnload,
  revokeBeforeUnload,
  cancelBlocked,
  saveBlocked,
  submitBlocked
} = useFilingTaskGuards(
  [
    [() => receiverStore.initialFormState, () => receiverStore.formState],
    [() => receiverStore.initialReceivers, () => receiverStore.receivers]
  ],
  () => !!receiverStore.receivers.find(r => r.new.actions.length > 0)
)

// submit final filing
async function submitFiling() {
  try {
    setBtnCtrlAlert(undefined)
    if (submitBlocked(urlParams.draft as string | undefined)) {
      return setBtnCtrlAlert('Update at least one Receiver to submit.', 'right')
    }
    handleButtonLoading(true, 'right', 1)
    await receiverStore.submit(true)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    await modal.openSaveFilingErrorModal(error)
    handleButtonLoading(false)
    initBeforeUnload()
  }
}

async function cancelFiling() {
  if (cancelBlocked()) {
    return
  }
  await navigateTo(dashboardUrl.value, { external: true })
}

async function saveFiling(enableUnsavedChangesBlock = true) {
  try {
    if (enableUnsavedChangesBlock) {
      if (saveBlocked()) {
        return setBtnCtrlAlert('There are no changes to save.', 'left')
      }
      if (receiverStore.formState.activeParty !== undefined) {
        return setSubFormAlert('party-details-form', 'Finish this task before saving.')
      }
    }
    await receiverStore.submit(false)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    if (enableUnsavedChangesBlock) {
      await modal.openSaveFilingErrorModal(error)
      initBeforeUnload()
    }
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
  saveFiling: { onClick: () => saveFiling() },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'receiver-filing' },
  breadcrumbs,
  // TODO: currently even if a draft is saved it doesnt include the
  // draft url param to reload the draft once the user logs back in
  // need to sort out why and fix
  setOnBeforeSessionExpired: async () => {
    if (hasChanges.value) {
      await saveFiling(false)
    }
  }
})
</script>

<template>
  <div>
    <ConnectSpinner v-if="initializing" fullscreen />
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
          1. {{ t('label.receiverInfo') }}
        </h2>

        <ManageParties
          v-model:active-party="receiverStore.formState.activeParty"
          :loading="receiverStore.initializing"
          :empty-text="receiverStore.initializing ? `${t('label.loading')}...` : t('text.noReceivers')"
          :add-label="t('label.addReceiver')"
          :edit-label="t('label.editReceiver')"
          :role-type="RoleTypeUi.RECEIVER"
          :allowed-actions="allowedPartyActions"
        />
      </section>

      <FormCourtOrderPoa
        ref="court-order-poa-ref"
        v-model="receiverStore.formState.courtOrder"
        :disabled="initializing"
        name="courtOrder"
        order="2"
        :state="receiverStore.formState.courtOrder"
      />

      <FormDocumentId
        ref="document-id-ref"
        v-model="receiverStore.formState.documentId"
        :disabled="initializing"
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
            :disabled="initializing"
            :show-priority="true"
            name="staffPayment"
            :enable-auto-reset="!receiverStore.initializing"
          />
        </ConnectFormFieldWrapper>
      </ConnectFieldset>
    </UForm>
  </div>
</template>
