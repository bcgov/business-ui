// NB: Only testing options definitions here - query definitions are simply returning the options wrapped by useQuery
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockKeys = {
  addresses: vi.fn(),
  authInfo: vi.fn(),
  authorizedActions: vi.fn(),
  business: vi.fn(),
  bootstrapFiling: vi.fn(),
  document: vi.fn(),
  filing: vi.fn(),
  filingComments: vi.fn(),
  filingDocumentUrls: vi.fn(),
  ledger: vi.fn(),
  linkedNameRequest: vi.fn(),
  parties: vi.fn(),
  tasks: vi.fn()
}

mockNuxtImport('useBusinessQueryKeys', () => {
  return () => ({
    keys: mockKeys,
    base: ['business', 'ACC123']
  })
})

const mockBusinessApi = vi.fn()
const mockAuthApi = vi.fn()
mockNuxtImport('useNuxtApp', () => {
  return () => ({
    $businessApi: mockBusinessApi,
    $authApi: mockAuthApi
  })
})

describe('useBusinessQuery', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  const businessId = 'BC123'
  const DEFAULT_STALE_TIME = 60000

  it('addressesOptions should have correct config', () => {
    const { addressesOptions } = useBusinessQuery()

    const options = addressesOptions(businessId)
    options.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(`businesses/${businessId}/addresses`)
    expect(mockKeys.addresses).toHaveBeenCalledWith(businessId)
    expect(options.staleTime).toBe(DEFAULT_STALE_TIME)

    const custom = addressesOptions(businessId, {
      enabled: false,
      staleTime: 30000
    })
    expect(custom.enabled).toBe(false)
    expect(custom.staleTime).toBe(30000)
  })

  it('authorizedActionsOptions should have correct config', () => {
    const { authorizedActionsOptions } = useBusinessQuery()

    const options = authorizedActionsOptions(businessId)
    options.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith('/permissions')
    expect(mockKeys.authorizedActions).toHaveBeenCalledWith(businessId)
    expect(options.staleTime).toBe(DEFAULT_STALE_TIME)

    const custom = authorizedActionsOptions(businessId, { enabled: false })
    expect(custom.enabled).toBe(false)
  })

  it('businessOptions should have correct config', () => {
    const { businessOptions } = useBusinessQuery()

    // slim only fetch
    const slim = businessOptions(businessId, true, false)
    slim.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(
      `businesses/${businessId}`, { query: { slim: true } })
    expect(mockKeys.business).toHaveBeenCalledWith(businessId, true, false)
    expect(slim.staleTime).toBe(DEFAULT_STALE_TIME)

    // public only fetch
    const publicData = businessOptions(businessId, false, true)
    publicData.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(
      `businesses/${businessId}/public`, { query: undefined })
    expect(mockKeys.business).toHaveBeenCalledWith(businessId, false, true)
    expect(publicData.staleTime).toBe(DEFAULT_STALE_TIME)

    // slim and public fetch
    const slimPublic = businessOptions(businessId, true, true)
    slimPublic.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(
      `businesses/${businessId}/public`, { query: { slim: true } })
    expect(mockKeys.business).toHaveBeenCalledWith(businessId, true, true)
    expect(publicData.staleTime).toBe(DEFAULT_STALE_TIME)

    // full fetch
    const full = businessOptions(businessId, false, false)
    full.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(`businesses/${businessId}`, { query: undefined })
    expect(mockKeys.business).toHaveBeenCalledWith(businessId, false, false)
    expect(full.staleTime).toBe(DEFAULT_STALE_TIME)

    // custom options
    const custom = businessOptions(businessId, false, false, {
      enabled: false,
      staleTime: 500
    })
    expect(custom.enabled).toBe(false)
    expect(custom.staleTime).toBe(500)
    expect(mockKeys.business).toHaveBeenLastCalledWith(businessId, false, false)
  })

  it('documentOptions should have correct config', () => {
    const { documentOptions } = useBusinessQuery()
    const url = 'https://api.example.com/download'
    const filename = 'business_summary.pdf'

    const options = documentOptions(businessId, url, filename)

    expect(options.staleTime).toBe(0)
    expect(options.gcTime).toBe(0)

    options.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith('', {
      baseURL: url,
      responseType: 'blob' as 'json',
      headers: { Accept: 'application/pdf' }
    })

    expect(mockKeys.document).toHaveBeenCalledWith(businessId, url, filename)

    const custom = documentOptions(businessId, url, 'file.pdf', { staleTime: 5000 })
    expect(custom.staleTime).toBe(5000)
  })

  it('bootstrapFilingOptions should have correct config', () => {
    const { bootstrapFilingOptions } = useBusinessQuery()
    const tempId = 'T1234567'

    const options = bootstrapFilingOptions(tempId)
    options.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(`businesses/${tempId}/filings`)
    expect(mockKeys.bootstrapFiling).toHaveBeenCalledWith(tempId)
    expect(options.staleTime).toBe(DEFAULT_STALE_TIME)

    const custom = bootstrapFilingOptions('123', { staleTime: 5000 })
    expect(custom.staleTime).toBe(5000)
    expect(mockKeys.bootstrapFiling).toHaveBeenCalledWith('123')
  })

  it('filingOptions should have correct config', () => {
    const { filingOptions } = useBusinessQuery()
    const filingId = 123

    const options = filingOptions(businessId, filingId)
    options.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(`businesses/${businessId}/filings/${filingId}`)
    expect(mockKeys.filing).toHaveBeenCalledWith(businessId, filingId)
    expect(options.staleTime).toBe(DEFAULT_STALE_TIME)

    const custom = filingOptions(businessId, '12345', { staleTime: 5000 })
    expect(custom.staleTime).toBe(5000)
    expect(mockKeys.filing).toHaveBeenCalledWith(businessId, '12345')
  })

  it('filingCommentsOptions should have correct config', () => {
    const { filingCommentsOptions } = useBusinessQuery()
    const filingId = 456
    const externalUrl = 'https://api.legal.gov/comments/v1'

    const options = filingCommentsOptions(businessId, filingId, externalUrl)
    options.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith('', { baseURL: externalUrl })
    expect(mockKeys.filingComments).toHaveBeenCalledWith(businessId, filingId, externalUrl)
    expect(options.staleTime).toBe(DEFAULT_STALE_TIME)

    const custom = filingCommentsOptions(businessId, '12345', externalUrl, { staleTime: 5000 })
    expect(custom.staleTime).toBe(5000)
    expect(mockKeys.filingComments).toHaveBeenCalledWith(businessId, '12345', externalUrl)
  })

  it('filingDocumentUrlsOptions should have correct config', () => {
    const { filingDocumentUrlsOptions } = useBusinessQuery()
    const filingId = '999'

    const options = filingDocumentUrlsOptions(businessId, filingId)
    options.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(`businesses/${businessId}/filings/${filingId}/documents`)
    expect(mockKeys.filingDocumentUrls).toHaveBeenCalledWith(businessId, filingId)
    expect(options.staleTime).toBe(DEFAULT_STALE_TIME)

    const custom = filingDocumentUrlsOptions(businessId, '12345', { staleTime: 5000 })
    expect(custom.staleTime).toBe(5000)
    expect(mockKeys.filingDocumentUrls).toHaveBeenCalledWith(businessId, '12345')
  })

  it('ledgerOptions should have correct config', () => {
    const { ledgerOptions } = useBusinessQuery()
    const date = '2026-01-13'

    const options = ledgerOptions(businessId, date)
    options.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(`businesses/${businessId}/filings`, {
      params: { effective_date: date }
    })
    expect(mockKeys.ledger).toHaveBeenCalledWith(businessId, date)
    expect(options.staleTime).toBe(DEFAULT_STALE_TIME)

    const noDate = ledgerOptions(businessId)
    noDate.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(`businesses/${businessId}/filings`, {
      params: {}
    })
    expect(mockKeys.ledger).toHaveBeenCalledWith(businessId, '')
    expect(noDate.staleTime).toBe(DEFAULT_STALE_TIME)

    const custom = ledgerOptions(businessId, '12345', { staleTime: 5000 })
    expect(custom.staleTime).toBe(5000)
    expect(mockKeys.ledger).toHaveBeenCalledWith(businessId, '12345')
  })

  it('linkedNameRequestOptions should have correct config', () => {
    const { linkedNameRequestOptions } = useBusinessQuery()
    const nrNumber = 'NR1234567'

    const options = linkedNameRequestOptions(businessId, nrNumber)
    options.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(`nameRequests/${nrNumber}/validate`)
    expect(mockKeys.linkedNameRequest).toHaveBeenCalledWith(businessId, nrNumber)
    expect(options.staleTime).toBe(DEFAULT_STALE_TIME)

    const custom = linkedNameRequestOptions(businessId, '12345', { staleTime: 5000 })
    expect(custom.staleTime).toBe(5000)
    expect(mockKeys.linkedNameRequest).toHaveBeenCalledWith(businessId, '12345')
  })

  it('partiesOptions should have correct config', () => {
    const { partiesOptions } = useBusinessQuery()
    const query = { role: 'director', status: 'active' }

    const options = partiesOptions(businessId, query)
    options.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(`businesses/${businessId}/parties`, {
      query: query
    })
    expect(mockKeys.parties).toHaveBeenCalledWith(businessId, query)
    expect(options.staleTime).toBe(DEFAULT_STALE_TIME)

    const noQuery = partiesOptions(businessId)
    noQuery.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(`businesses/${businessId}/parties`, {
      query: undefined
    })
    expect(mockKeys.parties).toHaveBeenCalledWith(businessId, undefined)
    expect(noQuery.staleTime).toBe(DEFAULT_STALE_TIME)

    const custom = partiesOptions(businessId, undefined, { staleTime: 5000 })
    expect(custom.staleTime).toBe(5000)
    expect(mockKeys.parties).toHaveBeenCalledWith(businessId, undefined)
  })

  it('tasksOptions should have correct config', () => {
    const { tasksOptions } = useBusinessQuery()

    const options = tasksOptions(businessId)
    options.query({} as any)
    expect(mockBusinessApi).toHaveBeenCalledWith(`businesses/${businessId}/tasks`)
    expect(mockKeys.tasks).toHaveBeenCalledWith(businessId)
    expect(options.staleTime).toBe(DEFAULT_STALE_TIME)

    const custom = tasksOptions(businessId, { staleTime: 5000 })
    expect(custom.staleTime).toBe(5000)
    expect(mockKeys.tasks).toHaveBeenCalledWith(businessId)
  })

  it('authInfoOptions should route to the Auth API and use the correct path', () => {
    const { authInfoOptions } = useBusinessQuery()

    const options = authInfoOptions(businessId)
    options.query({} as any)
    expect(mockAuthApi).toHaveBeenCalledWith(`/entities/${businessId}`)
    expect(mockBusinessApi).not.toHaveBeenCalled()
    expect(mockKeys.authInfo).toHaveBeenCalledWith(businessId)
    expect(options.staleTime).toBe(DEFAULT_STALE_TIME)

    const custom = authInfoOptions(businessId, { staleTime: 5000 })
    expect(custom.staleTime).toBe(5000)
    expect(mockKeys.authInfo).toHaveBeenCalledWith(businessId)
  })
})
