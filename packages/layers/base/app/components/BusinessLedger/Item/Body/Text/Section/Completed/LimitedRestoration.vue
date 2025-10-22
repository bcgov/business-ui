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
const text = t(
  isFilingType(undefined, FilingSubType.LIMITED_RESTORATION)
    ? 'text.limitedRestorationWasSuccessful'
    : 'text.limitedRestorationExtensionWasSuccessful',
  {
    boldStart: '<strong>',
    boldEnd: '</strong>',
    expiryDate,
    name: businessName || t('test.thisCompany')
  })
</script>

<template>
  <div class="space-y-4">
    <p>
      <strong>{{ title }}</strong>
    </p>
    <!-- NOTE: no user inputted values are used below -->
    <!-- eslint-disable-next-line vue/no-v-html  -->
    <p v-html="text" />
  </div>
</template>
