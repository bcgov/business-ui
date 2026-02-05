import { DateTime } from 'luxon'

export const useBusinessTombstone = () => {
  const t = useNuxtApp().$i18n.t
  const { tombstone: businessTombstone, $reset: resetTombstone } = useConnectTombstone()

  const businessStore = useBusinessStore()
  const { business, businessContact, businessName } = storeToRefs(businessStore)

  async function setFilingDefault(businessId: string, slim = true) {
    businessTombstone.value.loading = true
    await businessStore.init(businessId, slim, false, false, true)

    const ext = businessContact.value?.extension || businessContact.value?.phoneExtension
    const phoneLabel = ext
      ? `${businessContact.value?.phone || ''} Ext: ${ext}`
      : businessContact.value?.phone || t('label.notAvailable')

    businessTombstone.value.title = { as: 'span', text: businessName.value || t('text.unknown') }
    businessTombstone.value.subtitles = business.value
      ? [{ text: getCorpFullDescription(business.value.legalType) }]
      : []
    businessTombstone.value.sideDetails = business.value
      ? [
        { label: t('label.businessNumber'), value: business.value.taxId ?? t('label.notAvailable') },
        { label: t('label.incorporationNumber'), value: business.value.identifier },
        { label: t('label.email'), value: businessContact.value?.email || t('label.notAvailable') },
        { label: t('label.phone'), value: phoneLabel }
      ]
      : []
    businessTombstone.value.loading = false
  }

  async function setPublicDefault(businessId: string, slim = true): Promise<void> {
    businessTombstone.value.loading = true

    if (!business.value) {
      await businessStore.init(businessId, slim, true)
    }

    businessTombstone.value.title = { as: 'h1', text: businessName.value || `[${t('text.unknown')}]` }
    businessTombstone.value.subtitles = business.value
      ? [{ text: getCorpFullDescription(business.value.legalType) }]
      : []
    businessTombstone.value.details = business.value?.state && business.value.state != EntityState.ACTIVE
      ? [{ badge: { label: business.value.state } }]
      : []
    const foundingDate = toDate(business.value?.foundingDate || '')
    const foundingDateStr = foundingDate ? toFormattedDateStr(foundingDate, DateTime.DATE_FULL) : undefined
    businessTombstone.value.sideDetails = [
      {
        label: t(
          businessStore.isFirm()
            ? 'label.registrationDate'
            : 'label.incorporationDate'),
        value: foundingDateStr ?? t('label.notAvailable')
      },
      {
        label: t(
          businessStore.isFirm()
            ? 'label.registrationNum'
            : 'label.incorporationNumber'),
        value: businessId
      },
      { label: t('label.businessNumber'), value: business.value?.taxId ?? t('label.notAvailable') }
    ]
    businessTombstone.value.loading = false
  }

  return {
    businessTombstone,
    resetTombstone,
    setFilingDefault,
    setPublicDefault
  }
}
