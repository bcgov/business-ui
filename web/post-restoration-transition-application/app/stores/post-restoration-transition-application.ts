export const usePostRestorationTransitionApplicationStore
  = defineStore('post-restoration-transition-application-store', () => {
  const t = useNuxtApp().$i18n.t
  const legalApi = useLegalApi()
  const authApi = useAuthApi()
  const detailsHeaderStore = useConnectDetailsHeaderStore()
  const activeBusiness = shallowRef<BusinessDataSlim>({} as BusinessDataSlim)

  const businessName = computed(() => {
    const alternateName = activeBusiness.value?.alternateNames?.length > 0
      ? activeBusiness.value?.alternateNames[0]?.name
      : undefined

    return activeBusiness.value?.legalName || alternateName || undefined
  })

  const _updateBreadcrumbs = async (businessId: string) => {
    const rtc = useRuntimeConfig().public

    setBreadcrumbs([
      {
        label: t('label.bcRegistriesDashboard'),
        to: `${rtc.registryHomeUrl}dashboard`,
        external: true
      },
      {
        label: t('label.myBusinessRegistry'),
        to: `${rtc.brdUrl}account/${businessId}`,
        appendAccountId: true,
        external: true
      },
      {
        label: businessName.value || businessId,
        to: `${rtc.businessDashboardUrl + businessId}`,
        appendAccountId: true,
        external: true
      },
      {
        label: t('page.postRestorationTransitionApplication.h1')
      }
    ])
  }

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

    await _updateBreadcrumbs(businessId)
  }

  return {
    activeBusiness,
    init
  }
})
