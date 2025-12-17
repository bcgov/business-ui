import { z } from 'zod'

export function getDocumentIdSchema(statusCode?: number) {
  const t = useNuxtApp().$i18n.t

  return z.object({
    documentIdNumber: z.preprocess(
      val => val === '' ? undefined : val,
      z.string().length(8, t('validation.exactDocIDChars')).optional()
    )
  }).superRefine((data, ctx) => {
    // Only run if we have a documentIdNumber and a statusCode
    if (data.documentIdNumber && statusCode) {
      if (statusCode === 400) {
        ctx.addIssue({
          code: 'custom',
          path: ['documentIdNumber'],
          message: t('validation.invalidDocId')
        })
      }
      if (statusCode === 200) {
        ctx.addIssue({
          code: 'custom',
          path: ['documentIdNumber'],
          message: t('validation.duplicateDocId')
        })
      }
      // 404 means valid, so no issue
    }
  })
}
