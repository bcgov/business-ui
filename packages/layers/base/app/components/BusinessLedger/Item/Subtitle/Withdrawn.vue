<script setup lang="ts">
import { toDate } from '#imports'

const filing = inject<BusinessLedgerItem>('filing')!
const date = filing.data?.withdrawnDate ? toDate(filing.data.withdrawnDate) : undefined
</script>

<template>
  <BusinessLedgerItemSubtitle>
    <Divide>
      <span>
        {{ $t('text.withdrawnOn') }}
        <DateTooltip v-if="date" :date />
        <span v-else>
          {{ $t('label.unknown') }}
        </span>
      </span>
      <span>
        {{ $t('label.PAID') }}
      </span>
    </Divide>
  </BusinessLedgerItemSubtitle>
</template>
