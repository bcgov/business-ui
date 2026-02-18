/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockQuery = {
  addressesOptions: vi.fn(),
  authorizedActionsOptions: vi.fn(),
  businessOptions: vi.fn(),
  bootstrapFilingOptions: vi.fn(),
  documentOptions: vi.fn(),
  filingOptions: vi.fn(),
  filingCommentsOptions: vi.fn(),
  filingDocumentUrlsOptions: vi.fn(),
  ledgerOptions: vi.fn(),
  linkedNameRequestOptions: vi.fn(),
  partiesOptions: vi.fn(),
  shareClassOptions: vi.fn(),
  tasksOptions: vi.fn(),
  authInfoOptions: vi.fn()
}
mockNuxtImport('useBusinessQuery', () => () => mockQuery)

const { mockGetCachedOrFetch, mockIsValidDraft } = vi.hoisted(() => ({
  mockGetCachedOrFetch: vi.fn(),
  mockIsValidDraft: vi.fn()
}))
vi.mock('~/services/helpers', () => ({
  getCachedOrFetch: mockGetCachedOrFetch
}))
mockNuxtImport('isValidDraft', () => mockIsValidDraft)

describe('useBusinessService', () => {
  const service = useBusinessService()
  const businessId = 'BC1234567'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAddresses should fetch options and call the cache helper', async () => {
    const mockData = { street: '123 Main' }
    mockGetCachedOrFetch.mockResolvedValue(mockData)

    const result = await service.getAddresses(businessId, true)
    const opts = mockQuery.addressesOptions
    expect(opts).toHaveBeenCalledWith(businessId)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), true)
    expect(result).toEqual(mockData)
  })

  it('getAndValidateDraftFiling should throw if validation fails', async () => {
    mockGetCachedOrFetch.mockResolvedValue({ some: 'data' })
    mockIsValidDraft.mockReturnValue(false)

    await expect(service.getAndValidateDraftFiling(businessId, 123, 'annualReport' as any))
      .rejects.toThrow('invalid-draft-filing')
  })

  it('getAuthInfo should fetch options and call the cache helper', async () => {
    const mockData = { authStuff: 'test' }
    mockGetCachedOrFetch.mockResolvedValue(mockData)

    const result = await service.getAuthInfo(businessId, true)
    const opts = mockQuery.authInfoOptions
    expect(opts).toHaveBeenCalledWith(businessId)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), true)
    expect(result).toEqual(mockData)
  })

  it('getAuthorizedActions should fetch options and call the cache helper', async () => {
    const mockData = { authorizedPermissions: ['action1', 'action2', 'actions3'] }
    mockGetCachedOrFetch.mockResolvedValue(mockData)

    const result = await service.getAuthorizedActions(businessId, true)
    const opts = mockQuery.authorizedActionsOptions
    expect(opts).toHaveBeenCalledWith(businessId)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), true)
    expect(result).toEqual(mockData.authorizedPermissions)
  })

  it('getBusiness should fetch options and call the cache helper', async () => {
    const mockData = { business: { name: 'ACME Corp' } }
    mockGetCachedOrFetch.mockResolvedValue(mockData)

    const result = await service.getBusiness(businessId, false)

    const opts = mockQuery.businessOptions
    expect(opts).toHaveBeenCalledWith(businessId, false, false)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), false)
    expect(result).toEqual(mockData.business)
  })

  it('getBootstrapFiling should fetch options and call the cache helper', async () => {
    // returns undefined for a non-temp id
    const realIdentifierResult = await service.getBootstrapFiling('BC1234567')
    expect(realIdentifierResult).toBeUndefined()
    expect(mockGetCachedOrFetch).not.toHaveBeenCalled()

    const mockData = { business: { name: 'Temp Corp' } }
    mockGetCachedOrFetch.mockResolvedValue(mockData)

    const tempId = 'T123456789'
    const tempIdResult = await service.getBootstrapFiling(tempId)

    const opts = mockQuery.bootstrapFilingOptions
    expect(opts).toHaveBeenCalledWith(tempId)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), false)
    expect(tempIdResult).toEqual(mockData)
  })

  it('getDocument should fetch options and call the cache helper', async () => {
    const mockData = { id: 'some-document' }
    mockGetCachedOrFetch.mockResolvedValue(mockData)

    const url = 'some-url'
    const filename = 'file.pdf'

    const result = await service.getDocument(businessId, url, filename, true)
    const opts = mockQuery.documentOptions
    expect(opts).toHaveBeenCalledWith(businessId, url, filename)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), true)
    expect(result).toEqual(mockData)
  })

  it('getFiling should fetch options and call the cache helper', async () => {
    const mockData = { filing: { data: 'test' } }
    mockGetCachedOrFetch.mockResolvedValue(mockData)
    const filingId = 123

    const result = await service.getFiling(businessId, filingId, true)
    const opts = mockQuery.filingOptions
    expect(opts).toHaveBeenCalledWith(businessId, filingId)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), true)
    expect(result).toEqual(mockData)
  })

  it('getFilingComments should fetch options and call the cache helper', async () => {
    const mockData = {
      comments: [
        {
          comment: {
            timestamp: '2026-01-02T10:00:00Z',
            comment: 'This is the second comment',
            submitterDisplayName: 'User B'
          } as BusinessComment
        },
        {
          comment: {
            timestamp: '2026-01-01T10:00:00Z',
            comment: 'This is the first comment',
            submitterDisplayName: 'User A'
          } as BusinessComment
        }
      ]
    }
    mockGetCachedOrFetch.mockResolvedValue(mockData)
    const filingId = 'filing-id'
    const url = 'http://url'

    const result = await service.getFilingComments(businessId, filingId, url, true) as any
    const opts = mockQuery.filingCommentsOptions
    expect(opts).toHaveBeenCalledWith(businessId, filingId, url)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), true)
    expect(result).toHaveLength(2)

    expect(result[0].timestamp).toBe('2026-01-01T10:00:00Z')
    expect(result[0].submitterDisplayName).toBe('User A')
    expect(result[0].comment).toBe('This is the first comment')
    expect(result[0]).not.toHaveProperty('comment.comment')
  })

  it('getFilingDocumentUrls should fetch options and call the cache helper', async () => {
    const mockData = { documents: ['doc1', 'doc2', 'doc3'] }
    mockGetCachedOrFetch.mockResolvedValue(mockData)
    const filingId = '123'

    const result = await service.getFilingDocumentUrls(businessId, filingId)
    const opts = mockQuery.filingDocumentUrlsOptions
    expect(opts).toHaveBeenCalledWith(businessId, filingId)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), false)
    expect(result).toEqual(mockData.documents)
  })

  it('getLedger should fetch options and call the cache helper', async () => {
    const mockData = { filings: ['item1', 'item2', 'item3'] }
    mockGetCachedOrFetch.mockResolvedValue(mockData)
    const date = 'test-date'

    const result = await service.getLedger(businessId, date)
    const opts = mockQuery.ledgerOptions
    expect(opts).toHaveBeenCalledWith(businessId, date)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), false)
    expect(result).toEqual(mockData.filings)
  })

  it('getLinkedNameRequest should fetch options and call the cache helper', async () => {
    const mockData = { nr: 'some-date' }
    mockGetCachedOrFetch.mockResolvedValue(mockData)
    const nrNum = 'nr123'

    const result = await service.getLinkedNameRequest(businessId, nrNum)
    const opts = mockQuery.linkedNameRequestOptions
    expect(opts).toHaveBeenCalledWith(businessId, nrNum)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), false)
    expect(result).toEqual(mockData)
  })

  it('getShareClasses should fetch options and call the cache helper', async () => {
    const mockData = { shareClasses: ['item1', 'item2', 'item3'] }
    mockGetCachedOrFetch.mockResolvedValue(mockData)

    const result = await service.getShareClasses(businessId)
    const opts = mockQuery.shareClassOptions
    expect(opts).toHaveBeenCalledWith(businessId, undefined)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), false)
    expect(result).toEqual(mockData.shareClasses)
  })

  it('getTasks should fetch options and call the cache helper', async () => {
    const mockData = { tasks: ['task1', 'task2', 'task3'] }
    mockGetCachedOrFetch.mockResolvedValue(mockData)

    const result = await service.getTasks(businessId, true)
    const opts = mockQuery.tasksOptions
    expect(opts).toHaveBeenCalledWith(businessId)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), true)
    expect(result).toEqual(mockData.tasks)
  })

  it('getParties should fetch options and call the cache helper', async () => {
    const mockData = { parties: ['party1', 'party2', 'party3'] }
    mockGetCachedOrFetch.mockResolvedValue(mockData)

    const query = { role: 'director' }
    const result = await service.getParties(businessId, query, true)
    const opts = mockQuery.partiesOptions
    expect(opts).toHaveBeenCalledWith(businessId, query)
    expect(mockGetCachedOrFetch).toHaveBeenCalledWith(opts(), true)
    expect(result).toEqual(mockData.parties)
  })
})
