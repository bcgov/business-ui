/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '../../../mocks/business-table-utils'

describe('getParValueColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct basic properties', () => {
    const column = getParValueColumn() as any

    expect(column.id).toBe('parValue')
    expect(column.header).toBe('Par Value')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('renders the par value correctly when provided', () => {
    const row = {
      depth: 0,
      original: { new: { parValue: '$1.00' } }
    }
    const column = getParValueColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe('span')
    expect(cell.children).toBe('$1.00')
    expect(cell.props.class).toBe('min-w-48 max-w-48 overflow-clip')
  })

  it('renders "No Par Value" label when parValue is null or empty', () => {
    const row = {
      depth: 0,
      original: { new: { parValue: '' } }
    }
    const column = getParValueColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.children).toBe('No Par Value')
  })

  it('shoudl add opacity-50 if the current row is removed', () => {
    const row = {
      depth: 0,
      original: { new: { parValue: '$0.50' } }
    }
    const column = getParValueColumn() as any
    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
  })

  it('should add opacity-50 for a series if the parent class is removed', () => {
    const parentRow = { id: 'class-parent' }
    const row = {
      depth: 1,
      original: { new: { parValue: '$0.50' } },
      getParentRow: () => parentRow
    }
    const column = getParValueColumn() as any

    mockGetIsRowRemoved.mockImplementation(r => r === parentRow)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
  })
})
