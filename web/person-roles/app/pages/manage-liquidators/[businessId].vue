<script setup lang="ts">
import type { FormErrorEvent, Form } from '@nuxt/ui'
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
const store = useLiquidatorStore()
const { handleButtonLoading } = useConnectButtonControl()

const FILING_TYPE = FilingType.CHANGE_OF_LIQUIDATORS
const businessId = route.params.businessId as string
const filingSubType = route.params.filingSubType as LiquidateType
const showLiqRecordsOffice = [LiquidateType.INTENT, LiquidateType.ADDRESS, LiquidateType.REPORT].includes(filingSubType)
const isReport = filingSubType === LiquidateType.REPORT
const { dashboardUrl, breadcrumbs } = useFilingNavigation(t(`page.${FILING_TYPE}.${filingSubType}.h1`))
const formRef = useTemplateRef<Form<LiquidatorFormSchema>>('liquidator-filing')
const staffPayFormRef = useTemplateRef<StaffPaymentFormRef>('staff-pay-ref')

useHead({
  title: t(`page.${FILING_TYPE}.${filingSubType}.title`)
})

// must confirm offices and parties for liquidationReport only
const schema = isReport
  ? z.object({
    confirmOffices: z.boolean().refine(val => val === true, t('connect.validation.required')),
    confirmParties: z.boolean().refine(val => val === true, t('connect.validation.required'))
  })
  : z.any()

const confirmErrors = computed(() => {
  const errors = formRef.value?.getErrors()

  return {
    confirmOffices: errors?.find(e => e.name?.includes('confirmOffices')),
    confirmParties: errors?.find(e => e.name?.includes('confirmParties'))
  }
})

const allowedPartyActions = computed(() => {
  const actionMap: Record<LiquidateType, ManageAllowedAction[] | undefined> = {
    [LiquidateType.ADDRESS]: [ManageAllowedAction.ADDRESS_CHANGE],
    [LiquidateType.APPOINT]: [ManageAllowedAction.ADD],
    [LiquidateType.CEASE]: [ManageAllowedAction.REMOVE],
    [LiquidateType.INTENT]: [ManageAllowedAction.ADD],
    [LiquidateType.REPORT]: []
  }
  return actionMap[filingSubType]
})

const allowedOfficeActions = computed(() => {
  const actionMap: Record<LiquidateType, ManageAllowedAction[] | undefined> = {
    [LiquidateType.ADDRESS]: [ManageAllowedAction.ADDRESS_CHANGE],
    [LiquidateType.APPOINT]: [],
    [LiquidateType.CEASE]: [],
    [LiquidateType.INTENT]: [ManageAllowedAction.ADD],
    [LiquidateType.REPORT]: []
  }
  return actionMap[filingSubType]
})

async function submitFiling() {
  try {
    handleButtonLoading(true, 'right', 1)
    await store.submit(true)
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

async function saveFiling(resumeLater = false, disableActiveFormCheck = false) {
  try {
    if (!disableActiveFormCheck && useManageParties().addingParty.value) {
      // TODO: temporary text - update in lang file or change this to scroll etc.
      useConnectButtonControl().setAlertText('Please complete your expanded Liquidator above', 'left', 0)
      return
    }

    await store.submit(false)

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
  store,
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
  <div>
    <ConnectSpinner v-if="store.initializing" fullscreen />
    <UForm
      id="liquidator-filing"
      ref="liquidator-filing"
      :state="store.formState"
      :schema
      novalidate
      class="py-10 space-y-10"
      aria-labelledby="filing-title"
      @submit="submitFiling"
      @error="onError"
    >
      <div class="space-y-1">
        <h1 id="filing-title">
          {{ $t(`page.${FILING_TYPE}.${filingSubType}.h1`) }}
        </h1>
        <p>{{ $t(`page.${FILING_TYPE}.${filingSubType}.desc`) }}</p>
      </div>

      <section class="space-y-4" data-testid="liquidator-info-section">
        <h2 class="text-base">
          1. {{ $t('label.liquidatorInfo') }}
        </h2>

        <ManageParties
          v-model:active-party="store.formState.activeParty"
          :loading="store.initializing"
          :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('text.noLiquidators')"
          :add-label="$t('label.addLiquidator')"
          :edit-label="$t('label.editLiquidator')"
          :allowed-actions="allowedPartyActions"
          :role-type="RoleTypeUi.LIQUIDATOR"
          :party-form-props="{
            partyNameProps: { allowBusinessName: true, allowPreferredName: false }
          }"
        />

        <ConnectFormFieldWrapper
          orientation="horizontal"
          :label="$t('label.confirm')"
          class="bg-white p-6 rounded"
          :error="confirmErrors.confirmParties"
        >
          <UFormField name="confirmParties" :ui="{ error: 'sr-only' }">
            <UCheckbox
              v-model="store.formState.confirmParties"
              :label="$t('text.confirmLiquidatorsCorrect')"
            />
          </UFormField>
        </ConnectFormFieldWrapper>
      </section>

      <section
        v-if="showLiqRecordsOffice"
        class="space-y-4"
        data-testid="records-office-section"
      >
        <div>
          <h2 class="text-base">
            2. {{ $t('label.liquidationRecordsOfficeAddress') }}
          </h2>
          <p>{{ $t('text.liquidationRecordsOfficeAddressDesc') }}</p>
        </div>

        <ManageOffices
          v-model:active-office="store.formState.activeOffice"
          :loading="store.initializing"
          :empty-text="store.initializing ? `${t('label.loading')}...` : t('label.noOffice')"
          :add-label="$t('label.addOfficeType', { type: $t(`officeType.${OfficeType.LIQUIDATION}`) })"
          :edit-label="$t('label.editOffice')"
          :allowed-actions="allowedOfficeActions"
          :allow-add-office-type="OfficeType.LIQUIDATION"
        />

        <ConnectFormFieldWrapper
          v-if="isReport"
          orientation="horizontal"
          :label="$t('label.confirm')"
          class="bg-white p-6 rounded"
          :error="confirmErrors.confirmOffices"
        >
          <UFormField name="confirmOffices" :ui="{ error: 'sr-only' }">
            <UCheckbox
              v-model="store.formState.confirmOffices"
              :label="$t('text.confirmOfficesCorrect')"
            />
          </UFormField>
        </ConnectFormFieldWrapper>
      </section>

      <FormCourtOrderPoa
        v-if="filingSubType !== LiquidateType.REPORT"
        ref="court-order-poa-ref"
        v-model="store.formState.courtOrder"
        data-testid="court-order-section"
        :disabled="store.initializing"
        name="courtOrder"
        order="3"
        :state="store.formState.courtOrder"
      />

      <FormDocumentId
        v-if="filingSubType !== LiquidateType.REPORT"
        ref="document-id-ref"
        v-model="store.formState.documentId"
        data-testid="document-id-section"
        :disabled="store.initializing"
        name="documentId"
        order="4"
        :state="store.formState.documentId"
      />

      <ConnectFieldset
        data-testid="staff-payment-section"
        :label="(isReport ? '3. ' : showLiqRecordsOffice ? '5. ' : '4.') + $t('label.staffPayment')"
        body-variant="card"
      >
        <ConnectFormFieldWrapper :label="$t('label.payment')" orientation="horizontal">
          <StaffPayment
            ref="staff-pay-ref"
            v-model="store.formState.staffPayment"
            :disabled="store.initializing"
            :show-priority="true"
            name="staffPayment"
            :enable-auto-reset="!store.initializing"
          />
        </ConnectFormFieldWrapper>
      </ConnectFieldset>
    </UForm>
  </div>
</template>
