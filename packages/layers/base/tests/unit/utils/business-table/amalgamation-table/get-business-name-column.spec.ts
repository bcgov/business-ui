/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockGetColumnMeta,
  mockGetIsRowRemoved,
  mockGetTableBadges
} from '#business/tests/unit/mocks/business-table-utils'
import { getBusinessNameColumn } from '#business/app/utils/business-table/amalgamation-table/get-business-name-column'
import { TableColumnIdentity } from '#components'
import { DELETED_CLASS } from '#business/app/utils/business-table/columns/constants'

describe('getBusinessNameColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct column properties', () => {
    const column = getBusinessNameColumn() as any

    expect(column.id).toBe('business-name-column')
    expect(column.header).toBe('Business Name')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('first')
  })

  it('should render the cell with business name and number slot', () => {
    const row = {
      original: {
        new: {
          name: '0888620 B.C. LTD.',
          number: 'BC0888620'
        }
      }
    }
    const column = getBusinessNameColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)
    mockGetTableBadges.mockReturnValue([])

    const cell = column.cell({ row })

    expect(cell.type).toBe(TableColumnIdentity)
    expect(cell.props.label).toBe('0888620 B.C. LTD.')
    expect(cell.props.class).toEqual('font-bold min-w-40 max-w-40 flex flex-col gap-2')
    expect(cell.props.labelClass).toBe('')

    const additionalLabel = cell.children['additional-label']()
    expect(additionalLabel.type).toBe('span')
    expect(additionalLabel.props.class).toBe('text-sm font-normal')
    expect(additionalLabel.children).toBe('BC0888620')
  })

  it('should add DELETED_CLASS when the row is marked as removed', () => {
    const row = {
      original: {
        new: {
          name: 'ALBANIA CORP',
          number: 'AL12345'
        }
      }
    }
    const column = getBusinessNameColumn() as any
    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toEqual(`font-bold min-w-40 max-w-40 flex flex-col gap-2 ${DELETED_CLASS}`)
    expect(cell.props.labelClass).toBe(DELETED_CLASS)
  })

  it('should pass badges and label overrides correctly', () => {
    const row = {
      original: {
        new: {
          name: 'REALLY LONG COMPANY 12345',
          number: 'NB12345'
        }
      }
    }
    const badgeOverrides = { ADDED: 'New Entity' } as any
    const mockBadges = [{ label: 'New Entity', color: 'primary' }]
    mockGetTableBadges.mockReturnValue(mockBadges)

    const column = getBusinessNameColumn('first', badgeOverrides) as any
    const cell = column.cell({ row })

    expect(mockGetTableBadges).toHaveBeenCalledWith(row, badgeOverrides)
    expect(cell.props.badges).toEqual(mockBadges)
  })
})
