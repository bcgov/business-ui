import { NrRequestActionCodes } from '@bcrs-shared-components/enums'

export function useAffiliationNavigation () {
  const webUrl = getWebUrl()
  const accountStore = useConnectAccountStore()
  const currentAccountId = computed(() => accountStore.currentAccount.id)

  /** Navigation handler for entities dashboard. */
  function goToDashboard (businessIdentifier: string) {
    sessionStorage.setItem(SessionStorageKeys.BusinessIdentifierKey, businessIdentifier)
    const redirectURL = `${webUrl.getBusinessDashUrl()}${businessIdentifier}?accountid=${currentAccountId.value}`
    return navigateTo(decodeURIComponent(redirectURL), { external: true })
  }

  /** Navigation handler for Name Request application. */
  function goToNameRequest (nameRequest: NameRequest | undefined) {
    if (nameRequest) {
      // Set name request applicant info to retrieve on redirect
      if (nameRequest.nrNumber && nameRequest.applicantEmail && nameRequest.applicantPhone) {
        sessionStorage.setItem('BCREG-nrNum', nameRequest.nrNumber)
        sessionStorage.setItem('BCREG-emailAddress', nameRequest.applicantEmail)
        sessionStorage.setItem('BCREG-phoneNumber', nameRequest.applicantPhone)
      }
      return navigateTo(decodeURIComponent(`${webUrl.getNameRequestUrl()}nr/${nameRequest.id}?accountid=${currentAccountId.value}`), { external: true })
    } else {
      console.log('handle no name request case')
    }
  }

  /** Navigation handler for Corporate Online application */
  function goToCorpOnline () {
    const redirectURL = `${webUrl.getCorporateOnlineUrl()}?accountid=${currentAccountId.value}`
    return navigateTo(redirectURL, { open: { target: '_blank' } })
  }

  function goToFormPage (entityType: CorpTypes) {
    let formUrl = ''
    switch (entityType) {
      case CorpTypes.LL_PARTNERSHIP:
        formUrl = webUrl.getLLPFormsUrl()
        break
      case CorpTypes.LIM_PARTNERSHIP:
        formUrl = webUrl.getLPFormsUrl()
        break
      case CorpTypes.XPRO_LIM_PARTNR:
        formUrl = webUrl.getXLPFormsUrl()
        break
      default:
        formUrl = webUrl.getCorpFormsUrl()
        break
    }
    return navigateTo(formUrl, { open: { target: '_blank' } })
  }

  /** Navigation handler for Societies Online */
  function goToSocieties () {
    const redirectURL = `${webUrl.getSocietiesUrl()}?accountid=${currentAccountId.value}`
    return navigateTo(redirectURL, { open: { target: '_blank' } })
  }

  async function goToRegister (item: Business, cb: (item: Business) => Promise<string>) {
    if (isModernizedEntity(item)) {
      const businessIdentifier = await cb(item)
      goToDashboard(businessIdentifier)
    } else if (isSocieties(item)) {
      goToSocieties()
    } else if (isOtherEntities(item)) {
      goToFormPage(getEntityType(item))
    } else {
      goToCorpOnline()
    }
  }

  async function goToAmalgamate (item: Business, cb: (item: Business) => Promise<string>) {
    if (isSupportedAmalgamationEntities(item)) {
      const businessIdentifier = await cb(item)
      goToDashboard(businessIdentifier)
    } else {
      goToCorpOnline()
    }
  }

  async function goToContinuationIn (item: Business, cb: (item: Business) => Promise<string>) {
    if (isSupportedContinuationInEntities(item)) {
      const businessIdentifier = await cb(item)
      goToDashboard(businessIdentifier)
    } else {
      goToCorpOnline()
    }
  }

  function isOpenExternal (item: Business): boolean {
    const invitationStatus = item?.affiliationInvites?.[0]?.status

    if (invitationStatus && [AffiliationInvitationStatus.Pending, AffiliationInvitationStatus.Expired].includes(invitationStatus as AffiliationInvitationStatus)) {
      return false
    }

    if (isTemporaryBusiness(item)) {
      return false
    }

    if (isNameRequest(item)) {
      const nrState = affiliationStatus(item)
      if (nrState !== NrDisplayStates.APPROVED) {
        return false
      }
      const nrRequestActionCd = item.nameRequest?.requestActionCd
      if (nrRequestActionCd === NrRequestActionCodes.NEW_BUSINESS) {
        return !isModernizedEntity(item)
      }
      // temporarily show external icon for continue in
      if (nrRequestActionCd === NrRequestActionCodes.MOVE) {
        return !isSupportedContinuationInEntities(item)
      }
      // temporary show external icon for amalgamate for some entity types
      if (nrRequestActionCd === NrRequestActionCodes.AMALGAMATE) {
        return !isSupportedAmalgamationEntities(item)
      }
      // temporarily show external icon for restore/reinstate for some entity types
      if (nrRequestActionCd === NrRequestActionCodes.RESTORE || nrRequestActionCd === NrRequestActionCodes.RENEW) {
        return !isSupportedRestorationEntities(item)
      }
      return false
    }

    // existing businesses will route to Business Dashboard -- don't show external icon
    return false
  }

  return {
    goToDashboard,
    goToNameRequest,
    goToCorpOnline,
    goToFormPage,
    goToSocieties,
    goToRegister,
    goToAmalgamate,
    goToContinuationIn,
    isOpenExternal
  }
}
