<script setup lang="ts">
defineProps<{ documentId: string }>()
const openDocumentRecord = (documentId: string) => {
  const url = `${useRuntimeConfig().public.documentsUiUrl}/document-records/${documentId}`
  window.open(url, '_blank')
}
</script>

<template>
  <UButton
    :label="$t('label.manageDocumentRecord') + ' ' + documentId"
    variant="ghost"
    trailing-icon="i-mdi-open-in-new"
    :data-testid="`document-record-btn-${documentId}`"
    @click="openDocumentRecord(documentId)"
  />
</template>
