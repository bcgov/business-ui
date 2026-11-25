import { describe, it, expect } from 'vitest'

describe('getConfirmAuthorizationSchema', () => {
  it('should pass with the checkbox checked and no completing party', () => {
    const result = getConfirmAuthorizationSchema().safeParse({ isAuthorized: true })
    expect(result.success).toBe(true)
  })

  it('should pass with an empty or undefined completing party', () => {
    expect(getConfirmAuthorizationSchema().safeParse({ isAuthorized: true, completingParty: '' }).success)
      .toBe(true)
    expect(getConfirmAuthorizationSchema().safeParse({ isAuthorized: true, completingParty: undefined }).success)
      .toBe(true)
  })

  it('should fail when the checkbox is unchecked', () => {
    const result = getConfirmAuthorizationSchema().safeParse({ isAuthorized: false })
    expect(result.success).toBe(false)
    expect(result.error!.issues).toHaveLength(1)
    expect(result.error!.issues[0]!.message).toBe('Check this box to continue')
    expect(result.error!.issues[0]!.path).toEqual(['isAuthorized'])
  })

  it('should show the checkbox message when isAuthorized is undefined', () => {
    const result = getConfirmAuthorizationSchema().safeParse({ completingParty: '' })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('Check this box to continue')
    expect(result.error!.issues[0]!.path).toEqual(['isAuthorized'])
  })
})

describe('getConfirmAuthorizationStaffSchema', () => {
  it('should pass with a name and the checkbox checked', () => {
    const result = getConfirmAuthorizationStaffSchema()
      .safeParse({ isAuthorized: true, completingParty: 'Jane Smith' })
    expect(result.success).toBe(true)
  })

  it('should trim the name in the parsed output', () => {
    const result = getConfirmAuthorizationStaffSchema()
      .safeParse({ isAuthorized: true, completingParty: '  Jane Smith  ' })
    expect(result.success).toBe(true)
    expect(result.data!.completingParty).toBe('Jane Smith')
  })

  it.each([
    ['empty', ''],
    ['whitespace-only', '   '],
    ['undefined (cleared input)', undefined]
  ])('should fail with a %s name', (_label, value) => {
    const result = getConfirmAuthorizationStaffSchema()
      .safeParse({ isAuthorized: true, completingParty: value })
    expect(result.success).toBe(false)
    expect(result.error!.issues).toHaveLength(1)
    expect(result.error!.issues[0]!.message).toBe('Please enter the full legal name of the completing party')
    expect(result.error!.issues[0]!.path).toEqual(['completingParty'])
  })

  it('should fail when the checkbox is unchecked', () => {
    const result = getConfirmAuthorizationStaffSchema()
      .safeParse({ isAuthorized: false, completingParty: 'Jane Smith' })
    expect(result.success).toBe(false)
    expect(result.error!.issues).toHaveLength(1)
    expect(result.error!.issues[0]!.message).toBe('Check this box to continue')
    expect(result.error!.issues[0]!.path).toEqual(['isAuthorized'])
  })

  it('should report both errors when the name is empty and the checkbox is unchecked', () => {
    const result = getConfirmAuthorizationStaffSchema()
      .safeParse({ isAuthorized: false, completingParty: '' })
    expect(result.success).toBe(false)
    expect(result.error!.issues).toHaveLength(2)

    // find by path rather than index so the test doesn't depend on the order of the schema keys
    const messages = Object.fromEntries(result.error!.issues.map(i => [i.path.join('.'), i.message]))
    expect(messages.isAuthorized).toBe('Check this box to continue')
    expect(messages.completingParty).toBe('Please enter the full legal name of the completing party')
  })
})

describe('getConfirmAuthorizationDefaults', () => {
  it('should be unchecked with an empty completing party', () => {
    expect(getConfirmAuthorizationDefaults()).toEqual({ isAuthorized: false, completingParty: '' })
  })
})
