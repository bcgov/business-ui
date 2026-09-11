/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '../../../mocks/business-table-utils'

function getMockRow(email: string = 'tester.testing@example.com') {
  return {
    original: {
      new: {
        email,
        actions: []
      }
    }
  }
}

describe('getEmailColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getEmailColumn() as any
    // should call meta function for meta config
    expect(mockGetColumnMeta).toHaveBeenCalledOnce()

    expect(column.id).toBe('email')
    expect(column.header).toBe('Email')
    expect(column).toHaveProperty('meta')

    // cell should be defined
    expect((column).cell).toBeDefined()
  })

  it('should call getColumnMeta with "default" by default', () => {
    getEmailColumn()
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('should call getColumnMeta with the given metaOption', () => {
    getEmailColumn('last')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('last')
    expect(mockGetColumnMeta).toHaveBeenCalledOnce()
  })

  it('cell should have correct properties for a valid email', () => {
    const row = getMockRow()
    const column = getEmailColumn() as any

    mockGetIsRowRemoved.mockReturnValue(false)

    const cell = column.cell({ row })

    expect(mockGetIsRowRemoved).toHaveBeenCalledWith(row)

    expect(cell.type).toBe('span')
    expect(cell.props.class).toEqual('min-w-48 max-w-48 overflow-clip break-words')
    expect(cell.children).toBe('tester.testing@example.com')
  })

  it('cell should render "Not Available" text if missing email', () => {
    const row = getMockRow('')
    const column = getEmailColumn() as any

    const cell = column.cell({ row })
    expect(cell.children).toBe('Not Available')
  })

  it('cell should add "opacity-40" when row is removed', () => {
    const row = getMockRow()
    const column = getEmailColumn() as any

    mockGetIsRowRemoved.mockReturnValue(true)

    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-40')
  })
})
