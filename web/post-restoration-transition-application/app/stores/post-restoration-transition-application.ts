import { isEmpty } from 'es-toolkit/compat'
import { useLegalApi2 } from '~/composables/useLegalApi'
import { type Articles, EmptyArticles } from '~/interfaces/articles'
import type { StandaloneTransitionFiling } from '~/interfaces/standalone-transition'
import type { PageSection } from '~/enum/page_sections'

const transitionApplicationIncompleteHook = 'app:transition-application-form:incomplete'

export const usePostRestorationTransitionApplicationStore
  = defineStore('post-restoration-transition-application-store', () => {
  const { errorModal } = useModal()
  const nuxtApp = useNuxtApp()
  const t = nuxtApp.$i18n.t
  const legalApi = useLegalApi2()
  const accountStore = useConnectAccountStore()
  const { setFilingDefault, filingTombstone } = useFilingTombstone()
  const { userFullName } = storeToRefs(accountStore)
  const activeBusiness = shallowRef<BusinessDataSlim>({} as BusinessDataSlim)
  const articles = ref<Articles>(EmptyArticles())
  const regOfficeEmail = ref<string | undefined>(undefined)
  const compPartyEmail = ref<string | undefined>(undefined)
  const courtOrderNumber = ref<string | undefined>(undefined)
  const planOfArrangement = ref<boolean>(false)
  const folio = ref<string | undefined>(undefined)
  const staffPay = ref<StaffPay>({ priority: false } as StaffPay)

  const formIdSectionMapping = ref<{ [key: string]: PageSection }>({})
  const offices = ref<Office[]>([])
  const directors = ref<OrgPerson[]>([])
  const ORIGINAL_DIRECTORS = ref<OrgPerson[]>([])
  const legalName = ref<string | undefined>(undefined)
  const shareClasses = ref<Share[]>([])
  const ORIGINAL_SHARE_CLASSES = ref<Share[]>([])
  const editingShareIndex = ref<number>(-1)
  const certifiedByLegalName = ref<boolean | undefined>(false)
  const editingDirector = ref<OrgPerson | undefined>(undefined)
  const openEditComponentId = ref<string | undefined>(undefined)
  const modifiedDirectors = ref<number[]>([])
  const editingSeriesParent = ref<number>(-1)
  const draftFilingId = ref<string | undefined>(undefined)

  const isStaffOrSbcStaff = computed(() => {
    return accountStore.hasRoles(['STAFF'])
  })

  const editState = computed(() => editingShareIndex.value !== -1)

  const businessName = computed(() => {
    const alternateName = activeBusiness.value?.alternateNames?.length > 0
      ? activeBusiness.value?.alternateNames[0]?.name
      : undefined

    return activeBusiness.value?.legalName || alternateName || undefined
  })

  const _getContactPointEmail = (authInfo: AuthInformation): string | undefined => {
    // find first contact with email and return it, otherwise return undefined
    return authInfo?.contacts?.find(contact => contact.email)?.email
  }

  const _cleanDirectors = (directors: OrgPerson[]) => {
    // if officer email is empty string or spaces, remove email attribute from the object
    return directors
      .map((director) => {
        if (director?.officer?.email?.trim() === '') {
          delete director.officer.email
        }
        return director
      })
  }

  const setTransitionBreadcrumbs = () => {
    const rtc = useRuntimeConfig().public

    setBreadcrumbs([
      {
        label: t('label.bcRegistriesDashboard'),
        to: `${rtc.registryHomeUrl}dashboard`,
        external: true
      },
      {
        label: t('label.myBusinessRegistry'),
        to: `${rtc.brdUrl}account/${activeBusiness.value.identifier}`,
        appendAccountId: true,
        external: true
      },
      {
        label: businessName.value || activeBusiness.value.identifier,
        to: `${rtc.businessDashboardUrl + activeBusiness.value.identifier}`,
        appendAccountId: true,
        external: true
      },
      {
        label: t('transitionApplication.title')
      }
    ])
  }

  const _setContactPoint = (authInfo: AuthInformation) => {
    regOfficeEmail.value = _getContactPointEmail(authInfo)
  }

  // linter, giving minimal required attributes object has to have to fit as the params for this function
  const _openInitErrorModal = (error: { statusCode: number }) => {
    const router = useRouter()
    const rtc = useRuntimeConfig().public
    const buttons: ConnectModalButton[] = []
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
    errorModal.open({
        error: error,
        i18nPrefix: 'modal.error.initStore',
        buttons: buttons
      })
  }

  const _initOffices = (addresses: IncorporationAddress) => {
    // reset offices so when pushing they are not duplicated (on refresh and similar)
    offices.value = []
    if (addresses.registeredOffice) {
      offices.value.push({
        officeType: 'registeredOffice',
        deliveryAddress: formatAddressUi(addresses.registeredOffice.deliveryAddress),
        mailingAddress: formatAddressUi(addresses.registeredOffice.mailingAddress)
      })
    }
    if (addresses.recordsOffice) {
      offices.value.push({
        officeType: 'recordsOffice',
        deliveryAddress: formatAddressUi(addresses.recordsOffice.deliveryAddress),
        mailingAddress: formatAddressUi(addresses.recordsOffice.mailingAddress)
      })
    }
  }

  const _loadDraft = (draft: FilingSubmissionBody<StandaloneTransitionFiling>) => {
    directors.value = draft.filing.transition.parties
    for (let i = 0; i < directors.value.length; i++) {
      // compare the draft director mailing / delivery to the original to see if there are any changes
      const mailingAddresses = [directors.value[i]?.mailingAddress, ORIGINAL_DIRECTORS.value[i]?.mailingAddress]
      const deliveryAddresses = [directors.value[i]?.deliveryAddress, ORIGINAL_DIRECTORS.value[i]?.deliveryAddress]
      for (const addresses of [mailingAddresses, deliveryAddresses]) {
        const currentAddress = addresses[0]
        const originalAddress = addresses[1]
        if (
          // one address is undefined and the other is not
          ((!currentAddress && originalAddress) || (currentAddress && !originalAddress))
          // both addresses are defined, but at least one field is different
          || (currentAddress && originalAddress && !areApiAddressesEqual(currentAddress, originalAddress))
        ) {
          // one of the addresses is changed so add director to modified index list
          modifiedDirectors.value.push(i)
          // continue to next director
          break
        }
      }
    }
    shareClasses.value = draft.filing.transition.shareStructure.shareClasses
    // TODO: resolution dates #30846
    // articles.value.resolutionDates =
    // TODO: court order details #30849
    // courtOrderNumber.value =
    // planOfArrangement.value =
    folio.value = draft.filing.header.folioNumber
    const contactEmail = draft.filing.transition.contactPoint?.email
    if (contactEmail && contactEmail !== regOfficeEmail.value) {
      compPartyEmail.value = contactEmail
    }
  }

  async function init(businessId: string, draftId?: string) {
    filingTombstone.value.loading = true
    draftFilingId.value = draftId
    // if user is client, autopopulate legalName
    if (!isStaffOrSbcStaff.value) {
      legalName.value = userFullName.value
    }

    const [
      authInfo,
      shareClassesResponse,
      business,
      apiAddresses,
      apiDirectors,
      resolutions,
      draft
    ] = await Promise.all([
      legalApi.getAuthInfo(businessId),
      legalApi.getShareClasses(businessId),
      legalApi.getBusiness(businessId, true),
      legalApi.getAddresses(businessId),
      legalApi.getParties(businessId, { type: 'director' }),
      legalApi.getResolutions(businessId),
      draftId ? legalApi.getFilingById<StandaloneTransitionFiling>(businessId, draftId) : undefined
    ]).catch((error) => {
      _openInitErrorModal(error)
      return [undefined, undefined, undefined, undefined, undefined, undefined, undefined]
    })
    if (authInfo && shareClassesResponse && business && apiAddresses && apiDirectors && resolutions) {
      regOfficeEmail.value = _getContactPointEmail(authInfo)
      activeBusiness.value = business
      _cleanDirectors(apiDirectors)
      directors.value = apiDirectors
      ORIGINAL_DIRECTORS.value = JSON.parse(JSON.stringify(apiDirectors))
      shareClasses.value = JSON.parse(JSON.stringify(shareClassesResponse.shareClasses))
      ORIGINAL_SHARE_CLASSES.value = JSON.parse(JSON.stringify(shareClassesResponse.shareClasses))

      if (resolutions.resolutions?.length > 0) {
        articles.value.resolutionDates = resolutions?.resolutions.map(resolution => resolution.date)
      }
      if (business.foundingDate) {
        articles.value.incorpDate = business.foundingDate
      }
      _initOffices(apiAddresses)
      setFilingDefault(business, authInfo)

      if (draft) {
        _loadDraft(draft)
      }
    }
    filingTombstone.value.loading = false
  }

  const shareWithSpecialRightsModified = computed(() => {
    for (const share of shareClasses.value) {
      if (share.hasRightsOrRestrictions && (share.added || share.modified)) {
        return true
      }
      for (const series of share.series) {
        if (series.hasRightsOrRestrictions && (series.added || series.modified)) {
          return true
        }
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
          email: compPartyEmail.value || regOfficeEmail.value || undefined // todo: find out correct details for this
        },
        shareStructure: { shareClasses: shareClasses.value }
      }
    }
    console.info(transitionFiling)
    return transitionFiling
  }

  const sectionHasOpenForm = (pageSection: PageSection): boolean => {
    // setup in this direction as we can have only one blocking edit form open on the page
    if (openEditComponentId.value) {
      return (pageSection === formIdSectionMapping.value[openEditComponentId.value])
    }
    return false
  }

  const registerFormIdToSection = (formId: string, pageSection: PageSection) => {
    formIdSectionMapping.value[formId] = pageSection
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
    sectionHasOpenForm,
    setTransitionBreadcrumbs,
    registerFormIdToSection,
    init,
    checkHasActiveForm,
    checkHasChanges,
    getFilingPayload,
    editingShareIndex,
    shareWithSpecialRightsModified,
    ORIGINAL_SHARE_CLASSES,
    staffPay,
    editingDirector,
    openEditComponentId,
    modifiedDirectors,
    editingSeriesParent,
    draftFilingId
  }
})
