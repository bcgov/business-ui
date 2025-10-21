<script setup lang="ts">
import { FilingStatus } from '#imports'

const filing = inject<BusinessLedgerItem>('filing')!

const { isFilingStatus, isFilingType } = useBusinessLedger(filing)

const putBackOnOrAdminDissolution = computed(() => (
  isFilingType(FilingType.PUT_BACK_ON)
  || isFilingType(undefined, FilingSubType.DISSOLUTION_ADMINISTRATIVE)
))

/** Date to use for Filed and Paid. */
const date = computed(() => new Date(filing.paymentDate || filing.submittedDate))
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
    <span v-else>
      {{ $t('text.FiledBySubmitterOn', { submitter: filing.submitter }) }}
      <DateTooltip :date />
    </span>
  </div>
</template>
