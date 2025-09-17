/* eslint-disable @typescript-eslint/no-explicit-any */ // allow any for typeguard function
/**
 * A type guard that validates if an API response is a valid and usable draft filing.
 *
 * This function checks two main conditions:
 * 1. The filing's header status is 'DRAFT'.
 * 2. The filing object contains the specific data object (e.g., 'changeOfOfficers').
 *
 * If this function returns true, TypeScript will correctly narrow the type of the
 * `response` object to `FilingGetByIdResponse<F>`, allowing for safe access to its properties.
 *
 * @param filingName - The key of the specific filing data to check for (e.g., 'changeOfOfficers').
 * @param response - The raw API response, typically of type `unknown` or `any`.
 * @returns `true` if the response is a valid draft filing, otherwise `false`.
 *
 * @example
 * const rawResponse = await api.getFiling(id);
 * if (isValidDraft('changeOfOfficers', rawResponse)) {
 * // Inside this block, `rawResponse` is now correctly typed.
 * const officers = rawResponse.filing.changeOfOfficers;
 * }
*/
export function isValidDraft<F extends Record<string, unknown>>(
  filingName: string,
  response: any
): response is FilingGetByIdResponse<F> {
  const isDraft = response?.filing?.header?.status === FilingStatus.DRAFT
  const hasFilingData = !!response?.filing?.[filingName]

  return isDraft && hasFilingData
}
