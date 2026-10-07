import { z } from 'zod'
import type { FormForeignJurisdiction } from '#components'

/**
 * Mirrors legal-api's validate_foreign_jurisdiction rules: country required (ISO alpha-2);
 * CA/US require a region; the CA region can never be BC (FEDERAL is allowed - the menu
 * provides it); other countries carry no region (the form clears it on country change).
 */
export function getForeignJurisdictionSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    country: z.string().min(1, t('validation.jurisdictionCountryRequired')),
    region: z.string().optional()
  }).superRefine((val, ctx) => {
    if ((val.country === 'CA' || val.country === 'US') && !val.region) {
      ctx.addIssue({
        code: 'custom',
        message: t('validation.jurisdictionRegionRequired'),
        path: ['region']
      })
    }

    if (val.country === 'CA' && val.region === 'BC') {
      ctx.addIssue({
        code: 'custom',
        message: t('validation.jurisdictionRegionNotBc'),
        path: ['region']
      })
    }
  })
}

export type ForeignJurisdictionSchema = z.output<ReturnType<typeof getForeignJurisdictionSchema>>

export type FormForeignJurisdictionRef = InstanceType<typeof FormForeignJurisdiction>
