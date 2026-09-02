/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '#business/tests/unit/mocks/business-table-utils'
import { getDocumentsColumn } from '#business/app/utils/business-table/court-order-table/get-documents-column'
import { TableColumnDocuments } from '#components'

describe('getDocumentsColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct column properties', () => {
    const column = getDocumentsColumn() as any

    expect(column.id).toBe('court-order-documents')
    expect(column.header).toBe('Documents')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('should render TableColumnDocuments cell with correct props', () => {
    const mockFiles = [
      { id: '1', name: 'order.pdf', fileKey: 'key-1' },
      { id: '2', name: 'poa.pdf', fileKey: 'key-2' }
    ]
    const row = {
      original: { new: { files: mockFiles } }
    }
    mockGetIsRowRemoved.mockReturnValue(false)

    const column = getDocumentsColumn() as any
    const cell = column.cell({ row })

    expect(cell.type).toBe(TableColumnDocuments)
    expect(cell.props.files).toEqual(mockFiles)
    expect(cell.props.isRemoved).toBe(false)
    expect(cell.props.class).toEqual('min-w-48 max-w-48')
  })

  it('should apply DELETED_CLASS when row is removed', () => {
    const row = {
      original: { new: { files: [] } }
    }
    mockGetIsRowRemoved.mockReturnValue(true)

    const column = getDocumentsColumn() as any
    const cell = column.cell({ row })

    expect(cell.props.isRemoved).toBe(true)
    expect(cell.props.class).toEqual('min-w-48 max-w-48 opacity-40')
  })

  it('should forward metaOption to getColumnMeta', () => {
    getDocumentsColumn('first')

    expect(mockGetColumnMeta).toHaveBeenCalledWith('first')
  })
})
