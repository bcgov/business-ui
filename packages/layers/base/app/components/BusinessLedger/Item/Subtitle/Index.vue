<script setup lang="ts">
import { FilingStatus } from '#imports'

const filing = inject<BusinessLedgerItem>('filing')!

const { isChangeOfOfficers, isFilingStatus, isFilingType } = useBusinessLedger(filing)

/** Date to use for Filed and Paid. */
const filedAndPaidDate = computed(() => new Date(filing.paymentDate || filing.submittedDate))

const showEffectiveAs = computed(() => {
  // consider converting to which ones to show
  const hideEffectiveDateFilings = [
    FilingType.REGISTRARS_NOTATION,
    FilingType.REGISTRARS_ORDER,
    FilingType.COURT_ORDER
  ]
  return !hideEffectiveDateFilings.includes(filing.name) && !isFilingStatus(FilingStatus.WITHDRAWN)
})

/** Whether to hide the tooltip (which effectively hides the effective time). */
const hideTooltip = computed(() => {
  return isFilingType(FilingType.CHANGE_OF_DIRECTORS)
})
</script>

<template>
  <div data-testid="business-ledger-item-header-subtitle">
    <slot>
      <span v-if="!isChangeOfOfficers">
        {{ $t('label.FILEDANDPAID') }}
      </span>
    </slot>
    <Divide>
      <span v-if="!(isChangeOfOfficers || isFilingStatus(FilingStatus.REJECTED))">
        ({{ $t('text.filedBySubmitterOn', { submitter: filing.submitter }) }}
        <DateTooltip :date="filedAndPaidDate" />)
      </span>
      <span v-else-if="isFilingStatus(FilingStatus.COMPLETED)">
        {{ $t('text.SubmittedBySubmitterOn', { submitter: filing.submitter }) }}
        <DateTooltip :date="filedAndPaidDate" />
      </span>
      <span v-else>
        ({{ $t('text.submittedBySubmitterOn', { submitter: filing.submitter }) }}
        <DateTooltip :date="filedAndPaidDate" />)
      </span>
      <span v-if="showEffectiveAs">
        {{ $t('text.effectiveAsOf') }}
        <DateTooltip :date="new Date(filing.effectiveDate)" :disabled="hideTooltip" />
      </span>
    </Divide>
  </div>
</template>
