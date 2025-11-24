<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useI18n()
const urlParams = useUrlSearchParams()
const route = useRoute()
const { setButtonControl } = useConnectButtonControl()
const modal = useFilingModals()
const { dashboardUrl, breadcrumbs } = useFilingNavigation(t('page.manageReceivers.h1'))
const receiverSchema = getReceiversSchema()
const receiverStore = useReceiverStore()
const businessStore = useBusinessStore()
const feeStore = useConnectFeeStore()
const accountStore = useConnectAccountStore()

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

// submit final filing
async function submitFiling(e: FormSubmitEvent<unknown>) {
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

// TODO: consolidate with officers
watch(
  () => accountStore.currentAccount.id,
  async () => {
    const draftId = (urlParams.draft as string) ?? undefined
    await receiverStore.init(businessId, draftId)

    // load fees
    if (businessStore.business?.legalType !== undefined) {
      try {
        // TODO: update init with actual fee codes -> potentially move this into common code
        const officerFeeCode = 'NOCOI'
        await feeStore.initFees(
          [
            { code: officerFeeCode, entityType: businessStore.business.legalType, label: t('label.officerChange') }
          ],
          // TODO: need design input
          { label: t('page.manageReceivers.h1') }
        )
      } catch {
        // do nothing if fee failed
      }
    }

    setBreadcrumbs(breadcrumbs.value)

    setButtonControl({
      leftGroup: {
        buttons: [
          { onClick: () => saveFiling(true), label: t('label.saveResumeLater'), variant: 'outline' }
        ]
      },
      rightGroup: {
        buttons: [
          { onClick: cancelFiling, label: t('label.cancel'), variant: 'outline' },
          {
            label: t('label.submit'),
            type: 'submit',
            trailingIcon: 'i-mdi-chevron-right',
            // @ts-expect-error - form attr will be typed once this change has been published
            // https://github.com/nuxt/ui/pull/5348
            form: 'receiver-filing'
          }
        ]
      }
    })

    // save filing before user logged out when session expires
    setOnBeforeSessionExpired(async () => {
      await saveFiling(false, true)
    })
  },
  { immediate: true }
)
</script>

<template>
  <UForm
    id="receiver-filing"
    ref="receiver-filing"
    :state="receiverStore.formState"
    :schema="receiverSchema"
    class="py-10 space-y-10"
    novalidate
    :aria-label="t('page.manageReceivers.h1')"
    @submit="submitFiling"
    @error="(e) => console.info('validation errors: ', e.errors)"
  >
    <div class="space-y-1">
      <h1>{{ t('page.manageReceivers.h1') }}</h1>
      <p>Some receiver descriptive text</p>
    </div>

    <section class="space-y-4">
      <h2 class="text-base">
        1. Receiver Information
      </h2>

      <TableReceiver
        v-model:active-party="receiverStore.formState.activeParty"
        :loading="receiverStore.initializing"
        :empty-text="receiverStore.initializing ? 'Loading current receivers' : 'There are currently no Receivers'"
        add-label="Add Receiver"
        edit-label="Edit Receiver"
      />

      <!-- <UButton
        label="Add Receiver"
        variant="outline"
        icon="i-mdi-account-plus-outline"
        class="w-min"
        @click="receiverStore.initAddReceiver"
      />

      <FormReceiverDetails
        v-if="receiverStore.addingReceiver && receiverStore.formState.activeParty"
        v-model="receiverStore.formState.activeParty"
        name="activeParty"
        variant="add"
        @done="receiverStore.addNewReceiver"
        @cancel="receiverStore.cancelAddReceiver"
      />

      <TableParty
        v-model:expanded="receiverStore.expandedReceiver"
        :data="receiverStore.receiverTableState"
        :loading="receiverStore.initializing"
        :empty-text="receiverStore.initializing ? 'Loading current receivers' : 'There are currently no Receivers'"
        @init-edit="receiverStore.initEditReceiver"
        @remove="receiverStore.removeReceiver"
        @undo="receiverStore.undoReceiver"
      >
        <template #expanded="{ row }">
          <FormReceiverDetails
            v-if="receiverStore.formState.activeParty"
            v-model="receiverStore.formState.activeParty"
            name="activeParty"
            variant="edit"
            @done="() => receiverStore.applyReceiverEdits(row)"
            @cancel="receiverStore.cancelEditReceiver"
          />
        </template>
      </TableParty> -->
    </section>

    <FormCourtOrderPoa
      ref="court-order-poa-ref"
      v-model="receiverStore.formState.courtOrder"
      name="courtOrder"
      order="2"
      :state="receiverStore.formState.courtOrder"
    />

    <div class="border-2 border-black w-full p-10 font-bold">
      DOCUMENT SCANNING
    </div>

    <ConnectFieldset label="4. Staff Payment" body-variant="card">
      <ConnectFormFieldWrapper label="Payment" orientation="horizontal">
        <StaffPayment
          v-model="receiverStore.formState.staffPayment"
          :state="receiverStore.formState.staffPayment"
          :show-priority="true"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
