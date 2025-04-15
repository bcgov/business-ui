import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'

let mockAuthenticated = true
mockNuxtImport('useNuxtApp', () => {
  return () => (
    {
      $keycloak: {
        authenticated: mockAuthenticated,
        token: 'mock-token'
      }
    }
  )
})

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

mockNuxtImport('useRuntimeConfig', () => {
  return () => (
    {
      public: {
        businessDashUrl: 'https://business-dash.example.com/',
        nrURL: 'https://namerequest.example.com/',
        oneStopUrl: 'https://onestop.example.com/',
        corpOLUrl: 'https://corporateonline.example.com/',
        llpFormsUrl: 'https://llpforms.example.com/',
        lpFormsUrl: 'https://lpforms.example.com/',
        xlpFormUrl: 'https://xlpforms.example.com/',
        corpFormsUrl: 'https://corpforms.example.com/',
        societiesUrl: 'https://societies.example.com/'
      }
    }
  )
})

const mockGetStoredFlag = vi.fn()
mockNuxtImport('useConnectLaunchdarklyStore', () => {
  return () => (
    {
      getStoredFlag: mockGetStoredFlag
    }
  )
})

// Mock the useBrdModals composable
const mockOpenContinuationInCoopModal = vi.fn()
mockNuxtImport('useBrdModals', () => {
  return () => ({
    openManageNameRequest: vi.fn(),
    openManageNRError: vi.fn(),
    openBusinessAddError: vi.fn(),
    nameRequestActionError: vi.fn(),
    openBusinessUnavailableError: vi.fn(),
    openInvalidFilingApplication: vi.fn(),
    openBusinessRemovalConfirmation: vi.fn(),
    openManageBusiness: vi.fn(),
    openMagicLinkModal: vi.fn(),
    openAuthEmailSent: vi.fn(),
    openContinuationInCoopModal: mockOpenContinuationInCoopModal,
    close: vi.fn()
  })
})

