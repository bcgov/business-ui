import { DRAFT_FILING_ID } from './handles'

export interface DraftFilingMockOptions {
  /** The filing name written to `header.name` - validated when a draft is resumed. */
  filingName: FilingType
  /** The filing body key, eg `changeOfDirectors`. */
  bodyKey: string
  body?: Record<string, unknown>
  header?: Record<string, unknown>
  business?: Record<string, unknown>
  filingId?: number
}

/** A draft filing as returned by legal-api GET /businesses/:identifier/filings/:filingId. */
export function getDraftFilingMock<T>({
  filingName,
  bodyKey,
  body = {},
  header = {},
  business = {},
  filingId = DRAFT_FILING_ID
}: DraftFilingMockOptions): T {
  return {
    filing: {
      header: {
        name: filingName,
        filingId,
        status: FilingStatus.DRAFT,
        ...header
      },
      business: {
        identifier: 'BC1234567',
        legalType: 'BC',
        ...business
      },
      [bodyKey]: body
    }
  } as T
}
