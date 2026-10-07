import { describe, it, expect } from 'vitest'

describe('getForeignJurisdictionSchema', () => {
  it('should fail when no country is selected', () => {
    const result = getForeignJurisdictionSchema().safeParse({ country: '', region: '' })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('Jurisdiction Country is required')
    expect(result.error!.issues[0]!.path).toEqual(['country'])
  })

  it('should require a region for Canada', () => {
    const result = getForeignJurisdictionSchema().safeParse({ country: 'CA', region: '' })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('Jurisdiction Region is required')
    expect(result.error!.issues[0]!.path).toEqual(['region'])
  })

  it('should require a region for the US', () => {
    const result = getForeignJurisdictionSchema().safeParse({ country: 'US', region: '' })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('Jurisdiction Region is required')
  })

  it('should reject BC as a Canadian region', () => {
    const result = getForeignJurisdictionSchema().safeParse({ country: 'CA', region: 'BC' })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('Jurisdiction Region cannot be British Columbia')
  })

  it('should pass for a Canadian province other than BC', () => {
    expect(getForeignJurisdictionSchema().safeParse({ country: 'CA', region: 'AB' }).success).toBe(true)
  })

  it('should pass for the FEDERAL Canadian jurisdiction', () => {
    expect(getForeignJurisdictionSchema().safeParse({ country: 'CA', region: 'FEDERAL' }).success).toBe(true)
  })

  it('should pass for a US state', () => {
    expect(getForeignJurisdictionSchema().safeParse({ country: 'US', region: 'WA' }).success).toBe(true)
  })

  it('should pass for any other country without a region', () => {
    expect(getForeignJurisdictionSchema().safeParse({ country: 'AU', region: '' }).success).toBe(true)
    expect(getForeignJurisdictionSchema().safeParse({ country: 'AU' }).success).toBe(true)
  })
})
