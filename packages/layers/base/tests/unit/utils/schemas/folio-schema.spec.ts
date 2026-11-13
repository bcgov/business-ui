import { describe, it, expect, beforeEach } from 'vitest'

describe('getFolioSchema', () => {
  let schema: ReturnType<typeof getFolioSchema>

  beforeEach(() => {
    schema = getFolioSchema()
  })

  it('should pass when the folio is empty', () => {
    expect(schema.safeParse({ folioNumber: '' }).success).toBe(true)
    expect(schema.safeParse({}).success).toBe(true)
  })

  it('should pass at exactly 50 characters, the limit the account record and the filing schema allow', () => {
    const result = schema.safeParse({ folioNumber: 'a'.repeat(50) })
    expect(result.success).toBe(true)
  })

  it('should fail with the max length message at 51 characters', () => {
    const result = schema.safeParse({ folioNumber: 'a'.repeat(51) })

    expect(result.success).toBe(false)
    const issues = result.error!.issues
    expect(issues).toHaveLength(1)
    expect(issues[0]!.message).toBe('Maximum 50 characters')
    expect(issues[0]!.path).toEqual(['folioNumber'])
  })
})
