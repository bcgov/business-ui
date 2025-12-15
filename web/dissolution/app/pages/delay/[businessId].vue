<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { onFormSubmitError } from '#imports' // auto imports causing type error for this util
import { DateTime } from 'luxon'

const { t } = useI18n()
const store = useDodStore()
const { breadcrumbs, dashboardUrl } = useFilingNavigation()
const urlParams = useUrlSearchParams()
const route = useRoute()
const modal = useFilingModals()
const { handleButtonLoading } = useConnectButtonControl()

const businessId = route.params.businessId as string

const filingText = computed(() => {
  return {
    h1: store.isStaff ? t('page.stayDissolution.h1') : t('page.delayDissolution.h1'),
    title: store.isStaff ? t('page.stayDissolution.title') : t('page.delayDissolution.title'),
    description: store.isStaff ? 'page.stayDissolution.desc' : 'page.delayDissolution.desc' // component only needs the translation key
  }
})
const filingSubType = computed(() => store.isStaff ? 'stay' : 'delay')

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
useFilingPageWatcher<unknown>({
  // @ts-expect-error - unknown filing type not matching 'delay' | 'stay'
  // this should be fixed once the types are complete
  store,
  businessId,
  // @ts-expect-error - filing type not matching 'delay' | 'stay'
  // this should be fixed once the types are complete
  filingType: filingSubType.value, // TODO: IMPORTANT: determine if stay/delay are sub types or filing types
  filingSubType,
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
        :translation-path="filingText.description"
        :date="delayDateDisplay"
      />
      <AlertMaxTwoDelays v-if="!store.isStaff" />
    </div>

    <FormDelayDate
      v-model="store.formState.delay"
      order="1"
      :is-staff="store.isStaff"
      name="delay"
      :delay-date-display="delayDateDisplay"
    />

    <FormCourtOrderPoa
      v-if="store.isStaff"
      ref="court-order-poa-ref"
      v-model="store.formState.courtOrder"
      name="courtOrder"
      order="2"
    />

    <FormFolio
      ref="folio-ref"
      v-model="store.formState.folio"
      name="folio"
      :order="store.isStaff ? 3 : 2"
    />

    <FormAddToLedger
      v-if="store.isStaff"
      v-model="store.formState.addToLedger"
      order="4"
    />

    <FormCertify
      v-else
      ref="certify-ref"
      v-model="store.formState.certify"
      :description="t('text.certifyDelayDescription')"
      name="certify"
      order="3"
    />
  </UForm>
</template>
