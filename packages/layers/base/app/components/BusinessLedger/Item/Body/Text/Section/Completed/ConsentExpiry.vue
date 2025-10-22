<script setup lang="ts">
const { t } = useI18n()

const filing = inject<BusinessLedgerItem>('filing')!
const { foreignJurisdiction, isFilingType } = useBusinessLedger(filing)

const expiryDate = toDate(
  filing.data?.consentAmalgamationOut?.expiry || filing.data?.consentContinuationOut?.expiry || '')

const expiry = expiryDate ? toPacificDateTime(expiryDate) : null

/** Check if Consent is Expired. (Assumes expiry is not empty.) */
const isConsentExpired: Ref<boolean> = computed(() => {
  if (expiryDate) {
    const daysToExpire = daysBetween(new Date(), expiryDate)
    if (daysToExpire !== undefined && daysToExpire < 0) {
      return true
    }
  }
  return false
})

const name = isFilingType(FilingType.CONSENT_AMALGAMATION_OUT)
  ? t('text.amalgamateOut')
  : t('text.continueOut')

const notExpiredText = t(
  'text.thisConsentToIsValidUntilDate',
  { boldStart: '<strong>', boldEnd: '</strong>', date: expiry, foreignJurisdiction: foreignJurisdiction.value, name }
)
</script>

<template>
  <div>
    <!-- TODO test BC0887698 -->
    <div v-if="isConsentExpired" class="flex gap-2 items-start">
      <UIcon name="i-mdi-alert" class="text-warning text-xl" />
      <p>
        {{ $t('text.expiredConsent', { name }) }}
      </p>
    </div>
    <!-- NOTE: no user inputted values are used below -->
    <!-- eslint-disable-next-line vue/no-v-html  -->
    <p v-else v-html="notExpiredText" />
  </div>
</template>
