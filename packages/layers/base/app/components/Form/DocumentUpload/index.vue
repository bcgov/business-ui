<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui'

/**
 * FileUpload component for handling file uploads with validation.
 * Supports multiple files, drag-and-drop, and displays upload progress.
 *
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
const props = defineProps({
  validate: { type: Boolean, default: false },
  uploadLabel: { type: String, default: 'Upload Files' },
  multipleFiles: { type: Boolean, default: true },
  maxFileSize: { type: Number, default: 3 * 1024 * 1024 }, // 3MB
  acceptedFileTypes: { type: Array<string>, default: () => ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'] },
})

/** Emits an event when files are converted */
const emit = defineEmits<{
  (event: 'converted-files', files: any[]): void
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
  onConverted: (files) => emit('converted-files', files)
})


/** Label for the file upload component */
const uploadDescription = computed(() =>
  `Accepted file types: ${props.acceptedFileTypes.map(type => '.' + type.split('/').pop()).join(', ')}.
   Max file size ${formatBytes(props.maxFileSize, 0)}.`
)

/**
 * Computed property to check if there is at least one valid uploaded file.
 * A file is considered valid if it has the `uploaded` property set to true and no `errorMsg`.
 */
const hasValidUploadedFile = computed(() =>
  Array.isArray(state.files) &&
  state.files.some(file => file.uploaded && !file.errorMsg)
)

/**
 * Computed property to determine if a validation error should be shown.
 * Returns true if validation is required and there are no valid uploaded files.
 */
const showValidationError = computed(() =>
  props.validate && !hasValidUploadedFile.value
)

/** Mobile detection and responsive layout handling */
const isMobile = ref(window.innerWidth < 640)
function handleResize() {
  isMobile.value = window.innerWidth < 640
}
onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))

/** Computed configurations for file upload component */
const fileUploadFileConfig = computed(() => {
  const baseConfig = showValidationError.value
    ? { label: 'text-red-600', base: 'border-red-600' }
    : {}
  if (isMobile.value) {
    return { ...baseConfig, file: 'grid grid-cols-6 gap-1 wrap-anywhere' };
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
    state.files = Array.isArray(state.files) ? [...state.files, ...files] : [...files]

    fileHandler(state.files)
  }
}

/** Dropdown menu items for mobile actions */
const mobileMenuItems = ref([
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
] satisfies SelectMenuItem[])

/** Refs for mobile file inputs */
const albumInput = ref<HTMLInputElement | null>(null)
const cameraInput = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

/** Trigger input click by type */
function triggerInput(type: 'cameraInput' | 'albumInput' | 'fileInput') {
  const inputRefs = { albumInput, cameraInput, fileInput }
  inputRefs[type].value?.click()
}
</script>

<template>
  <UForm :state="state" class="w-full" >
    <UFormField name="image">
      <UFileUpload
        v-model="state.files"
        :label="uploadLabel"
        layout="list"
        :multiple="multipleFiles"
        :interactive="false"
        class="w-full"
        :ui="fileUploadFileConfig"
        @update:model-value="fileHandler"
      >
        <template #leading>{{ null }}</template>

        <template #description>
          <div class="grid">
            <span v-if="showValidationError" class="text-red-600">
              No documents have been uploaded. Please upload the required document.
            </span>
            {{ uploadDescription }}
          </div>
        </template>

        <template #actions="{ open }">

          <!-- Mobile Device Actions-->
          <template v-if="isMobile">
            <UDropdownMenu
              :items="mobileMenuItems"
            >
              <UButton
                label="Upload Files"
                icon="i-mdi-file-upload-outline"
                color="primary"
                variant="solid"
                class=""
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
              :label="'Upload File' + (multipleFiles ? 's' : '')"
              icon="i-mdi-file-upload-outline"
              color="primary"
              variant="solid"
              @click="open()"
            />
            <span class="ml-2 text-blue-500 hidden sm:inline">or drag and drop files here</span>
          </div>
        </template>

        <!-- File details and PDF preview -->
        <template #file="{ file, index }">
          <!-- Mobile fallback -->
          <div v-if="isMobile" class="w-full col-span-12">
            <div class="h-30 rounded bg-gray-100 flex items-center">
              <UIcon name="i-mdi-image-outline" class="w-7 h-7 m-auto" />
            </div>
          </div>

          <div v-else class="pdf-frame">
            <div v-if="file?.uploaded">
              <iframe
                :key="file?.document?.name"
                :src="getObjectURL(file?.document) + '#page=1&view=FitH&zoom=page-width'"
                type="application/pdf"
                class="pdf-frame__iframe"
              />
            </div>

            <div v-else class="w-[8rem] h-30 rounded bg-gray-100 flex items-center">
              <UIcon name="i-mdi-image-outline" class="w-7 h-7 m-auto" />
            </div>
          </div>

          <!-- File status and metadata -->
          <div class="ml-4 w-full max-sm:col-span-12">
            <template v-if="file?.errorMsg">
              <div class="flex items-center">
                <UIcon name="i-mdi-close-circle" class="text-red-600 size-[20px]" />
                <span class="ml-2 text-red-600 text-[14px] italic">
                  Upload of {{ file.document?.name }} failed. {{ file.errorMsg }}
                </span>
              </div>
            </template>
            <template v-else-if="file?.uploaded">
              <div class="flex items-center">
                <UIcon name="i-mdi-check-circle" class="text-green-700 size-[20px]" />
                <a
                  class="ml-2 text-[16px] italic"
                  :href="getObjectURL(file?.document)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span class="text-blue-500">{{ file?.document.name }}</span>
                </a>
              </div>
              <div class="ml-6">
                {{ formatBytes(file?.document.size, 0) }}
              </div>
            </template>
            <template v-else>
              <UProgress class="w-[200px]" color="primary" />
              <span class="mt-1">Uploading...</span>
            </template>
          </div>

          <!-- Remove/Cancel button -->
          <UButton
            variant="ghost"
            color="primary"
            class="max-sm:col-span-12"
            @click="removeFile(index)"
          >
            <span>{{ file?.uploaded ? 'Remove' : 'Cancel' }}</span>
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
