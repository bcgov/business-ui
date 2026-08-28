// NB: temporary util file before creating the full reusable component
import * as z from 'zod'
import { isEqual } from 'es-toolkit'
import type { ModelRef } from 'vue'
import { useNuxtApp } from '#app'

// doc types returned by the drs api
export enum DrsDocType {
  DEFAULT = 'COSD',
  COURT_ORDER = 'CRTO',
  SUPPORTING_DOCUMENT = 'SUPP' // not returned by api yet
}

// action a user has taken on a file
export enum FileAction {
  NONE = 'NONE',
  ADDED = 'ADDED',
  DELETED = 'DELETED'
}

// status of uploaded file, idle is an existing file sttached to a court order already
export enum FileStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// full response type from drs api
interface DrsDocument {
  author: string
  consumerDocumentId: string
  consumerFilename: string
  consumerIdentifier: string
  consumerReferenceId: string
  createDateTime: string
  documentClass: string // "CORP"
  /** The DRS document service id, eg "DS0100001003" */
  documentServiceId: string // "DS0000102166"
  documentType: DrsDocType // string // "CRTO"
  documentTypeDescription: string // "Court Orders"
  documentURL: string
  /** The file key to store in the filing, eg "CORP-DS0100001003" (or a Minio key on the legacy flow). */
  key: string // "CORP-DS0000102166"
}

// ui state
export interface FileType {
  id: string
  fileKey?: string // may be undefined during initial load
  name: string
  type: string
  action: FileAction
  status: FileStatus
  errorMessage?: string
  abortController?: AbortController
}

export const maxFileSize = 50 * 1024 * 1024 // 50MB
export const acceptedFileTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif']

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes'
  }
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const fileSchema = z.object({
  file: z.file()
    .mime(acceptedFileTypes, 'validation.invalidFileTypeNamed')
    .max(maxFileSize, 'validation.fileTooLargeNamed')
})

// appends (x) on a filename to help prevent duplicate filenames
function getUniqueFileName(rawName: string, existingNames: Set<string>): string {
  if (!existingNames.has(rawName)) {
    return rawName
  }

  const lastDotIndex = rawName.lastIndexOf('.')
  const baseName = lastDotIndex !== -1 ? rawName.slice(0, lastDotIndex) : rawName
  const extension = lastDotIndex !== -1 ? rawName.slice(lastDotIndex) : ''

  let counter = 1
  let newName = `${baseName} (${counter})${extension}`

  while (existingNames.has(newName)) {
    counter++
    newName = `${baseName} (${counter})${extension}`
  }

  return newName
}

