/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLegalNameRefinement } from '#business/app/utils/schemas/your-company/legal-name-refinement'
import { z } from 'zod'
import { describe, it, expect } from 'vitest'

function createTestSchema(context?: Parameters<typeof getLegalNameRefinement>[0]) {
  return z
    .object({
      legalName: z.string().optional()
    })
    .superRefine(getLegalNameRefinement(context))
}

describe('getLegalNameRefinement', () => {
  it('should fail when new legalName is empty or whitespace only', () => {
    const schema = createTestSchema({ business: {
      legalName: 'TEST COMPANY INC',
      legalType: CorpTypeCd.BC_COMPANY
    } } as any)

    const emptyRes = schema.safeParse({ legalName: '' })
    expect(emptyRes.success).toBe(false)
    if (!emptyRes.success) {
      expect(emptyRes.error.issues[0]!.message).toBe('A company name is required')
    }

    const whitespaceRes = schema.safeParse({ legalName: '   ' })
    expect(whitespaceRes.success).toBe(false)
    if (!whitespaceRes.success) {
      expect(whitespaceRes.error.issues[0]!.message).toBe('A company name is required')
    }
  })

  it('should fail when legalName is undefined or null', () => {
    const schema = createTestSchema({
      business: {
        legalName: 'TEST COMPANY INC',
        legalType: CorpTypeCd.BC_COMPANY
      } as any
    })

    const undefinedRes = schema.safeParse({})
    expect(undefinedRes.success).toBe(false)
    if (!undefinedRes.success) {
      expect(undefinedRes.error.issues[0]!.message).toBe('A company name is required')
    }

    const nullRes = schema.safeParse({ legalName: null as any })
    expect(nullRes.success).toBe(false)
  })

  it('should block editing if business context is missing and name is changed', () => {
    const schema = createTestSchema(undefined)
    const res = schema.safeParse({ legalName: 'NEW CORP LTD' })

    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues[0]!.message).toContain('business details could not be loaded')
    }
  })

  it('should block editing if business legalType is missing and name is changed', () => {
    const schema = createTestSchema({
      business: { legalName: 'OLD NAME LTD' } as any
    })
    const res = schema.safeParse({ legalName: 'NEW NAME LTD' })

    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues[0]!.message).toContain('business details could not be loaded')
    }
  })

  it('should allow unchanged name to pass even if context is minimal', () => {
    const schema = createTestSchema({
      business: {
        legalName: 'EXISTING COMPANY LTD',
        legalType: CorpTypeCd.BC_COMPANY
      } as any
    })

    const res = schema.safeParse({ legalName: 'EXISTING COMPANY LTD' })
    expect(res.success).toBe(true)
  })

  it('should block editing if CorpType has no entry in DESIGNATION_CONFIG', () => {
    const schema = createTestSchema({
      business: {
        legalName: 'SOME NAME LTD',
        legalType: 'UNKNOWN_TYPE' as any
      } as any
    })

    const res = schema.safeParse({ legalName: 'NEW NAME LTD' })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues[0]!.message).toContain('no designation rules are configured')
    }
  })

  it('should block editing if existing database legalName lacks a valid designation', () => {
    const schema = createTestSchema({
      business: {
        legalName: 'CORRUPT NAME WITHOUT SUFFIX',
        legalType: CorpTypeCd.BC_COMPANY
      } as any
    })

    const res = schema.safeParse({ legalName: 'VALID NAME LTD' })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues[0]!.message).toContain('existing designation could not be verified')
    }
  })

  it('should emit the issue with path ["legalName"]', () => {
    const schema = createTestSchema({ business: { legalName: 'test', legalType: 'BC' } } as any)
    const res = schema.safeParse({ legalName: 'INVALID NAME' })

    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues[0]!.path).toEqual(['legalName'])
    }
  })

  it('should fail if the name contains multiple designations', () => {
    const corpSchema = createTestSchema({
      business: {
        legalName: 'PACIFIC ENTERPRISES INC',
        legalType: CorpTypeCd.BC_COMPANY
      } as any
    })

    const duplicate = corpSchema.safeParse({ legalName: 'INC HOLDINGS INC' })
    expect(duplicate.success).toBe(false)
    if (!duplicate.success) {
      expect(duplicate.error.issues[0]!.message).toBe('A company name cannot contain multiple designations.')
    }

    const multipleDifferent = corpSchema.safeParse({ legalName: 'ACME LTD INC' })
    expect(multipleDifferent.success).toBe(false)
    if (!multipleDifferent.success) {
      expect(multipleDifferent.error.issues[0]!.message).toBe('A company name cannot contain multiple designations.')
    }

    const fullAndAbbr = corpSchema.safeParse({ legalName: 'PACIFIC Corporation INC' })
    expect(fullAndAbbr.success).toBe(false)
    if (!fullAndAbbr.success) {
      expect(fullAndAbbr.error.issues[0]!.message).toBe('A company name cannot contain multiple designations.')
    }

    const numberedWithExtra = corpSchema.safeParse({ legalName: '1234567 B.C. LTD. INC' })
    expect(numberedWithExtra.success).toBe(false)
    if (!numberedWithExtra.success) {
      expect(numberedWithExtra.error.issues[0]!.message).toBe('A company name cannot contain multiple designations.')
    }

    const numberedSchema = createTestSchema({
      business: {
        legalName: '1234567 B.C. LTD.',
        legalType: CorpTypeCd.BC_COMPANY
      } as any
    })

    const numberedDoubleLtd = numberedSchema.safeParse({ legalName: '1234567 LTD B.C. LTD.' })
    expect(numberedDoubleLtd.success).toBe(false)
    if (!numberedDoubleLtd.success) {
      expect(numberedDoubleLtd.error.issues[0]!.message).toBe('A company name cannot contain multiple designations.')
    }

    const cccSchema = createTestSchema({
      business: {
        legalName: 'OCEAN CLEANUP B.C. COMMUNITY CONTRIBUTION COMPANY LTD.',
        legalType: CorpTypeCd.BC_CCC
      } as any
    })

    const cccWithExtraCorp = cccSchema.safeParse({
      legalName: 'OCEAN CLEANUP Corporation B.C. COMMUNITY CONTRIBUTION COMPANY LTD.'
    })
    expect(cccWithExtraCorp.success).toBe(false)
    if (!cccWithExtraCorp.success) {
      expect(cccWithExtraCorp.error.issues[0]!.message).toBe('A company name cannot contain multiple designations.')
    }

    const ulcSchema = createTestSchema({
      business: {
        legalName: 'SUMMIT ASSETS ULC',
        legalType: CorpTypeCd.BC_ULC_COMPANY
      } as any
    })

    const ulcMultiple = ulcSchema.safeParse({
      legalName: 'SUMMIT Unlimited Liability Company ULC'
    })
    expect(ulcMultiple.success).toBe(false)
    if (!ulcMultiple.success) {
      expect(ulcMultiple.error.issues[0]!.message).toBe('A company name cannot contain multiple designations.')
    }

    const coopSchema = createTestSchema({
      business: {
        legalName: 'ISLAND CO-OP GROCERY',
        legalType: CorpTypeCd.COOP
      } as any
    })

    const coopMultiple = coopSchema.safeParse({
      legalName: 'ISLAND CO-OP COOPERATIVE GROCERY'
    })
    expect(coopMultiple.success).toBe(false)
    if (!coopMultiple.success) {
      expect(coopMultiple.error.issues[0]!.message).toBe('A company name cannot contain multiple designations.')
    }

    const coopDuplicate = coopSchema.safeParse({
      legalName: 'ISLAND CO-OP GROCERY CO-OP'
    })
    expect(coopDuplicate.success).toBe(false)
    if (!coopDuplicate.success) {
      expect(coopDuplicate.error.issues[0]!.message).toBe('A company name cannot contain multiple designations.')
    }
  })

  it('should not fail on substring match (CORPORAL includes CORP)', () => {
    const schema = createTestSchema({
      business: {
        legalName: 'CORPORAL INVESTMENTS INC',
        legalType: CorpTypeCd.BC_COMPANY
      } as any
    })

    expect(schema.safeParse({ legalName: 'CORPORAL VENTURES INC' }).success).toBe(true)
  })

  it('should handle multiple whitespaces before designation', () => {
    const schema = createTestSchema({
      business: {
        legalName: 'PACIFIC ENTERPRISES INC',
        legalType: CorpTypeCd.BC_COMPANY
      } as any
    })

    expect(schema.safeParse({ legalName: 'NORTHERN PEAK  ENTERPRISES   INC' }).success).toBe(true)
  })

  it('should fail if designation has preceding punctuation', () => {
    const schema = createTestSchema({
      business: {
        legalName: 'PACIFIC ENTERPRISES INC',
        legalType: CorpTypeCd.BC_COMPANY
      } as any
    })

    expect(schema.safeParse({ legalName: 'NORTHERN PEAK-INC' }).success).toBe(false)
    expect(schema.safeParse({ legalName: 'NORTHERN PEAK.INC' }).success).toBe(false)
  })

  describe('Punctuation and Multi-word Designation', () => {
    it('should correctly match CCC designation instead of LTD', () => {
      const schema = createTestSchema({
        business: {
          legalName: 'OCEAN CLEANUP B.C. COMMUNITY CONTRIBUTION COMPANY LTD.',
          legalType: CorpTypeCd.BC_CCC
        } as any
      })

      // Valid: retaining full compound designation
      expect(
        schema.safeParse({
          legalName: 'COASTAL RESTORATION B.C. COMMUNITY CONTRIBUTION COMPANY LTD.'
        }).success
      ).toBe(true)

      // Invalid: changing to just standard LTD
      const res = schema.safeParse({ legalName: 'COASTAL RESTORATION LTD' })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.issues[0]!.message).toBe(
          'The business designation B.C. COMMUNITY CONTRIBUTION COMPANY LTD. cannot be changed.'
        )
      }
    })

    it('should correctly check punctuation in numbered companies (B.C. LTD.)', () => {
      const schema = createTestSchema({
        business: {
          legalName: '1234567 B.C. LTD.',
          legalType: CorpTypeCd.BC_COMPANY
        } as any
      })

      expect(schema.safeParse({ legalName: '9876543 B.C. LTD.' }).success).toBe(true)
      expect(schema.safeParse({ legalName: '9876543 BC LTD' }).success).toBe(false)
    })

    it('should enforce ULC-specific designations for Unlimited Liability Companies', () => {
      const schema = createTestSchema({
        business: {
          legalName: 'PACIFIC HOLDINGS ULC',
          legalType: CorpTypeCd.BC_ULC_COMPANY
        } as any
      })

      expect(schema.safeParse({ legalName: 'SUMMIT ASSETS ULC' }).success).toBe(true)
      expect(schema.safeParse({ legalName: 'SUMMIT ASSETS LTD' }).success).toBe(false)
      expect(schema.safeParse({ legalName: 'SUMMIT ASSETS INC' }).success).toBe(false)
    })
  })

  describe('Rule: nonPrefix', () => {
    const coopContext = {
      legalName: 'SUNSHINE CO-OP BAKERY',
      legalType: CorpTypeCd.COOP
    } as any

    it('should allow designation in the middle with whitespace on each side', () => {
      const schema = createTestSchema({ business: coopContext })
      expect(schema.safeParse({ legalName: 'ISLAND CO-OP GROCERY' }).success).toBe(true)
    })

    it('should allow designation as the suffix at the end of the name', () => {
      const schema = createTestSchema({ business: coopContext })
      expect(schema.safeParse({ legalName: 'ISLAND ARTISAN CO-OP' }).success).toBe(true)
    })

    it('should fail when designation is at the beginning (prefix)', () => {
      const schema = createTestSchema({ business: coopContext })

      const res = schema.safeParse({ legalName: 'CO-OP ISLAND BAKERY' })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.issues[0]!.message).toBe('The business designation CO-OP cannot be changed.')
      }
    })

    it('should fail when designation is the only word in the name', () => {
      const schema = createTestSchema({ business: coopContext })

      expect(schema.safeParse({ legalName: 'CO-OP' }).success).toBe(false)
      expect(schema.safeParse({ legalName: '   CO-OP   ' }).success).toBe(false)
    })

    it('should fail when designation lacks whitespace in the middle', () => {
      const schema = createTestSchema({ business: coopContext })

      expect(schema.safeParse({ legalName: 'ISLAND/CO-OP/BAKERY' }).success).toBe(false)
      expect(schema.safeParse({ legalName: 'ISLANDCO-OP BAKERY' }).success).toBe(false)
      expect(schema.safeParse({ legalName: 'ISLAND CO-OPBAKERY' }).success).toBe(false)
    })

    it('should determine between CO-OP and COOP designations strictly', () => {
      const schema = createTestSchema({ business: coopContext })

      const res = schema.safeParse({ legalName: 'ISLAND COOP BAKERY' })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.issues[0]!.message).toBe('The business designation CO-OP cannot be changed.')
      }
    })

    it('should fail when designation is followed by punctuation', () => {
      const schema = createTestSchema({ business: coopContext })
      expect(schema.safeParse({ legalName: 'ISLAND CO-OP,BAKERY' }).success).toBe(false)
    })

    it('should fail CO-OP if trailing punctuation', () => {
      const schema = createTestSchema({
        business: {
          legalName: 'SUNSHINE CO-OP BAKERY',
          legalType: CorpTypeCd.COOP
        } as any
      })

      expect(schema.safeParse({ legalName: 'ISLAND ARTISAN CO-OP.' }).success).toBe(false)
      expect(schema.safeParse({ legalName: 'ISLAND CO-OP. ARTISAN' }).success).toBe(false)
    })
  })

  describe('Rule: none (SP/GP)', () => {
    it.each([
      CorpTypeCd.SOLE_PROP,
      CorpTypeCd.PARTNERSHIP
    ])('should allow any legal name changes for %s without designation checks', (type) => {
      const schema = createTestSchema({
        business: {
          legalName: 'OLD STORE',
          legalType: type
        } as any
      })

      expect(schema.safeParse({ legalName: 'NEW STORE' }).success).toBe(true)
      expect(schema.safeParse({ legalName: 'NEW STORE CONSULTING' }).success).toBe(true)
      expect(schema.safeParse({ legalName: 'ANYTHING GOES' }).success).toBe(true)
    })
  })

  describe('Rule: suffix', () => {
    const businessContext = {
      legalName: 'PACIFIC ENTERPRISES INC',
      legalType: CorpTypeCd.BC_COMPANY
    } as any

    it('should pass when keeping the exact suffix', () => {
      const schema = createTestSchema({ business: businessContext })

      expect(schema.safeParse({ legalName: 'NORTHERN PEAK ENTERPRISES INC' }).success).toBe(true)
      expect(schema.safeParse({ legalName: 'NORTHERN PEAK ENTERPRISES inc' }).success).toBe(false)
    })

    it('should fail when changing to another allowed suffix within the same corp type', () => {
      const schema = createTestSchema({ business: businessContext })

      // Changed from INC to LTD
      const res = schema.safeParse({ legalName: 'NORTHERN PEAK ENTERPRISES LTD' })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.issues[0]!.message).toBe('The business designation INC cannot be changed.')
      }
    })

    it('should fail when removing the suffix', () => {
      const schema = createTestSchema({ business: businessContext })

      const res = schema.safeParse({ legalName: 'NORTHERN PEAK ENTERPRISES' })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.issues[0]!.message).toBe('The business designation INC cannot be changed.')
      }
    })

    it('should fail when the designation is in the middle', () => {
      const schema = createTestSchema({ business: businessContext })

      const res = schema.safeParse({ legalName: 'NORTHERN INC ENTERPRISES' })
      expect(res.success).toBe(false)
    })

    it('should fail when designation lacks a preceding space', () => {
      const schema = createTestSchema({ business: businessContext })

      const res = schema.safeParse({ legalName: 'NORTHERN ENTERPRISESINC' })
      expect(res.success).toBe(false)
    })

    it('should fail when the string is only the designation with no preceding text', () => {
      const schema = createTestSchema({ business: businessContext })

      expect(schema.safeParse({ legalName: 'INC' }).success).toBe(false)
      expect(schema.safeParse({ legalName: '   INC' }).success).toBe(false)
    })

    it('should pass name contains leading or trailing whitespace', () => {
      const schema = createTestSchema({ business: businessContext })

      expect(schema.safeParse({ legalName: '  NORTHERN PEAK ENTERPRISES INC  ' }).success).toBe(true)
    })

    it('should fail if a trailing dot is appended to a suffix that does not have one', () => {
      const schema1 = createTestSchema({ business: { legalName: 'NORTHERN PEAK ENTERPRISES INC' } } as any)
      const res1 = schema1.safeParse({ legalName: 'NORTHERN PEAK ENTERPRISES INC.' })
      expect(res1.success).toBe(false)

      const schema2 = createTestSchema({ business: { legalName: 'NORTHERN PEAK ENTERPRISES LTD' } } as any)
      const res2 = schema2.safeParse({ legalName: 'NORTHERN PEAK ENTERPRISES LTD.' })
      expect(res2.success).toBe(false)
    })
  })
})
