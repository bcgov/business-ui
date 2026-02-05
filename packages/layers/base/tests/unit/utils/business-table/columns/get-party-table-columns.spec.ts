import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('~/utils/business-table/columns/get-name-column', () => ({
  getNameColumn: vi.fn(() => ({ id: 'name' }))
}))

vi.mock('~/utils/business-table/columns/get-delivery-address-column', () => ({
  getDeliveryAddressColumn: vi.fn(() => ({ id: 'deliveryAddress' }))
}))

vi.mock('~/utils/business-table/columns/get-mailing-address-column', () => ({
  getMailingAddressColumn: vi.fn(() => ({ id: 'mailingAddress' }))
}))

vi.mock('~/utils/business-table/columns/get-effective-dates-column', () => ({
  getEffectiveDatesColumn: vi.fn(() => ({ id: 'effectiveDates' }))
}))

vi.mock('~/utils/business-table/columns/get-actions-column', () => ({
  getActionsColumn: vi.fn(() => ({ id: 'actions' }))
}))

describe('getPartyTableColumns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call all four get column utils by default', () => {
    getPartyTableColumns()

    expect(getNameColumn).toHaveBeenCalledOnce()
    expect(getDeliveryAddressColumn).toHaveBeenCalledOnce()
    expect(getMailingAddressColumn).toHaveBeenCalledOnce()
    expect(getActionsColumn).toHaveBeenCalledOnce()
  })

  it('should return the correct amount of default columns in the correct order', () => {
    const columns = getPartyTableColumns()

    expect(columns).toHaveLength(4)
    expect(columns.map(c => c.id)).toEqual([
      'name',
      'deliveryAddress',
      'mailingAddress',
      'actions'
    ])
  })

  it('should return custom column config and ordering', () => {
    const columns = getPartyTableColumns([
      'name',
      'effectiveDates',
      'name',
      'delivery',
      'mailing',
      'delivery',
      'actions',
      'actions'
    ])

    expect(columns).toHaveLength(8)
    expect(columns.map(c => c.id)).toEqual([
      'name',
      'effectiveDates',
      'name',
      'deliveryAddress',
      'mailingAddress',
      'deliveryAddress',
      'actions',
      'actions'
    ])
  })
})
