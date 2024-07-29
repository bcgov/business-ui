import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { useAnnualReportStore } from '#imports'
import { mockNewAccount, mockedArFilingResponse } from '~/tests/mocks/mockedData'

describe('Annual Report Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const busStore = useBusinessStore()
    const accountStore = useAccountStore()
    accountStore.currentAccount = mockNewAccount
    busStore.businessNano = {
      identifier: '123',
      legalName: 'Test inc',
      legalType: 'BC',
      taxId: null
    }
  })

  it('inits the store with empty values', () => {
    const arStore = useAnnualReportStore()

    expect(arStore.loading).toEqual(false)
    expect(arStore.arFiling).toEqual({})
  })

  it('creates ar filing, assigns store value and returns paymentToken and filingId', async () => {
    registerEndpoint('/business/123/filings', {
      method: 'POST',
      handler: () => (mockedArFilingResponse)
    })

    const arStore = useAnnualReportStore()
    // submit filing
    const { paymentToken, filingId } = await arStore.submitAnnualReportFiling({
      agmDate: '2022-10-10',
      votedForNoAGM: false,
      unanimousResolutionDate: null
    })

    // assert
    expect(arStore.arFiling).toEqual(mockedArFilingResponse)
    // assigns user accounts in the onResponse of the getUserAccounts
    expect(paymentToken).toEqual(mockedArFilingResponse.filing.header.paymentToken)
    expect(filingId).toEqual(mockedArFilingResponse.filing.header.id)
  })

  it('will add filing id to end of submitAnnualReport url if a filing currently exists', async () => {
    const arStore = useAnnualReportStore()

    registerEndpoint('/business/123/filings/1', { // current store filings id
      method: 'POST',
      handler: () => (mockedArFilingResponse)
    })

    arStore.arFiling = mockedArFilingResponse

    expect(Object.keys(arStore.arFiling).length).toBeGreaterThan(0)

    await arStore.submitAnnualReportFiling({
      agmDate: '2022-10-10',
      votedForNoAGM: false,
      unanimousResolutionDate: null
    })

    const { paymentToken, filingId } = await arStore.submitAnnualReportFiling({
      agmDate: '2022-10-10',
      votedForNoAGM: false,
      unanimousResolutionDate: null
    })

    // assert
    expect(arStore.arFiling).toEqual(mockedArFilingResponse)
    // assigns user accounts in the onResponse of the getUserAccounts
    expect(paymentToken).toEqual(mockedArFilingResponse.filing.header.paymentToken)
    expect(filingId).toEqual(mockedArFilingResponse.filing.header.id)
  })

  it('can reset the store values', () => {
    const arStore = useAnnualReportStore()
    arStore.arFiling = mockedArFilingResponse
    arStore.loading = false

    expect(Object.keys(arStore.arFiling).length).toBeGreaterThan(0)

    arStore.$reset()

    expect(Object.keys(arStore.arFiling).length).toBe(0)
  })

  describe('handleDocumentDownload', () => {
    let createObjectURLSpy: any, revokeObjectURLSpy: any, appendChildSpy: any, removeChildSpy: any, clickSpy: any

    beforeEach(() => {
      createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:url')
      revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {})
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(node => node)
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(node => node)
      clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.clearAllMocks()
      vi.unstubAllGlobals()
      vi.useRealTimers()
    })

    it('should download the file and call window/document events/methods', async () => {
      const arStore = useAnnualReportStore()
      const _fetch = vi.fn().mockResolvedValue(new Blob(['test content'], { type: 'application/pdf' }))
      vi.stubGlobal('$fetch', _fetch)

      const file = { name: 'Report', url: '/path/to/file' }
      await arStore.handleDocumentDownload(file)

      expect(_fetch).toHaveBeenCalledWith('/path/to/file', { responseType: 'blob', headers: { Authorization: 'Bearer 123' } })
      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
      vi.runAllTimers()
      expect(removeChildSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalled()
    })

    it('should show an error alert if the download fails', async () => {
      const arStore = useAnnualReportStore()
      const alertStore = useAlertStore()
      const addAlertSpy = vi.spyOn(alertStore, 'addAlert')

      const _fetch = vi.fn().mockRejectedValue(new Error('Download failed'))
      vi.stubGlobal('$fetch', _fetch)

      const file = { name: 'Report', url: '/path/to/file' }
      await arStore.handleDocumentDownload(file)

      expect(addAlertSpy).toHaveBeenCalledWith({
        severity: 'error',
        category: 'document-download'
      })
    })
  })
})
