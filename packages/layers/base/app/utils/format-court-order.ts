export function formatCourtOrderUi(courtOrder: CourtOrder): CourtOrderPoaSchema {
  return {
    courtOrderNumber: courtOrder.fileNumber,
    hasPoa: !!courtOrder.hasPlanOfArrangement
  }
}

export function formatCourtOrderApi(courtOrder: CourtOrderPoaSchema): CourtOrder {
  return {
    fileNumber: courtOrder.courtOrderNumber ?? '',
    hasPlanOfArrangement: !!courtOrder.hasPoa
  }
}
