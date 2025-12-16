<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { onFormSubmitError } from '#imports' // auto imports causing type error for this util
import { DateTime } from 'luxon'

const { t } = useI18n()
const store = useDodStore()
const urlParams = useUrlSearchParams()
const route = useRoute()
const modal = useFilingModals()
const { handleButtonLoading } = useConnectButtonControl()

const businessId = route.params.businessId as string
const FILING_TYPE = FilingType.DISSOLUTION
const FILING_SUB_TYPE = FilingSubType.DISSOLUTION_DELAY

const filingText = computed(() => {
  return {
    h1: store.isStaff ? t('page.dissolution.delay.h1Staff') : t('page.dissolution.delay.h1'),
    title: store.isStaff ? t('page.dissolution.delay.titleStaff') : t('page.dissolution.delay.title')
  }
})

const { breadcrumbs, dashboardUrl } = useFilingNavigation(filingText.value.h1)

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

useHead({
  title: filingText.value.title
})

// TODO: figure out display if invalid date was manually entered - maybe move to store
const delayDateDisplay = computed<string>((previous) => {
  const dt = DateTime.fromISO(store.formState.delay.date, { zone: 'America/Vancouver' })

  if (!dt.isValid) {
    return previous || '' // TODO: fallback value? Only update if valid selection?
  }

  return dt.toFormat('DDD')
})

async function submitFiling(e: FormSubmitEvent<unknown>) {
  try {
    handleButtonLoading(true, 'right', 1)
    console.info('Data: ', e.data)
    await store.submit(true)
    await navigateTo(dashboardUrl.value, { external: true })
  } catch {
    handleButtonLoading(false)
  }
}

async function saveFiling(resumeLater = false, _disableActiveFormCheck = false) {
  try {
    await store.submit(false)
    // if resume later, navigate back to business dashboard
    if (resumeLater) {
      await navigateTo(dashboardUrl.value, { external: true })
    }
  } catch (error) {
    await modal.openSaveFilingErrorModal(error)
  }
}

async function cancelFiling() {
  // TODO: check has changes, display modal if unsaved changes
  await navigateTo(dashboardUrl.value, { external: true })
}

// TODO: update type
useFilingPageWatcher<DissolutionType>({
  store,
  businessId,
  filingType: FILING_TYPE,
  filingSubType: FILING_SUB_TYPE,
  draftId: urlParams.draft as string | undefined,
  saveFiling: { onClick: () => saveFiling(true) },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'dod-filing' },
  breadcrumbs,
  setOnBeforeSessionExpired: () => saveFiling(false, true)
})
</script>

<template>
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
        as="p"
        translation-path="page.dissolution.delay.desc"
        :date="delayDateDisplay"
      />
      <AlertMaxTwoDelays v-if="!store.isStaff" data-testid="alert-max-2-days" />
    </div>

    <FormDelayDate
      v-model="store.formState.delay"
      data-testid="form-section-delay-date"
      order="1"
      :is-staff="store.isStaff"
      name="delay"
      :delay-date-display="delayDateDisplay"
    />

    <FormCourtOrderPoa
      v-if="store.isStaff"
      v-model="store.formState.courtOrder"
      data-testid="form-section-court-order-poa"
      name="courtOrder"
      order="2"
    />

    <FormFolio
      v-model="store.formState.folio"
      data-testid="form-section-folio-number"
      name="folio"
      :order="store.isStaff ? 3 : 2"
    />

    <FormAddToLedger
      v-if="store.isStaff"
      v-model="store.formState.addToLedger"
      data-testid="form-section-add-to-ledger"
      name="addToLedger"
      order="4"
    />

    <FormCertify
      v-else
      v-model="store.formState.certify"
      data-testid="form-section-certify"
      :description="t('text.certifyDelayDescription')"
      name="certify"
      order="3"
    />
  </UForm>
</template>
