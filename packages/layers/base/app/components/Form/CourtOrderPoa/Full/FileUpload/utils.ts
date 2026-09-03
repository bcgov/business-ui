// NB: temporary util file before creating the full reusable component
import * as z from 'zod'
import { isEqual } from 'es-toolkit'
import type { ModelRef } from 'vue'
import { useNuxtApp } from '#app'

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
  let baseName = lastDotIndex !== -1 ? rawName.slice(0, lastDotIndex) : rawName
  const extension = lastDotIndex !== -1 ? rawName.slice(lastDotIndex) : ''

  const match = baseName.match(/^(.*?)\s*\((\d+)\)$/)
  let counter = 1

  if (match) {
    baseName = match[1]!
    counter = parseInt(match[2]!, 10) + 1
  }

  let newName = `${baseName} (${counter})${extension}`

  while (existingNames.has(newName)) {
    counter++
    newName = `${baseName} (${counter})${extension}`
  }

  return newName
}

// helper to determine if an uploaded court order file is in an active state
function isActiveCourtOrder(doc: CourtOrderFileUi, excludeId?: string) {
  return doc.type === DocumentTypeClient.COURT_ORDER
    && doc.id !== excludeId
    && doc.action !== CourtOrderFileAction.DELETED
    && [CourtOrderFileStatus.SUCCESS, CourtOrderFileStatus.IDLE, CourtOrderFileStatus.LOADING].includes(doc.status)
}

