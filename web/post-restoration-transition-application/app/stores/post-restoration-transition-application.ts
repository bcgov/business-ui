export const usePostRestorationTransitionApplicationStore
  = defineStore('post-restoration-transition-application-store', () => {
  const t = useNuxtApp().$i18n.t
  const legalApi = useLegalApi()
  const authApi = useAuthApi()
  const detailsHeaderStore = useConnectDetailsHeaderStore()
  const activeBusiness = shallowRef<BusinessDataSlim>({} as BusinessDataSlim)

  async function init(businessId: string) {
    const [authInfo, business] = await Promise.all([
      authApi.getAuthInfo(businessId),
      legalApi.getBusiness(businessId, true)
    ])

    activeBusiness.value = business

    // set masthead data
    const contact = authInfo.contacts[0]
    const ext = contact?.extension ?? contact?.phoneExtension
    const phoneLabel = ext ? `${contact?.phone ?? ''} Ext: ${ext}` : contact?.phone ?? ''

    detailsHeaderStore.title = { el: 'span', text: business.legalName }
    detailsHeaderStore.subtitles = [{ text: authInfo.corpType.desc }]
    detailsHeaderStore.sideDetails = [
      { label: t('label.businessNumber'), value: business.taxId ?? '' },
      { label: t('label.incorporationNumber'), value: business.identifier },
      { label: t('label.email'), value: contact?.email ?? '' },
      { label: t('label.phone'), value: phoneLabel }
    ]
  }

  return {
    activeBusiness,
    init
  }
})
