export function useAffiliationNavigation () {
  const webUrl = getWebUrl()
  const accountStore = useConnectAccountStore()
  const currentAccountId = computed(() => accountStore.currentAccount.id)

  /** Navigation handler for entities dashboard. */
  function goToDashboard (businessIdentifier: string) {
    sessionStorage.setItem(SessionStorageKeys.BusinessIdentifierKey, businessIdentifier)
    const redirectURL = `${webUrl.getBusinessURL()}${businessIdentifier}?accountid=${currentAccountId.value}`
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
      return navigateTo(decodeURIComponent(`${webUrl.getNameRequestUrl()}nr/${nameRequest.id}`), { external: true })
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

  function goToRegister (item: Business) {
    // if (isModernizedEntity(item)) { // TODO: implement after adding affiliation invitations after adding launch darkly
    //   const businessIdentifier = await createBusinessRecord(item)
    // affNav.goToDashboard(businessIdentifier)
    // } else if (isSocieties(item)) {
    if (isSocieties(item)) {
      goToSocieties()
    } else if (isOtherEntities(item)) {
      goToFormPage(getEntityType(item))
    } else {
      goToCorpOnline()
    }
  }

  // const goToAmalgamate = async (item: Business) => {
  function goToAmalgamate () { // TODO: implement after adding affiliation invitations after adding launch darkly
    // if (isSupportedAmalgamationEntities(item)) {
    //   const businessIdentifier = await createBusinessRecord(item)
    //   goToDashboard(businessIdentifier)
    // } else {
    goToCorpOnline()
    // }
  }

  // const goToContinuationIn = async (item: Business): Promise<void> => {
  function goToContinuationIn () { // TODO: implement after adding affiliation invitations after adding launch darkly
    // if (isSupportedContinuationInEntities(item)) {
    //   const businessIdentifier = await createBusinessRecord(item)
    //   goToDashboard(businessIdentifier)
    // } else {
    goToCorpOnline()
    // }
  }

  return {
    goToDashboard,
    goToNameRequest,
    goToCorpOnline,
    goToFormPage,
    goToSocieties,
    goToRegister,
    goToAmalgamate,
    goToContinuationIn
  }
}