// upload a document to the drs via business api client endpoint
async function uploadDocument(
  file: File,
  documentType: DocumentTypeClient,
  props: {
    identifier?: string
    filingId: string | number
  },
  signal?: AbortSignal
) {
  return await useNuxtApp().$businessApi<DrsDocument>(
    `documents/client/${FilingType.COURT_ORDER}/${CorpTypeCd.BC_COMPANY}/${documentType}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/pdf' },
      query: {
        filename: file.name,
        businessIdentifier: props.identifier || '',
        filingId: Number(props.filingId)
      },
      body: file,
      signal
    }
  )
}

function deleteDocument(fileKey?: string) {
  if (!fileKey) {
    return
  }
  // UI doesn't care if delete failed, silently handle errors
  useNuxtApp().$businessApi(`documents/client/${fileKey}`, { method: 'DELETE' }).catch(() => {})
}

// helper to determine if an uploaded court order file is in an active state
function isActiveCourtOrder(doc: FileType, excludeId?: string) {
  return doc.type === DrsDocType.COURT_ORDER
    && doc.id !== excludeId
    && doc.action !== FileAction.DELETED
    && [FileStatus.SUCCESS, FileStatus.IDLE, FileStatus.LOADING].includes(doc.status)
}

// main functionality/state handling
export function useCourtOrderDocs(
  model: ModelRef<FileType[]>,
  props: {
    identifier?: string
    filingId: string | number
  }
) {
  const { te, t } = useNuxtApp().$i18n

  const dropzoneRef = useTemplateRef<HTMLDivElement>('dropzoneRef')
  const { isOverDropZone } = useDropZone(dropzoneRef, {
    onDrop: (files) => { supportingFiles.value = [...supportingFiles.value, ...files ?? []] },
    multiple: true,
    preventDefaultForUnhandled: true
  })

  const uploadedDocuments = ref<FileType[]>([]) // full list of files
  const courtOrderFile = ref<File>() // model value for court order upload
  const supportingFiles = ref<File[]>([]) // model value for supporting docs upload
  const courtOrderUploadTimestamp = ref<number | undefined>(undefined) // flag to trigger sr alert
  const inProgressFilenames = new Set<string>() // list of filenames actively being uploaded

  // full list of court order files
  const courtOrderDocs = computed(() =>
    uploadedDocuments.value.filter(doc => doc.type === DrsDocType.COURT_ORDER)
  )
  // full list of supporting files
  const supportingDocs = computed(() =>
    uploadedDocuments.value.filter(doc => doc.type !== DrsDocType.COURT_ORDER)
  )

  const activeCourtOrderDoc = computed(() => {
    const doc = uploadedDocuments.value.find(d => isActiveCourtOrder(d))
    return {
      doc,
      exists: Boolean(doc)
    }
  })

  const displayMaxOneCourtOrderAlert = computed(() =>
    courtOrderUploadTimestamp.value !== undefined && activeCourtOrderDoc.value.exists
  )

  function preventDuplicateCourtOrderCheck(excludeId?: string): boolean {
    const hasActive = excludeId
      ? uploadedDocuments.value.some(d => isActiveCourtOrder(d, excludeId))
      : activeCourtOrderDoc.value.exists

    if (hasActive) {
      courtOrderUploadTimestamp.value = Date.now()
      return true
    }
    return false
  }

  function onUploadCourtOrder(open: () => void) {
    if (preventDuplicateCourtOrderCheck()) {
      return
    }
    open()
  }

  // file item action handling
  function onFileItemEmit(id: string, actionType: 'delete' | 'undo' | 'cancel') {
    const file = uploadedDocuments.value.find(f => f.id === id)
    if (!file) {
      return
    }

    switch (actionType) {
      case 'delete':
        // newly added files get hard deleted
        if (file.action === FileAction.ADDED) {
          deleteDocument(file.fileKey)
          uploadedDocuments.value = uploadedDocuments.value.filter(f => f.id !== id)
        // existing files get soft deleted with the deleted action  
        } else {
          file.action = FileAction.DELETED
        }
        courtOrderUploadTimestamp.value = undefined
        break

      case 'undo': {
        // prevent undo on a court order if another court order is active
        if (file.type === DrsDocType.COURT_ORDER && preventDuplicateCourtOrderCheck(file.id)) {
          return
        }
        // else revert the action to none
        file.action = FileAction.NONE
        courtOrderUploadTimestamp.value = undefined
        break
      }

      case 'cancel':
        // cancel network request and remove file from uploaded docs
        file.abortController?.abort()
        uploadedDocuments.value = uploadedDocuments.value.filter(f => f.id !== id)
        break
    }
  }

  // main file handler
  async function processFiles(
    submitted: File[] | File | undefined,
    docType: DocumentTypeClient.COURT_ORDER | DocumentTypeClient.SUPPORTING_DOCUMENT
  ) {
    // safety check
    if (!submitted) {
      return
    }

    // safety check
    if (docType === DocumentTypeClient.COURT_ORDER && preventDuplicateCourtOrderCheck()) {
      courtOrderFile.value = undefined
      return
    }

    const newFiles = Array.isArray(submitted) ? submitted : [submitted]
    if (!newFiles.length) {
      return
    }

    // filter out docs with errors on any new upload
    uploadedDocuments.value = uploadedDocuments.value.filter(
      doc => doc.status !== FileStatus.ERROR
    )

    // reset model values for future uploads
    courtOrderFile.value = undefined
    supportingFiles.value = []

    const existingNames = new Set([
      ...uploadedDocuments.value
        .filter(item => item.action !== FileAction.DELETED)
        .map(item => item.name),
      ...inProgressFilenames
    ])

    await Promise.allSettled(
      newFiles.map(async (file) => {
        const uniqueName = getUniqueFileName(file.name, existingNames)
        existingNames.add(uniqueName)
        inProgressFilenames.add(uniqueName)

        const newFile = new File([file], uniqueName, { type: file.type })

        // normalize doc type
        const uiDocType = docType === DocumentTypeClient.COURT_ORDER
          ? DrsDocType.COURT_ORDER
          : DrsDocType.SUPPORTING_DOCUMENT

        // temporary file item for loading state
        const fileItem = reactive<FileType>({
          id: crypto.randomUUID(),
          name: newFile.name,
          type: uiDocType,
          status: FileStatus.LOADING,
          action: FileAction.ADDED,
          abortController: markRaw(new AbortController()) // exclude web api from reactivity
        })

        uploadedDocuments.value.push(fileItem)

        try {
          // validate max bytes and accepted types, will throw if invalid
          fileSchema.parse({ file: newFile })

          // upload to drs via business api client endpoint
          const doc = await uploadDocument(
            newFile,
            docType,
            props,
            fileItem.abortController?.signal
          )

          // update file item with drs props and success status
          Object.assign(fileItem, {
            fileKey: doc.key,
            name: doc.consumerFilename,
            type: uiDocType,
            url: doc.documentURL,
            status: FileStatus.SUCCESS,
            abortController: undefined
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          if (e?.name === 'AbortError') {
            return
          }

          fileItem.status = FileStatus.ERROR

          // get zod error message
          const tKey = e?.issues?.[0]?.message

          // i18n props
          const tData = {
            filename: fileItem.name,
            validtype: acceptedFileTypes.map(type => `.${type.split('/').pop()?.toUpperCase()}`).join(', '),
            maxsize: formatBytes(maxFileSize)
          }

          // use zod error message if available or fallbackl to generic
          const errorMessage = te(tKey)
            ? t(tKey, tData)
            : t('validation.uploadFailedGeneric', tData)

          fileItem.errorMessage = errorMessage
        } finally {
          inProgressFilenames.delete(uniqueName)
        }
      })
    )
  }

  // process user uploaded court order file
  watch(courtOrderFile, async newVal => await processFiles(newVal, DocumentTypeClient.COURT_ORDER))
  // process user uploaded supporting files
  watch(supportingFiles, async newVal => await processFiles(newVal, DocumentTypeClient.SUPPORTING_DOCUMENT))

  // sync model value (external state) with uploaded documents (internal state)
  watch(uploadedDocuments, (newVal) => {
    model.value = newVal.map(({ abortController, ...rest }) => ({ ...rest }))
  }, { deep: true })

  // sync uploaded documents (internal state) with model value (external state)
  // either by parent mutation or onMounted from immediate: true
  watch(
    model,
    (newVal) => {
      const internal = uploadedDocuments.value.map(({ abortController, ...rest }) => ({ ...rest }))
      // safety check to prevent recursive updates
      if (!isEqual(newVal, internal)) {
        uploadedDocuments.value = newVal.map(item => ({ ...item }))
      }
    },
    { immediate: true }
  )

  return {
    courtOrderFile,
    supportingFiles,
    dropzoneRef,
    isOverDropZone,
    courtOrderDocs,
    supportingDocs,
    activeCourtOrderDoc,
    courtOrderUploadTimestamp,
    displayMaxOneCourtOrderAlert,
    onUploadCourtOrder,
    onFileItemEmit
  }
}
