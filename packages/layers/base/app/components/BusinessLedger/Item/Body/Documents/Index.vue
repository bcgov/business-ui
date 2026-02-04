<script setup lang="ts">
const filing = inject<BusinessLedgerItem>('filing')!
const isLocked = inject<Ref<boolean>>('lockedDocuments')
const lockedDocumentsText = inject<string>('lockedDocumentsText')
const overrideGetDocumentFn = inject<OverrideGetDocumentDownloadFn>('overrideGetDocumentFn')

const { documents } = useBusinessLedger(filing)
const { getBusinessDocument } = useBusinessApi()

const downloadingIndex = ref(-1)
const downloadingAll = ref(false)

const BusinessHelpContact = resolveComponent('BusinessHelpContact')

const download = async (document: BusinessDocument, index: number) => {
  downloadingIndex.value = index
  try {
    const documentBlob = overrideGetDocumentFn
      ? await overrideGetDocumentFn(document, filing.businessIdentifier, filing.filingId)
      : await getBusinessDocument(document.link)
    downloadFile(documentBlob, document.filename)
  } catch {
    useModal().errorModal.open({
      error: { statusCode: 500 },
      i18nPrefix: 'modal.error.documentDownload',
      buttons: [{ label: 'OK', shouldClose: true }],
      contactInfo: h(BusinessHelpContact)
    })
  }
  downloadingIndex.value = -1
}

const downloadAll = async () => {
  downloadingAll.value = true
  const promises = documents.value.map(document =>
    download(document, -1)
  )
  await Promise.all(promises)
  downloadingAll.value = false
}
</script>

<template>
  <div data-testid="document-list">
    <p v-if="!documents.length" class="ml-7 text-sm">
      {{ $t('text.noDocumentsAvailable') }}
    </p>
    <div v-for="(document, index) in documents" :key="index">
      <template v-if="isLocked">
        <UTooltip
          arrow
          :content="{ side: 'top' }"
          :disabled="!lockedDocumentsText"
          :text="lockedDocumentsText"
          :ui="{
            content: 'max-w-xs *:text-wrap *:whitespace-normal h-full'
          }"
        >
          <UButton
            color="neutral"
            disabled
            :label="document.title"
            leading-icon="i-mdi-file-lock-outline"
            variant="ghost"
          />
        </UTooltip>
      </template>
      <template v-else>
        <UButton
          :disabled="downloadingIndex !== -1 || downloadingAll"
          :label="document.title"
          leading-icon="i-mdi-file-pdf-outline"
          :loading="downloadingIndex === index"
          variant="ghost"
          @click="download(document, index)"
        />
      </template>
    </div>
    <div>
      <UButton
        v-if="documents.length > 1 && !isLocked"
        :color="isLocked ? 'neutral' : 'primary'"
        :disabled="downloadingIndex !== -1 || downloadingAll || isLocked"
        :label="$t('label.downloadAll')"
        :leading-icon="isLocked ? 'i-mdi-download-locked' : 'i-mdi-download'"
        :loading="downloadingAll"
        variant="ghost"
        @click="downloadAll"
      />
    </div>
  </div>
</template>
