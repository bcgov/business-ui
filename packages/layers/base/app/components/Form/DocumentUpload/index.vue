<script setup lang="ts">
interface DocumentUploadProps {
  validate?: boolean
  uploadLabel?: string
  multipleFiles?: boolean
  maxFileSize?: number
  acceptedFileTypes?: string[]
}

type TriggerInputType = 'cameraInput' | 'albumInput' | 'fileInput'

/**
 * Props:
 * - validate: boolean — Whether to enable validation (default: false)
 * - uploadLabel: string — Label for the upload button (default: 'Upload Files')
 * - multipleFiles: boolean — Allow multiple file selection (default: true)
 * - maxFileSize: number — Maximum file size in bytes (default: 3MB)
 * - acceptedFileTypes: Array of accepted image MIME types (default: [
 *   'application/msword',
 *   'application/vnd.ms-powerpoint',
 *   'application/pdf',
 *   'application/vnd.openxmlformats-officedocument.presentationml.presentation',
 *   'application/vnd.ms-excel',
 *   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 *   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 *   'image/gif',
 *   'image/jpeg',
 *   'image/png',
 *   'image/tiff',
 *   'image/svg+xml',
 *   'text/csv',
 *   'text/plain'
 * ])
 */
const props = withDefaults(defineProps<DocumentUploadProps>(), {
  validate: false,
  uploadLabel: 'Upload Files',
  multipleFiles: true,
  maxFileSize: () => 3 * 1024 * 1024,
  acceptedFileTypes: () => ['application/pdf', 'image/jpeg', 'image/png', 'image/gif']
})

/** Emits an event when files are converted */
const emit = defineEmits<{
  (event: 'converted-files', files: File[]): void
}>()

/** Reactive state and methods for file handling */
const {
  state,
  formatBytes,
  removeFile,
  getObjectURL,
  fileHandler
} = useDocumentHandler({
  maxFileSize: props.maxFileSize,
  acceptedFileTypes: props.acceptedFileTypes,
  onConverted: files => emit('converted-files', files)
})

/** Label for the file upload component */
const uploadDescription = computed(() =>
  `${$t('documentUpload.acceptedFiles')} ${props.acceptedFileTypes.map(type => '.' + type.split('/').pop()).join(', ')}.
   ${$t('documentUpload.maxFileSize')} ${formatBytes(props.maxFileSize, 0)}.`
)

/**
 * Computed property to check if there is at least one valid uploaded file.
 * A file is considered valid if it has the `uploaded` property set to true and no `errorMsg`.
 */
const hasValidUploadedFile = computed(() =>
  Array.isArray(state.files)
  && state.files.some(file => file.uploaded && !file.errorMsg)
)

/**
 * Computed property to determine if a validation error should be shown.
 * Returns true if validation is required and there are no valid uploaded files.
 */
const showValidationError = computed(() =>
  props.validate && !hasValidUploadedFile.value
)

/** Mobile detection and responsive layout handling */
const isMobile = useMediaQuery('(max-width: 640px)')

/** Computed configurations for file upload component */
const fileUploadFileConfig = computed(() => {
  const baseConfig = showValidationError.value
    ? { label: 'text-error', base: 'border-error' }
    : {}
  if (isMobile.value) {
    return { ...baseConfig, file: 'grid grid-cols-6 gap-1 wrap-anywhere' }
  }
  return baseConfig
})

/**
 * Handles the change event for mobile picture or album input.
 * Extracts the selected file(s) and passes them as an array to the file handler.
 * @param event - The input change event from the file input element.
 */
const mobilePictureHandler = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    // Ensure state.files is always an array before spreading new files into it
    const files = Array.from(input.files)
    const currentLength = state.files?.length || 0
    const processedFiles = files.map((file, i) => ({
      document: file,
      uploaded: false,
      index: currentLength + i
    }))

    state.files = Array.isArray(state.files)
      ? [...state.files, ...processedFiles]
      : [...processedFiles]

    fileHandler(files)
  }
}

/** Dropdown menu items for mobile actions */
const mobileMenuItems: Array<{ label: string, value: TriggerInputType, icon: string }> = [
  {
    label: 'Photos',
    value: 'albumInput',
    icon: 'i-mdi-camera'
  },
  {
    label: 'Camera',
    value: 'cameraInput',
    icon: 'i-mdi-image-multiple'
  },
  {
    label: 'Files',
    value: 'fileInput',
    icon: 'i-mdi-file'
  }
]

/** Refs for mobile file inputs */
const albumInput = useTemplateRef<HTMLInputElement>('albumInput')
const cameraInput = useTemplateRef<HTMLInputElement>('cameraInput')
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

/** Trigger input click by type */
function triggerInput(type: TriggerInputType) {
  const inputRefs = { albumInput, cameraInput, fileInput }
  inputRefs[type].value?.click()
}
</script>

