/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TableColumnIdentity } from '#components'
import { mockGetColumnMeta, mockGetIsRowRemoved, mockGetTableBadges } from '../../../mocks/business-table-utils'

describe('getShareClassOrSeriesNameColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getShareClassOrSeriesNameColumn() as any

    expect(column.id).toBe('shareClassOrSeriesName')
    expect(column.header).toBe('Name of Share Class or Series')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('first')
  })

  it('renders a Class row correctly (depth 0)', () => {
    const row = {
      depth: 0,
      original: { new: { name: 'Common' } }
    }
    const column = getShareClassOrSeriesNameColumn() as any

    mockGetIsRowRemoved.mockReturnValue(false)
    mockGetTableBadges.mockReturnValue([{ label: 'CHANGED' }])

    const cell = column.cell({ row })

    expect(cell.type).toBe(TableColumnIdentity)
    expect(cell.props.label).toBe('Common Shares')
    expect(cell.props.class).toContain('font-bold')
    expect(cell.props.class).not.toContain('ml-6')
    expect(cell.props.labelClass).toBe('')
  })

  it('renders a Series row correctly (depth 1)', () => {
    const row = {
      depth: 1,
      original: { new: { name: 'Series A' } },
      getParentRow: vi.fn()
    }
    const column = getShareClassOrSeriesNameColumn() as any

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('ml-6')
    expect(cell.props.labelClass).toContain('before:bg-black')
  })

  it('should add opacity-50 if the current row is removed', () => {
    const row = {
      depth: 0,
      original: { new: { name: 'Common' } }
    }
    const column = getShareClassOrSeriesNameColumn() as any

    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })
    expect(cell.props.class).toContain('opacity-50')
  })

  it('should add opacity-50 and hide badges if the parent row is removed', () => {
    const parentRow = { id: 'parent' }
    const row = {
      depth: 1,
      original: { new: { name: 'Series A' } },
      getParentRow: () => parentRow
    }
    const column = getShareClassOrSeriesNameColumn() as any

    mockGetIsRowRemoved.mockImplementation(r => r === parentRow)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
    expect(cell.props.badges).toEqual([])
    expect(mockGetTableBadges).not.toHaveBeenCalledWith(row)
  })
})
