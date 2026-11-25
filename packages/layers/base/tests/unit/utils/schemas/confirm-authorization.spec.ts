import { describe, it, expect } from 'vitest'

describe('getConfirmAuthorizationSchema', () => {
  describe('default (completing party not required)', () => {
    it('should pass with the checkbox checked and no completing party', () => {
      const result = getConfirmAuthorizationSchema().safeParse({ isAuthorized: true })
      expect(result.success).toBe(true)
    })

    it('should pass with an empty completing party', () => {
      const result = getConfirmAuthorizationSchema().safeParse({ isAuthorized: true, completingParty: '' })
      expect(result.success).toBe(true)
    })

    it('should pass with an undefined completing party', () => {
      const result = getConfirmAuthorizationSchema().safeParse({ isAuthorized: true, completingParty: undefined })
      expect(result.success).toBe(true)
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

    it('should behave the same when requireCompletingParty is explicitly false', () => {
      const result = getConfirmAuthorizationSchema({ requireCompletingParty: false })
        .safeParse({ isAuthorized: true, completingParty: '' })
      expect(result.success).toBe(true)
    })
  })

  describe('requireCompletingParty', () => {
    it('should pass with a name and the checkbox checked', () => {
      const result = getConfirmAuthorizationSchema({ requireCompletingParty: true })
        .safeParse({ isAuthorized: true, completingParty: 'Jane Smith' })
      expect(result.success).toBe(true)
    })

    it('should trim the name in the parsed output', () => {
      const result = getConfirmAuthorizationSchema({ requireCompletingParty: true })
        .safeParse({ isAuthorized: true, completingParty: '  Jane Smith  ' })
      expect(result.success).toBe(true)
      expect(result.data!.completingParty).toBe('Jane Smith')
    })

    it('should fail with an empty name', () => {
      const result = getConfirmAuthorizationSchema({ requireCompletingParty: true })
        .safeParse({ isAuthorized: true, completingParty: '' })
      expect(result.success).toBe(false)
      expect(result.error!.issues).toHaveLength(1)
      expect(result.error!.issues[0]!.message).toBe('Please enter the full legal name of the completing party')
      expect(result.error!.issues[0]!.path).toEqual(['completingParty'])
    })

    it('should fail with a whitespace-only name', () => {
      const result = getConfirmAuthorizationSchema({ requireCompletingParty: true })
        .safeParse({ isAuthorized: true, completingParty: '   ' })
      expect(result.success).toBe(false)
      expect(result.error!.issues[0]!.message).toBe('Please enter the full legal name of the completing party')
      expect(result.error!.issues[0]!.path).toEqual(['completingParty'])
    })

    it('should show the required message when the name is undefined (cleared input)', () => {
      const result = getConfirmAuthorizationSchema({ requireCompletingParty: true })
        .safeParse({ isAuthorized: true, completingParty: undefined })
      expect(result.success).toBe(false)
      expect(result.error!.issues[0]!.message).toBe('Please enter the full legal name of the completing party')
      expect(result.error!.issues[0]!.path).toEqual(['completingParty'])
    })

    it('should fail when the checkbox is unchecked', () => {
      const result = getConfirmAuthorizationSchema({ requireCompletingParty: true })
        .safeParse({ isAuthorized: false, completingParty: 'Jane Smith' })
      expect(result.success).toBe(false)
      expect(result.error!.issues).toHaveLength(1)
      expect(result.error!.issues[0]!.message).toBe('Check this box to continue')
      expect(result.error!.issues[0]!.path).toEqual(['isAuthorized'])
    })

    it('should report both errors when the name is empty and the checkbox is unchecked', () => {
      const result = getConfirmAuthorizationSchema({ requireCompletingParty: true })
        .safeParse({ isAuthorized: false, completingParty: '' })
      expect(result.success).toBe(false)
      expect(result.error!.issues).toHaveLength(2)

      // find by path rather than index so the test doesn't depend on the order of the schema keys
      const messages = Object.fromEntries(result.error!.issues.map(i => [i.path.join('.'), i.message]))
      expect(messages.isAuthorized).toBe('Check this box to continue')
      expect(messages.completingParty).toBe('Please enter the full legal name of the completing party')
    })
  })
})
