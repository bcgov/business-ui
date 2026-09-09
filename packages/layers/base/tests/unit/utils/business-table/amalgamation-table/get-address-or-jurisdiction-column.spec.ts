/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockGetColumnMeta,
  mockGetIsRowRemoved
} from '#business/tests/unit/mocks/business-table-utils'
import {
  getAddressOrJurisdictionColumn
} from '#business/app/utils/business-table/amalgamation-table/get-address-or-jurisdiction-column'
import { DELETED_CLASS } from '#business/app/utils/business-table/columns/constants'
import { isBCBusiness } from '#business/app/utils/business-table/amalgamation-table/utils'
import { ConnectAddressDisplay } from '#components'

vi.mock('#business/app/utils/business-table/amalgamation-table/utils', () => ({
  isBCBusiness: vi.fn()
}))

describe('getAddressOrJurisdictionColumn', () => {
  const mockIsBCBusiness = vi.mocked(isBCBusiness)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct column properties', () => {
    const column = getAddressOrJurisdictionColumn() as any

    expect(column.id).toBe('address-or-jurisdiction-column')
    expect(column.header).toBe('Mailing Address or Jurisdiction')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('should render ConnectAddressDisplay component for local BC business', () => {
    const rawAddress = {
      streetAddress: '200-940 Blanshard St',
      addressCity: 'Victoria',
      addressRegion: 'BC',
      postalCode: 'V8W 3E6',
      addressCountry: 'CA'
    }
    const row = {
      original: {
        new: {
          mailingAddress: rawAddress
        }
      }
    }

    mockIsBCBusiness.mockReturnValue(true)
    mockGetIsRowRemoved.mockReturnValue(false)

    const column = getAddressOrJurisdictionColumn() as any
    const cell = column.cell({ row })

    expect(mockIsBCBusiness).toHaveBeenCalledWith(row.original.new)
    expect(cell.type).toBe(ConnectAddressDisplay)
    expect(cell.props.textDecor).toBe(true)
    expect(cell.props.class).toEqual('min-w-48 max-w-48')
  })

  it('should render formatted Canadian jurisdiction string for extra-provincial Canadian business', () => {
    const row = {
      original: {
        new: {
          jurisdiction: {
            country: 'CA',
            region: 'NB'
          }
        }
      }
    }

    mockIsBCBusiness.mockReturnValue(false)
    mockGetIsRowRemoved.mockReturnValue(false)

    const column = getAddressOrJurisdictionColumn() as any
    const cell = column.cell({ row })

    expect(cell.type).toBe('span')
    expect(cell.props.class).toEqual('min-w-48 max-w-48')
    expect(cell.children).toBe('New Brunswick, Canada')
  })

  it('should render country name for non-Canadian foreign jurisdiction', () => {
    const row = {
      original: {
        new: {
          jurisdiction: {
            country: 'AL',
            region: null
          }
        }
      }
    }

    mockIsBCBusiness.mockReturnValue(false)
    mockGetIsRowRemoved.mockReturnValue(false)

    const column = getAddressOrJurisdictionColumn() as any
    const cell = column.cell({ row })

    expect(cell.type).toBe('span')
    expect(cell.children).toBe('Albania')
  })

  it('should apply DELETED_CLASS to both BC address and extra-provincial jurisdiction when row is removed', () => {
    const bcRow = { original: { new: { mailingAddress: {} } } }
    const exBcRow = { original: { new: { jurisdiction: { country: 'AL', region: null } } } }

    mockGetIsRowRemoved.mockReturnValue(true)

    const column = getAddressOrJurisdictionColumn() as any

    mockIsBCBusiness.mockReturnValue(true)
    const bcCell = column.cell({ row: bcRow })
    expect(bcCell.props.class).toEqual(`min-w-48 max-w-48 ${DELETED_CLASS}`)

    mockIsBCBusiness.mockReturnValue(false)
    const exBcCell = column.cell({ row: exBcRow })
    expect(exBcCell.props.class).toEqual(`min-w-48 max-w-48 ${DELETED_CLASS}`)
  })
})
