import { describe, it, expect } from 'vitest'
import { formatCourtOrdersSection, formatCourtOrdersApi } from '#business/app/utils/format-court-order'

describe('Format Court Order Utils', () => {
  describe('formatCourtOrdersSection', () => {
    const mockFile1 = {
      fileKey: 'key-1',
      fileName: 'order_1.pdf',
      documentType: DocumentTypeClient.COURT_ORDER,
      url: ''
    }

    const mockFile2 = {
      fileKey: 'key-2',
      fileName: 'supporting_doc.pdf',
      documentType: DocumentTypeClient.SUPPORTING_DOCUMENT,
      url: ''
    }

    const mockOriginal: CourtOrderResponse = {
      id: 101,
      fileNumber: 'CO-12345',
      effectOfOrder: 'planOfArrangement',
      filingId: 1,
      filingType: FilingType.COURT_ORDER,
      orderDate: '2026-01-15',
      orderDetails: 'Original order details',
      files: [mockFile1]
    }

    it('should not modify original when draftCourtOrders is undefined', () => {
      const result = formatCourtOrdersSection([mockOriginal], undefined)

      expect(result).toHaveLength(1)
      expect(result[0]!.old).toBeDefined()
      expect(result[0]!.new.actions).toEqual([])
      expect(result[0]!.old!.fileNumber).toBe('CO-12345')
      expect(result[0]!.new.fileNumber).toBe('CO-12345')
      expect(result[0]!.new.files).toEqual([
        {
          id: 'key-1',
          fileKey: 'key-1',
          name: 'order_1.pdf',
          type: DocumentTypeClient.COURT_ORDER,
          action: CourtOrderFileAction.NONE,
          status: CourtOrderFileStatus.IDLE
        }
      ])
    })

    it('should keep actions empty when draft matches original', () => {
      const draft: CourtOrderResponse = { ...mockOriginal }

      const result = formatCourtOrdersSection([mockOriginal], [draft])

      expect(result).toHaveLength(1)
      expect(result[0]!.new.actions).toEqual([])
      expect(result[0]!.new.orderDetails).toBe('Original order details')
      expect(result[0]!.new.files).toEqual([
        {
          id: 'key-1',
          fileKey: 'key-1',
          name: 'order_1.pdf',
          type: DocumentTypeClient.COURT_ORDER,
          action: CourtOrderFileAction.NONE,
          status: CourtOrderFileStatus.IDLE
        }
      ])
    })

    it('should add CHANGED action when draft does not match original', () => {
      const draft: CourtOrderResponse = {
        ...mockOriginal,
        orderDetails: 'Updated order details'
      }

      const result = formatCourtOrdersSection([mockOriginal], [draft])

      expect(result).toHaveLength(1)
      expect(result[0]!.new.actions).toEqual([ActionType.CHANGED])
      expect(result[0]!.new.orderDetails).toBe('Updated order details')
    })

    it('should add REMOVED action when original item is missing from draftCourtOrders', () => {
      const result = formatCourtOrdersSection([mockOriginal], [])

      expect(result).toHaveLength(1)
      expect(result[0]!.old).toBeDefined()
      expect(result[0]!.new.actions).toEqual([ActionType.REMOVED])
    })

    it('should add ADDED action for draft items without an id', () => {
      const newDraft = {
        fileNumber: 'CO-99999',
        effectOfOrder: null,
        filingId: 2,
        filingType: FilingType.COURT_ORDER,
        orderDate: '2026-08-01',
        orderDetails: 'New order details',
        files: []
      }

      const result = formatCourtOrdersSection([mockOriginal], [mockOriginal, newDraft])

      expect(result).toHaveLength(2)
      expect(result[0]!.new.actions).toEqual([])
      expect(result[1]!.old).toBeUndefined()
      expect(result[1]!.new.fileNumber).toBe('CO-99999')
      expect(result[1]!.new.actions).toEqual([ActionType.ADDED])
    })

    it('should add CHANGED action when a file is added to an existing court order', () => {
      const draft: CourtOrderResponse = {
        ...mockOriginal,
        files: [mockFile1, mockFile2]
      }

      const result = formatCourtOrdersSection([mockOriginal], [draft])

      expect(result).toHaveLength(1)
      expect(result[0]!.new.actions).toEqual([ActionType.CHANGED])
      expect(result[0]!.new.files).toHaveLength(2)

      expect(result[0]!.new.files[0]).toEqual({
        id: 'key-1',
        fileKey: 'key-1',
        name: 'order_1.pdf',
        type: DocumentTypeClient.COURT_ORDER,
        action: CourtOrderFileAction.NONE,
        status: CourtOrderFileStatus.IDLE
      })

      expect(result[0]!.new.files[1]).toEqual({
        id: 'key-2',
        fileKey: 'key-2',
        name: 'supporting_doc.pdf',
        type: DocumentTypeClient.SUPPORTING_DOCUMENT,
        action: CourtOrderFileAction.ADDED,
        status: CourtOrderFileStatus.SUCCESS
      })
    })

    it('should add CHANGED action and tag missing file with DELETED action', () => {
      const draft: CourtOrderResponse = {
        ...mockOriginal,
        files: []
      }

      const result = formatCourtOrdersSection([mockOriginal], [draft])

      expect(result).toHaveLength(1)
      expect(result[0]!.new.actions).toEqual([ActionType.CHANGED])
      expect(result[0]!.new.files).toHaveLength(1)
      expect(result[0]!.new.files[0]).toEqual({
        id: 'key-1',
        fileKey: 'key-1',
        name: 'order_1.pdf',
        type: DocumentTypeClient.COURT_ORDER,
        action: CourtOrderFileAction.DELETED,
        status: CourtOrderFileStatus.IDLE
      })
    })

    it('should add ADDED action for new draft court orders and mark their files as ADDED/SUCCESS', () => {
      const newDraft = {
        fileNumber: 'CO-99999',
        effectOfOrder: null,
        filingId: 2,
        filingType: FilingType.COURT_ORDER,
        orderDate: '2026-08-01',
        orderDetails: 'New order details',
        files: [mockFile2]
      }

      const result = formatCourtOrdersSection([mockOriginal], [mockOriginal, newDraft])

      expect(result).toHaveLength(2)
      expect(result[0]!.new.actions).toEqual([])

      expect(result[1]!.old).toBeUndefined()
      expect(result[1]!.new.fileNumber).toBe('CO-99999')
      expect(result[1]!.new.actions).toEqual([ActionType.ADDED])
      expect(result[1]!.new.files).toEqual([
        {
          id: 'key-2',
          fileKey: 'key-2',
          name: 'supporting_doc.pdf',
          type: DocumentTypeClient.SUPPORTING_DOCUMENT,
          action: CourtOrderFileAction.ADDED,
          status: CourtOrderFileStatus.SUCCESS
        }
      ])
    })
  })

  describe('formatCourtOrdersApi', () => {
    const mockFile = (overrides = {}) => ({
      id: 'file-1',
      fileKey: 'key-123',
      name: 'order.pdf',
      type: DocumentTypeClient.COURT_ORDER,
      action: CourtOrderFileAction.ADDED,
      status: CourtOrderFileStatus.SUCCESS,
      ...overrides
    })

    const baseItem = {
      isEditing: false,
      id: '101',
      fileNumber: 'CO-12345',
      effectOfOrder: true,
      filingId: 1,
      filingType: FilingType.COURT_ORDER,
      orderDate: '2026-01-15',
      orderDetails: 'Order details',
      files: []
    }

    it('should return undefined when no items have pending actions', () => {
      const mockState = [
        {
          old: { ...baseItem, actions: [] },
          new: { ...baseItem, actions: [] }
        }
      ]

      const result = formatCourtOrdersApi(mockState)

      expect(result).toBeUndefined()
    })

    it('should filter out items with REMOVED action', () => {
      const mockState = [
        {
          old: { ...baseItem, actions: [] },
          new: { ...baseItem, actions: [ActionType.REMOVED] }
        }
      ]

      const result = formatCourtOrdersApi(mockState)

      expect(result).toEqual([])
    })

    it('should map changed table state to API format', () => {
      const mockState = [
        {
          old: { ...baseItem, actions: [] },
          new: { ...baseItem, orderDetails: 'Updated', actions: [ActionType.CHANGED] }
        }
      ]

      const result = formatCourtOrdersApi(mockState)

      expect(result).toHaveLength(1)
      expect(result![0]).toEqual({
        id: 101,
        effectOfOrder: 'planOfArrangement',
        fileNumber: 'CO-12345',
        filingId: 1,
        filingType: FilingType.COURT_ORDER,
        orderDetails: 'Updated',
        files: undefined,
        orderDate: '2026-01-15'
      })
    })

    it('should set id to undefined for newly added court orders', () => {
      const mockState = [
        {
          old: undefined,
          new: { ...baseItem, id: '999', actions: [ActionType.ADDED] }
        }
      ]

      const result = formatCourtOrdersApi(mockState)

      expect(result).toHaveLength(1)
      expect(result![0]!.id).toBeUndefined()
      expect(result![0]!.fileNumber).toBe('CO-12345')
    })

    it('should convert false/null effectOfOrder to null and empty orderDetails to null', () => {
      const mockState = [
        {
          old: undefined,
          new: {
            ...baseItem,
            effectOfOrder: false,
            orderDetails: '',
            actions: [ActionType.ADDED]
          }
        }
      ]

      const result = formatCourtOrdersApi(mockState)

      expect(result![0]!.effectOfOrder).toBeUndefined()
      expect(result![0]!.orderDetails).toBeUndefined()
    })

    it('should correctly format valid files', () => {
      const mockState = [
        {
          old: { ...baseItem, actions: [] },
          new: {
            ...baseItem,
            actions: [ActionType.CHANGED],
            files: [
              mockFile({ id: 'f1', fileKey: 'key-1', name: 'doc1.pdf', type: DocumentTypeClient.COURT_ORDER }),
              mockFile({ id: 'f2', fileKey: 'key-2', name: 'doc2.pdf', type: DocumentTypeClient.SUPPORTING_DOCUMENT })
            ]
          }
        }
      ]

      const result = formatCourtOrdersApi(mockState)

      expect(result![0]!.files).toEqual([
        {
          fileName: 'doc1.pdf',
          fileKey: 'key-1',
          documentType: DocumentTypeClient.COURT_ORDER
        },
        {
          fileName: 'doc2.pdf',
          fileKey: 'key-2',
          documentType: DocumentTypeClient.SUPPORTING_DOCUMENT
        }
      ])
    })

    it('should exclude files marked as DELETED, having ERROR status, or missing a fileKey', () => {
      const mockState = [
        {
          old: { ...baseItem, actions: [] },
          new: {
            ...baseItem,
            actions: [ActionType.CHANGED],
            files: [
              mockFile({
                id: 'f1',
                fileKey: 'valid-key',
                name: 'valid.pdf',
                type: DocumentTypeClient.COURT_ORDER
              }),
              mockFile({
                id: 'f2',
                fileKey: 'key-2',
                action: CourtOrderFileAction.DELETED,
                type: DocumentTypeClient.COURT_ORDER
              }),
              mockFile({
                id: 'f3',
                fileKey: 'key-3',
                status: CourtOrderFileStatus.ERROR,
                type: DocumentTypeClient.COURT_ORDER
              }),
              mockFile({
                id: 'f4',
                fileKey: undefined,
                name: 'no-key.pdf',
                type: DocumentTypeClient.COURT_ORDER
              })
            ]
          }
        }
      ]

      const result = formatCourtOrdersApi(mockState)

      expect(result![0]!.files).toHaveLength(1)
      expect(result![0]!.files).toEqual([
        {
          fileName: 'valid.pdf',
          fileKey: 'valid-key',
          documentType: DocumentTypeClient.COURT_ORDER
        }
      ])
    })

    it('should exclude files property if all files in the array are filtered out', () => {
      const mockState = [
        {
          old: { ...baseItem, actions: [] },
          new: {
            ...baseItem,
            actions: [ActionType.CHANGED],
            files: [
              mockFile({ action: CourtOrderFileAction.DELETED }),
              mockFile({ status: CourtOrderFileStatus.ERROR }),
              mockFile({ fileKey: '' })
            ]
          }
        }
      ]

      const result = formatCourtOrdersApi(mockState)

      expect(result![0]!.files).toBeUndefined()
    })
  })
})
