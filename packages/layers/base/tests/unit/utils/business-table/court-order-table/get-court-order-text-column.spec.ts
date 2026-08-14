/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '#business/tests/unit/mocks/business-table-utils'
import { getCourtOrderTextColumn } from '#business/app/utils/business-table/court-order-table/get-court-order-text-column'

describe('getCourtOrderTextColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getCourtOrderTextColumn() as any

    expect(column.id).toBe('court-order-text')
    expect(column.header).toBe('Text')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('should render the cell correctly when text is provided', () => {
    const row = {
      original: { new: { orderDetails: 'Some text here' } }
    }
    const column = getCourtOrderTextColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe('p')
    expect(cell.children).toBe('Some text here')
    expect(cell.props.class).toBe('min-w-48 max-w-48 overflow-clip break-words')
  })

  it('should fallback to N/A when text is null', () => {
    const row = {
      original: { new: { orderDetails: null } }
    }
    const column = getCourtOrderTextColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe('p')
    expect(cell.children).toBe('N/A')
    expect(cell.props.class).toBe('min-w-48 max-w-48 overflow-clip break-words')
  })

  it('should fallback to N/A when text is empty string', () => {
    const row = {
      original: { new: { orderDetails: '' } }
    }
    const column = getCourtOrderTextColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe('p')
    expect(cell.children).toBe('N/A')
    expect(cell.props.class).toBe('min-w-48 max-w-48 overflow-clip break-words')
  })

  it('should add opacity-40 if the row is removed', () => {
    const row = {
      original: { new: { orderDetails: 'Some text here' } }
    }
    const column = getCourtOrderTextColumn() as any
    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-40')
  })
})
