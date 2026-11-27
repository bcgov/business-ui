<script setup lang="ts">
import { useCourtOrderDocs } from './utils'

const {
  identifier,
  filingId,
  entityType,
  disabled,
  isFileAndDetailsRequired = false,
  supportingDocsCheckbox = false
} = defineProps<{
  identifier?: string
  filingId: string | number
  entityType: CorpTypeCd
  disabled?: boolean
  isFileAndDetailsRequired?: boolean
  supportingDocsCheckbox?: boolean // gates the supporting documents upload behind a checkbox
  supportingDocsError?: string
  courtOrderFileError?: string
}>()

const { t } = useI18n()
const { baseModal } = useModal()

const model = defineModel<CourtOrderFileUi[]>({ default: () => [] })
// UI only flag revealing the supporting documents upload (derived true by the schema when any exist)
const hasSupportingDocs = defineModel<boolean | undefined>('hasSupportingDocs')

const {
  courtOrderFile,
  supportingFiles,
  isOverDropZone,
  isDropZoneEnabled,
  courtOrderDocs,
  supportingDocs,
  activeCourtOrderDoc,
  courtOrderUploadTimestamp,
  displayMaxOneCourtOrderAlert,
  onUploadCourtOrder,
  onFileAction,
  cleanupFilesOnSessionCancel
} = useCourtOrderDocs(model, {
  // getters so values resolving after mount (ex: the business data) are used by the next upload
  identifier: () => identifier,
  filingId: () => filingId,
  entityType: () => entityType,
  disabled: () => disabled
})

const hasActiveSupportingDocs = computed(() => hasActiveSupportingDoc(supportingDocs.value))

// unchecking never leaves supporting documents behind the hidden section
function removeAllSupportingDocs() {
  supportingDocs.value.forEach((doc) => {
    if (doc.status === CourtOrderFileStatus.LOADING) {
      onFileAction(doc.id, 'cancel')
    } else if (doc.status === CourtOrderFileStatus.ERROR) {
      onFileAction(doc.id, 'dismiss')
    } else if (doc.action !== CourtOrderFileAction.DELETED) {
      onFileAction(doc.id, 'delete')
    }
  })
}

function uncheckSupportingDocs() {
  removeAllSupportingDocs()
  hasSupportingDocs.value = false
}

const isSupportingDocsChecked = computed({
  get: () => !!hasSupportingDocs.value,
  set: (checked: boolean) => {
    if (checked) {
      hasSupportingDocs.value = true
    } else if (hasActiveSupportingDocs.value) {
      // stays checked until the removal is confirmed
      baseModal.open({
        title: t('modal.removeSupportingDocs.title'),
        description: t('modal.removeSupportingDocs.description'),
        dismissible: true,
        buttons: [
          { label: t('label.cancel'), shouldClose: true, variant: 'outline' },
          { label: t('label.removeDocuments'), shouldClose: true, onClick: uncheckSupportingDocs }
        ]
      })
    } else {
      uncheckSupportingDocs()
    }
  }
})

// without the checkbox variant the supporting documents upload always shows
const showSupportingDocs = computed(() => !supportingDocsCheckbox || isSupportingDocsChecked.value)

const supportingDocErrorIds = computed(() => supportingDocs.value
  .filter(doc => doc.status === CourtOrderFileStatus.ERROR && doc.errorMessage)
  .map(doc => `file-error-${doc.id}`)
  .join(' ')
)

const supportingDocsAriaDescribedBy = computed(() => {
  const base = 'multiple-supporting-docs-desc'
  return supportingDocErrorIds.value ? `${base} ${supportingDocErrorIds.value}` : base
})

const courtOrderDocErrorIds = computed(() => courtOrderDocs.value
  .filter(doc => doc.status === CourtOrderFileStatus.ERROR && doc.errorMessage)
  .map(doc => `file-error-${doc.id}`)
  .join(' ')
)

const courtOrderDocsAriaDescribedBy = computed(() => {
  const base = 'max-one-court-order-desc max-one-court-order-alert court-order-file-required-alert'
  return courtOrderDocErrorIds.value ? `${base} ${courtOrderDocErrorIds.value}` : base
})

defineExpose({
  cleanupFilesOnSessionCancel
})
</script>

<template>
  <FormCourtOrderPoaFullFileUploadFieldset
    v-slot="{ descriptionId: fileSizeAndTypeDescId }"
    :is-file-and-details-required="isFileAndDetailsRequired"
  >
    <fieldset
      class="flex flex-col min-w-0"
      :class="courtOrderDocs.length ? 'pb-6' : 'pb-2'"
      :aria-label="$t('label.courtOrderDocumentUpload')"
    >
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
        :disabled
        aria-hidden="true"
      >
        <div class="flex flex-col gap-4" :class="courtOrderDocs.length ? 'pb-6' : ''">
          <UButton
            :label="$t('label.uploadCourtOrder')"
            icon="i-mdi-file-upload-outline"
            class="w-min"
            :disabled
            :aria-label="`
              ${$t('label.uploadCourtOrder')}.
              ${$t('text.currentCourtOrderFile', { filename: activeCourtOrderDoc.doc?.name || $t('label.none') })}
            `"
            :aria-describedby="`
              ${fileSizeAndTypeDescId}
              ${courtOrderDocsAriaDescribedBy}
            `"
            @keydown.enter.stop
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
          <div
            v-else-if="courtOrderFileError"
            id="court-order-file-required-alert"
            class="flex gap-1 items-start"
            role="alert"
          >
            <UIcon name="i-mdi-warning" class="text-error size-6 shrink-0" />
            <p class="text-error text-base">
              {{ courtOrderFileError }}
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
    <!-- not in a UFormField: checking the box must not validate it, the rule only applies on submit -->
    <!-- no aria-invalid because it turns the box and label red -->
    <UCheckbox
      v-if="supportingDocsCheckbox"
      v-model="isSupportingDocsChecked"
      data-testid="court-order-add-supporting-docs-checkbox"
      :disabled
      :label="$t('label.addSupportingDocuments')"
      :aria-describedby="supportingDocsError ? 'add-supporting-docs-alert' : undefined"
    />
    <fieldset
      v-if="showSupportingDocs"
      class="flex flex-col min-w-0"
      :class="supportingDocsCheckbox ? 'pt-6' : ''"
      :aria-label="$t('label.supportingDocumentsUpload')"
    >
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
          :disabled
          aria-hidden="true"
        >
          <div class="flex flex-wrap gap-4 items-center">
            <UButton
              :label="$t('label.uploadDocuments')"
              icon="i-mdi-file-upload-outline"
              :disabled
              :aria-describedby="supportingDocsAriaDescribedBy"
              @keydown.enter.stop
              @click="open()"
            />
            <span
              v-if="isDropZoneEnabled"
              aria-hidden="true"
              class="text-primary text-base italic"
            >
              {{ $t('text.orDragAndDropFiles') }}
            </span>
          </div>
        </UFileUpload>
        <div
          v-if="supportingDocsError"
          id="add-supporting-docs-alert"
          class="flex gap-1 items-start"
          role="alert"
        >
          <UIcon name="i-mdi-warning" class="text-error size-6 shrink-0" />
          <p class="text-error text-base">
            {{ supportingDocsError }}
          </p>
        </div>
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
