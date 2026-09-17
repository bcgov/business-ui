/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import type { ModelRef } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import * as pdfjs from 'pdfjs-dist'

import {
  formatBytes,
  useCourtOrderDocs,
  maxFileSize,
  acceptedFileTypes
} from '../../app/components/Form/CourtOrderPoa/Full/FileUpload/utils'

const mockBusinessApi = vi.fn()

const mockBusinessService = {
  deleteDocument: vi.fn()
}

mockNuxtImport('useBusinessService', () => () => mockBusinessService)

const mockAuth = { getToken: vi.fn().mockResolvedValue('mock-token') }
const mockAccountStore = { currentAccount: { id: '123' } }

mockNuxtImport('useConnectAuth', () => () => mockAuth)
mockNuxtImport('useConnectAccountStore', () => () => mockAccountStore)
mockNuxtImport('useRuntimeConfig', () => () => ({
  public: {
    appName: 'test-app',
    xApiKey: 'test-key',
    businessApiUrl: 'https://test-api.gov.bc.ca',
    businessApiVersion: '/v1'
  }
}))
const mockMediaQuery = ref(false)
mockNuxtImport('useMediaQuery', () => () => mockMediaQuery)

vi.mock('#app', async (importOriginal) => {
  const original = await importOriginal<typeof import('#app')>()

  return {
    ...original,
    useNuxtApp: () => ({
      ...original.useNuxtApp?.(),
      $businessApi: mockBusinessApi,
      $i18n: {
        te: () => false,
        t: (key: string) => key
      }
    })
  }
})

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn()
}))

const getXhrMock = (sendMock?: any, abortMock?: any) => ({
  open: vi.fn(),
  setRequestHeader: vi.fn(),
  send: sendMock || vi.fn(function (this: any) {
    this.status = 200
    this.responseText = JSON.stringify({
      key: 'drs-key',
      consumerFilename: 'valid_order.pdf',
      documentURL: 'https://example.com/doc'
    })
    this.onload?.()
    this.onloadend?.()
  }),
  abort: abortMock || vi.fn(),
  upload: {}
})

describe('court order file constraints', () => {
  it('should default to the limits enforced by the api', () => {
    expect(maxFileSize).toBe(30 * 1024 * 1024)
    expect(formatBytes(maxFileSize)).toBe('30 MB')
    expect(acceptedFileTypes).toEqual(['application/pdf', 'image/jpeg', 'image/png', 'image/gif'])
  })
})

describe('formatBytes', () => {
  it('should format bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(31457280)).toBe('30 MB')
    expect(formatBytes(1500)).toBe('1.46 KB')
    expect(formatBytes(1500, 3)).toBe('1.465 KB')
    expect(formatBytes(1500, 0)).toBe('1 KB')
    expect(formatBytes(1500, -1)).toBe('1 KB')
    expect(formatBytes(1073741824)).toBe('1 GB')
  })
})

