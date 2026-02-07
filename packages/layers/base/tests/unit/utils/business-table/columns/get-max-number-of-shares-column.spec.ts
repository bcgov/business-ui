/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '../../../mocks/business-table-utils'

describe('getMaxNumberOfSharesColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getMaxNumberOfSharesColumn() as any

    expect(column.id).toBe('maxNumberOfShares')
    expect(column.header).toBe('Maximum Number of Shares')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('renders a specific number of shares correctly', () => {
    const row = {
      depth: 0,
      original: { new: { maxNumberOfShares: '1000' } }
    }
    const column = getMaxNumberOfSharesColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe('span')
    expect(cell.children).toBe('1000')
    expect(cell.props.class).toBe('min-w-48 max-w-48 overflow-clip')
  })

  it('renders "No Maximum" label when maxNumberOfShares is missing', () => {
    const row = {
      depth: 0,
      original: { new: { maxNumberOfShares: '' } }
    }
    const column = getMaxNumberOfSharesColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.children).toBe('No Maximum')
  })

  it('should add opacity-50 if the current row is removed', () => {
    const row = {
      depth: 0,
      original: { new: { maxNumberOfShares: '500' } }
    }
    const column = getMaxNumberOfSharesColumn() as any
    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
  })

  it('should add opacity-50 if its a series and the parent row is removed', () => {
    const parentRow = { id: 'parent-class' }
    const row = {
      depth: 1,
      original: { new: { maxNumberOfShares: '500' } },
      getParentRow: () => parentRow
    }
    const column = getMaxNumberOfSharesColumn() as any

    mockGetIsRowRemoved.mockImplementation(r => r === parentRow)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
  })
})
