/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '../../../mocks/business-table-utils'

function getMockRow(appointmentDate: string | null = '2025-04-12', cessationDate: string | null = null) {
  return {
    original: {
      new: {
        roles: [
          {
            roleType: 'Director',
            appointmentDate,
            cessationDate
          }
        ],
        actions: []
      }
    }
  }
}

describe('getEffectiveDatesColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getEffectiveDatesColumn() as any
    // should call meta function for meta config
    expect(mockGetColumnMeta).toHaveBeenCalledOnce()

    expect(column.id).toBe('effectiveDates')
    expect(column.header).toBe('Effective Dates')
    expect(column).toHaveProperty('meta')

    // cell should be defined
    expect((column).cell).toBeDefined()
  })

  it('should call getColumnMeta with "default" by default', () => {
    getEffectiveDatesColumn()
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('should call getColumnMeta with the given metaOption', () => {
    getEffectiveDatesColumn('last')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('last')
    expect(mockGetColumnMeta).toHaveBeenCalledOnce()
    getActionsColumn('first')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('first')
    expect(mockGetColumnMeta).toHaveBeenCalledTimes(2)
  })

  it('cell should have correct properties for a still-active role', () => {
    const row = getMockRow()
    const column = getEffectiveDatesColumn() as any

    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(mockGetIsRowRemoved).toHaveBeenCalledWith(row)

    expect(cell.type).toBe('span')
    expect(cell.props.class).toEqual('min-w-40 max-w-40 overflow-clip')
    expect(cell.children).toBe('April 12, 2025 to current')
  })

  it('cell should render "Not Available" text if missing an appointment date', () => {
    const row = getMockRow(null)
    const column = getEffectiveDatesColumn() as any

    const cell = column.cell({ row })
    expect(cell.children).toBe('Not Available')
  })

  it('cell should add "opacity-40" when row is removed', () => {
    const row = getMockRow()
    const column = getEffectiveDatesColumn() as any

    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-40')
  })

  it('cell should render a Start/End range once the role has a cessation date', () => {
    const row = getMockRow('2023-08-16', '2025-04-12')
    const column = getEffectiveDatesColumn() as any

    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(cell.type).toBe('div')
    expect(cell.props.class).toEqual('min-w-40 max-w-40 overflow-clip flex flex-col')
    expect(cell.children).toHaveLength(3)
    expect(cell.children[0].children).toBe('August 16, 2023')
    expect(cell.children[1].children).toBe('to')
    expect(cell.children[2].children).toBe('April 12, 2025')
  })
})