describe('useCourtOrderDocs', () => {
  let model: ModelRef<CourtOrderFileUi[]>
  const defaultProps = {
    identifier: 'BC1234567',
    filingId: 9876543,
    entityType: CorpTypeCd.BC_COMPANY
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    model = ref<CourtOrderFileUi[]>([]) as ModelRef<CourtOrderFileUi[]>
    mockBusinessApi.mockResolvedValue({})
    mockMediaQuery.value = false

    // default to letter size
    vi.mocked(pdfjs.getDocument).mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getViewport: () => ({ width: 612, height: 792 })
        }),
        cleanup: vi.fn().mockResolvedValue(undefined)
      })
    } as unknown as ReturnType<typeof pdfjs.getDocument>)
  })

  describe('State sync', () => {
    it('should sync internal state from model', async () => {
      const initial: CourtOrderFileUi = {
        id: '1234567',
        name: 'court_order.pdf',
        type: DocumentTypeClient.COURT_ORDER,
        action: CourtOrderFileAction.NONE,
        status: CourtOrderFileStatus.SUCCESS
      }
      model.value = [initial]

      const { courtOrderDocs } = useCourtOrderDocs(model, defaultProps)

      expect(courtOrderDocs.value).toHaveLength(1)
      expect(courtOrderDocs.value[0]!.id).toBe(initial.id)
    })

    it('should sync model on internal state update', async () => {
      const { supportingFiles } = useCourtOrderDocs(model, defaultProps)
      const mockApiResponse = {
        key: 'drs-key',
        consumerFilename: 'support.pdf',
        documentURL: 'https://doc.url'
      }
      mockBusinessApi.mockResolvedValueOnce(mockApiResponse)

      supportingFiles.value = [new File(['test file'], 'support.pdf', { type: 'application/pdf' })]
      await nextTick()

      expect(model.value).toHaveLength(1)
      expect(model.value[0]!.name).toBe(mockApiResponse.consumerFilename)
      expect(model.value[0]).not.toHaveProperty('abortController')
    })
  })

  describe('Court Order Upload', () => {
    it('should block upload if an active court order exists', async () => {
      model.value = [{
        id: '1234567',
        name: 'court_order.pdf',
        type: DocumentTypeClient.COURT_ORDER,
        action: CourtOrderFileAction.ADDED,
        status: CourtOrderFileStatus.SUCCESS
      }]

      const { onUploadCourtOrder, displayMaxOneCourtOrderAlert } = useCourtOrderDocs(model, defaultProps)
      await nextTick()

      const openFn = vi.fn()
      onUploadCourtOrder(openFn)

      expect(openFn).not.toHaveBeenCalled()
      expect(displayMaxOneCourtOrderAlert.value).toBe(true)
    })

    it('should allow upload when no court order exists', async () => {
      const { onUploadCourtOrder } = useCourtOrderDocs(model, defaultProps)
      const openFn = vi.fn()

      onUploadCourtOrder(openFn)
      expect(openFn).toHaveBeenCalledOnce()
    })

    it('should allow upload when a deleted court order exists', async () => {
      model.value = [{
        id: '1234567',
        name: 'court_order.pdf',
        type: DocumentTypeClient.COURT_ORDER,
        action: CourtOrderFileAction.DELETED,
        status: CourtOrderFileStatus.IDLE
      }]

      const { onUploadCourtOrder } = useCourtOrderDocs(model, defaultProps)
      const openFn = vi.fn()

      onUploadCourtOrder(openFn)
      expect(openFn).toHaveBeenCalledOnce()
    })
  })

  describe('processFiles', () => {
    it('should upload files successfully', async () => {
      const xhrMock = getXhrMock()
      vi.stubGlobal('XMLHttpRequest', vi.fn(() => xhrMock))
      const { courtOrderFile, courtOrderDocs } = useCourtOrderDocs(model, defaultProps)
      courtOrderFile.value = new File(['pdf data'], 'valid_order.pdf', { type: 'application/pdf' })

      await nextTick()
      await flushPromises()

      expect(xhrMock.open).toHaveBeenCalledWith(
        'POST',
        expect.stringContaining('/documents/client/courtOrder/BC/court_order?filename=valid_order.pdf')
      )
      expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Authorization', expect.stringMatching(/^Bearer/))
      expect(xhrMock.send).toHaveBeenCalledOnce()

      expect(courtOrderDocs.value[0]!.status).toBe(CourtOrderFileStatus.SUCCESS)
      expect(courtOrderDocs.value[0]!.fileKey).toBe('drs-key')
    })

    it('should use the current prop values on each upload (reactive props)', async () => {
      const xhrMock = getXhrMock()
      vi.stubGlobal('XMLHttpRequest', vi.fn(() => xhrMock))

      const filingId = ref<string | number>(9876543)
      const entityType = ref(CorpTypeCd.BC_COMPANY)

      const { supportingFiles } = useCourtOrderDocs(model, {
        identifier: 'BC1234567',
        filingId,
        entityType
      })

      supportingFiles.value = [new File(['pdf data'], 'first.pdf', { type: 'application/pdf' })]
      await nextTick()
      await flushPromises()

      expect(xhrMock.open).toHaveBeenLastCalledWith(
        'POST',
        expect.stringContaining('/documents/client/courtOrder/BC/supporting_document?filename=first.pdf')
      )
      expect(xhrMock.open).toHaveBeenLastCalledWith('POST', expect.stringContaining('filingId=9876543'))

      // values resolving after the composable was created should be used by the next upload
      filingId.value = 1234567
      entityType.value = CorpTypeCd.BENEFIT_COMPANY
      await nextTick()

      supportingFiles.value = [new File(['pdf data'], 'second.pdf', { type: 'application/pdf' })]
      await nextTick()
      await flushPromises()

      expect(xhrMock.open).toHaveBeenLastCalledWith(
        'POST',
        expect.stringContaining('/documents/client/courtOrder/BEN/supporting_document?filename=second.pdf')
      )
      expect(xhrMock.open).toHaveBeenLastCalledWith('POST', expect.stringContaining('filingId=1234567'))
    })

    it('should set error status when file is larger than the max file size', async () => {
      const { supportingFiles, supportingDocs } = useCourtOrderDocs(model, defaultProps)
      const oversizedFile = new File([new Uint8Array(maxFileSize + 100)], 'test.pdf', { type: 'application/pdf' })

      supportingFiles.value = [oversizedFile]
      await nextTick()
      await flushPromises()

      expect(supportingDocs.value[0]!.status).toBe(CourtOrderFileStatus.ERROR)
      expect(supportingDocs.value[0]!.errorMessage).toBeDefined()
    })

    it('should set error status when PDF page size is not Letter', async () => {
      vi.mocked(pdfjs.getDocument).mockReturnValueOnce({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn(() => Promise.resolve({
            getViewport: () => ({ width: 595, height: 842 }) // Not 8.5 x 11 inches
          })),
          cleanup: vi.fn(() => Promise.resolve())
        })
      } as any)

      const { supportingFiles, supportingDocs } = useCourtOrderDocs(model, defaultProps)
      const invalidSizeFile = new File(['pdf data'], 'a4_order.pdf', { type: 'application/pdf' })
      invalidSizeFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8))

      supportingFiles.value = [invalidSizeFile]
      await nextTick()
      await flushPromises()

      expect(supportingDocs.value[0]!.status).toBe(CourtOrderFileStatus.ERROR)
      expect(supportingDocs.value[0]!.errorMessage).toBeDefined()
    })

    it('should set error status when PDF is password protected', async () => {
      const passwordError = new Error('Password required')
      passwordError.name = 'PasswordException'

      vi.mocked(pdfjs.getDocument).mockReturnValueOnce({
        promise: Promise.reject(passwordError)
      } as any)

      const { supportingFiles, supportingDocs } = useCourtOrderDocs(model, defaultProps)
      const encryptedFile = new File(['pdf data'], 'locked_order.pdf', { type: 'application/pdf' })
      encryptedFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8))

      supportingFiles.value = [encryptedFile]
      await nextTick()
      await flushPromises()

      expect(supportingDocs.value[0]!.status).toBe(CourtOrderFileStatus.ERROR)
      expect(supportingDocs.value[0]!.errorMessage).toBeDefined()
    })

    it('should set error status when PDF is corrupted', async () => {
      vi.mocked(pdfjs.getDocument).mockReturnValueOnce({
        promise: Promise.reject(new Error('Invalid PDF structure'))
      } as any)

      const { supportingFiles, supportingDocs } = useCourtOrderDocs(model, defaultProps)
      const corruptFile = new File(['bad data'], 'corrupt.pdf', { type: 'application/pdf' })
      corruptFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8))

      supportingFiles.value = [corruptFile]
      await nextTick()
      await flushPromises()

      expect(supportingDocs.value[0]!.status).toBe(CourtOrderFileStatus.ERROR)
      expect(supportingDocs.value[0]!.errorMessage).toBeDefined()
    })

    it('should ensure unique file names', async () => {
      model.value = [{
        id: '1234567',
        name: 'document.pdf',
        type: DocumentTypeClient.SUPPORTING_DOCUMENT,
        action: CourtOrderFileAction.ADDED,
        status: CourtOrderFileStatus.SUCCESS
      }]

      const sendMock = vi.fn()

      sendMock.mockImplementationOnce(function (this: any) {
        this.status = 200
        this.responseText = JSON.stringify({
          key: 'drs-key-1',
          consumerFilename: 'document (1).pdf',
          documentURL: 'https://example.com/doc1'
        })
        this.onload?.()
        this.onloadend?.()
      })

      sendMock.mockImplementationOnce(function (this: any) {
        this.status = 200
        this.responseText = JSON.stringify({
          key: 'drs-key-2',
          consumerFilename: 'document (2).pdf',
          documentURL: 'https://example.com/doc2'
        })
        this.onload?.()
        this.onloadend?.()
      })

      const xhrMock = getXhrMock(sendMock)
      vi.stubGlobal('XMLHttpRequest', vi.fn(() => xhrMock))

      const { supportingFiles, supportingDocs } = useCourtOrderDocs(model, defaultProps)
      await nextTick()
      await flushPromises()

      supportingFiles.value = [new File(['test file'], 'document.pdf', { type: 'application/pdf' })]
      await nextTick()
      await flushPromises()

      expect(supportingDocs.value).toHaveLength(2)
      expect(supportingDocs.value[1]!.name).toBe('document (1).pdf')
      expect(xhrMock.open).toHaveBeenLastCalledWith(
        'POST',
        expect.stringContaining('filename=document+%281%29.pdf')
      )

      supportingFiles.value = [new File(['test file'], 'document (1).pdf', { type: 'application/pdf' })]
      await nextTick()
      await flushPromises()

      expect(supportingDocs.value).toHaveLength(3)
      expect(supportingDocs.value[2]!.name).toBe('document (2).pdf')
      expect(xhrMock.open).toHaveBeenLastCalledWith(
        'POST',
        expect.stringContaining('filename=document+%282%29.pdf')
      )

      expect(sendMock).toHaveBeenCalledTimes(2)
    })
  })

  describe('onFileAction', () => {
    it('should soft delete a newly added file if it was not added during this form session', async () => {
      const mockDoc = {
        id: '1234567',
        fileKey: 'drs-key',
        name: 'doc.pdf',
        type: DocumentTypeClient.SUPPORTING_DOCUMENT,
        action: CourtOrderFileAction.ADDED,
        status: CourtOrderFileStatus.SUCCESS
      }
      model.value = [mockDoc]

      const { onFileAction, supportingDocs } = useCourtOrderDocs(model, defaultProps)
      await nextTick()
      await flushPromises()

      onFileAction(mockDoc.id, 'delete')

      expect(mockBusinessService.deleteDocument).not.toHaveBeenCalled()
      expect(supportingDocs.value).toHaveLength(0)
    })

    it('should hard delete a newly added file if it was added during this form session', async () => {
      const mockDoc = {
        id: '1234567',
        fileKey: 'drs-key',
        name: 'doc.pdf',
        type: DocumentTypeClient.SUPPORTING_DOCUMENT,
        action: CourtOrderFileAction.ADDED,
        status: CourtOrderFileStatus.SUCCESS
      }
      model.value = [mockDoc]

      const xhrMock = getXhrMock()
      vi.stubGlobal('XMLHttpRequest', vi.fn(() => xhrMock))

      const { supportingFiles, supportingDocs, onFileAction } = useCourtOrderDocs(model, defaultProps)
      await nextTick()
      await flushPromises()

      supportingFiles.value = [new File(['test file'], 'document.pdf', { type: 'application/pdf' })]
      await nextTick()
      await flushPromises()

      expect(supportingDocs.value).toHaveLength(2)
      const expectedKey = 'drs-key'
      expect(supportingDocs.value[1]!.fileKey).toBe(expectedKey)

      onFileAction(supportingDocs.value[1]!.id, 'delete')

      expect(mockBusinessService.deleteDocument).toHaveBeenCalledWith(expectedKey)
    })

    it('should soft delete an existing file', async () => {
      const mockDoc = {
        id: '1234567',
        fileKey: 'drs-key',
        name: 'doc.pdf',
        type: DocumentTypeClient.SUPPORTING_DOCUMENT,
        action: CourtOrderFileAction.NONE,
        status: CourtOrderFileStatus.SUCCESS
      }
      model.value = [mockDoc]

      const { onFileAction, supportingDocs } = useCourtOrderDocs(model, defaultProps)

      expect(supportingDocs.value[0]!.action).toBe(CourtOrderFileAction.NONE)

      onFileAction(mockDoc.id, 'delete')

      expect(mockBusinessService.deleteDocument).not.toHaveBeenCalled()
      expect(supportingDocs.value[0]!.action).toBe(CourtOrderFileAction.DELETED)
    })

    it('should undo a soft deleted file', async () => {
      const mockDoc = {
        id: '1234567',
        fileKey: 'drs-key',
        name: 'doc.pdf',
        type: DocumentTypeClient.SUPPORTING_DOCUMENT,
        action: CourtOrderFileAction.DELETED,
        status: CourtOrderFileStatus.IDLE
      }
      model.value = [mockDoc]

      const { onFileAction, supportingDocs } = useCourtOrderDocs(model, defaultProps)
      expect(supportingDocs.value[0]!.action).toBe(CourtOrderFileAction.DELETED)

      onFileAction(mockDoc.id, 'undo')
      expect(supportingDocs.value[0]!.action).toBe(CourtOrderFileAction.NONE)
    })

    it('should not undo a court order if another active court order exists', async () => {
      model.value = [
        {
          id: 'file-1',
          name: 'active.pdf',
          type: DocumentTypeClient.COURT_ORDER,
          action: CourtOrderFileAction.ADDED,
          status: CourtOrderFileStatus.SUCCESS
        },
        {
          id: 'file-2',
          name: 'deleted.pdf',
          type: DocumentTypeClient.COURT_ORDER,
          action: CourtOrderFileAction.DELETED,
          status: CourtOrderFileStatus.SUCCESS
        }
      ]

      const { onFileAction, courtOrderDocs } = useCourtOrderDocs(model, defaultProps)

      onFileAction('file-2', 'undo')

      const file2 = courtOrderDocs.value.find(d => d.id === 'file-2')
      expect(file2?.action).toBe(CourtOrderFileAction.DELETED)
    })

    it('should call abort and remove file on cancel', async () => {
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
      const xhrMock = getXhrMock(
        vi.fn(),
        vi.fn(function (this: any) {
          this.onabort?.()
          this.onloadend?.()
        })
      )
      vi.stubGlobal('XMLHttpRequest', vi.fn(() => xhrMock))

      const { onFileAction, supportingFiles, supportingDocs } = useCourtOrderDocs(model, defaultProps)

      supportingFiles.value = [new File(['test file'], 'uploading.pdf', { type: 'application/pdf' })]
      await nextTick()
      await flushPromises()

      const activeFile = supportingDocs.value[0]!
      onFileAction(activeFile.id, 'cancel')

      expect(abortSpy).toHaveBeenCalledOnce()
      expect(xhrMock.abort).toHaveBeenCalledOnce()
      expect(supportingDocs.value).toHaveLength(0)
    })
  })

  describe('isDropZoneEnabled', () => {
    it('should be enabled when media query returns false', async () => {
      mockMediaQuery.value = false
      await nextTick()
      await flushPromises()

      const { isDropZoneEnabled } = useCourtOrderDocs(model, defaultProps)

      expect(isDropZoneEnabled.value).toBe(true)
    })

    it('should be disabled when media query returns true', async () => {
      mockMediaQuery.value = true
      await nextTick()
      await flushPromises()

      const { isDropZoneEnabled } = useCourtOrderDocs(model, defaultProps)

      expect(isDropZoneEnabled.value).toBe(false)
    })

    it('should be disabled when the disabled prop is true', async () => {
      const disabled = ref(true)
      const { isDropZoneEnabled } = useCourtOrderDocs(model, { ...defaultProps, disabled })

      expect(isDropZoneEnabled.value).toBe(false)

      disabled.value = false
      await nextTick()

      expect(isDropZoneEnabled.value).toBe(true)
    })
  })
})
