<script setup lang="ts">
import { FilingStatus } from '#imports'

const filing = inject<BusinessLedgerItem>('filing')!

const { isFilingStatus, isFilingType } = useBusinessLedgerFiling(filing)

const putBackOnOrAdminDissolution = isFilingType(FilingType.PUT_BACK_ON)
  || isFilingType(undefined, FilingSubType.DISSOLUTION_ADMINISTRATIVE)

/** Date to use for Filed and Paid. */
const date = new Date(filing.paymentDate || filing.submittedDate)
</script>

<template>
  <div>
    <template v-if="putBackOnOrAdminDissolution">
      <BusinessLedgerItemSubtitle :filing>
        <span>
          {{ isFilingStatus(FilingStatus.COMPLETED)
            ? $t('label.FILED')
            : $t('label.FILEDANDPENDING')
          }}
        </span>
      </BusinessLedgerItemSubtitle>
    </template>
    <span v-else data-testid="business-ledger-item-header-subtitle">
      {{ $t('text.FiledBySubmitterOn', { submitter: filing.submitter }) }}
      <DateTooltip :date />
    </span>
  </div>
</template>
