import type { z } from 'zod'
import type { FormEffectiveDate, FormEffectiveDateField, FormEffectiveDateRange } from '#components'
import type { getDateSchema } from '#base/app/utils/schemas/date'

export type EffectiveDateSchema = z.output<ReturnType<typeof getDateSchema>>
export type FormEffectiveDateRef = InstanceType<typeof FormEffectiveDate>
export type FormEffectiveDateFieldRef = InstanceType<typeof FormEffectiveDateField>
export type FormEffectiveDateRangeRef = InstanceType<typeof FormEffectiveDateRange>

// one limit on a date field - a field can have several per side (e.g. on or after both the founding
// date and the start date), each with its own message
export interface DateBound {
  date?: string // yyyy-MM-dd; empty or invalid bounds are ignored
  message?: string // defaults to 'Date must be on or after/before {date}'
}

export interface DateBounds {
  min?: DateBound[]
  max?: DateBound[]
}
