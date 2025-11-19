/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta } from '../../../mocks/business-table-utils'

describe('getActionsColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const actionsColumn = getActionsColumn() as any
    // should call meta function for meta config
    expect(mockGetColumnMeta).toHaveBeenCalledOnce()

    // meta and id should be defined on column
    expect(actionsColumn).toHaveProperty('meta')
    expect(actionsColumn.id).toBe('actions')

    // header values
    const header = (actionsColumn).header()
    expect(header.type).toBe('span')
    expect(header.props.class).toBe('sr-only')
    expect(header.children).toBe('Actions')

    // no cell defined on actions column
    expect((actionsColumn).cell).toBeUndefined()
  })

  it('should call getColumnMeta with "last" by default', () => {
    getActionsColumn()
    expect(mockGetColumnMeta).toHaveBeenCalledWith('last')
  })

  it('should call getColumnMeta with the given metaOption', () => {
    getActionsColumn('first')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('first')
    expect(mockGetColumnMeta).toHaveBeenCalledOnce()
    getActionsColumn('default')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
    expect(mockGetColumnMeta).toHaveBeenCalledTimes(2)
  })
})
