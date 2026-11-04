/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLegalNameRefinement } from '#business/app/utils/schemas/your-company/legal-name-refinement'
import { z } from 'zod'
import { describe, it, expect, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockBusinessService = {
  validateFilingSection: vi.fn().mockResolvedValue({ isValid: true, errors: [] })
}

mockNuxtImport('useBusinessService', () => () => mockBusinessService)

function createTestSchema(context?: Parameters<typeof getLegalNameRefinement>[0]) {
  return z
    .object({
      legalName: z.string().optional()
    })
    .superRefine(getLegalNameRefinement(context))
}

const context = {
  business: {
    legalName: 'TEST COMPANY INC',
    identifier: 'BC1234567'
  },
  filingType: FilingType.CORRECTION
} as any

describe('getLegalNameRefinement', () => {
  it('should fail when new legalName is empty or whitespace only', async () => {
    const schema = createTestSchema(context)

    const emptyRes = await schema.safeParseAsync({ legalName: '' })
    expect(emptyRes.success).toBe(false)
    expect(emptyRes.error!.issues[0]!.message).toBe('A company name is required')

    const whitespaceRes = await schema.safeParseAsync({ legalName: '   ' })
    expect(whitespaceRes.success).toBe(false)
    expect(whitespaceRes.error!.issues[0]!.message).toBe('A company name is required')
  })

  it('should fail when new missing required validation context', async () => {
    const noContext = await createTestSchema().safeParseAsync({ legalName: 'Valid Name LTD' })
    expect(noContext.success).toBe(false)
    expect(noContext.error!.issues[0]!.message)
      .toBe('Legal name edits are disabled: business designation could not be verified.')

    const noBusinessRes = await createTestSchema({ filingType: context.filingType })
      .safeParseAsync({ legalName: 'Valid Name LTD' })
    expect(noBusinessRes.success).toBe(false)
    expect(noBusinessRes.error!.issues[0]!.message)
      .toBe('Legal name edits are disabled: business designation could not be verified.')

    const noFilingType = await createTestSchema({ business: context.business })
      .safeParseAsync({ legalName: 'Valid Name LTD' })
    expect(noFilingType.success).toBe(false)
    expect(noFilingType.error!.issues[0]!.message)
      .toBe('Legal name edits are disabled: business designation could not be verified.')
  })

  it('should validate against the business api', async () => {
    await createTestSchema(context).safeParseAsync({ legalName: 'Valid Name LTD' })
    expect(mockBusinessService.validateFilingSection).toHaveBeenCalledWith(
      context.business.identifier,
      {
        data: {
          legalName: 'Valid Name LTD'
        },
        filingType: 'correction',
        section: 'nameRequest'
      }
    )
  })
})
