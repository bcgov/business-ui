/* eslint-disable @typescript-eslint/no-explicit-any */ // allow any for typeguard function
export function isValidDraft<F extends Record<string, unknown>>(
  filingName: string,
  response: any
): response is FilingGetByIdResponse<F> {
  const isDraft = response?.filing?.header?.status === FilingStatus.DRAFT
  const hasFilingData = !!response?.filing?.[filingName]

  return isDraft && hasFilingData
}
