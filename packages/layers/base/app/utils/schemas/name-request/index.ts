import { z } from 'zod'
import type { FormNameRequestNumber } from '#components'
import { CorrectNameOption } from '#imports'

export const NR_NUM_REGEX = /^(NR)?\s*(\d{7})$/i

// Name Request schema used in business filings
export function getNameRequestSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    changeOption: z.enum(CorrectNameOption).optional(),
    changeToNumbered: z.boolean().default(false),
    legalName: z.string().default(''),
    nrNumber: z.string().default('')
  }).superRefine((data, ctx) => {
    const option = data.changeOption

    if (!option) {
      return
    }

    switch (option) {
      case CorrectNameOption.CORRECT_NAME:
        if (!data.legalName.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['legalName'],
            message: t('validation.companyNameRequired')
          })
        }
        break
      case CorrectNameOption.CORRECT_NAME_TO_NUMBER:
        // safety check, should be updating the model when this option is selected
        if (!data.legalName.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['legalName'],
            message: t('validation.companyNameRequired')
          })
        }
        break
      case CorrectNameOption.CORRECT_NEW_NR:
        const nrNum = data.nrNumber.trim()
        if (!nrNum) {
          console.log('validating nr num required: ', nrNum)
          ctx.addIssue({
            code: 'custom',
            path: ['nrNumber'],
            message: t('validation.nrNumber.required')
          })
          return
        }
        if (!NR_NUM_REGEX.test(nrNum)) {
          console.log('validating nr num invalid: ', nrNum)
          ctx.addIssue({
            code: 'custom',
            path: ['nrNumber'],
            message: t('validation.nrNumber.invalid')
          })
          return
        }
        break
      // FUTURE: update last 2 enums as necessary
      // case CorrectNameOption.CORRECT_AML_ADOPT:  
      // case CorrectNameOption.CORRECT_AML_NUMBERED:  
      default:
        break
    }
  })
}

export function getActiveNameRequestSchema() {
  return getNameRequestSchema().nullable().optional()
}

export type NameRequestSchema = z.output<ReturnType<typeof getNameRequestSchema>>

export type ActiveNameRequestSchema = z.output<ReturnType<typeof getActiveNameRequestSchema>>

export type FormNameRequestNumberRef = InstanceType<typeof FormNameRequestNumber>
