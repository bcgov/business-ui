export const useFilingTombstone = () => {
  const t = useNuxtApp().$i18n.t
  const { tombstone: filingTombstone, $reset: resetFilingTombstone } = useConnectTombstone('business-filing-tombstone')

  function setFilingDefault(business: BusinessData | BusinessDataSlim, authInfo: AuthInformation): void {
    filingTombstone.value.loading = true

    const contact = authInfo.contacts[0]
    const ext = contact?.extension || contact?.phoneExtension
    const phoneLabel = ext ? `${contact?.phone || ''} Ext: ${ext}` : contact?.phone || t('label.notAvailable')

    filingTombstone.value.title = { as: 'span', text: business.legalName }
    filingTombstone.value.subtitles = [{ text: authInfo.corpType.desc }]
    filingTombstone.value.sideDetails = [
      { label: t('label.businessNumber'), value: business.taxId ?? t('label.notAvailable') },
      { label: t('label.incorporationNumber'), value: business.identifier },
      { label: t('label.email'), value: contact?.email || t('label.notAvailable') },
      { label: t('label.phone'), value: phoneLabel }
    ]
    filingTombstone.value.loading = false
  }

  return {
    filingTombstone,
    resetFilingTombstone,
    setFilingDefault
  }
}
