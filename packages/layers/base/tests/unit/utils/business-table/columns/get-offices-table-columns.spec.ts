import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('~/utils/business-table/columns/get-office-type-column', () => ({
  getOfficeTypeColumn: vi.fn(() => ({ id: 'office-type' }))
}))

vi.mock('~/utils/business-table/columns/get-delivery-address-column', () => ({
  getDeliveryAddressColumn: vi.fn(() => ({ id: 'deliveryAddress' }))
}))

vi.mock('~/utils/business-table/columns/get-mailing-address-column', () => ({
  getMailingAddressColumn: vi.fn(() => ({ id: 'mailingAddress' }))
}))

vi.mock('~/utils/business-table/columns/get-actions-column', () => ({
  getActionsColumn: vi.fn(() => ({ id: 'actions' }))
}))

describe('getOfficesTableColumns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call all four get column utils', () => {
    getOfficesTableColumns()

    expect(getOfficeTypeColumn).toHaveBeenCalledOnce()
    expect(getDeliveryAddressColumn).toHaveBeenCalledOnce()
    expect(getMailingAddressColumn).toHaveBeenCalledOnce()
    expect(getActionsColumn).toHaveBeenCalledOnce()
  })

  it('should return the correct amount of columns in the correct order', () => {
    const columns = getOfficesTableColumns()

    expect(columns).toHaveLength(4)
    expect(columns.map(c => c.id)).toEqual([
      'office-type',
      'deliveryAddress',
      'mailingAddress',
      'actions'
    ])
  })
})
