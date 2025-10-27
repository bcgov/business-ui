<script setup lang="ts">
const { t } = useI18n()

const filing = inject<BusinessLedgerItem>('filing')!
const { foreignJurisdiction, isFilingType } = useBusinessLedger(filing)

const expiryDate = toDate(
  filing.data?.consentAmalgamationOut?.expiry || filing.data?.consentContinuationOut?.expiry || '')

const expiry = expiryDate ? toPacificDateTime(expiryDate) : null

/** Check if Consent is Expired. (Assumes expiry is not empty.) */
const daysBeforeExpired = expiryDate ? daysBetween(new Date(), expiryDate) : undefined
const isConsentExpired = !!daysBeforeExpired && daysBeforeExpired < 0

const name = isFilingType(FilingType.CONSENT_AMALGAMATION_OUT)
  ? t('text.amalgamateOut')
  : t('text.continueOut')
</script>

<template>
  <div>
    <div v-if="isConsentExpired" class="flex gap-2 items-start">
      <UIcon name="i-mdi-alert" class="text-warning text-xl" />
      <p>
        <ConnectI18nHelper translation-path="text.expiredConsent" :name />
      </p>
    </div>
    <p v-else>
      <ConnectI18nHelper
        translation-path="text.thisConsentToIsValidUntilDate"
        :date="expiry"
        :foreignjurisdiction="foreignJurisdiction"
        :name
      />
    </p>
  </div>
</template>
