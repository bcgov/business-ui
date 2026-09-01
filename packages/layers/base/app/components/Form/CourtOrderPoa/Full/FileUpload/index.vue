<script setup lang="ts">
import { useCourtOrderDocs } from './utils'

const { identifier, filingId, entityType } = defineProps<{
  identifier?: string
  filingId: string | number
  entityType: CorpTypeCd
}>()

const model = defineModel<CourtOrderFileUi[]>({ default: () => [] })

const {
  courtOrderFile,
  supportingFiles,
  isOverDropZone,
  courtOrderDocs,
  supportingDocs,
  activeCourtOrderDoc,
  courtOrderUploadTimestamp,
  displayMaxOneCourtOrderAlert,
  onUploadCourtOrder,
  onFileAction
} = useCourtOrderDocs(model, { identifier, filingId, entityType })
</script>

<template>
  <FormCourtOrderPoaFullFileUploadFieldset v-slot="{ descriptionId: fileSizeAndTypeDescId }">
    <fieldset class="flex flex-col min-w-0 pb-6" :aria-label="$t('label.courtOrderDocumentUpload')">
      <div class="pb-4 text-base" aria-hidden="true">
        <span class="font-bold text-neutral-highlighted">{{ $t('label.courtOrder') }}</span>
        <p id="max-one-court-order-desc">
          {{ $t('text.uploadMaxOneCourtOrder') }}
        </p>
      </div>
      <UFileUpload
        v-slot="{ open }"
        v-model="courtOrderFile"
        :multiple="false"
        aria-hidden="true"
      >
        <div class="flex flex-col gap-4 pb-6">
          <UButton
            :label="$t('label.uploadCourtOrder')"
            icon="i-mdi-file-upload-outline"
            class="w-min"
            :aria-label="`
              ${$t('label.uploadCourtOrder')}.
              ${$t('text.currentCourtOrderFile', { filename: activeCourtOrderDoc.doc?.name || $t('label.none') })}
            `"
            :aria-describedby="`
              ${fileSizeAndTypeDescId}
              max-one-court-order-desc
              max-one-court-order-alert
            `"
            @click="onUploadCourtOrder(open)"
          />

          <div
            v-if="displayMaxOneCourtOrderAlert"
            id="max-one-court-order-alert"
            :key="courtOrderUploadTimestamp"
            class="flex gap-1 items-start"
            role="alert"
          >
            <UIcon name="i-mdi-warning" class="text-error size-6 shrink-0" />
            <p class="text-error text-base">
              {{ $t('validation.onlyOneCourtOrderPerFiling') }}
            </p>
          </div>
        </div>
      </UFileUpload>
      <FormCourtOrderPoaFullFileUploadList :aria-label="$t('label.uploadedCourtOrders')">
        <FormCourtOrderPoaFullFileUploadItem
          v-for="doc in courtOrderDocs"
          :key="doc.id"
          v-bind="doc"
          class="py-4"
          @file-action="onFileAction"
        />
      </FormCourtOrderPoaFullFileUploadList>
    </fieldset>
    <USeparator class="py-4" />
    <fieldset class="flex flex-col min-w-0" :aria-label="$t('label.supportingDocumentsUpload')">
      <div
        ref="dropzoneRef"
        class="flex flex-col gap-4 -mx-6 p-6 rounded transition-colors -mt-2"
        :class="isOverDropZone ? 'bg-(--ui-primary)/10' : ''"
      >
        <div aria-hidden="true" class="text-base">
          <span class="font-bold text-neutral-highlighted">{{ $t('label.supportingDocuments') }}</span>
          <p id="multiple-supporting-docs-desc">
            {{ $t('text.uploadOneOrMoreSupportingDocs') }}
          </p>
        </div>
        <UFileUpload
          v-slot="{ open }"
          v-model="supportingFiles"
          multiple
          aria-hidden="true"
        >
          <div class="flex flex-wrap gap-4 items-center">
            <UButton
              :label="$t('label.uploadDocuments')"
              icon="i-mdi-file-upload-outline"
              aria-describedby="multiple-supporting-docs-desc"
              @click="open()"
            />
            <span aria-hidden="true" class="text-primary text-base italic">{{ $t('text.orDragAndDropFiles') }}</span>
          </div>
        </UFileUpload>
      </div>
      <FormCourtOrderPoaFullFileUploadList :aria-label="$t('label.uploadedSupportingDocs')">
        <FormCourtOrderPoaFullFileUploadItem
          v-for="doc in supportingDocs"
          :key="doc.id"
          v-bind="doc"
          class="py-4"
          @file-action="onFileAction"
        />
      </FormCourtOrderPoaFullFileUploadList>
    </fieldset>
  </FormCourtOrderPoaFullFileUploadFieldset>
</template>
