<script setup lang="ts">
import { DateTime } from 'luxon'

const { t } = useI18n()

const filing = inject<BusinessLedgerItem>('filing')!

const agmYear = filing.data?.agmExtension?.year || `[${t('label.unknown').toLowerCase()}]`

const yyyyMmDd = filing.data?.agmExtension?.expireDateApprovedExt
const date = yyyyMmDd ? toDate(yyyyMmDd) : undefined
const formattedDateStr = date ? toFormattedDateStr(date, DateTime.DATE_MED) : undefined
const agmDueDate = formattedDateStr
  ? `${formattedDateStr} ${t('text.at1159PacificTime')}`
  : `[${t('label.unknown').toLowerCase()}]`
</script>

<template>
  <p>
    <ConnectI18nHelper
      translation-path="filingText.agmExtension"
      :agmduedate="agmDueDate"
      :agmyear="agmYear"
    />
  </p>
</template>
