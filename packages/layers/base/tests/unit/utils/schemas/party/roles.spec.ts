import { describe, it, expect } from 'vitest'

describe('hasCeasedTab', () => {
  it('is true only for role types configured with a cessationDate', () => {
    expect(hasCeasedTab(RoleTypeUi.DIRECTOR)).toBe(true)
    expect(hasCeasedTab(RoleTypeUi.CUSTODIAN)).toBe(false)
    expect(hasCeasedTab(undefined)).toBe(false)
  })
})

describe('isPartyCeased', () => {
  it('is true when every role of the given type has a cessation date', () => {
    const party = { roles: [{ roleType: RoleTypeUi.DIRECTOR, cessationDate: '2022-12-08' }] }
    expect(isPartyCeased(party, RoleTypeUi.DIRECTOR)).toBe(true)
  })

  it('is false when a role of the given type is still active', () => {
    expect(isPartyCeased({
      roles: [
        { roleType: RoleTypeUi.DIRECTOR, cessationDate: '2022-12-08' },
        { roleType: RoleTypeUi.DIRECTOR, cessationDate: null }
      ]
    }, RoleTypeUi.DIRECTOR)).toBe(false)
  })

  it('is false when the party has no role of the given type', () => {
    const party = { roles: [{ roleType: RoleTypeUi.RECEIVER, cessationDate: '2022-12-08' }] }
    expect(isPartyCeased(party, RoleTypeUi.DIRECTOR)).toBe(false)
  })
})
