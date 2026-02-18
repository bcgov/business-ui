import { z } from 'zod'

function getClientTransitionSchema() {
  return z.object({
    certify: getCertifySchema().default({
      isCertified: false,
      legalName: ''
    }),
    folio: getFolioSchema().default({ folioNumber: '' })
  })
}

function getStaffTransitionSchema() {
  return z.object({
    courtOrder: getCourtOrderPoaSchema().default(() => ({
      hasPoa: false,
      courtOrderNumber: ''
    })),
    staffPayment: getStaffPaymentSchema().default(() => ({
      option: StaffPaymentOption.NONE,
      bcolAccountNumber: '',
      datNumber: '',
      routingSlipNumber: '',
      folioNumber: '',
      isPriority: false
    }))
  })
}

export function getTransitionSchema(isStaff: boolean) {
  const schema = z.object({
    documentDelivery: getDocumentDeliverySchema().default(() => ({ completingPartyEmail: '' })),
    activeDirector: getActivePartySchema(),
    activeClass: getActiveShareClassSchema(),
    activeSeries: getActiveShareSeriesSchema(),
    confirmOffices: z.boolean()
      .default(true)
      .refine(val => val === true),
    confirmDirectors: z.boolean()
      .default(true)
      .refine(val => val === true)
  })

  if (isStaff) {
    return schema.extend(getStaffTransitionSchema().shape)
  } else {
    return schema.extend(getClientTransitionSchema().shape)
  }
}

export function getTransitionStep1Schema() {
  const t = useNuxtApp().$i18n.t
  return z.object({
    activeDirector: getActivePartySchema(),
    activeClass: getActiveShareClassSchema(),
    activeSeries: getActiveShareSeriesSchema(),
    confirmOffices: z.boolean()
      .default(true)
      .refine(val => val === true, t('connect.validation.required')),
    confirmDirectors: z.boolean()
      .default(true)
      .refine(val => val === true, t('connect.validation.required'))
  })
}

export type TransitionFormSchema = Partial<
  z.output<ReturnType<typeof getStaffTransitionSchema>>
  & z.output<ReturnType<typeof getClientTransitionSchema>>
  & z.output<ReturnType<typeof getTransitionSchema>>
>
