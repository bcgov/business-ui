<script setup lang="ts">
const { t } = useI18n()

const filing = inject<BusinessLedgerItem>('filing')!

const agmYear = filing.data?.agmExtension?.year || `[${t('label.unknown').toLowerCase()}]`

const yyyyMmDd = filing.data?.agmExtension?.expireDateApprovedExt
const date = yyyyMmDd ? toDate(yyyyMmDd) : undefined
const formattedDateStr = date ? toFormattedDateStr(date, { month: 'long', day: 'numeric' }) : undefined
const agmDueDate = formattedDateStr
  ? `${formattedDateStr}, ${t('text.at1159PacificTime')}`
  : `[${t('label.unknown').toLowerCase()}]`

const agmText = t('filingText.agmExtension', { boldStart: '<strong>', boldEnd: '</strong>', agmYear, agmDueDate })
</script>

<template>
  <!-- NOTE: no user inputted values are used below (invalid dates will return undefined) -->
  <!-- eslint-disable-next-line vue/no-v-html  -->
  <p v-html="agmText" />
</template>
