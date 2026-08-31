import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ModelRef } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

import {
  formatBytes,
  useCourtOrderDocs,
  maxFileSize
} from '../../app/components/Form/CourtOrderPoa/Full/FileUpload/utils'

const mockBusinessApi = vi.fn()

const mockBusinessService = {
  postDocument: vi.fn(),
  deleteDocument: vi.fn()
}

mockNuxtImport('useBusinessService', () => () => mockBusinessService)

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

describe('formatBytes', () => {
  it('should format bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(52428800)).toBe('50 MB')
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
    model = ref<CourtOrderFileUi[]>([]) as ModelRef<CourtOrderFileUi[]>
    mockBusinessApi.mockResolvedValue({})
  })

  describe('State sync', () => {
    it('should sync internal state from model', async () => {
      const initial: CourtOrderFileUi = {
        id: '1234567',
        name: 'court_order.pdf',
        type: DocumentTypeDrs.COURT_ORDER,
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
        type: DocumentTypeDrs.COURT_ORDER,
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
        type: DocumentTypeDrs.COURT_ORDER,
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
      const mockApiResponse = {
        key: 'drs-key',
        consumerFilename: 'valid_order.pdf',
        documentURL: 'https://example.com/doc'
      }
      mockBusinessService.postDocument.mockResolvedValueOnce(mockApiResponse)

      const { courtOrderFile, courtOrderDocs } = useCourtOrderDocs(model, defaultProps)
      courtOrderFile.value = new File(['pdf data'], 'valid_order.pdf', { type: 'application/pdf' })

      await new Promise(resolve => setTimeout(resolve, 10)) // required to transition from status LOADING -> SUCCESS

      expect(mockBusinessService.postDocument).toHaveBeenCalledOnce()
      expect(courtOrderDocs.value[0]!.status).toBe(CourtOrderFileStatus.SUCCESS)
      expect(courtOrderDocs.value[0]!.fileKey).toBe(mockApiResponse.key)

      expect(mockBusinessService.postDocument).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'valid_order.pdf' }),
        expect.objectContaining({
          filingType: FilingType.COURT_ORDER,
          entityType: defaultProps.entityType,
          documentType: DocumentTypeClient.COURT_ORDER,
          identifier: defaultProps.identifier,
          filingId: defaultProps.filingId,
          signal: expect.any(AbortSignal)
        })
      )
    })

    it('should set error status when file fails schema check', async () => {
      const { supportingFiles, supportingDocs } = useCourtOrderDocs(model, defaultProps)
      const oversizedFile = new File([new Uint8Array(maxFileSize + 100)], 'test.pdf', { type: 'application/pdf' })

      supportingFiles.value = [oversizedFile]
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(supportingDocs.value[0]!.status).toBe(CourtOrderFileStatus.ERROR)
      expect(supportingDocs.value[0]!.errorMessage).toBeDefined()
      expect(mockBusinessService.postDocument).not.toHaveBeenCalled()
    })

    it('should ensure unique file names', async () => {
      model.value = [{
        id: '1234567',
        name: 'document.pdf',
        type: DocumentTypeDrs.SUPPORTING_DOCUMENT,
        action: CourtOrderFileAction.ADDED,
        status: CourtOrderFileStatus.SUCCESS
      }]

      mockBusinessService.postDocument.mockResolvedValueOnce({
        key: 'drs-key',
        consumerFilename: 'document (1).pdf',
        documentURL: 'https://example.com/doc'
      })

      const { supportingFiles, supportingDocs } = useCourtOrderDocs(model, defaultProps)
      await nextTick()

      supportingFiles.value = [new File(['test file'], 'document.pdf', { type: 'application/pdf' })]
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(supportingDocs.value).toHaveLength(2)
      expect(supportingDocs.value[1]!.name).toBe('document (1).pdf')

      expect(mockBusinessService.postDocument).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'document (1).pdf' }),
        expect.objectContaining({
          filingType: FilingType.COURT_ORDER,
          entityType: defaultProps.entityType,
          documentType: DocumentTypeClient.SUPPORTING_DOCUMENT,
          identifier: defaultProps.identifier,
          filingId: defaultProps.filingId
        })
      )
    })
  })

  describe('onFileAction', () => {
    it('should hard delete a newly added file', async () => {
      const mockDoc = {
        id: '1234567',
        fileKey: 'drs-key',
        name: 'doc.pdf',
        type: DocumentTypeDrs.SUPPORTING_DOCUMENT,
        action: CourtOrderFileAction.ADDED,
        status: CourtOrderFileStatus.SUCCESS
      }
      model.value = [mockDoc]

      const { onFileAction, supportingDocs } = useCourtOrderDocs(model, defaultProps)
      await nextTick()

      onFileAction(mockDoc.id, 'delete')

      expect(mockBusinessService.deleteDocument).toHaveBeenCalledWith('drs-key')
      expect(supportingDocs.value).toHaveLength(0)
    })

    it('should soft delete an existing file', async () => {
      const mockDoc = {
        id: '1234567',
        fileKey: 'drs-key',
        name: 'doc.pdf',
        type: DocumentTypeDrs.SUPPORTING_DOCUMENT,
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
        type: DocumentTypeDrs.SUPPORTING_DOCUMENT,
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
          type: DocumentTypeDrs.COURT_ORDER,
          action: CourtOrderFileAction.ADDED,
          status: CourtOrderFileStatus.SUCCESS
        },
        {
          id: 'file-2',
          name: 'deleted.pdf',
          type: DocumentTypeDrs.COURT_ORDER,
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

      const { onFileAction, supportingFiles, supportingDocs } = useCourtOrderDocs(model, defaultProps)
      mockBusinessApi.mockImplementation(() => new Promise(() => {}))

      supportingFiles.value = [new File(['test file'], 'uploading.pdf', { type: 'application/pdf' })]
      await nextTick()

      const activeFile = supportingDocs.value[0]!
      onFileAction(activeFile.id, 'cancel')

      expect(abortSpy).toHaveBeenCalledOnce()
      expect(supportingDocs.value).toHaveLength(0)
    })
  })
})
