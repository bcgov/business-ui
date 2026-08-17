import { describe, it, expect } from 'vitest'
import { formatCourtOrdersSection, formatCourtOrdersApi } from '#business/app/utils/format-court-order'

describe('Format Court Order Utils', () => {
  describe('formatCourtOrdersSection', () => {
    const mockOriginal: CourtOrderResponse = {
      id: 101,
      fileNumber: 'CO-12345',
      effectOfOrder: 'planOfArrangement',
      filingId: 1,
      filingType: FilingType.COURT_ORDER,
      orderDate: '2026-01-15',
      orderDetails: 'Original order details',
      files: []
    }

    it('should not modify original when draftCourtOrders is undefined', () => {
      const result = formatCourtOrdersSection([mockOriginal], undefined)

      expect(result).toHaveLength(1)
      expect(result[0]!.old).toBeDefined()
      expect(result[0]!.new.actions).toEqual([])
      expect(result[0]!.old!.fileNumber).toBe('CO-12345')
      expect(result[0]!.new.fileNumber).toBe('CO-12345')
    })

    it('should keep actions empty when draft matches original', () => {
      const draft: CourtOrderResponse = { ...mockOriginal }

      const result = formatCourtOrdersSection([mockOriginal], [draft])

      expect(result).toHaveLength(1)
      expect(result[0]!.new.actions).toEqual([])
      expect(result[0]!.new.orderDetails).toBe('Original order details')
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
      const newDraft: CourtOrderResponse = {
        id: undefined,
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
  })

  describe('formatCourtOrdersApi', () => {
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
        orderDate: '2026-01-15',
        orderDetails: 'Updated',
        files: []
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

      expect(result![0]!.effectOfOrder).toBeNull()
      expect(result![0]!.orderDetails).toBeNull()
    })
  })
})