<script setup lang="ts">
// handle document download buttons for final page, this will only work for the 2 current file from the backend
// any updates to the backend this will need to be reworked
const arStore = useAnnualReportStore()
</script>
<template>
  <ClientOnly>
    <div
      v-if="arStore.arFiling.filing.documents && arStore.arFiling.filing.documents.length > 0"
      class="flex w-full items-center justify-center gap-2"
    >
      <UButton
        v-for="doc in arStore.arFiling.filing.documents"
        :key="doc.name"
        size="sm"
        icon="i-mdi-tray-arrow-down"
        :loading="arStore.loading"
        :label="doc.name === 'Receipt' ? $t('btn.downloadReceipt') : $t('btn.downloadReport')"
        @click="arStore.handleDocumentDownload(doc)"
      />
    </div>
  </ClientOnly>
</template>
