<script setup lang="ts">
const props = defineProps<{
  businessId: string
  date?: IsoDatePacific
  hideReceipts?: boolean
  lockedDocuments?: boolean
  lockedDocumentsTooltip?: string
  includeNonLedgerItems?: boolean
  overrideGetDocumentFn?: OverrideGetDocumentDownloadFn
  overrideGetFilingDocumentsFn?: OverrideGetFilingDocumentUrlsFn
}>()

const { isLoading, data } = useBusinessQuery().ledger(props.businessId, props.date)

const ledger = computed(() => {
  return props.includeNonLedgerItems
    ? data.value?.filings || []
    : data.value?.filings.filter(filing => filing.displayLedger) || []
})
</script>

<template>
  <div>
    <slot name="header">
      <h2>
        {{ $t('label.history') }}
        <span v-if="!isLoading">({{ ledger.length }})</span>
      </h2>
    </slot>
    <ConnectTransitionCollapse>
      <div v-if="!isLoading">
        <BusinessLedger
          :business-identifier="businessId"
          :filings="ledger"
          :hide-receipts
          :locked-documents
          :locked-documents-tooltip
          :override-get-document-fn
          :override-get-filing-documents-fn
        />
      </div>
      <div v-else class="space-y-5">
        <USkeleton class="h-15 w-full rounded" />
        <USkeleton class="h-15 w-full rounded" />
        <USkeleton class="h-15 w-full rounded" />
      </div>
    </ConnectTransitionCollapse>
  </div>
</template>
