import type { z } from 'zod'

export function getLegalNameRefinement(
  context?: {
    business?: BusinessData | BusinessDataPublic
    filingType?: FilingType
  }
) {
  const t = useNuxtApp().$i18n.t
  return async (
    data: { legalName?: string | null },
    ctx: z.RefinementCtx
  ) => {
    const fallbackMessage = t('validation.designationCannotBeVerified')
    if (!context?.business || !context.filingType) {
      ctx.addIssue({
        code: 'custom',
        path: ['legalName'],
        message: fallbackMessage
      })
      return
    }

    if (!data.legalName?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['legalName'],
        message: t('validation.companyNameRequired')
      })
      return
    }

    const payload = {
      filingType: context.filingType,
      section: 'nameRequest',
      data: {
        legalName: data.legalName
      }
    }

    const res = await useBusinessService()
      .validateFilingSection(
        context.business.identifier,
        payload
      ).catch(() => ({
        isValid: false,
        errors: [{ error: fallbackMessage, path: '/legalName' }]
      }))

    if (!res.isValid) {
      const msg = res.errors?.[0]?.error || fallbackMessage
      ctx.addIssue({
        code: 'custom',
        path: ['legalName'],
        message: msg
      })
    }
  }
}
