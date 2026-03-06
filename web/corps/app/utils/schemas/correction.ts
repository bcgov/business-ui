import { z } from 'zod'

function getClientCorrectionSchema() {
  return z.object({
    certify: getCertifySchema().default({
      isCertified: false,
      legalName: ''
    }),
    folio: getFolioSchema().default({ folioNumber: '' })
  })
}

function getStaffCorrectionSchema() {
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

export function getCorrectionSchema(isStaff: boolean) {
  const t = useNuxtApp().$i18n.t

  const schema = z.object({
    comment: z.string()
      .min(1, t('connect.validation.fieldRequired'))
      .max(4096, t('connect.validation.maxChars', 4096))
      .default(''),
    documentDelivery: getDocumentDeliverySchema().default(() => ({ completingPartyEmail: '' })),
    activeDirector: getActivePartySchema(),
    activeReceiver: getActivePartySchema(RoleTypeUi.RECEIVER),
    activeLiquidator: getActivePartySchema(RoleTypeUi.LIQUIDATOR),
    activeClass: getActiveShareClassSchema(),
    activeSeries: getActiveShareSeriesSchema()
  })

  if (isStaff) {
    return schema.extend(getStaffCorrectionSchema().shape)
  } else {
    return schema.extend(getClientCorrectionSchema().shape)
  }
}

export type CorrectionFormSchema = Partial<
  z.output<ReturnType<typeof getStaffCorrectionSchema>>
  & z.output<ReturnType<typeof getClientCorrectionSchema>>
  & z.output<ReturnType<typeof getCorrectionSchema>>
>
