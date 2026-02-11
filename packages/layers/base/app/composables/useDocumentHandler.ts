import { ref, reactive } from 'vue'
import * as z from 'zod'
import type { FileHandlerOptionsIF } from '~/interfaces/file-interfaces'

/**
 * Composable for handling file uploads, validation, and PDF conversion.
 * @param {FileHandlerOptionsIF} options - Configuration options for file handling.
 * @returns {object} File handler state, schema, and utility methods.
 */
export function useDocumentHandler(options: FileHandlerOptionsIF = {}) {
  const {
    maxFileSize,
    acceptedFileTypes
  } = options

  /** Reactive state for file handling. */
  const state = reactive<{ files?: File[] }>({ files: undefined })
  /** Indicates if a file operation is in progress. */
  const isProcessing = ref(false)

  /**
   * Formats bytes as a human-readable string.
   * @param {number} bytes - The number of bytes.
   * @param {number} decimals - Number of decimal places.
   * @returns {string} Formatted string.
   */
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) {
      return '0 Bytes'
    }
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  /**
   * Zod schema for file validation (pre-upload, no size or dimension checks).
   */
  const preConversionSchema = z.object({
    file: z
      .custom<File>(file => file instanceof File, { message: 'Please select a file.' })
      .refine(
        file => Array.isArray(acceptedFileTypes) && acceptedFileTypes.includes(file.type),
        {
          message: `Please upload a valid file (${
            (acceptedFileTypes ?? []).map(type => type.split('/').pop()?.toUpperCase()).join(', ')
          }).`
        })
  })

  /**
   * Zod schema for file validation (post-upload, only size check).
   */
  const postConversionSchema = z.object({
    file: z
      .custom<File>(file => file instanceof File, { message: 'Please select a file.' })
      .refine(file => typeof maxFileSize === 'undefined' || file.size <= maxFileSize, {
        message: `The file is too large. Please choose a file smaller than ${formatBytes(maxFileSize ?? 0)}.`
      })
  })

  /**
   * Removes a file from the state by index.
   * @param {number} index - Index of the file to remove.
   */
  const removeFile = (index: number) => {
    if (Array.isArray(state.files)) {
      state.files.splice(index, 1)

      // Call emit event with the updated files
      options.onConverted(state.files.map(f => f.document))
    }
  }

  /**
   * Converts a file to PDF using the pdfConversion utility.
   * @param {File} file - The file to convert.
   * @returns {Promise<File>} The converted PDF file.
   */
  const convertPdf = async (file: File) => {
    const { convertDocumentToPdf } = useDocumentRecordServiceApi()
    const blobResponse = await convertDocumentToPdf(file)
    if (!blobResponse || blobResponse.status === 'error') {
      throw new Error('Failed to convert file to PDF. No Blob returned.')
    }
    return new File(
      [blobResponse],
      file.name.replace(/\.[^/.]+$/, '.pdf'),
      { type: 'application/pdf' }
    )
  }

  /**
   * Returns an object URL for a given file.
   * @param {File} file - The file to create an object URL for.
   * @returns {string | undefined} The object URL.
   */
  const getObjectURL = (file: File) => window.URL?.createObjectURL(file)

  /**
   * Handles file uploads, validation, and conversion.
   * @param {File[]} files - Array of files to handle.
   */
  const fileHandler = async (files: File[]) => {
    // Check if already processing to prevent multiple uploads at once
    if (isProcessing.value) {
      return
    }
    isProcessing.value = true

    // Initialize state.files if not already an array: handle both single file and multiple files
    const fileArray = Array.isArray(files) ? files : [files]
    if (!Array.isArray(state.files)) {
      state.files = state.files ? [state.files] : []
    }

    // Add new files to the state
    try {
      for (const [index, file] of fileArray.entries()) {
        // Skip files that have already been uploaded
        if (state.files && (state.files[index]?.uploaded || !!state.files[index]?.errorMsg)) {
          continue
        }

        // Pre-upload validation
        const preResult = await preConversionSchema.safeParseAsync({ file })
        if (!preResult.success) {
          state.files[index] = {
            document: file,
            uploaded: false,
            errorMsg: preResult.error.errors.map((e: Error) => e.message).join(', '),
            index
          }
          continue // Skip conversion if pre-upload validation fails
        }

        try {
          const document = await convertPdf(file)
          // Post-upload validation
          const postResult = await postConversionSchema.safeParseAsync({ file: document })
          if (!postResult.success) {
            state.files[index] = {
              document,
              uploaded: false,
              errorMsg: postResult.error.errors.map((e: Error) => e.message).join(', '),
              index
            }
            continue
          }
          state.files[index] = {
            document,
            uploaded: true,
            index
          }

          // Call emit event with the uploaded files
          if (state.files[index]?.uploaded) {
            options.onConverted?.(state.files.filter(f => f.uploaded).map(f => f.document))
          }
        } catch (error: Error) {
          state.files[index] = {
            document: file,
            uploaded: false,
            errorMsg: `Failed to convert file to PDF: ${error.message}`,
            index
          }
        }
      }
    } finally {
      isProcessing.value = false
    }
  }

  return {
    state,
    isProcessing,
    formatBytes,
    removeFile,
    convertPdf,
    getObjectURL,
    fileHandler
  }
}
