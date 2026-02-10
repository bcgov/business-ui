/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('~/utils/business-table/columns/get-share-class-or-series-name-column', () => ({
  getShareClassOrSeriesNameColumn: vi.fn(() => ({ id: 'shareClassOrSeriesName' }))
}))

vi.mock('~/utils/business-table/columns/get-max-number-of-shares-column', () => ({
  getMaxNumberOfSharesColumn: vi.fn(() => ({ id: 'maxNumberOfShares' }))
}))

vi.mock('~/utils/business-table/columns/get-par-value-column', () => ({
  getParValueColumn: vi.fn(() => ({ id: 'parValue' }))
}))

vi.mock('~/utils/business-table/columns/get-currency-column', () => ({
  getCurrencyColumn: vi.fn(() => ({ id: 'currency' }))
}))

vi.mock('~/utils/business-table/columns/get-special-rights-or-restrictions-column', () => ({
  getSpecialRightsOrRestrictionsColumn: vi.fn(() => ({ id: 'specialRightsOrRestrictions' }))
}))

vi.mock('~/utils/business-table/columns/get-actions-column', () => ({
  getActionsColumn: vi.fn(() => ({ id: 'actions' }))
}))

describe('getShareStructureTableColumns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get all column def functions', () => {
    getShareStructureTableColumns()

    expect(getShareClassOrSeriesNameColumn).toHaveBeenCalledOnce()
    expect(getMaxNumberOfSharesColumn).toHaveBeenCalledOnce()
    expect(getParValueColumn).toHaveBeenCalledOnce()
    expect(getCurrencyColumn).toHaveBeenCalledOnce()
    expect(getSpecialRightsOrRestrictionsColumn).toHaveBeenCalledOnce()
    expect(getActionsColumn).toHaveBeenCalledOnce()
  })

  it('should return the columns in the correct order', () => {
    const columns = getShareStructureTableColumns()

    expect(columns).toHaveLength(7)

    const columnIds = columns.map(c => c.id)

    expect(columnIds).toEqual([
      'priority',
      'shareClassOrSeriesName',
      'maxNumberOfShares',
      'parValue',
      'currency',
      'specialRightsOrRestrictions',
      'actions'
    ])
  })

  it('should include the priority column for ordering only', () => {
    const columns = getShareStructureTableColumns()
    const priorityColumn = columns.find(c => c.id === 'priority')

    expect(priorityColumn).toBeDefined()
    expect(priorityColumn).toHaveProperty('id')
    expect((priorityColumn as any).accessorKey).toBe('new.priority')
  })
})
