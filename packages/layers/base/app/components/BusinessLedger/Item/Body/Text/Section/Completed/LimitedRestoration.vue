<script setup lang="ts">
import { DateTime } from 'luxon'

const { t } = useI18n()

const filing = inject<BusinessLedgerItem>('filing')!
const { isFilingType } = useBusinessLedger(filing)
const { businessName } = useBusinessStore()

/** The expiry date of the limited restoration filing as a Pacific date. */
const date = toDate(filing.data?.restoration?.expiry || '')
const expiryDate = date ? toFormattedDateStr(date, DateTime.DATE_MED) : `[${t('text.unknown')}]`
const title = isFilingType(undefined, FilingSubType.LIMITED_RESTORATION)
  ? t('label.limitedRestorationPeriod')
  : t('label.extensionOfLimitedRestoration')
const textPath = isFilingType(undefined, FilingSubType.LIMITED_RESTORATION)
  ? 'text.limitedRestorationWasSuccessful'
  : 'text.limitedRestorationExtensionWasSuccessful'
</script>

<template>
  <div class="space-y-4">
    <p>
      <strong>{{ title }}</strong>
    </p>
    <p>
      <ConnectI18nHelper
        :translation-path="textPath"
        :date="expiryDate"
        :name="businessName || $t('test.thisCompany')"
      />
    </p>
  </div>
</template>
