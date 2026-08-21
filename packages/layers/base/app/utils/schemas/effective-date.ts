import type { z } from 'zod'
import type { FormEffectiveDate } from '#components'
import type { getDateSchema } from '#base/app/utils/schemas/date'

export type EffectiveDateSchema = z.output<ReturnType<typeof getDateSchema>>
export type FormEffectiveDateRef = InstanceType<typeof FormEffectiveDate>
