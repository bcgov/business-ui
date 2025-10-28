<script setup lang="ts">
import { DateTime } from 'luxon'

definePageMeta({
  layout: 'connect-auth'
})

useHead({
  title: 'Business Ledger Example'
})

const localePath = useLocalePath()

setBreadcrumbs([
  {
    to: localePath('/'),
    label: 'Examples'
  },
  {
    to: localePath('/examples/components/BusinessLedger'),
    label: 'BusinessLedger'
  },
  {
    label: 'Mocked'
  }
])

// set permissions manually to prevent it calling out to the api
const { authorizedActions } = storeToRefs(useBusinessPermissionsStore())
authorizedActions.value = [AuthorizedAction.DETAIL_COMMENTS]

const today = DateTime.fromJSDate(new Date())
const tomorrow = today.plus({ days: 1 })

const identifier = 'BC0223072'
const filings: BusinessLedgerItem[] = [
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: `${tomorrow.weekdayShort}, ${tomorrow.day} ${tomorrow.monthShort} ${tomorrow.year} 08:01:00 GMT`,
    filingId: 206591,
    filingLink: '',
    isFutureEffective: true,
    name: FilingType.AMALGAMATION_APPLICATION,
    paymentDate: 'Mon, 21 Nov 2021 19:00:05 GMT',
    status: FilingStatus.PAID,
    submittedDate: 'Mon, 21 Nov 2021 19:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: `${tomorrow.weekdayShort}, ${tomorrow.day} ${tomorrow.monthShort} 2025 08:01:00 GMT`,
    filingId: 1,
    filingLink: '',
    isFutureEffective: true,
    name: FilingType.CHANGE_OF_ADDRESS,
    paymentDate: 'Fri, 10 Oct 2025 07:00:05 GMT',
    status: FilingStatus.PAID,
    submittedDate: 'Fri, 10 Oct 2025 08:00:05 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    displayName: 'Officer Change - name set from displayName',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Mon, 9 Oct 2025 14:00:27 GMT',
    filingId: 14,
    filingLink: '',
    isFutureEffective: false,
    name: FilingType.CHANGE_OF_OFFICERS,
    paymentDate: 'Mon, 9 Oct 2025 13:00:05 GMT',
    status: FilingStatus.PAID,
    submittedDate: 'Mon, 9 Oct 2025 13:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    data: {
      annualReport: {
        annualGeneralMeetingDate: '2025-08-01',
        annualReportDate: '2025-08-01',
        annualReportFilingYear: 2025
      }
    },
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Mon, 9 Oct 2025 13:00:27 GMT',
    filingId: 11,
    filingLink: '',
    isFutureEffective: false,
    name: FilingType.ANNUAL_REPORT,
    paymentDate: 'Mon, 9 Oct 2025 19:00:05 GMT',
    status: FilingStatus.PAID,
    submittedDate: 'Mon, 9 Oct 2025 19:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Mon, 5 Sep 2025 14:00:27 GMT',
    filingId: 15,
    filingLink: '',
    isFutureEffective: false,
    name: FilingType.CHANGE_OF_OFFICERS,
    paymentDate: 'Mon, 5 Sep 2025 13:00:05 GMT',
    status: FilingStatus.COMPLETED,
    submittedDate: 'Mon, 5 Sep 2025 13:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    data: {
      agmExtension: {
        expireDateApprovedExt: '2025-11-22',
        expireDateCurrExt: '2025-11-22',
        extensionDuration: 44,
        extReqForAgmYear: true,
        isFirstAgm: false,
        prevAgmRefDate: '2025-09-22',
        totalApprovedExt: 1,
        year: '2025'
      }
    },
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Sun, 4 Sep 2025 05:00:27 GMT',
    filingId: 16,
    filingLink: '',
    isFutureEffective: false,
    name: FilingType.AGM_EXTENSION,
    paymentDate: 'Sun, 4 Sep 2025 05:00:05 GMT',
    status: FilingStatus.COMPLETED,
    submittedDate: 'Sun, 4 Sep 2025 05:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Mon, 21 Sep 2025 13:00:27 GMT',
    filingId: 9,
    filingLink: '',
    isFutureEffective: false,
    name: FilingType.CONTINUATION_IN,
    paymentDate: 'Mon, 21 Sep 2025 19:00:05 GMT',
    status: FilingStatus.AWAITING_REVIEW,
    submittedDate: 'Mon, 21 Sep 2025 19:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Mon, 20 Sep 2025 13:00:27 GMT',
    filingId: 10,
    filingLink: '',
    isFutureEffective: false,
    name: FilingType.CHANGE_OF_DIRECTORS,
    paymentDate: 'Mon, 20 Sep 2025 19:00:05 GMT',
    status: FilingStatus.COMPLETED,
    submittedDate: 'Mon, 20 Sep 2025 19:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Tue, 26 Nov 2024 08:01:00 GMT',
    filingId: 2,
    filingLink: '',
    isFutureEffective: true,
    name: FilingType.CHANGE_OF_ADDRESS,
    paymentDate: 'Mon, 25 Nov 2024 19:00:05 GMT',
    status: FilingStatus.COMPLETED,
    submittedDate: 'Mon, 25 Nov 2024 19:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    data: { withdrawnDate: '2024-11-24T20:18:41.056922+00:00' },
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Tue, 24 Nov 2024 21:01:00 GMT',
    filingId: 3,
    filingLink: '',
    isFutureEffective: false,
    name: FilingType.NOTICE_OF_WITHDRAWAL,
    paymentDate: 'Mon, 24 Nov 2024 21:00:05 GMT',
    status: FilingStatus.COMPLETED,
    submittedDate: 'Mon, 24 Nov 2024 21:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    data: { withdrawnDate: '2024-11-24T20:18:41.056922+00:00' },
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Tue, 25 Nov 2024 08:01:00 GMT',
    filingId: 4,
    filingLink: '',
    isFutureEffective: true,
    name: FilingType.ALTERATION,
    paymentDate: 'Mon, 24 Nov 2024 19:00:05 GMT',
    status: FilingStatus.WITHDRAWN,
    submittedDate: 'Mon, 24 Nov 2024 19:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Fri, 23 Dec 2023 17:00:27 GMT',
    filingId: 5,
    filingLink: '',
    isFutureEffective: false,
    name: FilingType.COURT_ORDER,
    paymentDate: 'Mon, 21 Dec 2023 19:00:05 GMT',
    status: FilingStatus.COMPLETED,
    submittedDate: 'Mon, 21 Dec 2023 19:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Mon, 21 November 2023 13:00:27 GMT',
    filingId: 6,
    filingLink: '',
    isFutureEffective: false,
    name: FilingType.ADMIN_FREEZE,
    paymentDate: 'Mon, 21 Nov 2023 19:00:05 GMT',
    status: FilingStatus.COMPLETED,
    submittedDate: 'Mon, 21 Nov 2023 19:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Mon, 21 November 2022 13:00:27 GMT',
    filingId: 8,
    filingLink: '',
    isFutureEffective: false,
    name: FilingType.CONTINUATION_IN,
    paymentDate: 'Mon, 21 Nov 2022 19:00:05 GMT',
    status: FilingStatus.REJECTED,
    submittedDate: 'Mon, 21 Nov 2022 19:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: identifier,
    commentsCount: 0,
    commentsLink: '',
    displayName: '',
    displayLedger: true,
    documentsLink: '',
    effectiveDate: 'Mon, 21 November 2021 13:00:27 GMT',
    filingId: 12,
    filingLink: '',
    isFutureEffective: false,
    name: FilingType.INCORPORATION_APPLICATION,
    paymentDate: 'Mon, 21 Nov 2021 19:00:05 GMT',
    status: FilingStatus.COMPLETED,
    submittedDate: 'Mon, 21 Nov 2021 19:00:04 GMT',
    submitter: 'Tester Testing',
    withdrawalPending: false
  }
]

const includeCourtOrder = ref(true)
const noFilings = ref(false)

const ledgerItems = computed(() => {
  return noFilings.value
    ? []
    : includeCourtOrder.value
      ? filings
      : filings.filter(filing => filing.name != FilingType.COURT_ORDER)
})
</script>

<template>
  <div class="py-8 space-y-6">
    <h1>
      BusinessLedger Mocked
    </h1>
    <NuxtLink class="text-primary" :to="localePath('/examples/components/BusinessLedger')">
      Go to API Integrated version of component
    </NuxtLink>
    <ConnectPageSection
      :heading="{
        label: 'Mocked Example (No comments or documents, ledger items are hardcoded)'
      }"
      ui-body="p-4 space-y-4"
    >
      <div class="space-y-3">
        <USwitch v-model="includeCourtOrder" label="Court Order" />
        <USwitch v-model="noFilings" label="No Filings" />
      </div>
      <div class="bg-shade p-5 mt-3">
        <BusinessLedger :business-identifier="identifier" :filings="ledgerItems" />
      </div>
    </ConnectPageSection>
  </div>
</template>
