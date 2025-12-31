<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth'],
  path: '/manage-liquidators/:businessId/:filingSubType',
  validate(route) {
    const filingSubType = route.params.filingSubType as string
    return Object.values(LiquidateType).includes(filingSubType as LiquidateType)
  }
})

const { t } = useI18n()
const urlParams = useUrlSearchParams()
const route = useRoute()
const modal = useFilingModals()
const liquidatorStore = useLiquidatorStore()
const { handleButtonLoading } = useConnectButtonControl()

const FILING_TYPE = FilingType.CHANGE_OF_LIQUIDATORS
const businessId = route.params.businessId as string
const filingSubType = route.params.filingSubType as LiquidateType
const isIntentToLiquidate = filingSubType === LiquidateType.INTENT

useHead({
  title: t(`page.${FILING_TYPE}.${filingSubType}.title`)
})

const { dashboardUrl, breadcrumbs } = useFilingNavigation(t(`page.${FILING_TYPE}.${filingSubType}.h1`))

const staffPayFormRef = useTemplateRef<StaffPaymentFormRef>('staff-pay-ref')
// leaving - might be needed to validate form before submit/save
// const formRef = useTemplateRef<Form<LiquidatorFormSchema>>('liquidator-filing')

const allowedPartyActions = computed(() => {
  const actionMap: Record<LiquidateType, ManageAllowedAction[] | undefined> = {
    [LiquidateType.ADDRESS]: [ManageAllowedAction.ADDRESS_CHANGE],
    [LiquidateType.APPOINT]: [ManageAllowedAction.ADD],
    [LiquidateType.CEASE]: [ManageAllowedAction.REMOVE],
    [LiquidateType.INTENT]: [ManageAllowedAction.ADD],
    [LiquidateType.REPORT]: undefined
  }
  return actionMap[filingSubType]
})

async function submitFiling() {
  try {
    // TODO: check if filing has new data before submit
    handleButtonLoading(true, 'right', 1)
    await liquidatorStore.submit(true)
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    await modal.openSaveFilingErrorModal(error)
    handleButtonLoading(false)
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

// TODO: validate form before save?
async function saveFiling(resumeLater = false, disableActiveFormCheck = false) {
  try {
    if (!disableActiveFormCheck && useManageParties().addingParty.value) {
      // TODO: temporary text - update in lang file or change this to scroll etc.
      useConnectButtonControl().setAlertText('Please complete your expanded Liquidator above', 'left', 0)
      return
    }

    await liquidatorStore.submit(false)

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

useFilingPageWatcher<LiquidateType>({
  store: liquidatorStore,
  businessId,
  draftId: urlParams.draft as string | undefined,
  filingType: FilingType.CHANGE_OF_LIQUIDATORS,
  filingSubType,
  saveFiling: { onClick: () => saveFiling(true) },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'liquidator-filing' },
  breadcrumbs,
  setOnBeforeSessionExpired: () => saveFiling(false, true)
})
</script>

<template>
  <UForm
    id="liquidator-filing"
    ref="liquidator-filing"
    :state="liquidatorStore.formState"
    :schema="z.any()"
    novalidate
    class="py-10 space-y-10"
    aria-labelledby="filing-title"
    @submit="submitFiling"
    @error="onError"
  >
    <div class="space-y-1">
      <h1 id="filing-title">
        {{ t(`page.${FILING_TYPE}.${filingSubType}.h1`) }}
      </h1>
      <p>{{ t(`page.${FILING_TYPE}.${filingSubType}.desc`) }}</p>
    </div>

    <section class="space-y-4" data-testid="liquidator-info-section">
      <h2 class="text-base">
        1. {{ t('label.liquidatorInfo') }}
      </h2>

      <ManageParties
        v-model:active-party="liquidatorStore.formState.activeParty"
        :loading="liquidatorStore.initializing"
        :empty-text="liquidatorStore.initializing ? `${t('label.loading')}...` : t('text.noLiquidators')"
        :add-label="t('label.addLiquidator')"
        :edit-label="t('label.editLiquidator')"
        :allowed-actions="allowedPartyActions"
        :role-type="RoleTypeUi.LIQUIDATOR"
      />
    </section>

    <FormCourtOrderPoa
      ref="court-order-poa-ref"
      v-model="liquidatorStore.formState.courtOrder"
      data-testid="court-order-section"
      name="courtOrder"
      order="2"
      :state="liquidatorStore.formState.courtOrder"
    />

    <FormDocumentId
      ref="document-id-ref"
      v-model="liquidatorStore.formState.documentId"
      data-testid="document-id-section"
      name="documentId"
      order="3"
      :state="liquidatorStore.formState.documentId"
    />

    <ConnectFieldset
      v-if="isIntentToLiquidate"
      data-testid="records-office-section"
      :label="'4. ' + t('label.liquidationRecordsOfficeAddress')"
      :description="t('text.liquidationRecordsOfficeAddressDesc')"
      body-variant="card"
    >
      <ConnectFormFieldWrapper
        :label="t('label.liquidationRecordsOfficeAddress')"
        orientation="horizontal"
      >
        <FormAddress
          id="records-office"
          v-model="liquidatorStore.formState.recordsOffice"
          name="recordsOffice"
          nested
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>

    <!-- TODO: add text/translation -->
    <ConnectFieldset
      data-testid="staff-payment-section"
      :label="(isIntentToLiquidate ? '5. ' : '4.') + 'Staff Payment'"
      body-variant="card"
    >
      <ConnectFormFieldWrapper label="Payment" orientation="horizontal">
        <StaffPayment
          ref="staff-pay-ref"
          v-model="liquidatorStore.formState.staffPayment"
          :show-priority="true"
          name="staffPayment"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