describe('useAffiliationNavigation', () => {
  let store: any
  beforeEach(() => {
    setActivePinia(createPinia())
    store = useConnectAccountStore()

    store.currentAccount = {
      id: '123',
      accountType: 'basic',
      accountStatus: '',
      label: 'some label',
      type: '',
      urlpath: '',
      urlorigin: ''
    }

    vi.stubGlobal('sessionStorage', {
      setItem: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn()
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.restoreAllMocks()
    mockAuthenticated = true
  })

  it('goToDashboard', () => {
    const { goToDashboard } = useAffiliationNavigation()
    goToDashboard('BC1234567')

    expect(sessionStorage.setItem).toHaveBeenCalledWith('BUSINESS_ID', 'BC1234567')
    expect(navigateToMock).toHaveBeenCalledWith(
      'https://business-dash.example.com/BC1234567?accountid=123',
      { external: true }
    )
  })

  it('goToNameRequest', () => {
    const { goToNameRequest } = useAffiliationNavigation()
    const nameRequest: NameRequest = {
      id: 1,
      nrNumber: 'NR1234567',
      applicantEmail: 'test@example.com',
      applicantPhone: '123-456-7890',
      legalType: CorpTypes.BC_COMPANY
    }
    goToNameRequest(nameRequest)

    expect(sessionStorage.setItem).toHaveBeenCalledWith('BCREG-nrNum', 'NR1234567')
    expect(sessionStorage.setItem).toHaveBeenCalledWith('BCREG-emailAddress', 'test@example.com')
    expect(sessionStorage.setItem).toHaveBeenCalledWith('BCREG-phoneNumber', '123-456-7890')
    expect(navigateToMock).toHaveBeenCalledWith(
      'https://namerequest.example.com/nr/1?accountid=123',
      { external: true }
    )
  })

  it('goToCorpOnline', () => {
    const { goToCorpOnline } = useAffiliationNavigation()
    goToCorpOnline()

    expect(navigateToMock).toHaveBeenCalledWith(
      'https://corporateonline.example.com/?accountid=123',
      { open: { target: '_blank' } }
    )
  })

  // switch (entityType) {
  //   case CorpTypes.LL_PARTNERSHIP:
  //     formUrl = webUrl.getLLPFormsUrl()
  //     break
  //   case CorpTypes.LIM_PARTNERSHIP:
  //     formUrl = webUrl.getLPFormsUrl()
  //     break
  //   case CorpTypes.XPRO_LIM_PARTNR:
  //     formUrl = webUrl.getXLPFormsUrl()
  //     break
  //   default:
  //     formUrl = webUrl.getCorpFormsUrl()
  //     break
  // }

  describe('goToFormPage', () => {
    it('should navigate when entity type is CorpTypes.LL_PARTNERSHIP', () => {
      const { goToFormPage } = useAffiliationNavigation()
      goToFormPage(CorpTypes.LL_PARTNERSHIP)

      expect(navigateToMock).toHaveBeenCalledWith(
        'https://llpforms.example.com/',
        { open: { target: '_blank' } }
      )
    })

    it('should navigate when entity type is CorpTypes.LIM_PARTNERSHIP', () => {
      const { goToFormPage } = useAffiliationNavigation()
      goToFormPage(CorpTypes.LIM_PARTNERSHIP)

      expect(navigateToMock).toHaveBeenCalledWith(
        'https://lpforms.example.com/',
        { open: { target: '_blank' } }
      )
    })

    it('should navigate when entity type is CorpTypes.XPRO_LIM_PARTNR', () => {
      const { goToFormPage } = useAffiliationNavigation()
      goToFormPage(CorpTypes.XPRO_LIM_PARTNR)

      expect(navigateToMock).toHaveBeenCalledWith(
        'https://xlpforms.example.com/',
        { open: { target: '_blank' } }
      )
    })

    it('should navigate to corp forms when entity type is doesnt match any of the previous options', () => {
      const { goToFormPage } = useAffiliationNavigation()
      goToFormPage(CorpTypes.BC_COMPANY)

      expect(navigateToMock).toHaveBeenCalledWith(
        'https://corpforms.example.com/',
        { open: { target: '_blank' } }
      )
    })
  })

  it('goToSocieties', () => {
    const { goToSocieties } = useAffiliationNavigation()
    goToSocieties()

    expect(navigateToMock).toHaveBeenCalledWith(
      'https://societies.example.com/?accountid=123',
      { open: { target: '_blank' } }
    )
  })

  describe('goToRegister', () => {
    it('should navigate to goToBusiness when business is a modernized entity', async () => {
      mockGetStoredFlag.mockReturnValue('BC') // mock ld so isSupportedAmalgamationEntities returns true
      const { goToRegister } = useAffiliationNavigation()
      const business: Business = { corpType: { code: CorpTypes.BC_COMPANY }, businessIdentifier: '123' }
      const cb = vi.fn().mockResolvedValue('BC1234567')

      await goToRegister(business, cb)

      expect(cb).toHaveBeenCalledWith(business)
      expect(navigateToMock).toHaveBeenCalledWith(
        'https://business-dash.example.com/BC1234567?accountid=123',
        { external: true }
      )
    })

    it('should navigate goToSocieties when business is societies', async () => {
      const { goToRegister } = useAffiliationNavigation()
      const business: Business = { corpType: { code: CorpTypes.SOCIETY }, businessIdentifier: '123' }
      const cb = vi.fn().mockResolvedValue('BC1234567')

      await goToRegister(business, cb)

      expect(navigateToMock).toHaveBeenCalledWith(
        'https://societies.example.com/?accountid=123',
        { open: { target: '_blank' } }
      )
    })

    it('should navigate to goToFormPage when business isOtherEntities', async () => {
      const { goToRegister } = useAffiliationNavigation()
      const business: Business = { corpType: { code: CorpTypes.LL_PARTNERSHIP }, businessIdentifier: '123' }
      const cb = vi.fn().mockResolvedValue('BC1234567')

      await goToRegister(business, cb)

      expect(cb).not.toHaveBeenCalled()
      expect(navigateToMock).toHaveBeenCalledWith(
        'https://llpforms.example.com/',
        {
          open: {
            target: '_blank'
          }
        }
      )
    })

    it('should navigate to corpOnline when business doesnt match any of the above', async () => {
      const { goToRegister } = useAffiliationNavigation()
      const business: Business = { corpType: { code: CorpTypes.CONTINUATION_IN }, businessIdentifier: '123' }
      const cb = vi.fn().mockResolvedValue('BC1234567')

      await goToRegister(business, cb)

      expect(cb).not.toHaveBeenCalled()
      expect(navigateToMock).toHaveBeenCalledWith(
        'https://corporateonline.example.com/?accountid=123',
        {
          open: {
            target: '_blank'
          }
        }
      )
    })
  })

  describe('goToAmalgamate', () => {
    it('should navigate to goToDashboard when the entity is supported for amalgamation', async () => {
      mockGetStoredFlag.mockReturnValue('BC') // mock ld so isSupportedAmalgamationEntities returns true
      const { goToAmalgamate } = useAffiliationNavigation()
      const business: Business = { corpType: { code: CorpTypes.BC_COMPANY }, businessIdentifier: '123' }
      const cb = vi.fn().mockResolvedValue('BC1234567')

      await goToAmalgamate(business, cb)

      expect(cb).toHaveBeenCalledWith(business)
      expect(navigateToMock).toHaveBeenCalledWith(
        'https://business-dash.example.com/BC1234567?accountid=123',
        { external: true }
      )
    })

    it('should navigate to goToCorpOnline when the entity is not supported for amalgamation', async () => {
      const { goToAmalgamate } = useAffiliationNavigation()
      const business: Business = { corpType: { code: CorpTypes.FINANCIAL }, businessIdentifier: '123' }
      const cb = vi.fn().mockResolvedValue('BC1234567')

      await goToAmalgamate(business, cb)

      expect(cb).not.toHaveBeenCalled()
      expect(navigateToMock).toHaveBeenCalledWith(
        'https://corporateonline.example.com/?accountid=123',
        { open: { target: '_blank' } }
      )
    })
  })

  describe('goToContinuationIn', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should navigate to goToDashboard when the entity is supported for continuation in', async () => {
      mockGetStoredFlag.mockReturnValue('C') // mock ld so isSupportedContinuationInEntities returns true
      const { goToContinuationIn } = useAffiliationNavigation()
      const business: Business = { corpType: { code: CorpTypes.CONTINUE_IN }, businessIdentifier: '456' }
      const cb = vi.fn().mockResolvedValue('BC1234567')

      await goToContinuationIn(business, cb)

      expect(cb).toHaveBeenCalledWith(business)
      expect(navigateToMock).toHaveBeenCalledWith(
        'https://business-dash.example.com/BC1234567?accountid=123',
        { external: true }
      )
    })

    it('should open the continuation in coop modal when the entity type is COOP', async () => {
      const { goToContinuationIn } = useAffiliationNavigation()
      const business: Business = {
        corpType: { code: CorpTypes.CONTINUE_IN },
        businessIdentifier: '456',
        nameRequest: { entityTypeCd: CorpTypes.COOP } as any
      }
      const cb = vi.fn().mockResolvedValue('BC1234567')

      await goToContinuationIn(business, cb)

      expect(cb).not.toHaveBeenCalled() // cb shouldn't be called
      expect(mockOpenContinuationInCoopModal).toHaveBeenCalledTimes(1)
      expect(navigateToMock).not.toHaveBeenCalled()
    })

    it('should navigate to goToCorpOnline when the entity is not supported for continuation in', async () => {
      const { goToContinuationIn } = useAffiliationNavigation()
      const business: Business = { corpType: { code: CorpTypes.XPRO_SOCIETY }, businessIdentifier: '456' }
      const cb = vi.fn().mockResolvedValue('BC1234567')

      await goToContinuationIn(business, cb)

      expect(cb).not.toHaveBeenCalled() // cb shouldn't be called
      expect(navigateToMock).toHaveBeenCalledWith(
        'https://corporateonline.example.com/?accountid=123',
        { open: { target: '_blank' } }
      )
    })
  })
})
