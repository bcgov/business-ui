import { vi } from 'vitest'

/**
 * The mock handles and `mockNuxtImport` factories shared by the filing store specs.
 *
 * NB: `mockNuxtImport` is a build time macro - it only registers when called from the spec file
 * itself, and its factory cannot close over a statically imported binding (the call is hoisted).
 * Register each site from the spec with an async factory that imports the factory dynamically:
 *
 * ```ts
 * mockNuxtImport('useBusinessService', async () => (await import('#test-mocks')).makeBusinessServiceMock)
 * mockNuxtImport('useFiling', async original => (await import('#test-mocks')).makeFilingMock(original))
 * ```
 */

/** The filing id every draft mock and saved draft response carries. */
export const DRAFT_FILING_ID = 987654

/** The signed in user name `createFilingPayload` certifies a filing with. */
export const DEFAULT_FULL_NAME = 'Test User'

const defaultBusiness = {
  identifier: 'BC1234567',
  legalName: 'Test Business Inc.',
  legalType: 'BC',
  foundingDate: '2020-04-05T12:00:00+00:00'
}

export type MockBusiness = typeof defaultBusiness & Record<string, unknown>

/** The business the mocked business store serves - mutate through `setMockBusiness`. */
export const mockBusiness = ref<MockBusiness>({ ...defaultBusiness })

export function setMockBusiness(overrides: Record<string, unknown> = {}) {
  mockBusiness.value = { ...defaultBusiness, ...overrides }
}

export const mockSaveOrUpdateDraftFiling = vi.fn()
export const mockPostFiling = vi.fn()
export const mockInitFiling = vi.fn()
export const mockUpdateAllFees = vi.fn()
export const mockIsStaff = ref(false)
export const mockAccountType = ref<AccountType>(AccountType.PREMIUM)
export const mockFullName = ref(DEFAULT_FULL_NAME)

export const makeBusinessServiceMock = () => ({
  saveOrUpdateDraftFiling: mockSaveOrUpdateDraftFiling,
  postFiling: mockPostFiling
})

/**
 * Mocks only `initFiling` - `createFilingPayload` and the payload helpers run for real so the
 * submitted payload shape is asserted end to end.
 * @param original the original `useFiling` handed to the `mockNuxtImport` factory
 */
export const makeFilingMock = (original?: unknown) => () => {
  const orig = typeof original === 'function' ? original() as Record<string, unknown> : {}
  return {
    ...orig,
    initFiling: mockInitFiling
  }
}

export const makeFilingModalsMock = () => ({
  openGetDraftFilingErrorModal: vi.fn(),
  openInitFilingErrorModal: vi.fn(),
  openSaveFilingErrorModal: vi.fn(),
  openFilingNotAllowedErrorModal: vi.fn()
})

export const makeFeeStoreMock = () => ({
  initFees: vi.fn(),
  addReplaceFee: vi.fn(),
  updateAllFees: mockUpdateAllFees
})

export const makeConnectAuthMock = (fullName?: string) => ({
  authUser: { value: { fullName: fullName ?? mockFullName.value } }
})

export const makeAccountStoreMock = () => ({
  currentAccount: { id: 123, get accountType() { return mockAccountType.value } }
})

/** @param original the original `useBusinessStore` handed to the `mockNuxtImport` factory */
export const makeBusinessStoreMock = (original?: unknown) => () => {
  const orig = typeof original === 'function' ? original() as Record<string, unknown> : {}
  return {
    ...orig,
    get business() { return mockBusiness.value },
    get businessIdentifier() { return mockBusiness.value.identifier },
    isBaseCompany: vi.fn().mockReturnValue(true),
    isAllowedFiling: vi.fn().mockReturnValue(true)
  }
}

export const makeIsStaffMock = () => mockIsStaff

/** Clears every handle and restores the account, staff and business defaults. */
export function resetFilingStoreMocks() {
  mockSaveOrUpdateDraftFiling.mockReset()
  mockPostFiling.mockReset()
  mockInitFiling.mockReset()
  mockUpdateAllFees.mockReset()
  mockIsStaff.value = false
  mockAccountType.value = AccountType.PREMIUM
  mockFullName.value = DEFAULT_FULL_NAME
  setMockBusiness()
}
