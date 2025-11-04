<script setup lang="ts">
const props = defineProps<{
  businessId: string
  date?: IsoDatePacific
  hideReceipts?: boolean
  lockedDocuments?: boolean
  lockedDocumentsTooltip?: string
  overrideGetDocumentFn?: OverrideGetDocumentFn
}>()

const ledgerStore = useBusinessLedgerStore()
const { ledger } = storeToRefs(ledgerStore)

const loadingLedger = ref(false)

onMounted(async () => {
  loadingLedger.value = true
  await ledgerStore.init(props.businessId, props.date)
  loadingLedger.value = false
})
</script>

<template>
  <div>
    <slot name="header">
      <h2>
        {{ $t('label.history') }}
        <span v-if="!loadingLedger">({{ ledger.length }})</span>
      </h2>
    </slot>
    <ConnectTransitionCollapse>
      <div v-if="!loadingLedger">
        <BusinessLedger
          :business-identifier="businessId"
          :filings="ledger"
          :hide-receipts
          :locked-documents
          :locked-documents-tooltip
          :override-get-document-fn
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
