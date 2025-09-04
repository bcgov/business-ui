import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

let mockTombstoneState: Ref<ConnectTombstoneState>
const mockResetFn = vi.fn()

mockNuxtImport('useConnectTombstone', () => {
  return vi.fn((stateKey: string) => {
    if (stateKey === 'business-filing-tombstone') {
      return {
        tombstone: mockTombstoneState,
        $reset: mockResetFn
      }
    }
    return { tombstone: ref({}), $reset: vi.fn() }
  })
})

const mockBusiness = {
  legalName: 'Test Business Inc.',
  identifier: 'BC1234567',
  taxId: '987654321'
} as BusinessData

const mockAuthInfo = {
  corpType: { desc: 'BC Limited Company' },
  contacts: [{
    email: 'test@example.com',
    phone: '555-123-4567',
    extension: '123'
  }]
} as unknown as AuthInformation

describe('useFilingTombstone', () => {
  beforeEach(() => {
    // @ts-expect-error - type too large
    mockTombstoneState = ref({} as ConnectTombstoneState)
    vi.clearAllMocks()
  })

  it('returns the tombstone state and reset function', () => {
    const { filingTombstone, resetFilingTombstone } = useFilingTombstone()

    expect(filingTombstone).toBe(mockTombstoneState)

    resetFilingTombstone()
    expect(mockResetFn).toHaveBeenCalledOnce()
  })

  it('setFilingDefault sets the correct data', () => {
    const { setFilingDefault } = useFilingTombstone()

    setFilingDefault(mockBusiness, mockAuthInfo)

    const state = mockTombstoneState.value
    expect(state.loading).toBe(false)
    expect(state.title.text).toBe('Test Business Inc.')
    expect(state.subtitles[0]!.text).toBe('BC Limited Company')
    expect(state.sideDetails).toEqual([
      { label: 'Business Number', value: '987654321' },
      { label: 'Incorporation Number', value: 'BC1234567' },
      { label: 'Email', value: 'test@example.com' },
      { label: 'Phone', value: '555-123-4567 Ext: 123' }
    ])
  })

  it('fallsback to "Not Available" when missing values', () => {
    const { setFilingDefault } = useFilingTombstone()
    const incompleteBusiness: BusinessData = { ...mockBusiness, taxId: undefined }
    const incompleteAuth = { ...mockAuthInfo, contacts: [{}] } as AuthInformation

    setFilingDefault(incompleteBusiness, incompleteAuth)

    const state = mockTombstoneState.value
    expect(state.sideDetails).toEqual([
      { label: 'Business Number', value: 'Not Available' },
      { label: 'Incorporation Number', value: 'BC1234567' },
      { label: 'Email', value: 'Not Available' },
      { label: 'Phone', value: 'Not Available' }
    ])
  })

  it('displays phone number correctly with no extension', () => {
    const { setFilingDefault } = useFilingTombstone()
    const noExtAuth: AuthInformation = {
      ...mockAuthInfo,
      contacts: [{ phone: '555-111-2222' }]
    } as AuthInformation

    setFilingDefault(mockBusiness, noExtAuth)

    const phoneDetail = mockTombstoneState.value.sideDetails.find(d => d.label === 'Phone')
    expect(phoneDetail?.value).toBe('555-111-2222')
  })

  it('displays phone extension with phoneExtension attribute', () => {
    const { setFilingDefault } = useFilingTombstone()
    const phoneExtAuth: AuthInformation = {
      ...mockAuthInfo,
      contacts: [{ phone: '555-333-4444', phoneExtension: '456' }]
    } as AuthInformation

    setFilingDefault(mockBusiness, phoneExtAuth)

    const phoneDetail = mockTombstoneState.value.sideDetails.find(d => d.label === 'Phone')
    expect(phoneDetail?.value).toBe('555-333-4444 Ext: 456')
  })

  it('displays phone extension with extension attribute', () => {
    const { setFilingDefault } = useFilingTombstone()
    const phoneExtAuth: AuthInformation = {
      ...mockAuthInfo,
      contacts: [{ phone: '555-333-4444', extension: 123 }]
    } as AuthInformation

    setFilingDefault(mockBusiness, phoneExtAuth)

    const phoneDetail = mockTombstoneState.value.sideDetails.find(d => d.label === 'Phone')
    expect(phoneDetail?.value).toBe('555-333-4444 Ext: 123')
  })

  it('sets loading to false when finished loading', () => {
    const { setFilingDefault, filingTombstone } = useFilingTombstone()

    filingTombstone.value.loading = false

    setFilingDefault(mockBusiness, mockAuthInfo)

    expect(filingTombstone.value.loading).toBe(false)
  })
})
