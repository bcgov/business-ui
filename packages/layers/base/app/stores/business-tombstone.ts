export const useBusinessTombstoneStore = defineStore('business-tombstone-store', () => {
  const t = useNuxtApp().$i18n.t
  const loading = ref(false)
  const title = ref<BusinessTombstoneTitle>({} as BusinessTombstoneTitle)
  const subtitles = ref<BusinessTombstoneItem[]>([])
  const details = ref<BusinessTombstoneItem[]>([])
  const sideDetails = ref<BusinessTombstoneSideDetail[]>([])
  const bottomButtons = ref<BusinessTombstoneBtn[]>([])

  function setFilingDefault(business: BusinessData | BusinessDataSlim, authInfo: AuthInformation): void {
    const contact = authInfo.contacts[0]
    const ext = contact?.extension || contact?.phoneExtension
    const phoneLabel = ext ? `${contact?.phone || ''} Ext: ${ext}` : contact?.phone || t('label.notAvailable')

    title.value = { el: 'span', text: business.legalName }
    subtitles.value = [{ text: authInfo.corpType.desc }]
    sideDetails.value = [
      { label: t('label.businessNumber'), value: business.taxId ?? t('label.notAvailable') },
      { label: t('label.incorporationNumber'), value: business.identifier },
      { label: t('label.email'), value: contact?.email || t('label.notAvailable') },
      { label: t('label.phone'), value: phoneLabel }
    ]
    loading.value = false
  }

  return {
    loading,
    title,
    subtitles,
    details,
    sideDetails,
    bottomButtons,
    setFilingDefault
  }
})
