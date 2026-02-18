/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TableColumnRoles } from '#components'
import { mockGetColumnMeta, mockGetIsRowRemoved } from '../../../mocks/business-table-utils'

describe('getPartyRolesColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct properties', () => {
    const column = getPartyRolesColumn()

    expect(column.id).toBe('roles')
    expect(column.header).toBe('Roles')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('default')
  })

  it('returns the column roles component with expected values', () => {
    const roles = [
      {
        roleType: RoleTypeUi.DIRECTOR,
        cessationDate: '2024-05-03'
      },
      {
        roleType: RoleTypeUi.RECEIVER
      },
      {
        roleType: RoleTypeUi.TREASURER
      },
      {
        roleType: RoleTypeUi.CEO
      },
      {
        roleType: RoleTypeUi.SECRETARY
      }
    ]
    const row = { original: { new: { roles } } }
    const column = getPartyRolesColumn() as any
    mockGetIsRowRemoved.mockReturnValue(false)
    const cell = column.cell({ row })

    expect(cell.type).toBe(TableColumnRoles)
    expect(cell.props.roles).toEqual(roles)
    expect(cell.props.class).toBe('min-w-48 max-w-48 overflow-clip')
  })
})
