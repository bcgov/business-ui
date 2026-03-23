<script setup lang="ts">
import type { FetchError } from 'ofetch'
import { z } from 'zod'
import { DateTime } from 'luxon'

const { t } = useI18n()
const store = useDodStore()
const { initializing } = storeToRefs(store)
const urlParams = useUrlSearchParams()
const route = useRoute()
const modal = useFilingModals()
const { handleButtonLoading, setAlertText: setBtnCtrlAlert } = useConnectButtonControl()
const rtc = useRuntimeConfig().public

const businessId = route.params.businessId as string
const filingSubType = route.params.filingSubType as DissolutionType
const FILING_TYPE = FilingType.DISSOLUTION

const filingText = {
  h1: t('page.dissolution.delay.h1'),
  title: t('page.dissolution.delay.title')
}

const { breadcrumbs, dashboardUrl } = useFilingNavigation(filingText.h1)

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth'],
  path: '/dissolution/:businessId/:filingSubType'
})

useHead({
  title: filingText.title
})

const delayDateDisplay = computed<string>((previous) => {
  const dissolutionDate = DateTime.fromISO(
    store.dissolutionInfo.targetDissolutionDate,
    { zone: 'America/Vancouver' }
  )
  const unknownStr = `[${t('text.unknown')}]`

  if (!dissolutionDate.isValid) {
    return unknownStr
  }

  const delayDate = DateTime.fromISO(store.formState.delay.date, { zone: 'America/Vancouver' })
  const delayOption = store.formState.delay.option

  if (delayOption === DelayOption.DEFAULT) {
    return dissolutionDate.plus({ months: 6 }).toFormat('DDD')
  } else {
    // selected date
    if (!delayDate.isValid) {
      return previous || unknownStr
    }
    return store.dissolutionInfo.isStage1
      ? delayDate.plus({ days: Number(rtc.disStageDelay) }).toFormat('DDD')
      : delayDate.toFormat('DDD')
  }
})

// no canSubmit check as no changes are actually required to submit the filing
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
    const e = error as FetchError<DissolutionDraftState>
    // in case there was a failure and it saved a draft
    const filingResp = e.response?._data
    const urlParams = useUrlSearchParams()
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

useFilingPageWatcher<DissolutionType>({
  store,
  businessId,
  filingSubType,
  filingType: FILING_TYPE,
  draftId: urlParams.draft as string | undefined,
  saveFiling: { onClick: () => saveFiling(true) },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'dod-filing' },
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
      id="dod-filing"
      ref="dod-filing"
      :state="store.formState"
      :schema="z.any()"
      novalidate
      class="py-6 space-y-6 sm:py-10 sm:space-y-10"
      :aria-label="filingText.h1"
      @error="onFormSubmitError"
      @submit="submitFiling"
    >
      <div class="space-y-4">
        <h1>{{ filingText.h1 }}</h1>
        <ConnectI18nHelper
          v-if="store.isStaff"
          as="p"
          translation-path="page.dissolution.delay.desc"
          :date="delayDateDisplay"
        />
        <AlertMaxTwoDelays v-if="!store.isStaff" data-testid="alert-max-2-days" />
      </div>

      <FormDelayDate
        v-model="store.formState.delay"
        data-testid="form-section-delay-date"
        :disabled="initializing"
        order="1"
        :is-staff="store.isStaff"
        name="delay"
        :delay-date-display="delayDateDisplay"
      />

      <FormCourtOrderPoa
        v-if="store.isStaff"
        v-model="store.formState.courtOrder"
        data-testid="form-section-court-order-poa"
        :disabled="initializing"
        name="courtOrder"
        order="2"
      />

      <FormFolio
        v-model="store.formState.folio"
        data-testid="form-section-folio-number"
        :disabled="initializing"
        name="folio"
        :order="store.isStaff ? 3 : 2"
      />

      <FormAddToLedger
        v-if="store.isStaff"
        v-model="store.formState.addToLedger"
        data-testid="form-section-add-to-ledger"
        :disabled="initializing"
        name="addToLedger"
        order="4"
      />

      <FormCertify
        v-else
        v-model="store.formState.certify"
        data-testid="form-section-certify"
        :description="t('text.certifyDelayDescription')"
        :disabled="initializing"
        name="certify"
        order="3"
      />
    </UForm>
  </div>
</template>
