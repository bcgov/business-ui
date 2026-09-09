/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockGetColumnMeta,
  mockGetIsRowRemoved
} from '#business/tests/unit/mocks/business-table-utils'
import { getBusinessTypeColumn } from '#business/app/utils/business-table/amalgamation-table/get-business-type-column'
import { DELETED_CLASS } from '#business/app/utils/business-table/columns/constants'
import { isBCBusiness } from '#business/app/utils/business-table/amalgamation-table/utils'

vi.mock('#business/app/utils/business-table/amalgamation-table/utils', () => ({
  isBCBusiness: vi.fn()
}))

describe('getBusinessTypeColumn', () => {
  const mockIsBCBusiness = vi.mocked(isBCBusiness)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct column properties', () => {
    const column = getBusinessTypeColumn() as any

    expect(column.id).toBe('business-type-column')
    expect(column.header).toBe('Business Type')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('should render legalType for a local BC business', () => {
    const row = {
      original: {
        new: {
          legalType: 'BC'
        }
      }
    }

    mockIsBCBusiness.mockReturnValue(true)
    mockGetIsRowRemoved.mockReturnValue(false)

    const column = getBusinessTypeColumn() as any
    const cell = column.cell({ row })

    expect(mockIsBCBusiness).toHaveBeenCalledWith(row.original.new)
    expect(cell.type).toBe('span')
    expect(cell.children).toBe('BC')
    expect(cell.props.class).toEqual('min-w-40 max-w-40')
  })

  it('should render foreign label for extra-provincial business', () => {
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

    const column = getBusinessTypeColumn() as any
    const cell = column.cell({ row })

    expect(mockIsBCBusiness).toHaveBeenCalledWith(row.original.new)
    expect(cell.type).toBe('span')
    expect(cell.children).toBe('Foreign')
    expect(cell.props.class).toEqual('min-w-40 max-w-40')
  })

  it('should apply DELETED_CLASS when the row is marked as removed', () => {
    const row = {
      original: {
        new: {
          legalType: 'BC'
        }
      }
    }

    mockIsBCBusiness.mockReturnValue(true)
    mockGetIsRowRemoved.mockReturnValue(true)

    const column = getBusinessTypeColumn() as any
    const cell = column.cell({ row })

    expect(cell.props.class).toEqual(`min-w-40 max-w-40 ${DELETED_CLASS}`)
  })
})
