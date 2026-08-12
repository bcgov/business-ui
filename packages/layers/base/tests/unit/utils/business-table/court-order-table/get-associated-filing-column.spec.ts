/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '#business/tests/unit/mocks/business-table-utils'
import { getAssociatedFilingColumn } from '#business/app/utils/business-table/court-order-table/get-associated-filing-column'

describe('getAssociatedFilingColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getAssociatedFilingColumn() as any

    expect(column.id).toBe('court-order-associated-filing')
    expect(column.header).toBe('Associated Filing')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('should render the filing type cell correctly', () => {
    const row = {
      original: { new: { filingType: 'restoration' } }
    }
    const column = getAssociatedFilingColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe('span')
    expect(cell.children).toBe('restoration')
    expect(cell.props.class).toBe('min-w-48 max-w-48 overflow-clip break-words')
  })

  it('should add opacity-40 if the row is removed', () => {
    const row = {
      original: { new: { filingType: 'restoration' } }
    }
    const column = getAssociatedFilingColumn() as any
    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-40')
  })
})
