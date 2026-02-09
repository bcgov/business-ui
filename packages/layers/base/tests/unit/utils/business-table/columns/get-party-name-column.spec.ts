/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TableColumnIdentity } from '#components'
import { mockGetColumnMeta, mockGetIsRowRemoved, mockGetTableBadges } from '../../../mocks/business-table-utils'

describe('getPartyNameColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getPartyNameColumn() as any

    expect(column.id).toBe('name')
    expect(column.header).toBe('Name')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('first')
  })

  it('renders a PERSON name correctly in uppercase', () => {
    const row = {
      original: {
        new: {
          name: {
            partyType: PartyType.PERSON,
            firstName: 'John',
            middleName: 'Quincy',
            lastName: 'Doe'
          }
        }
      }
    }
    const column = getPartyNameColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)
    mockGetTableBadges.mockReturnValue([])

    const cell = column.cell({ row })

    expect(cell.type).toBe(TableColumnIdentity)
    expect(cell.props.label).toBe('JOHN QUINCY DOE')
    expect(cell.props.class).toBe('font-bold min-w-48 max-w-48 flex flex-col gap-2')
  })

  it('renders a BUSINESS name correctly in uppercase', () => {
    const row = {
      original: {
        new: {
          name: {
            partyType: PartyType.ORGANIZATION,
            businessName: 'Acme Corp Services'
          }
        }
      }
    }
    const column = getPartyNameColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.props.label).toBe('ACME CORP SERVICES')
  })

  it('renders an empty string if businessName is missing', () => {
    const row = {
      original: {
        new: {
          name: {
            partyType: PartyType.ORGANIZATION,
            businessName: undefined
          }
        }
      }
    }
    const column = getPartyNameColumn() as any
    const cell = column.cell({ row })

    expect(cell.props.label).toBe('')
  })

  it('should add opacity-50 if the party row is removed', () => {
    const row = {
      original: {
        new: {
          name: { partyType: PartyType.ORGANIZATION, businessName: 'Test' }
        }
      }
    }
    const column = getPartyNameColumn() as any

    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
  })

  it('passes badges correctly to TableColumnIdentity', () => {
    const row = {
      original: {
        new: {
          name: { partyType: PartyType.ORGANIZATION, businessName: 'Test' }
        }
      }
    }
    const column = getPartyNameColumn() as any
    const mockBadges = [{ label: 'REMOVED', color: 'neutral' }]
    mockGetTableBadges.mockReturnValue(mockBadges)

    const cell = column.cell({ row })

    expect(cell.props.badges).toEqual(mockBadges)
    expect(mockGetTableBadges).toHaveBeenCalledWith(row)
  })
})
