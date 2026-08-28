<script setup lang="ts">
import { type FileType, useCourtOrderDocs } from './utils'

const { identifier, filingId } = defineProps<{
  identifier?: string
  filingId: string | number
}>()

const model = defineModel<FileType[]>({ default: () => [] })

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
  onFileItemEmit
} = useCourtOrderDocs(model, { identifier, filingId })
</script>

<template>
  <FormCourtOrderPoaFullFileUploadFieldset v-slot="{ descriptionId: fileSizeAndTypeDescId }">
    <fieldset class="flex flex-col min-w-0 pb-6" :aria-label="$t('label.courtOrderDocumentUpload')">
      <div class="pb-4" aria-hidden="true">
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
            <p class="text-error">
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
          @delete="onFileItemEmit($event, 'delete')"
          @undo="onFileItemEmit($event, 'undo')"
          @cancel="onFileItemEmit($event, 'cancel')"
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
        <div aria-hidden="true">
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
            <span aria-hidden="true" class="text-primary italic">{{ $t('text.orDragAndDropFiles') }}</span>
          </div>
        </UFileUpload>
      </div>
      <FormCourtOrderPoaFullFileUploadList :aria-label="$t('label.uploadedSupportingDocs')">
        <FormCourtOrderPoaFullFileUploadItem
          v-for="doc in supportingDocs"
          :key="doc.id"
          v-bind="doc"
          class="py-4"
          @delete="onFileItemEmit($event, 'delete')"
          @undo="onFileItemEmit($event, 'undo')"
          @cancel="onFileItemEmit($event, 'cancel')"
        />
      </FormCourtOrderPoaFullFileUploadList>
    </fieldset>
  </FormCourtOrderPoaFullFileUploadFieldset>
</template>
