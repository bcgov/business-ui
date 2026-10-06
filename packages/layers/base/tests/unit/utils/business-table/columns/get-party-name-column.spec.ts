/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TableColumnIdentity } from '#components'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockGetColumnMeta } = vi.hoisted(() => ({ mockGetColumnMeta: vi.fn() }))
mockNuxtImport('getColumnMeta', () => mockGetColumnMeta)

const { mockGetIsRowRemoved } = vi.hoisted(() => ({ mockGetIsRowRemoved: vi.fn() }))
mockNuxtImport('getIsRowRemoved', () => mockGetIsRowRemoved)

const { mockGetTableBadges } = vi.hoisted(() => ({ mockGetTableBadges: vi.fn() }))
mockNuxtImport('getTableBadges', () => mockGetTableBadges)

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

  it('renders a PERSON name in uppercase without preferred name', () => {
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
    expect(cell.props.icon).toBe('i-mdi-account')
    expect(cell.props.class).toBe('min-w-36 max-w-36 font-bold flex flex-col gap-2 break-words')
    expect(cell.children['additional-label']).toBeDefined()
    expect(cell.children['additional-label']()).toEqual([])
  })

  it('renders a PERSON name in uppercase with preferred name', () => {
    const preferredName = 'Cool Cat'
    const row = {
      original: {
        new: {
          name: {
            partyType: PartyType.PERSON,
            firstName: 'John',
            middleName: 'Quincy',
            lastName: 'Doe',
            preferredName
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
    expect(cell.props.class).toBe('min-w-36 max-w-36 font-bold flex flex-col gap-2 break-words')
    expect(cell.children['additional-label']).toBeDefined()
    const slot = cell.children['additional-label']()
    expect(slot.children.length).toBe(2)
    expect(slot.children[0].children).toBe('Preferred Name:')
    expect(slot.children[0].props.class).toBe('text-sm italic')
    expect(slot.children[1].children).toBe(preferredName)
    expect(slot.children[1].props.class).toBe('text-sm font-normal')
  })

  it('renders a BUSINESS name in uppercase', () => {
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
    expect(cell.props.icon).toBe('i-mdi-domain')
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

  it('should add opacity-40 if the party row is removed', () => {
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

    expect(cell.props.labelClass).toContain('opacity-40')
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
    expect(mockGetTableBadges).toHaveBeenCalledWith(row, undefined)
  })

  it('adds a CEASED badge when all roles have ceased', () => {
    const row = {
      original: {
        new: {
          name: { partyType: PartyType.PERSON, firstName: 'John', middleName: '', lastName: 'Doe' },
          roles: [{ roleType: RoleTypeUi.DIRECTOR, appointmentDate: '2020-12-22', cessationDate: '2022-12-08' }],
          actions: []
        }
      }
    }
    const column = getPartyNameColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)
    mockGetTableBadges.mockReturnValue([])

    const cell = column.cell({ row })

    expect(cell.props.badges).toEqual([expect.objectContaining({ label: 'CEASED' })])
    expect(cell.props.labelClass).toBe('opacity-55')
    expect(cell.props.iconClass).toBe('opacity-55')
  })

  it('does not add a CEASED badge for active or removed parties', () => {
    const column = getPartyNameColumn() as any
    const getRow = (cessationDate: string | null, actions: ActionType[]) => ({
      original: {
        new: {
          name: { partyType: PartyType.PERSON, firstName: 'John', middleName: '', lastName: 'Doe' },
          roles: [{ roleType: RoleTypeUi.DIRECTOR, cessationDate }],
          actions
        }
      }
    })

    mockGetIsRowRemoved.mockReturnValue(false)
    mockGetTableBadges.mockReturnValue([])
    expect(column.cell({ row: getRow(null, []) }).props.badges).toEqual([])

    mockGetIsRowRemoved.mockReturnValue(true)
    mockGetTableBadges.mockReturnValue([{ label: 'DELETED' }])
    expect(column.cell({ row: getRow('2022-12-08', [ActionType.REMOVED]) }).props.badges)
      .toEqual([{ label: 'DELETED' }])
  })
})
