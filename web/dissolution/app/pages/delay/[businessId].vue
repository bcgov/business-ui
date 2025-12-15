<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { onFormSubmitError } from '#imports'
import { DateTime } from 'luxon'

const { t } = useI18n()
const store = useDodStore()
// const urlParams = useUrlSearchParams()
// const route = useRoute()
// const modal = useFilingModals()
// const { currentAccount } = storeToRefs(useConnectAccountStore())

// const isStaff = computed(() => currentAccount.value.accountType === AccountType.STAFF)
const filingHeading = computed(() => store.isStaff ? t('page.delay.h1Staff') : t('page.delay.h1'))

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

useHead({
  title: t('page.delay.title')
})

// TODO: figure out display if invalid date was menually entered - maybe move to store
const delayDateDisplay = computed<string>((previous) => {
  const dt = DateTime.fromISO(store.formState.delay.date, { zone: 'America/Vancouver' })

  if (!dt.isValid) {
    return previous || '' // TODO: fallback value? Only update if valid selection?
  }

  return dt.toFormat('DDD')
})

async function submitFiling(e: FormSubmitEvent<unknown>) {
  console.info('Data: ', e.data)
  await store.submit
}
</script>

<template>
  <UForm
    id="dod-filing"
    ref="dod-filing"
    :state="store.formState"
    :schema="z.any()"
    novalidate
    class="py-6 space-y-6 sm:py-10 sm:space-y-10"
    :aria-label="filingHeading"
    @error="onFormSubmitError"
    @submit="submitFiling"
  >
    <div class="space-y-4">
      <h1>{{ filingHeading }}</h1>
      <ConnectI18nHelper
        as="p"
        translation-path="page.delay.desc"
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

    <UButton type="submit" label="Submit" />
  </UForm>
</template>
