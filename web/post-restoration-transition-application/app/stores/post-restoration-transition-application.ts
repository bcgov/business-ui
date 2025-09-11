import { useLegalApi2 } from '~/composables/useLegalApi'
import { type Articles, EmptyArticles } from '~/interfaces/articles'
import type { StandaloneTransitionFiling } from '~/interfaces/standalone-transition'

const transitionApplicationIncompleteHook = 'app:transition-application-form:incomplete'

export const usePostRestorationTransitionApplicationStore
  = defineStore('post-restoration-transition-application-store', () => {
  const t = useNuxtApp().$i18n.t
  const nuxtApp = useNuxtApp()
  const legalApi = useLegalApi2()
  const authApi = useAuthApi()
  const feeStore = useConnectFeeStore()
  const accountStore = useConnectAccountStore()
  const detailsHeaderStore = useConnectDetailsHeaderStore()
  const { isStaffOrSbcStaff, userFullName } = storeToRefs(useConnectAccountStore())
  const activeBusiness = shallowRef<BusinessDataSlim>({} as BusinessDataSlim)
  const articles = ref<Articles>(EmptyArticles())
  const regOfficeEmail = ref<string | undefined>(undefined)
  const compPartyEmail = ref<string | undefined>(undefined)
  const courtOrderNumber = ref<string | undefined>(undefined)
  const planOfArrangement = ref<boolean>(false)
  const folio = ref<string | undefined>(undefined)
  const modifiedShareIndexes = ref<number[]>([])
  const staffPay = ref<StaffPay>({ priority: false } as StaffPay)

  const offices = ref<Office[]>([])
  const directors = ref<OrgPerson[]>([])
  const legalName = ref<string | undefined>(undefined)
  const shareClasses = ref<Share[]>([])
  const ORIGINAL_SHARE_CLASSES = ref<Share[]>([])
  const editingShareIndex = ref<number>(-1)
  const certifiedByLegalName = ref<boolean | undefined>(false)
  const editingDirector = ref<OrgPerson | undefined>(undefined)
  const openEditComponentId = ref<string | undefined>(undefined)
  const modifiedDirectors = ref<number[]>([])

  const editState = computed(() => editingShareIndex.value !== -1)

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
    const [authInfo, shareClassesResponse, business, apiAddresses, apiDirectors] = await Promise.all([
      authApi.getAuthInfo(businessId),
      legalApi.getShareClasses(businessId),
      legalApi.getBusiness(businessId, true),
      legalApi.getAddresses(businessId),
      legalApi.getParties(businessId, { type: 'director' })
    ]).catch((error) => {
      const modal = useModal()
      const router = useRouter()
      const rtc = useRuntimeConfig().public
      const buttons: ModalButtonProps[] = []
      const errorStatus = error.statusCode || 404
      if (errorStatus === 401 || errorStatus === 403 || errorStatus === 404) {
        buttons.push({
          label: t('label.goToMyBusinessRegistry'),
          to: `${rtc.brdUrl}account/${accountStore.currentAccount.id}`
        })
      } else if (errorStatus > 499 && errorStatus < 600) {
        buttons.push({ label: t('label.goBack'), onClick: () => router.back() })
        buttons.push({ label: t('label.refresh'), onClick: () => window.location.reload() })
      } else {
        buttons.push({ label: t('label.close'), shouldClose: true })
      }
      modal.openBaseErrorModal(
        error,
        'modal.error.initOfficerStore',
        buttons
      )
    })
    // FUTURE: error handling on fees #29114
    const transitionFees = await feeStore.getFee(business.legalType, 'TRANP')
    feeStore.feeOptions.showServiceFees = true
    if (transitionFees) {
      transitionFees.total = transitionFees.filingFees + transitionFees.serviceFees
      feeStore.addReplaceFee(transitionFees)
    }

    activeBusiness.value = business
    directors.value = apiDirectors
    shareClasses.value = JSON.parse(JSON.stringify(shareClassesResponse.shareClasses))
    ORIGINAL_SHARE_CLASSES.value = JSON.parse(JSON.stringify(shareClassesResponse.shareClasses))

    try {
      const resolutions = await legalApi.getResolutions(businessId)
      if (resolutions.resolutions?.length > 0) {
        articles.value.resolutionDates = resolutions?.resolutions.map(resolution => resolution.date)
      }
      if (business.foundingDate) {
        articles.value.incorpDate = business.foundingDate
      }
    } catch (error) {
      const modal = useModal()
      modal.openBaseErrorModal(
        error,
        'modal.error.initOfficerStore'
      )
    }

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

    // if user is client, autopopulate legalName
    if (!isStaffOrSbcStaff.value) {
      legalName.value = userFullName.value
    }

    await _updateBreadcrumbs(businessId)
  }

  const shareWithSpecialRightsModified = computed(() => {
    for (const index of modifiedShareIndexes.value) {
      if (shareClasses.value[index]?.hasRightsOrRestrictions
        || ORIGINAL_SHARE_CLASSES.value[index]?.hasRightsOrRestrictions) {
        return true
      }
    }
    return false
  })

  async function checkHasActiveForm(opt: 'save' | 'submit' | 'change') {
    if (!isEmpty(editState.value)) {
      let msg
      switch (opt) {
        case 'save':
          msg = t('text.finishTaskBeforeSave')
          break
        case 'change':
          msg = t('text.finishTaskBeforeOtherChanges')
          break
        case 'submit':
          msg = t('text.finishTaskBeforeSubmit')
          break
        default:
          msg = t('text.finishTaskBeforeOtherChanges')
      }

      await nuxtApp.callHook(transitionApplicationIncompleteHook, { message: msg })
      return true
    }
    return false
  }

  const checkHasChanges = async (opt: 'save' | 'submit' | 'change') => {
    if (await checkHasActiveForm(opt)) {
      return true
    }
    return true
    // return false
    // todo: on wha1t changes do we want to stop ?
  }

  const getFilingPayload = (): StandaloneTransitionFiling | undefined => {
    // todo: implement filing payload
    const officesData = toStandaloneTransitionOffices(offices.value)
    if (officesData === undefined) {
      return undefined
    }
    const transitionFiling = {
      transition: {
        nameTranslations: activeBusiness.value.alternateNames,
        offices: officesData,
        parties: directors.value,
        hasProvisions: false, // todo: find out hot wo fill this out
        contactPoint: {
          email: compPartyEmail.value || regOfficeEmail.value || '' // todo: find out correct details for this
        },
        shareStructure: { shareClasses: shareClasses.value }
      }
    }
    console.info(transitionFiling)
    return transitionFiling
  }

  return {
    activeBusiness,
    articles,
    certifiedByLegalName,
    compPartyEmail,
    courtOrderNumber,
    directors,
    folio,
    isStaffOrSbcStaff,
    legalName,
    offices,
    shareClasses,
    planOfArrangement,
    regOfficeEmail,
    init,
    checkHasActiveForm,
    checkHasChanges,
    getFilingPayload,
    editingShareIndex,
    modifiedShareIndexes,
    shareWithSpecialRightsModified,
    ORIGINAL_SHARE_CLASSES,
    staffPay,
    editingDirector,
    openEditComponentId,
    modifiedDirectors
  }
})