<template>
  <UForm :state="state" class="w-full">
    <UFormField name="documentUpload">
      <UFileUpload
        v-model="state.files as any"
        :label="uploadLabel"
        layout="list"
        :multiple="multipleFiles"
        :interactive="false"
        class="w-full"
        :ui="fileUploadFileConfig"
        @update:model-value="fileHandler"
      >
        <template #leading>
          {{ null }}
        </template>

        <template #description>
          <div class="grid">
            <span v-if="showValidationError" class="text-error">
              {{ $t('documentUpload.noDocumentsDescription') }}
            </span>
            <span class="text-neutral">{{ uploadDescription }}</span>
          </div>
        </template>

        <template #actions="{ open }">
          <!-- Mobile Device Actions -->
          <template v-if="isMobile">
            <UDropdownMenu
              :items="mobileMenuItems"
            >
              <UButton
                :label="$t('documentUpload.label')"
                icon="i-mdi-file-upload-outline"
                color="primary"
                variant="solid"
              />
              <template #item="{ item }">
                <UButton
                  type="button"
                  class="min-w-[150px]"
                  variant="ghost"
                  :label="item.label"
                  :icon="item.icon"
                  @click="triggerInput(item.value)"
                />
              </template>
            </UDropdownMenu>

            <!-- Camera Input -->
            <input
              ref="cameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              class="hidden"
              @change="mobilePictureHandler"
            >
            <!-- Photo Album Input -->
            <input
              ref="albumInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="mobilePictureHandler"
            >
            <!-- File Picker Input -->
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              @change="mobilePictureHandler"
            >
          </template>

          <!-- Desktop Actions -->
          <div v-else class="flex items-center">
            <UButton
              :label="$t('documentUpload.label') + (props.multipleFiles ? 's' : '')"
              icon="i-mdi-file-upload-outline"
              color="primary"
              variant="solid"
              @click="open()"
            />
            <span class="ml-2 text-primary hidden sm:inline">{{ $t('documentUpload.dragAndDropLabel') }}</span>
          </div>
        </template>

        <!-- File details and PDF preview -->
        <template #file="{ file, index }">
          <!-- Mobile fallback -->
          <div v-if="isMobile" class="w-full col-span-12">
            <div class="h-30 rounded bg-gray-100 flex items-center justify-center">
              <UIcon name="i-mdi-image-outline" class="w-7 h-7 text-neutral" />
            </div>
          </div>

          <div v-else-if="(file as any)?.uploaded && (file as any)?.document" class="pdf-frame">
            <iframe
              :key="(file as any)!.document.name"
              :src="getObjectURL((file as any)!.document) + '#page=1&view=FitH&zoom=page-width'"
              type="application/pdf"
              class="pdf-frame__iframe"
            />
          </div>

          <div v-else class="w-[16rem] h-30 rounded bg-gray-100 flex items-center justify-center">
            <UIcon name="i-mdi-image-outline" class="w-8 h-8 text-neutral" />
          </div>

          <!-- File status and metadata -->
          <div class="ml-4 w-full max-sm:col-span-12">
            <template v-if="(file as any)?.errorMsg">
              <div class="flex items-center">
                <UIcon name="i-mdi-close-circle" class="text-error size-[20px]" />
                <span class="ml-2 text-error text-sm italic">
                  {{ $t('documentUpload.uploadFailed', {
                    name: (file as any)?.document?.name,
                    error: (file as any)!.errorMsg
                  }) }}
                </span>
              </div>
            </template>
            <template v-else-if="(file as any)?.uploaded && (file as any)?.document">
              <div class="flex items-center">
                <UIcon name="i-mdi-check-circle" class="text-success size-[20px]" />
                <a
                  class="ml-2 text-base italic"
                  :href="getObjectURL((file as any)!.document)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span class="text-primary">{{ (file as any)?.document.name }}</span>
                </a>
              </div>
              <div class="ml-6">
                {{ formatBytes((file as any)!.document.size, 0) }}
              </div>
            </template>
            <template v-else>
              <UProgress class="w-[200px]" color="primary" />
              <span class="mt-1">{{ $t('documentUpload.uploading') }}</span>
            </template>
          </div>

          <!-- Remove/Cancel button -->
          <UButton
            variant="ghost"
            color="primary"
            class="max-sm:col-span-12"
            @click="removeFile(index)"
          >
            <span>{{ (file as any)?.uploaded ? $t('label.remove') : $t('label.cancel') }}</span>
            <UIcon name="i-mdi-close" />
          </UButton>
        </template>
      </UFileUpload>
    </UFormField>
  </UForm>
</template>

<style scoped>
.pdf-frame {
  max-width: 150px;
  overflow: hidden;
}

.pdf-frame__iframe {
  width: 105%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
