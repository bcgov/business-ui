/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TableColumnDeliveryAddress } from '#components'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '../../../mocks/business-table-utils'

const addressData = {
  deliveryAddress: {
    street: '12345 Main St',
    streetAdditional: 'Additional Street Info',
    city: 'Victoria',
    region: 'BC',
    postalCode: 'V1X 1X1',
    country: 'CA',
    locationDescription: 'Location Description'
  },
  mailingAddress: {
    street: '12345 Main St',
    streetAdditional: 'Additional Street Info',
    city: 'Victoria',
    region: 'BC',
    postalCode: 'V1X 1X1',
    country: 'CA',
    locationDescription: 'Location Description'
  },
  sameAs: true
}

const row = {
  original: {
    new: {
      address: addressData
    }
  }
}

describe('getDeliveryAddressColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getDeliveryAddressColumn() as any
    // should call meta function for meta config
    expect(mockGetColumnMeta).toHaveBeenCalledOnce()

    expect(column.id).toBe('deliveryAddress')
    expect(column.header).toBe('Delivery Address')
    expect(column).toHaveProperty('meta')

    // cell should be defined
    expect((column).cell).toBeDefined()
  })

  it('should call getColumnMeta with "default" by default', () => {
    getDeliveryAddressColumn()
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('should call getColumnMeta with the given metaOption', () => {
    getDeliveryAddressColumn('last')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('last')
    expect(mockGetColumnMeta).toHaveBeenCalledOnce()
    getActionsColumn('last')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('last')
    expect(mockGetColumnMeta).toHaveBeenCalledTimes(2)
  })

  it('cell should have correct properties', () => {
    const column = getDeliveryAddressColumn() as any

    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(mockGetIsRowRemoved).toHaveBeenCalledWith(row)

    expect(cell.type).toBe(TableColumnDeliveryAddress)
    expect(cell.props.data).toEqual(addressData)
    expect(cell.props.class).toEqual('min-w-48 max-w-48 overflow-clip')
  })

  it('cell should add "opacity-50" when row is removed', () => {
    const column = getDeliveryAddressColumn() as any

    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
  })
})
