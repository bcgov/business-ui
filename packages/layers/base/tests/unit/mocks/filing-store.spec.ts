import { describe, it, expect, beforeEach } from 'vitest'
import {
  DEFAULT_FULL_NAME,
  DRAFT_FILING_ID,
  getDraftFilingMock,
  mockAccountType,
  mockBusiness,
  mockFullName,
  mockInitFiling,
  mockIsStaff,
  resetFilingStoreMocks,
  setMockBusiness
} from '#test-mocks/filing-store'

describe('getDraftFilingMock', () => {
  it('should build a draft filing with the shared defaults', () => {
    const draft = getDraftFilingMock<FilingDraftState<CODFiling>>({
      filingName: FilingType.CHANGE_OF_DIRECTORS,
      bodyKey: 'changeOfDirectors'
    })

    expect(draft.filing.header.name).toBe(FilingType.CHANGE_OF_DIRECTORS)
    expect(draft.filing.header.filingId).toBe(DRAFT_FILING_ID)
    expect(draft.filing.header.status).toBe(FilingStatus.DRAFT)
    expect(draft.filing.business).toEqual({ identifier: 'BC1234567', legalType: 'BC' })
    expect(draft.filing.changeOfDirectors).toEqual({})
  })

  it('should apply the body, header, business and filing id overrides', () => {
    const draft = getDraftFilingMock<FilingDraftState<CODFiling>>({
      filingName: FilingType.CHANGE_OF_DIRECTORS,
      bodyKey: 'changeOfDirectors',
      body: { relationships: [] },
      header: { folioNumber: 'ABC-123', status: FilingStatus.PENDING },
      business: { identifier: 'CP1002605', legalType: 'CP' },
      filingId: 123
    })

    expect(draft.filing.changeOfDirectors).toEqual({ relationships: [] })
    expect(draft.filing.header.folioNumber).toBe('ABC-123')
    expect(draft.filing.header.status).toBe(FilingStatus.PENDING)
    expect(draft.filing.header.filingId).toBe(123)
    expect(draft.filing.business).toEqual({ identifier: 'CP1002605', legalType: 'CP' })
  })
})

describe('resetFilingStoreMocks', () => {
  beforeEach(() => {
    resetFilingStoreMocks()
  })

  it('should restore the account, staff, name and business defaults', () => {
    mockIsStaff.value = true
    mockAccountType.value = AccountType.STAFF
    mockFullName.value = 'Someone Else'
    setMockBusiness({ identifier: 'CP1002605', legalType: 'CP' })

    resetFilingStoreMocks()

    expect(mockIsStaff.value).toBe(false)
    expect(mockAccountType.value).toBe(AccountType.PREMIUM)
    expect(mockFullName.value).toBe(DEFAULT_FULL_NAME)
    expect(mockBusiness.value.identifier).toBe('BC1234567')
    expect(mockBusiness.value.legalType).toBe('BC')
  })

  it('should clear the calls and implementations of the vi handles', async () => {
    mockInitFiling.mockResolvedValue({ draftFiling: undefined })
    await mockInitFiling()

    resetFilingStoreMocks()

    expect(mockInitFiling).not.toHaveBeenCalled()
    expect(mockInitFiling()).toBeUndefined()
  })
})

describe('setMockBusiness', () => {
  it('should merge the overrides over the default business', () => {
    setMockBusiness({ legalName: 'TEST COOPERATIVE ASSOCIATION', legalType: 'CP' })

    expect(mockBusiness.value.identifier).toBe('BC1234567')
    expect(mockBusiness.value.legalName).toBe('TEST COOPERATIVE ASSOCIATION')
    expect(mockBusiness.value.legalType).toBe('CP')
    expect(mockBusiness.value.foundingDate).toBeTruthy()
  })
})
