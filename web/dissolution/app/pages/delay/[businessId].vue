<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { onFormSubmitError } from '#imports'
import { DateTime } from 'luxon'

const { t } = useI18n()
// const urlParams = useUrlSearchParams()
// const route = useRoute()
// const modal = useFilingModals()
const { currentAccount } = storeToRefs(useConnectAccountStore())

const isStaff = computed(() => currentAccount.value.accountType === AccountType.STAFF)
const filingHeading = computed(() => isStaff.value ? t('page.delay.h1Staff') : t('page.delay.h1'))

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: ['connect-auth']
})

useHead({
  title: t('page.delay.title')
})
const schema = getDodSchema()

const formState = reactive(schema.parse({}))

const delayDateDisplay = computed<string>((previous) => {
  const dt = DateTime.fromISO(formState.delay.date, { zone: 'America/Vancouver' })

  if (!dt.isValid) {
    return previous || '' // TODO: fallback value? Only update if valid selection?
  }

  return dt.toFormat('DDD')
})

function submitFiling(e: FormSubmitEvent<unknown>) {
  console.info('Data: ', e.data)
}
</script>

<template>
  <UForm
    id="dod-filing"
    ref="dod-filing"
    :state="formState"
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
      <AlertMaxTwoDelays v-if="!isStaff" />
    </div>

    <FormDelayDate
      v-model="formState.delay"
      order="1"
      :is-staff="isStaff"
      name="delay"
      :delay-date-display="delayDateDisplay"
    />

    <FormCourtOrderPoa
      v-if="isStaff"
      ref="court-order-poa-ref"
      v-model="formState.courtOrder"
      name="courtOrder"
      order="2"
    />

    <FormFolio
      ref="folio-ref"
      v-model="formState.folio"
      name="folio"
      :order="isStaff ? 3 : 2"
    />

    <FormAddToLedger
      v-if="isStaff"
      v-model="formState.addToLedger"
      order="4"
    />

    <FormCertify
      v-else
      ref="certify-ref"
      v-model="formState.certify"
      :description="t('text.certifyDelayDescription')"
      name="certify"
      order="3"
    />

    <UButton type="submit" label="Submit" />
  </UForm>
</template>
