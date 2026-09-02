/* eslint-disable max-len */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// importing required as these are not registered to Nuxt's auto-imports
import { getCourtOrderNumberColumn } from '#business/app/utils/business-table/court-order-table/get-court-order-number-column'
import { getCourtOrderTextColumn } from '#business/app/utils/business-table/court-order-table/get-court-order-text-column'
import { getHasPoaColumn } from '#business/app/utils/business-table/court-order-table/get-has-poa-column'
import { getAssociatedFilingColumn } from '#business/app/utils/business-table/court-order-table/get-associated-filing-column'
import { getDocumentsColumn } from '#business/app/utils/business-table/court-order-table/get-documents-column'

vi.mock('#business/app/utils/business-table/court-order-table/get-court-order-number-column', () => ({
  getCourtOrderNumberColumn: vi.fn(() => ({ id: 'court-order-number' }))
}))

vi.mock('#business/app/utils/business-table/court-order-table/get-court-order-text-column', () => ({
  getCourtOrderTextColumn: vi.fn(() => ({ id: 'court-order-text' }))
}))

vi.mock('#business/app/utils/business-table/court-order-table/get-has-poa-column', () => ({
  getHasPoaColumn: vi.fn(() => ({ id: 'court-order-has-poa' }))
}))

vi.mock('#business/app/utils/business-table/court-order-table/get-associated-filing-column', () => ({
  getAssociatedFilingColumn: vi.fn(() => ({ id: 'court-order-associated-filing' }))
}))

vi.mock('#business/app/utils/business-table/court-order-table/get-documents-column', () => ({
  getDocumentsColumn: vi.fn(() => ({ id: 'court-order-documents' }))
}))

vi.mock('~/utils/business-table/columns/get-actions-column', () => ({
  getActionsColumn: vi.fn(() => ({ id: 'actions' }))
}))

describe('getCourtOrderTableColumns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call all column utils and return them in the correct order', () => {
    const columns = getCourtOrderTableColumns()

    expect(getCourtOrderNumberColumn).toHaveBeenCalledWith('first', undefined)
    expect(getCourtOrderTextColumn).toHaveBeenCalledOnce()
    expect(getHasPoaColumn).toHaveBeenCalledOnce()
    expect(getAssociatedFilingColumn).toHaveBeenCalledOnce()
    expect(getDocumentsColumn).toHaveBeenCalledOnce()
    expect(getActionsColumn).toHaveBeenCalledOnce()

    expect(columns).toHaveLength(6)
    expect(columns.map(c => c.id)).toEqual([
      'court-order-number',
      'court-order-has-poa',
      'court-order-text',
      'court-order-associated-filing',
      'court-order-documents',
      'actions'
    ])
  })

  it('should pass badgeLabelOverrides to getCourtOrderNumberColumn', () => {
    const badgeOverrides = { CHANGED: 'Corrected' }

    getCourtOrderTableColumns(badgeOverrides)

    expect(getCourtOrderNumberColumn).toHaveBeenCalledWith('first', badgeOverrides)
  })
})
