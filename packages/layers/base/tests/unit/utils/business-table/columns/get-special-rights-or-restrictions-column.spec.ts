/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '../../../mocks/business-table-utils'

describe('getSpecialRightsOrRestrictionsColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getSpecialRightsOrRestrictionsColumn() as any

    expect(column.id).toBe('specialRightsOrRestrictions')
    expect(column.header).toBe('Special Rights or Restrictions')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('renders "Yes" when hasRightsOrRestrictions is true', () => {
    const row = {
      depth: 0,
      original: { new: { hasRightsOrRestrictions: true } }
    }
    const column = getSpecialRightsOrRestrictionsColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe('span')
    expect(cell.children).toBe('Yes')
    expect(cell.props.class).toBe('min-w-48 max-w-48 overflow-clip')
  })

  it('renders "No" when hasRightsOrRestrictions is false', () => {
    const row = {
      depth: 0,
      original: { new: { hasRightsOrRestrictions: false } }
    }
    const column = getSpecialRightsOrRestrictionsColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.children).toBe('No')
  })

  it('should add opacity-50 if the current row is removed', () => {
    const row = {
      depth: 0,
      original: { new: { hasRightsOrRestrictions: true } }
    }
    const column = getSpecialRightsOrRestrictionsColumn() as any
    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
  })

  it('should add opacity-50 if its a series and the parent row is removed', () => {
    const parentRow = { id: 'parent-class' }
    const row = {
      depth: 1,
      original: { new: { hasRightsOrRestrictions: true } },
      getParentRow: () => parentRow
    }
    const column = getSpecialRightsOrRestrictionsColumn() as any

    mockGetIsRowRemoved.mockImplementation(r => r === parentRow)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
  })
})
