/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TableColumnName } from '#components'
import { mockGetColumnMeta, mockGetIsRowRemoved, mockGetTableBadges } from '../../../mocks/business-table-utils'

describe('getNameColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getNameColumn() as any
    // should call meta function for meta config
    expect(mockGetColumnMeta).toHaveBeenCalledOnce()

    expect(column.id).toBe('name')
    expect(column.header).toBe('Name')
    expect(column).toHaveProperty('meta')

    // cell should be defined
    expect((column).cell).toBeDefined()
  })

  it('should call getColumnMeta with "first" by default', () => {
    getNameColumn()
    expect(mockGetColumnMeta).toHaveBeenCalledWith('first')
  })

  it('should call getColumnMeta with the given metaOption', () => {
    getNameColumn('last')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('last')
    expect(mockGetColumnMeta).toHaveBeenCalledOnce()
    getActionsColumn('default')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
    expect(mockGetColumnMeta).toHaveBeenCalledTimes(2)
  })

  it('cell should have correct properties', () => {
    const row = {
      original: {
        new: {
          name: { firstName: 'Alice' },
          actions: []
        }
      }
    }
    const column = getNameColumn() as any

    const mockBadges = [{ label: 'EDITED' }]
    mockGetTableBadges.mockReturnValue(mockBadges)
    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(mockGetTableBadges).toHaveBeenCalledWith(row)
    expect(mockGetIsRowRemoved).toHaveBeenCalledWith(row)

    expect(cell.type).toBe(TableColumnName)
    expect(cell.props.party).toEqual({ firstName: 'Alice' })
    expect(cell.props.badges).toEqual(mockBadges)
    expect(cell.props.class).toEqual('font-bold min-w-48 max-w-48 flex flex-col gap-2')
  })

  it('cell should add "opacity-50" when row is removed', () => {
    const row = {
      original: {
        new: {
          name: { firstName: 'Alice' },
          actions: []
        }
      }
    }
    const column = getNameColumn() as any

    mockGetTableBadges.mockReturnValue([])
    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
  })
})
