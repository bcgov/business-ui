export const validate = () => {
  const filingStore = usePostRestorationTransitionApplicationStore()
  const errorStore = usePostRestorationErrorsStore()

  const certifiedValues: certify = {
    certified: filingStore.certifiedByLegalName || false,
    name: filingStore.legalName || ''
  }
  const shareValues: Share[] = filingStore.shareClasses
  const folioValues: folioReference = {
    folio: filingStore.folio || ''
  }
  const courtOrderValues: courtOrder = {
    courtOrderNumber: filingStore.courtOrderNumber || ''
  }
  const completingPartyValues: completingParty = {
    email: filingStore.compPartyEmail || ''
  }

  const articlesValues: Articles = {
    currentDate: filingStore.articles.currentDate || '',
    resolutionDates: filingStore.articles.resolutionDates || [],
    specialResolutionChanges: filingStore.articles.specialResolutionChanges || false
  }

  const staffPayValues: StaffPay = filingStore.staffPay

  return errorStore.verifyThenHasErrors(
    certifiedValues,
    shareValues,
    folioValues,
    courtOrderValues,
    completingPartyValues,
    articlesValues,
    staffPayValues
  )
}