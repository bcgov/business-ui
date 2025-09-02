import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockLegalApi = vi.fn()
mockNuxtImport('useNuxtApp', () => {
  return () => ({
    $businessApi: mockLegalApi
  })
})

mockNuxtImport('useConnectAuth', () => {
  return () => ({
    authUser: { value: { fullName: 'Test User' } }
  })
})

mockNuxtImport('useConnectAccountStore', () => {
  return () => ({
    currentAccount: { id: 123 }
  })
})

describe('useBusinessApi', () => {
  const businessApi = useBusinessApi()

  beforeEach(() => {
    vi.clearAllMocks()
    const mockDate = new Date('2025-06-24T02:00:00.000Z')
    vi.setSystemTime(mockDate)
  })

  describe('createFilingPayload', () => {
    const business = {
      identifier: 'BC123',
      foundingDate: '2022-01-01T12:00:00Z',
      legalName: 'Test Inc',
      legalType: 'BC'
    } as BusinessData

    test('should construct a valid payload for a single filing type', () => {
      const filingName = 'changeOfOfficers'
      const payload = { relationships: [{ entity: { givenName: 'Test' } }] }

      const result = businessApi.createFilingPayload(business, filingName, { [filingName]: payload })

      expect(result).toHaveProperty('filing')
      const filing = result.filing

      expect(filing.header.name).toBe('changeOfOfficers')
      expect(filing.header.certifiedBy).toBe('Test User')
      expect(filing.header.accountId).toBe(123)
      expect(filing.header.type).toBe(FilingHeaderType.LEGAL)

      expect(filing.business.identifier).toBe(business.identifier)
      expect(filing.business.foundingDate).toBe(business.foundingDate)
      expect(filing.business.legalName).toBe(business.legalName)
      expect(filing.business.legalType).toBe(business.legalType)

      // filing data
      expect(filing).toHaveProperty('changeOfOfficers')
      expect(filing.changeOfOfficers).toEqual(payload)
    })

    test('should construct a valid payload for multiple filing types', () => {
      const filings = {
        changeOfOfficers: { relationships: [{ entity: { givenName: 'Officer' } }] },
        changeOfAddress: { deliveryAddress: { street: '123 Main' } }
      }

      const result = businessApi.createFilingPayload(business, 'changeOfOfficers', filings)
      const filing = result.filing

      expect(filing.header.name).toBe('changeOfOfficers')

      // filing data
      expect(filing).toHaveProperty('changeOfOfficers')
      expect(filing).toHaveProperty('changeOfAddress')
      expect(filing.changeOfAddress.deliveryAddress.street).toBe('123 Main')
    })
  })

  describe('getBusiness', () => {
    test('should fetch full business data by default', async () => {
      const businessId = 'BC123'
      mockLegalApi.mockResolvedValue({ business: { legalName: 'Full Business' } })

      await businessApi.getBusiness(businessId)

      expect(mockLegalApi).toHaveBeenCalledWith(`businesses/${businessId}`, { query: undefined })
    })

    test('should fetch slim business data when specified', async () => {
      const businessId = 'BC123'
      mockLegalApi.mockResolvedValue({ business: { legalName: 'Slim Business' } })

      await businessApi.getBusiness(businessId, true)

      expect(mockLegalApi).toHaveBeenCalledWith(`businesses/${businessId}`, { query: { slim: true } })
    })
  })

  describe('getParties', () => {
    test('should fetch parties with a given query', async () => {
      const businessId = 'BC123'
      const query = { classType: 'officer' }
      mockLegalApi.mockResolvedValue({ parties: [] })

      await businessApi.getParties(businessId, query)

      expect(mockLegalApi).toHaveBeenCalledWith(`businesses/${businessId}/parties`, { query })
    })
  })

  describe('postFiling', () => {
    test('should call the correct endpoint with POST and a fully constructed body', async () => {
      const business = {
        identifier: 'BC123', foundingDate: '2022-01-01', legalName: 'Test Inc', legalType: 'BC'
      } as BusinessData
      const payload = businessApi.createFilingPayload(
        business,
        'changeOfOfficers',
        { changeOfOfficers: { relationships: [{ entity: { givenName: 'Test' } }] } }
      )

      mockLegalApi.mockResolvedValue({ filing: { header: { name: 'changeOfOfficers' } } })

      await businessApi.postFiling(business.identifier, payload)

      expect(mockLegalApi).toHaveBeenCalledOnce()
      expect(mockLegalApi).toHaveBeenCalledWith(
        `businesses/${business.identifier}/filings`,
        expect.objectContaining({
          method: 'POST'
        })
      )

      // @ts-expect-error - mockLegalApi.mock.calls may be undefined
      const sentBody = mockLegalApi.mock.calls[0][1].body
      expect(sentBody.filing.header.name).toBe('changeOfOfficers')
      expect(sentBody.filing.business.identifier).toBe('BC123')
      expect(sentBody.filing.changeOfOfficers).toEqual({ relationships: [{ entity: { givenName: 'Test' } }] })
    })
  })

  describe('saveOrUpdateDraftFiling', () => {
    const business = {
      identifier: 'BC123', foundingDate: '2022-01-01', legalName: 'Test Inc', legalType: 'BC'
    } as BusinessData

    const payload = businessApi.createFilingPayload(
      business,
      'changeOfOfficers',
      { data: 'test' }
    )

    test('should make a POST request to create a new draft', async () => {
      mockLegalApi.mockResolvedValue({ filing: {} })

      await businessApi.saveOrUpdateDraftFiling(business.identifier, payload, false)

      expect(mockLegalApi).toHaveBeenCalledWith(
        `businesses/${business.identifier}/filings`,
        expect.objectContaining({
          method: 'POST',
          query: { draft: true },
          body: expect.any(Object)
        })
      )
    })

    test('should make a PUT request to update an existing draft', async () => {
      const filingId = 999
      mockLegalApi.mockResolvedValue({ filing: {} })

      await businessApi.saveOrUpdateDraftFiling(business.identifier, payload, false, filingId)

      expect(mockLegalApi).toHaveBeenCalledWith(
        `businesses/${business.identifier}/filings/${filingId}`,
        expect.objectContaining({
          method: 'PUT',
          query: { draft: true },
          body: expect.any(Object)
        })
      )
    })

    test('should submit a final filing (not a draft) when isSubmission is true', async () => {
      mockLegalApi.mockResolvedValue({ filing: {} })

      await businessApi.saveOrUpdateDraftFiling(business.identifier, payload, true)

      expect(mockLegalApi).toHaveBeenCalledWith(
        `businesses/${business.identifier}/filings`,
        expect.objectContaining({
          method: 'POST',
          query: undefined, // The draft query param should be undefined
          body: expect.any(Object)
        })
      )
    })

    test('should build the filing body correctly', async () => {
      mockLegalApi.mockResolvedValue({ filing: {} })

      await businessApi.saveOrUpdateDraftFiling(business.identifier, payload, false)

      // @ts-expect-error - mockLegalApi.mock.calls may be undefined
      const sentBody = mockLegalApi.mock.calls[0][1].body
      expect(sentBody.filing.header.name).toBe('changeOfOfficers')
      expect(sentBody.filing.business.identifier).toBe('BC123')
    })
  })

  describe('getTasks', () => {
    test('should call the tasks endpoint and return the response', async () => {
      const businessId = 'BC123'
      const mockResponse = { tasks: [{ task: { todo: { header: { name: 'Test Todo' } } } }] } as TaskGetResponse
      mockLegalApi.mockResolvedValue(mockResponse)

      const result = await businessApi.getTasks(businessId)

      expect(mockLegalApi).toHaveBeenCalledOnce()
      expect(mockLegalApi).toHaveBeenCalledWith(`businesses/${businessId}/tasks`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getPendingTask', () => {
    test('should find and return a pending filing task', async () => {
      const mockTasksResponse = {
        tasks: [
          { task: { filing: { header: { status: FilingStatus.DRAFT } } } },
          { task: { todo: { header: { status: FilingStatus.NEW } } } }
        ]
      } as TaskGetResponse

      mockLegalApi.mockResolvedValue(mockTasksResponse)

      const result = await businessApi.getPendingTask('BC123', 'filing')

      expect(result).toBeDefined()
      expect(result?.filing.header.status).toBe(FilingStatus.DRAFT)
      expect(mockLegalApi).toHaveBeenCalledOnce()
      expect(mockLegalApi).toHaveBeenCalledWith('businesses/BC123/tasks')
    })

    test('should return undefined if no pending tasks of the specified type are found', async () => {
      const mockTasksResponse = {
        tasks: [
          { task: { filing: { header: { status: FilingStatus.NEW } } } },
          { task: { todo: { header: { status: FilingStatus.COMPLETED } } } }
        ]
      }
      mockLegalApi.mockResolvedValue(mockTasksResponse)

      const result = await businessApi.getPendingTask('BC123', 'filing')

      expect(result).toBeUndefined()
    })
  })

  describe('getAndValidateDraftFiling', () => {
    test('should return isValid: true and data when draft is valid', async () => {
      const mockFilingResponse = {
        filing: { header: { status: 'DRAFT', name: 'changeOfOfficers' }, changeOfOfficers: {} }
      }
      mockLegalApi.mockResolvedValue(mockFilingResponse)

      const result = await businessApi.getAndValidateDraftFiling('BC123', 999, 'changeOfOfficers')

      expect(result.isValid).toBe(true)
      expect(result.data).toEqual(mockFilingResponse)
    })

    test('should return isValid: false when draft is invalid', async () => {
      const mockFilingResponse = { filing: { header: { status: 'COMPLETED' } } }
      mockLegalApi.mockResolvedValue(mockFilingResponse)

      const result = await businessApi.getAndValidateDraftFiling('BC123', 999, 'changeOfOfficers')

      expect(result.isValid).toBe(false)
      expect(result.data).toBeNull()
    })
  })

  describe('deleteFilingById', () => {
    test('should call the correct endpoint with the DELETE method', async () => {
      const businessId = 'BC123'
      const filingId = 999
      mockLegalApi.mockResolvedValue({ success: true })

      await businessApi.deleteFilingById(businessId, filingId)

      expect(mockLegalApi).toHaveBeenCalledOnce()
      expect(mockLegalApi).toHaveBeenCalledWith(
        `businesses/${businessId}/filings/${filingId}`,
        { method: 'DELETE' }
      )
    })
  })
})