// custom xhr request to return upload percentage
async function uploadFile(
  file: File,
  fileItem: CourtOrderFileUi,
  options: {
    entityType: CorpTypeCd
    documentType: DocumentTypeClient
    identifier?: string
    filingId?: string | number
  }
): Promise<DocumentUploadResponse> {
  const auth = useConnectAuth()
  const accountStore = useConnectAccountStore()
  const rtc = useRuntimeConfig().public

  const token = await auth.getToken()

  const headers = new Headers()
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('App-Name', rtc.appName)
  headers.set('X-Apikey', rtc.xApiKey)

  const accountId = accountStore.currentAccount?.id
  if (accountId) {
    headers.set('Account-Id', String(accountId))
  }

  const {
    documentType,
    entityType,
    identifier = '',
    filingId
  } = options

  // must manually build url or new URL may strip trailing characters with how our env vars are set
  const base = `${rtc.businessApiUrl}${rtc.businessApiVersion}`.replace(/\/+$/, '')
  const url = new URL(`${base}/documents/client/${FilingType.COURT_ORDER}/${entityType}/${documentType}`)

  const params = new URLSearchParams({
    filename: file.name
  })

  if (identifier) {
    params.set('businessIdentifier', identifier)
  }

  if (filingId && Number(filingId)) {
    params.set('filingId', String(filingId))
  }

  url.search = params.toString()

  const signal = fileItem.abortController?.signal
  if (signal?.aborted) {
    return Promise.reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url.toString())
    xhr.timeout = 30000

    headers.forEach((v, k) => xhr.setRequestHeader(k, v))

    // Simulate progress up to 95% -> provides better UX
    const timer = setInterval(() => {
      const currentProgress = fileItem.progress ?? 0
      if (currentProgress < 85) {
        fileItem.progress = currentProgress + Math.floor(Math.random() * 6) + 4
      } else if (currentProgress < 95) {
        fileItem.progress = currentProgress + 1
      }
    }, 120)

    const onAbort = () => xhr.abort()
    signal?.addEventListener('abort', onAbort, { once: true })

    xhr.onloadend = () => {
      clearInterval(timer)
      signal?.removeEventListener('abort', onAbort)
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        const realPercentage = Math.round((e.loaded / e.total) * 90)
        if (realPercentage > (fileItem.progress ?? 0)) {
          fileItem.progress = realPercentage
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        fileItem.progress = 100
        try {
          const data = xhr.responseText ? JSON.parse(xhr.responseText) : {}
          resolve(data)
        } catch {
          reject(new Error('Invalid JSON response'))
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText || 'Upload failed'}`))
      }
    }

    xhr.ontimeout = () => reject(new Error('Request timed out after 30 seconds'))
    xhr.onerror = () => reject(new TypeError('Network error'))
    xhr.onabort = () => reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))

    xhr.send(file)
  })
}

// main functionality/state handling
export function useCourtOrderDocs(
  model: ModelRef<CourtOrderFileUi[]>,
  props: {
    identifier?: string
    filingId: string | number
    entityType: CorpTypeCd
  }
) {
  const { te, t } = useNuxtApp().$i18n
  const service = useBusinessService()

  const isTouchscreen = useMediaQuery('(pointer: coarse)')

  const dropzoneRef = useTemplateRef<HTMLDivElement>('dropzoneRef')
  const { isOverDropZone } = useDropZone(() => isTouchscreen.value ? null : dropzoneRef.value, {
    onDrop: (files) => { supportingFiles.value = [...supportingFiles.value, ...files ?? []] },
    multiple: true,
    preventDefaultForUnhandled: true
  })

  const uploadedDocuments = ref<CourtOrderFileUi[]>([]) // full list of files
  const courtOrderFile = ref<File>() // model value for court order upload
  const supportingFiles = ref<File[]>([]) // model value for supporting docs upload
  const courtOrderUploadTimestamp = ref<number | undefined>(undefined) // flag to trigger sr alert
  const inProgressFilenames = new Set<string>() // list of filenames actively being uploaded

  const isDropZoneEnabled = computed(() => !isTouchscreen.value)

  // full list of court order files
  const courtOrderDocs = computed(() =>
    uploadedDocuments.value.filter(doc => doc.type === DocumentTypeClient.COURT_ORDER)
  )
  // full list of supporting files
  const supportingDocs = computed(() =>
    uploadedDocuments.value.filter(doc => doc.type !== DocumentTypeClient.COURT_ORDER)
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
  function onFileAction(id: string, action: 'delete' | 'undo' | 'cancel' | 'dismiss') {
    const file = uploadedDocuments.value.find(f => f.id === id)
    if (!file) {
      return
    }

    switch (action) {
      case 'delete':
        // newly added files get hard deleted
        if (file.action === CourtOrderFileAction.ADDED) {
          service.deleteDocument(file.fileKey)
          uploadedDocuments.value = uploadedDocuments.value.filter(f => f.id !== id)
        // existing files get soft deleted with the deleted action
        } else {
          file.action = CourtOrderFileAction.DELETED
        }
        courtOrderUploadTimestamp.value = undefined
        break

      case 'undo': {
        // prevent undo on a court order if another court order is active
        if (file.type === DocumentTypeClient.COURT_ORDER && preventDuplicateCourtOrderCheck(file.id)) {
          return
        }
        // else revert the action to none
        file.action = CourtOrderFileAction.NONE
        courtOrderUploadTimestamp.value = undefined
        break
      }

      case 'cancel':
        // cancel network request and remove file from uploaded docs
        file.abortController?.abort()
        uploadedDocuments.value = uploadedDocuments.value.filter(f => f.id !== id)
        break

      case 'dismiss':
        // clear file with upload error on dismiss
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
      doc => doc.status !== CourtOrderFileStatus.ERROR
    )

    // reset model values for future uploads
    courtOrderFile.value = undefined
    supportingFiles.value = []

    const existingNames = new Set([
      ...uploadedDocuments.value
        .filter(item => item.action !== CourtOrderFileAction.DELETED)
        .map(item => item.name),
      ...inProgressFilenames
    ])

    await Promise.allSettled(
      newFiles.map(async (file) => {
        const uniqueName = getUniqueFileName(file.name, existingNames)
        existingNames.add(uniqueName)
        inProgressFilenames.add(uniqueName)

        const newFile = new File([file], uniqueName, { type: file.type })

        // temporary file item for loading state
        const fileItem = reactive<CourtOrderFileUi>({
          id: crypto.randomUUID(),
          name: newFile.name,
          type: docType,
          status: CourtOrderFileStatus.LOADING,
          action: CourtOrderFileAction.ADDED,
          progress: 0,
          abortController: markRaw(new AbortController()) // exclude web api from reactivity
        })

        uploadedDocuments.value.push(fileItem)

        try {
          // validate max bytes and accepted types, will throw if invalid
          fileSchema.parse({ file: newFile })

          // upload to drs via business api client endpoint
          const doc = await uploadFile(
            newFile,
            fileItem,
            {
              entityType: props.entityType,
              documentType: fileItem.type,
              identifier: props.identifier,
              filingId: props.filingId
            }
          )

          // update file item with drs props and success status
          Object.assign(fileItem, {
            fileKey: doc.key,
            name: doc.consumerFilename,
            type: docType,
            url: doc.documentURL,
            status: CourtOrderFileStatus.SUCCESS,
            progress: 100,
            abortController: undefined
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          if (e?.name === 'AbortError') {
            return
          }

          fileItem.status = CourtOrderFileStatus.ERROR

          // get zod error message
          const tKey = e?.issues?.[0]?.message

          // i18n props
          const tData = {
            filename: fileItem.name,
            validtype: acceptedFileTypes.map(type => `.${type.split('/').pop()?.toUpperCase()}`).join(', '),
            maxsize: formatBytes(maxFileSize)
          }

          // use zod error message if available or fallback to generic
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
    const internal = newVal.map(({ abortController, progress, ...rest }) => ({ ...rest }))
    if (!isEqual(model.value, internal)) {
      model.value = internal
    }
  }, { deep: true })

  // sync uploaded documents (internal state) with model value (external state)
  // either by parent mutation or onMounted from immediate: true
  watch(model, (newVal) => {
    const internal = uploadedDocuments.value.map(({ abortController, progress, ...rest }) => ({ ...rest }))
    // safety check to prevent recursive updates
    if (!isEqual(newVal, internal)) {
      uploadedDocuments.value = newVal.map(item => ({ ...item }))
    }
  }, { immediate: true })

  return {
    courtOrderFile,
    supportingFiles,
    dropzoneRef,
    isOverDropZone,
    isDropZoneEnabled,
    courtOrderDocs,
    supportingDocs,
    activeCourtOrderDoc,
    courtOrderUploadTimestamp,
    displayMaxOneCourtOrderAlert,
    onUploadCourtOrder,
    onFileAction
  }
}
