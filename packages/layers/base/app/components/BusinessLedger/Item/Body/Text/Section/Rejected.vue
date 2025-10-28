<script setup lang="ts">
const filing = inject<BusinessLedgerItem>('filing')!
const { bootstrapIdentifier } = useBusinessBootstrapStore()
</script>

<template>
  <div class="space-y-4">
    <p>
      {{ $t('text.reviewReasonsYourFilingWasRejected') }}
    </p>
    <p class="bg-gray-200 py-3 px-5">
      {{ filing.latestReviewComment || `[${$t('text.undefinedStaffRejectionMessage')}]` }}
    </p>
    <p v-if="!!bootstrapIdentifier">
      {{ $t('text.pleaseSubmitANewApplication') }}
    </p>
  </div>
</template>
