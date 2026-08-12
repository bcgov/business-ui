/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta, mockGetIsRowRemoved, mockGetTableBadges } from '#business/tests/unit/mocks/business-table-utils'
import { getCourtOrderNumberColumn } from '#business/app/utils/business-table/court-order-table/get-court-order-number-column'
import { TableColumnIdentity } from '#components'

describe('getCourtOrderNumberColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getCourtOrderNumberColumn() as any

    expect(column.id).toBe('court-order-number')
    expect(column.header).toBe('Court Order #')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('first')
  })

  it('should render the cell correctly', () => {
    const row = {
      original: { new: { courtOrderNumber: 'TT123456789' } }
    }
    const column = getCourtOrderNumberColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe(TableColumnIdentity)
    expect(cell.props.label).toBe('#TT123456789')
    expect(cell.props.class).toBe('min-w-36 max-w-36 font-bold')
  })

  it('should add opacity-40 if the row is removed', () => {
    const row = {
      original: { new: { courtOrderNumber: 'TT123456789' } }
    }
    const column = getCourtOrderNumberColumn() as any
    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.labelClass).toContain('opacity-40')
  })

  it('should pass badges correctly to TableColumnIdentity', () => {
    const row = {
      original: { new: { courtOrderNumber: 'TT123456789' } }
    }
    const column = getCourtOrderNumberColumn() as any
    const mockBadges = [{ label: 'REMOVED', color: 'neutral' }]
    mockGetTableBadges.mockReturnValue(mockBadges)

    const cell = column.cell({ row })

    expect(cell.props.badges).toEqual(mockBadges)
    expect(mockGetTableBadges).toHaveBeenCalledWith(row, undefined)
  })
})
