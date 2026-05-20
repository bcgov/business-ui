<script setup lang="ts">
import type { FormErrorEvent, Form } from '@nuxt/ui'
import type { FetchError } from 'ofetch'
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
const { business } = storeToRefs(useBusinessStore())
const { handleButtonLoading, setAlertText: setBtnCtrlAlert } = useConnectButtonControl()
const { setAlert: setPartiesAlert } = useFilingAlerts('manage-parties')
const { setAlert: setOfficesAlert } = useFilingAlerts('manage-offices')

const FILING_TYPE = FilingType.CHANGE_OF_LIQUIDATORS
const businessId = route.params.businessId as string
const filingSubType = route.params.filingSubType as LiquidateType
const officeSubject = t(`officeType.${OfficeType.LIQUIDATION}`)
const showLiqRecordsOffice = computed(() => (
  [LiquidateType.INTENT, LiquidateType.ADDRESS, LiquidateType.REPORT].includes(filingSubType)
  || (LiquidateType.APPOINT && !business.value?.inLiquidation)
))
const isReport = filingSubType === LiquidateType.REPORT
const { dashboardUrl, breadcrumbs } = useFilingNavigation(t(`page.${FILING_TYPE}.${filingSubType}.h1`))
const formRef = useTemplateRef<Form<LiquidatorFormSchema>>('liquidator-filing')
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

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
    [LiquidateType.APPOINT]: !business.value?.inLiquidation ? [ManageAllowedAction.ADD] : [],
    [LiquidateType.CEASE]: [],
    [LiquidateType.INTENT]: [ManageAllowedAction.ADD],
    [LiquidateType.REPORT]: []
  }
  return actionMap[filingSubType]
})

const {
  canSubmit,
  canSave,
  canCancel,
  initBeforeUnload,
  revokeBeforeUnload
} = useFilingTaskGuards(
  [
    [() => store.initialFormState, () => store.formState],
    [() => store.initialLiquidators, () => store.liquidators],
    [() => store.initialOffices, () => store.offices]
  ],
  isReport
    ? undefined
    : () => store.liquidators.some(l => l.new.actions.length > 0)
      || store.offices.some(o => o.new.actions.length > 0)
)

function checkActiveSubForm() {
  const alertMsg = t('text.finishTaskBeforeOtherChanges')
  const hasActiveSubForm
    = (store.formState.activeOffice && setOfficesAlert('office-address-form', alertMsg))
      || (store.formState.activeParty && setPartiesAlert('party-details-form', alertMsg))

  return hasActiveSubForm
}

// liquidators always required except for liquidationReport
// filing task guards will catch most cases but extra check required for intentToLiquidate
function checkLiquidatorsRequired() {
  const liquidatorRequired = filingSubType === LiquidateType.INTENT
    && !store.liquidators.some(l => l.new.actions.length > 0)
  if (liquidatorRequired) {
    setPartiesAlert('parties-table', t('validation.noSubjectAddedYet', { subject: t('label.liquidators') }))
  }
  return liquidatorRequired
}

// offices always required for intentToLiquidate
// offices required when appointLiquidator and business not yet in liquidation
function checkOfficesRequired() {
  const isIntent = filingSubType === LiquidateType.INTENT
  const isAppoint = filingSubType === LiquidateType.APPOINT
  const officeRequired = (isIntent || (isAppoint && !business.value?.inLiquidation))
    && !store.offices.some(o => o.new.actions.length > 0)
  if (officeRequired) {
    setOfficesAlert('offices-table', t('validation.noSubjectAddedYet', { subject: officeSubject }))
  }
  return officeRequired
}

async function submitFiling() {
  try {
    setBtnCtrlAlert(undefined)
    if (checkActiveSubForm()) {
      return
    }
    if (checkLiquidatorsRequired() || checkOfficesRequired()) {
      return
    }
    if (!canSubmit()) {
      return setBtnCtrlAlert(t('text.noChangesToSubmit'), 'right')
    }
    handleButtonLoading(true, 'right', 1)
    await store.submit(true)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    const e = error as FetchError<LiquidatorDraftState>
    // in case there was a failure and it saved a draft
    const filingResp = e.response?._data
    const urlParams = useUrlSearchParams()
    urlParams.draft = String(filingResp?.filing?.header?.filingId)
    await modal.openSaveFilingErrorModal(error)
    handleButtonLoading(false)
    initBeforeUnload()
  }
}

async function cancelFiling() {
  if (!canCancel()) {
    return
  }
  await navigateTo(dashboardUrl.value, { external: true })
}

async function saveFiling(enableUnsavedChangesBlock = true) {
  try {
    if (enableUnsavedChangesBlock) {
      if (checkActiveSubForm()) {
        return
      }
      if (!canSave()) {
        return setBtnCtrlAlert(t('text.noChangesToSave'), 'left')
      }
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
  saveFiling: isReport ? null : { onClick: () => saveFiling(true) },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'liquidator-filing' },
  breadcrumbs,
  setOnBeforeSessionExpired: async () => {
    if (canSave() && !isReport) {
      await saveFiling(false)
    }
  }
})

onMounted(() => {
  if (isReport) {
    // disable unsaved changes check for Liquidation Report (no drafts)
    revokeBeforeUnload()
  }
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

      <div class="space-y-4" data-testid="liquidator-info-section">
        <ManageParties
          v-model:active-party="store.formState.activeParty"
          :loading="store.initializing"
          :empty-text="$t('text.noLiquidators')"
          :section-title="`1. ${$t('label.liquidatorInfo')}`"
          :table-title="$t('label.liquidators')"
          :subject="$t('label.liquidator')"
          :allowed-actions="allowedPartyActions"
          :role-type="RoleTypeUi.LIQUIDATOR"
          :party-form-props="{
            partyNameProps: { allowBusinessName: true, allowPreferredName: false }
          }"
        />

        <ConnectFormFieldWrapper
          v-if="isReport"
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
      </div>

      <div
        v-if="showLiqRecordsOffice"
        class="space-y-4"
        data-testid="records-office-section"
      >
        <ManageOffices
          v-model:active-office="store.formState.activeOffice"
          :loading="store.initializing"
          :empty-text="$t('label.noOffice')"
          :subject="officeSubject"
          :section-title="`2. ${$t('label.liquidationRecordsOfficeAddress')}`"
          :section-description="$t('text.liquidationRecordsOfficeAddressDesc')"
          :table-title="$t('label.offices')"
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
      </div>

      <FormCourtOrderPoa
        v-if="filingSubType !== LiquidateType.REPORT"
        ref="court-order-poa-ref"
        v-model="store.formState.courtOrder"
        data-testid="court-order-section"
        :disabled="store.initializing"
        name="courtOrder"
        :order="showLiqRecordsOffice ? 3 : 2"
      />

      <StaffPaymentFieldset
        ref="staff-pay-ref"
        v-model="store.formState.staffPayment"
        :order="isReport ? 3 : showLiqRecordsOffice ? 4 : 3"
        :initializing="store.initializing"
      />
    </UForm>
  </div>
</template>
