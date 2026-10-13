import type { BusinessOverride } from '#test-mocks'

/** The business, parties, addresses and auth mocks themselves live in the base layer (`#test-mocks`). */
export const COOP_IDENTIFIER = 'CP1002605'

/** The annual report year under test - kept relative to today so the mocks don't go stale. */
export const COOP_AR_YEAR = new Date().getFullYear()

/**
 * Overrides that turn the base layer business mock into an active CP cooperative association.
 */
export function getCoopBusinessOverrides(overrides: BusinessOverride[] = []): BusinessOverride[] {
  return [
    { key: 'identifier', value: COOP_IDENTIFIER },
    { key: 'legalType', value: 'CP' },
    { key: 'legalName', value: 'PLAYWRIGHT TEST COOPERATIVE ASSOCIATION' },
    { key: 'foundingDate', value: '1998-08-26T07:00:00+00:00' },
    { key: 'arMinDate', value: `${COOP_AR_YEAR}-01-01` },
    { key: 'arMaxDate', value: `${COOP_AR_YEAR}-12-31` },
    { key: 'lastAnnualGeneralMeetingDate', value: `${COOP_AR_YEAR - 1}-04-15` },
    { key: 'lastAnnualReportDate', value: `${COOP_AR_YEAR - 1}-04-15` },
    { key: 'lastAddressChangeDate', value: `${COOP_AR_YEAR - 1}-04-15` },
    { key: 'lastDirectorChangeDate', value: `${COOP_AR_YEAR - 1}-04-15` },
    { key: 'nextAnnualReport', value: `${COOP_AR_YEAR}-01-01T08:00:00+00:00` },
    { key: 'goodStanding', value: true },
    { key: 'adminFreeze', value: false },
    { key: 'inDissolution', value: false },
    { key: 'complianceWarnings', value: [] },
    { key: 'warnings', value: [] },
    ...overrides
  ]
}
