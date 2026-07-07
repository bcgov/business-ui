<script setup lang="ts">
const filing = inject<BusinessLedgerItem>('filing')!

// the comments that are part of the filing
const { filingDetailComments } = useBusinessLedger(filing)
</script>

<template>
  <div class="space-y-4" data-testid="filing-details">
    <p
      v-for="(comment, index) in filingDetailComments"
      :key="index"
      class="whitespace-pre-line break-words"
      data-testid="filing-detail"
    >
      <strong>{{ $t('label.filingDetail') }}</strong>: {{ comment.comment }}
    </p>
  </div>
</template>
