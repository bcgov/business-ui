import { z } from 'zod'

export function getDocumentIdSchema(statusCode?: number) {
  const t = useNuxtApp().$i18n.t

  return z.object({
    documentIdNumber: z.preprocess(
      val => val === '' ? undefined : val,
      z.string().min(8, t('connect.validation.minChars', { count: 8 })).optional()
    )
  }).superRefine((data, ctx) => {
    // Only run if we have a documentIdNumber and a statusCode
    if (data.documentIdNumber && statusCode) {
      if (statusCode === 400) {
        ctx.addIssue({
          code: 'custom',
          path: ['documentIdNumber'],
          message: 'The number entered is not recognized in our system.'
        })
      }
      if (statusCode === 200) {
        ctx.addIssue({
          code: 'custom',
          path: ['documentIdNumber'],
          message: 'A document record already exists with this document ID.'
        })
      }
      // 404 means valid, so no issue
    }
  })
}


