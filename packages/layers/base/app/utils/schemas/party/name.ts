import { z } from 'zod'
import type { FormPartyName } from '#components'

export function getPartyNameSchema() {
  const t = useNuxtApp().$i18n.t

  const personNameSchema = z.object({
    firstName: z.string().max(20, t('connect.validation.maxChars', { count: 20 })),
    middleName: z.string().max(20, t('connect.validation.maxChars', { count: 20 })),
    lastName: z.string().min(1, t('validation.fieldRequired')).max(30, t('connect.validation.maxChars', { count: 30 }))
    // preferredName: z.string().max(50, t('connect.validation.maxChars', { count: 50 })),
    // hasPreferredName: z.boolean()
  })

  const orgNameSchema = z.object({
    businessName: z.string()
      .min(1, t('validation.fieldRequired'))
      .max(150, t('connect.validation.maxChars', { count: 150 }))
  })

  const schemaMap = {
    [PartyType.PERSON]: personNameSchema,
    [PartyType.ORGANIZATION]: orgNameSchema
  }

  return z.object({
    partyType: z.enum(PartyType),
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    // preferredName: z.string().optional(),
    // hasPreferredName: z.boolean().optional(),
    businessName: z.string().optional()
  }).superRefine((val, ctx) => {
    const partyType = val.partyType
    const schema = schemaMap[partyType]

    const result = schema.safeParse(val)
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue({ ...issue })
      })
    }
  })
}

export type PartyNameSchema = z.output<ReturnType<typeof getPartyNameSchema>>

export type FormPartyNameRef = InstanceType<typeof FormPartyName>
