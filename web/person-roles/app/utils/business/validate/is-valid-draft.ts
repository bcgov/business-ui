/* eslint-disable @typescript-eslint/no-explicit-any */ // allow any for typeguard function
export function isValidDraft<T extends string, P>(
  filingName: T,
  response: any
): response is FilingGetByIdResponse<T, P> {
  const isDraft = response?.filing?.header?.status === FilingStatus.DRAFT
  const hasFilingData = !!response?.filing?.[filingName]

  return isDraft && hasFilingData
}
