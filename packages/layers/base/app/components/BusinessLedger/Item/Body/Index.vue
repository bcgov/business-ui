<script setup lang="ts">
defineProps<{ loading: boolean }>()

const filing = inject<BusinessLedgerItem>('filing')!
const drsStore = useDocumentRecordServiceStore()
const documentId = ref<string | undefined>(undefined)

const hasExtraDocsOrDetails = computed(() => (
  !filing.availableOnPaperOnly
  || !!documentId.value
  || filing.commentsCount
))

onMounted(async () => {
  documentId.value = drsStore.getDocIdByFilingId(filing.filingId)
})
</script>

<template>
  <div class="mt-3 py-3 divide-y divide-line-muted border-t border-line-muted *:first:mt-0 *:first:pt-0 *:my-4 *:py-4">
    <BusinessLedgerItemBodyText />
    <div v-if="loading" class="space-y-3">
      <USkeleton class="h-5 w-50 rounded" />
      <USkeleton class="h-5 w-50 rounded" />
      <USkeleton class="h-5 w-50 rounded" />
    </div>
    <div v-else-if="hasExtraDocsOrDetails">
      <BusinessLedgerItemBodyDocuments v-if="!filing.availableOnPaperOnly" />
      <BusinessLedgerItemBodyDocumentsRecordButton v-if="documentId" v-model:document-id="documentId" />
      <BusinessLedgerItemBodyDetails
        v-if="filing.commentsCount"
        :class="{ 'border-t border-line-muted mt-6 pt-6': !filing.availableOnPaperOnly || documentId }"
      />
    </div>
  </div>
</template>
