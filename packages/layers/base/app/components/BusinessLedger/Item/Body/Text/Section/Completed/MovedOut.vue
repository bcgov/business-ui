<script setup lang="ts">
import { DateTime } from 'luxon'

const { t } = useI18n()
const filing = inject<BusinessLedgerItem>('filing')!

const { foreignJurisdiction, isFilingType } = useBusinessLedger(filing)
const { businessName } = useBusinessStore()

const title = ref('')
const text = ref('')

onMounted(() => {
  let newBusinessName = ''
  let textPath = ''
  let date = ''
  if (isFilingType(FilingType.CONTINUATION_OUT)) {
    title.value = t('label.continuedOutComplete')
    textPath = 'text.theCompanyWasSuccessfullyContinuedOut'
    const continuedDate = toDate(filing.data?.continuationOut?.continuationOutDate || '')
    date = continuedDate
      ? toFormattedDateStr(continuedDate, DateTime.DATE_MED) || `[${t('text.unknown')}]`
      : `[${t('text.unknown')}]`
    newBusinessName = filing.data?.continuationOut?.legalName || `[${t('text.unknown')}]`
  } else {
    title.value = t('label.amalgamationOutComplete')
    textPath = 'text.theCompanyWasSuccessfullyAmalgamatedOut'
    const amalgamatedDate = toDate(filing.data?.amalgamationOut?.amalgamationOutDate || '')
    date = amalgamatedDate
      ? toFormattedDateStr(amalgamatedDate, DateTime.DATE_MED) || `[${t('text.unknown')}]`
      : `[${t('text.unknown')}]`
    newBusinessName = filing.data?.amalgamationOut?.legalName || `[${t('text.unknown')}]`
  }
  text.value = t(
    textPath,
    {
      boldStart: '<strong>',
      boldEnd: '</strong>',
      date,
      foreignJurisdiction: foreignJurisdiction.value,
      name: businessName || t('text.ThisCompany'),
      newName: newBusinessName
    })
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
