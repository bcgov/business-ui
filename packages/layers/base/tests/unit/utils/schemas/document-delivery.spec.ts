import { describe, it, expect } from 'vitest'

describe('getDocumentDeliverySchema', () => {
  const schema = getDocumentDeliverySchema()

  describe('completingPartyEmail', () => {
    it('should pass when undefined', () => {
      const result = schema.safeParse({ completingPartyEmail: undefined })
      expect(result.success).toBe(true)
    })

    it('should convert to undefined and pass when empty string', () => {
      const result = schema.safeParse({ completingPartyEmail: '' })
      expect(result.success).toBe(true)
      expect(result.data!.completingPartyEmail).toBeUndefined()
    })

    it('should fail with an invalid email', () => {
      const result = schema.safeParse({ completingPartyEmail: 'invalid-email' })
      expect(result.success).toBe(false)
      expect(result.error!.issues[0]!.message).toBe('Enter a valid email address')
    })
  })
})
