import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { delay } from 'es-toolkit'

const mockBusiness = {
  legalName: 'Test Business Inc.',
  legalType: 'BC',
  identifier: 'BC1234567',
  taxId: '987654321'
} as BusinessData

const incompleteBusiness: BusinessData = { ...mockBusiness, taxId: undefined }

const mockAuthInfo = (identifier: string) => {
  const auth = {
    corpType: { desc: 'BC Limited Company' },
    contacts: [{
      email: 'test@example.com',
      phone: '555-123-4567',
      extension: '123'
    }]
  } as unknown as AuthInformation

  switch (identifier) {
    case 'incomplete':
      return ({ ...auth, contacts: [{}] } as AuthInformation)
    case 'noExtension':
      return ({ ...auth, contacts: [{ phone: '555-111-2222' }] } as AuthInformation)
    case 'phoneExtension':
      return ({ ...auth, contacts: [{ phone: '555-333-4444', phoneExtension: '456' }] } as AuthInformation)
    case 'extension':
      return ({ ...auth, contacts: [{ phone: '555-333-4444', extension: 123 }] } as AuthInformation)
    case 'full':
    default:
      return auth
  }
}

mockNuxtImport('useBusinessApi', () => {
  return vi.fn(() => {
    return {
      getBusiness: vi.fn((identifier: string) => {
        const state = { data: {
          value: { business: identifier === 'full' ? mockBusiness : incompleteBusiness } } }
        return {
          ...state,
          refresh: vi.fn(async () => setTimeout(() => (state)))
        }
      }),
      getAuthInfo: vi.fn((identifier: string) => {
        const state = { data: { value: mockAuthInfo(identifier) } }
        return {
          ...state,
          refresh: vi.fn(async () => setTimeout(() => (state)))
        }
      })
    }
  })
})

describe('useFilingTombstone', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('setFilingDefault sets the correct data', async () => {
    const { setFilingDefault } = useBusinessTombstone()

    setFilingDefault('full')

    const { businessTombstone } = useBusinessTombstone()

    const state = businessTombstone.value
    expect(state.loading).toBe(true)
    await delay(2)
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

  it('fallsback to "Not Available" when missing values', async () => {
    const { businessTombstone, setFilingDefault } = useBusinessTombstone()

    setFilingDefault('incomplete')

    const state = businessTombstone.value
    await delay(2)
    expect(state.sideDetails).toEqual([
      { label: 'Business Number', value: 'Not Available' },
      { label: 'Incorporation Number', value: 'BC1234567' },
      { label: 'Email', value: 'Not Available' },
      { label: 'Phone', value: 'Not Available' }
    ])
  })

  it('displays phone number correctly with no extension', async () => {
    const { businessTombstone, setFilingDefault } = useBusinessTombstone()

    setFilingDefault('noExtension')

    const state = businessTombstone.value
    await delay(2)
    const phoneDetail = state.sideDetails.find(d => d.label === 'Phone')
    expect(phoneDetail?.value).toBe('555-111-2222')
  })

  it('displays phone extension with phoneExtension attribute', async () => {
    const { businessTombstone, setFilingDefault } = useBusinessTombstone()
    setFilingDefault('phoneExtension')

    const state = businessTombstone.value
    await delay(2)
    const phoneDetail = state.sideDetails.find(d => d.label === 'Phone')
    expect(phoneDetail?.value).toBe('555-333-4444 Ext: 456')
  })

  it('displays phone extension with extension attribute', async () => {
    const { businessTombstone, setFilingDefault } = useBusinessTombstone()
    setFilingDefault('extension')

    const state = businessTombstone.value
    await delay(2)

    const phoneDetail = state.sideDetails.find(d => d.label === 'Phone')
    expect(phoneDetail?.value).toBe('555-333-4444 Ext: 123')
  })
})
