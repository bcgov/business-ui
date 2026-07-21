// These filings do not require a resolution date to alter the share structure
export const NO_RESOLUTION_FILING_TYPES = [
  FilingType.AMALGAMATION_APPLICATION,
  FilingType.AMALGAMATION_OUT,
  FilingType.ANNUAL_REPORT,
  FilingType.CONSENT_AMALGAMATION_OUT,
  FilingType.CONSENT_CONTINUATION_OUT,
  FilingType.CONTINUATION_IN,
  FilingType.CONTINUATION_OUT,
  FilingType.CHANGE_OF_DIRECTORS,
  FilingType.INCORPORATION_APPLICATION,
  FilingType.TRANSITION
]

export function isResolutionFiling(filingType: FilingType): boolean {
  return !NO_RESOLUTION_FILING_TYPES.includes(filingType)
}
