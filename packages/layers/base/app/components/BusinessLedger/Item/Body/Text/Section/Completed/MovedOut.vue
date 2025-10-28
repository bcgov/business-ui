<script setup lang="ts">
import { DateTime } from 'luxon'

const { t } = useI18n()
const filing = inject<BusinessLedgerItem>('filing')!

const { foreignJurisdiction, isFilingType } = useBusinessLedger(filing)
const { businessName } = useBusinessStore()

const title = ref('')
const textPath = ref('')
const date = ref('')
const newBusinessName = ref('')

onMounted(() => {
  if (isFilingType(FilingType.CONTINUATION_OUT)) {
    title.value = t('label.continuationOutComplete')
    textPath.value = 'text.theCompanyWasSuccessfullyContinuedOut'
    const continuedDate = toDate(filing.data?.continuationOut?.continuationOutDate || '')
    date.value = continuedDate
      ? toFormattedDateStr(continuedDate, DateTime.DATE_MED) || `[${t('text.unknown')}]`
      : `[${t('text.unknown')}]`
    newBusinessName.value = filing.data?.continuationOut?.legalName || `[${t('text.unknown')}]`
  } else {
    // amalgamation
    title.value = t('label.amalgamationOutComplete')
    textPath.value = 'text.theCompanyWasSuccessfullyAmalgamatedOut'
    const amalgamatedDate = toDate(filing.data?.amalgamationOut?.amalgamationOutDate || '')
    date.value = amalgamatedDate
      ? toFormattedDateStr(amalgamatedDate, DateTime.DATE_MED) || `[${t('text.unknown')}]`
      : `[${t('text.unknown')}]`
    newBusinessName.value = filing.data?.amalgamationOut?.legalName || `[${t('text.unknown')}]`
  }
})
</script>

<template>
  <div class="space-y-4">
    <p>
      <strong>{{ title }}</strong>
    </p>
    <p>
      <ConnectI18nHelper
        :translation-path="textPath"
        :date
        :foreignjurisdiction="foreignJurisdiction"
        :name="businessName || $t('text.ThisCompany')"
        :newname="newBusinessName"
      />
    </p>
  </div>
</template>
