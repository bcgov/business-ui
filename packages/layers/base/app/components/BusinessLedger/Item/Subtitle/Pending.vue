<script setup lang="ts">
const filing = inject<BusinessLedgerItem>('filing')!
const { isChangeOfOfficers, isFutureEffective } = useBusinessLedger(filing)
</script>

<template>
  <BusinessLedgerItemSubtitle :filing>
    <span :class="{ 'text-warning': !isFutureEffective }">
      {{ !isChangeOfOfficers ? $t('label.FILEDANDPENDING') : $t('label.PENDING') + ' ' }}
    </span>
  </BusinessLedgerItemSubtitle>
</template>
