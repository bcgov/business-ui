/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '#business/tests/unit/mocks/business-table-utils'
import { getHasPoaColumn } from '#business/app/utils/business-table/court-order-table/get-has-poa-column'

describe('getHasPoaColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getHasPoaColumn() as any

    expect(column.id).toBe('court-order-has-poa')
    expect(column.header).toBe('Plan of Arrangement')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('should render the cell correctly when hasPoa = true', () => {
    const row = {
      original: { new: { hasPoa: true } }
    }
    const column = getHasPoaColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe('span')
    expect(cell.children).toBe('Yes')
    expect(cell.props.class).toBe('min-w-36 max-w-36')
  })

  it('should render the cell correctly when hasPoa = false', () => {
    const row = {
      original: { new: { hasPoa: false } }
    }
    const column = getHasPoaColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe('span')
    expect(cell.children).toBe('No')
    expect(cell.props.class).toBe('min-w-36 max-w-36')
  })

  it('should add opacity-40 if the row is removed', () => {
    const row = {
      original: { new: { hasPoa: true } }
    }
    const column = getHasPoaColumn() as any
    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-40')
  })
})
