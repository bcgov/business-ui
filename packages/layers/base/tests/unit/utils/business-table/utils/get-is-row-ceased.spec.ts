/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'

function getRow(cessationDates: (string | null)[], actions: ActionType[] = []) {
  return {
    original: {
      new: {
        roles: cessationDates.map(cessationDate => ({ roleType: RoleTypeUi.DIRECTOR, cessationDate })),
        actions
      }
    }
  } as any
}

describe('getIsRowCeased', () => {
  it('is true when every role has a cessation date', () => {
    expect(getIsRowCeased(getRow(['2022-12-08']))).toBe(true)
  })

  it('is false when a role is still active', () => {
    expect(getIsRowCeased(getRow(['2022-12-08', null]))).toBe(false)
  })

  it('is false for removed rows, rows without roles, or no row', () => {
    expect(getIsRowCeased(getRow(['2022-12-08'], [ActionType.REMOVED]))).toBe(false)
    expect(getIsRowCeased({ original: { new: { actions: [] } } } as any)).toBe(false)
    expect(getIsRowCeased(undefined)).toBe(false)
  })
})
