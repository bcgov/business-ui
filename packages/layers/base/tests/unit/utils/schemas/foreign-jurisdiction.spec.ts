import { describe, it, expect } from 'vitest'

describe('getForeignJurisdictionSchema', () => {
  it('should fail when no jurisdiction is selected', () => {
    const result = getForeignJurisdictionSchema().safeParse({ country: '', region: '' })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('Jurisdiction is required')
    expect(result.error!.issues[0]!.path).toEqual(['country'])
  })

  it('should require a region for Canada (draft-resume guard)', () => {
    const result = getForeignJurisdictionSchema().safeParse({ country: 'CA', region: '' })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('Jurisdiction Region is required')
    expect(result.error!.issues[0]!.path).toEqual(['region'])
  })

  it('should reject BC as a Canadian region (draft-resume guard)', () => {
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

  it('should pass for an international country without a region', () => {
    // the combined jurisdiction menu emits international selections with region null (incl. the US)
    expect(getForeignJurisdictionSchema().safeParse({ country: 'US', region: null }).success).toBe(true)
    expect(getForeignJurisdictionSchema().safeParse({ country: 'US', region: '' }).success).toBe(true)
    expect(getForeignJurisdictionSchema().safeParse({ country: 'AU' }).success).toBe(true)
  })
})
