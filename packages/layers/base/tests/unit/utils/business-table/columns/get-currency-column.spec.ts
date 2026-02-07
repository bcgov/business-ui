/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '../../../mocks/business-table-utils'

describe('getCurrencyColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getCurrencyColumn() as any

    expect(column.id).toBe('currency')
    expect(column.header).toBe('Currency')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('renders the currency label correctly when provided', () => {
    const row = {
      original: { new: { currency: 'CAD' } }
    }
    const column = getCurrencyColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe('span')
    expect(cell.children).toBe('CAD')
    expect(cell.props.class).toBe('min-w-48 max-w-48 overflow-clip')
  })

  it('renders an empty string when currency is missing', () => {
    const row = {
      original: { new: { currency: '' } }
    }
    const column = getCurrencyColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.children).toBe('')
  })

  it('should add opacity-50 if the row is removed', () => {
    const row = {
      original: { new: { currency: 'USD' } }
    }
    const column = getCurrencyColumn() as any
    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
  })

  it('should add opacity-50 if its a series and the parent row is removed', () => {
    const parentRow = { id: 'parent-class' }
    const row = {
      depth: 1,
      original: { new: { currency: 'CAD' } },
      getParentRow: () => parentRow
    }
    const column = getCurrencyColumn() as any

    mockGetIsRowRemoved.mockImplementation(r => r === parentRow)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
  })
})
