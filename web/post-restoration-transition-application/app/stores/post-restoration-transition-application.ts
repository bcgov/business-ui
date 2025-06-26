import { useLegalApi2 } from '~/composables/useLegalApi'

export const usePostRestorationTransitionApplicationStore
  = defineStore('post-restoration-transition-application-store', () => {
  const t = useNuxtApp().$i18n.t
  const legalApi = useLegalApi2()
  const authApi = useAuthApi()
  const detailsHeaderStore = useConnectDetailsHeaderStore()
  const activeBusiness = shallowRef<BusinessDataSlim>({} as BusinessDataSlim)
  const regOfficeEmail = ref<string | undefined>(undefined)
  const compPartyEmail = ref<string | undefined>(undefined)
  const courtOrderNumber = ref<string | undefined>(undefined)
  const planOfArrangement = ref<boolean>(false)
  const folio = ref<string | undefined>(undefined)

  const offices = ref<Office[]>([])
  const directors = ref<OrgPerson[]>([])

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
        label: t('transitionApplication.title')
      }
    ])
  }

  async function init(businessId: string) {
    const [authInfo, business, apiAddresses, apiDirectors] = await Promise.all([
      authApi.getAuthInfo(businessId),
      legalApi.getBusiness(businessId, true),
      legalApi.getAddresses(businessId),
      legalApi.getParties(businessId, { type: 'director' })
    ])

    activeBusiness.value = business
    directors.value = apiDirectors

    // reset offices so when pushing they are not duplicated (on refresh and similar)
    offices.value = []
    if (apiAddresses?.registeredOffice) {
      offices.value.push({
        officeType: 'registeredOffice',
        deliveryAddress: formatAddressUi(apiAddresses.registeredOffice.deliveryAddress),
        mailingAddress: formatAddressUi(apiAddresses.registeredOffice.mailingAddress)
      })
    }
    if (apiAddresses.recordsOffice) {
      offices.value.push({
        officeType: 'recordsOffice',
        deliveryAddress: formatAddressUi(apiAddresses.recordsOffice.deliveryAddress),
        mailingAddress: formatAddressUi(apiAddresses.recordsOffice.mailingAddress)
      })
    }

    // set masthead data
    const contact = authInfo.contacts[0]
    const ext = contact?.extension ?? contact?.phoneExtension
    const phoneLabel = ext ? `${contact?.phone ?? ''} Ext: ${ext}` : contact?.phone ?? ''
    regOfficeEmail.value = contact?.email
    folio.value = authInfo.folioNumber

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
    compPartyEmail,
    courtOrderNumber,
    directors,
    folio,
    offices,
    planOfArrangement,
    regOfficeEmail,
    init
  }
})
