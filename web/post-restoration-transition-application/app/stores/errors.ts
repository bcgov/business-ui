import { certifySchema } from '~/interfaces/certify'
import { shareSchema } from '~/interfaces/shares'
import { usePostRestorationTransitionApplicationStore } from '~/stores/post-restoration-transition-application'
import { StaffPaySchema } from '~/interfaces/staffPay'

export const usePostRestorationErrorsStore
  = defineStore('post-restoration-errors-store', () => {
  const certifyErrors = ref<{ [key: string]: string[] }>({})
  const shareErrors = ref<{ [key: string]: string[] }[]>([])
  const folioErrors = ref<{ [key: string]: string[] }>({})
  const courtOrderErrors = ref<{ [key: string]: string[] }>({})
  const completingPartyErrors = ref<{ [key: string]: string[] }>({})
  const articlesErrors = ref<{ [key: string]: string[] }>({})
  const staffPayErrors = ref<{ [key: string]: string[] }>({})
  const openEditFormError = ref<string | undefined>(undefined)
  const filingStore = usePostRestorationTransitionApplicationStore()
  const {
    isStaffOrSbcStaff
  } = storeToRefs(filingStore)

  const clearErrors = () => {
    certifyErrors.value = {}
    shareErrors.value = []
    folioErrors.value = {}
    courtOrderErrors.value = {}
    completingPartyErrors.value = {}
    articlesErrors.value = {}
    staffPayErrors.value = {}
  }

  const verifyCertify = (certify: certify) => {
    certifyErrors.value = {}
    const certifyResult = certifySchema.safeParse(certify)
    if (!certifyResult.success) {
      certifyErrors.value = certifyResult.error.flatten().fieldErrors
    }
  }

  const verifyShareClasses = (shareClasses: (Share | Series)[]) => {
    shareErrors.value = []
    for (let i = 0; i < shareClasses.length; i++) {
      let shareResult = null
      if (Object.keys(shareClasses[i]).includes('series')) {
        shareResult = shareSchema.safeParse(shareClasses[i])
      } else {
        shareResult = seriesSchema.safeParse(shareClasses[i])
      }
      if (!shareResult.success) {
        shareErrors.value.push(shareResult.error.flatten().fieldErrors)
      } else {
        shareErrors.value.push({})
      }
    }
  }

  const verifyFolioReference = (folioReference: folioReference) => {
    folioErrors.value = {}
    const folioResult = folioReferenceSchema.safeParse(folioReference)
    if (!folioResult.success) {
      folioErrors.value = folioResult.error.flatten().fieldErrors
    }
  }

  const verifyCourtOrder = (courtOrder: courtOrder) => {
    courtOrderErrors.value = {}
    const courtOrderResult = courtOrderSchema.safeParse(courtOrder)
    if (!courtOrderResult.success) {
      courtOrderErrors.value = courtOrderResult.error.flatten().fieldErrors
    }
  }

  const verifyCompletingParty = (completingParty: completingParty) => {
    completingPartyErrors.value = {}
    const completingPartyResult = completingPartySchema.safeParse(completingParty)
    if (!completingPartyResult.success) {
      completingPartyErrors.value = completingPartyResult.error.flatten().fieldErrors
    }
  }

  const verifyArticles = (articles: Articles) => {
    articlesErrors.value = {}
    const articlesResult = articlesSchema.safeParse(articles)
    if (!articlesResult.success) {
      articlesErrors.value = articlesResult.error.flatten().fieldErrors
    }
  }

  const verifyStaffPay = (staffPay: StaffPay) => {
    staffPayErrors.value = {}
    const staffPayResult = StaffPaySchema.safeParse(staffPay)
    if (!staffPayResult.success) {
      staffPayErrors.value = staffPayResult.error.flatten().fieldErrors
    }
  }

  const verify = (certify: certify,
    shareClasses: Share[],
    folioReference: folioReference,
    courtOrder: courtOrder,
    completingParty: completingParty,
    articles: Articles,
    staffPay?: StaffPay
  ) => {
    clearErrors()
    verifyCertify(certify)
    verifyShareClasses(shareClasses)
    verifyFolioReference(folioReference)
    verifyCourtOrder(courtOrder)
    verifyCompletingParty(completingParty)
    verifyArticles(articles)
    if (staffPay && isStaffOrSbcStaff.value) {
      verifyStaffPay(staffPay)
    }
  }

  const verifyThenHasErrors = (certify: certify,
    shareClasses: Share[],
    folioReference: folioReference,
    courtOrder: courtOrder,
    completingParty: completingParty,
    articles: Articles,
    staffPay?: StaffPay
  ) => {
    verify(certify, shareClasses, folioReference, courtOrder, completingParty, articles, staffPay)
    return hasErrors.value
  }

  const _hasShareErrors = (): boolean => {
    return shareErrors.value.some(error => Object.keys(error).length > 0)
  }

  const hasErrors = computed(() => {
    return Object.keys(certifyErrors.value).length > 0
      || Object.keys(folioErrors.value).length > 0
      || _hasShareErrors()
      || Object.keys(courtOrderErrors.value).length > 0
      || Object.keys(completingPartyErrors.value).length > 0
      || Object.keys(articlesErrors.value).length > 0
  })

  return {
    certifyErrors,
    folioErrors,
    staffPayErrors,
    shareErrors,
    courtOrderErrors,
    completingPartyErrors,
    articlesErrors,
    openEditFormError,
    clearErrors,
    verify,
    hasErrors,
    verifyThenHasErrors,
    verifyCertify,
    verifyShareClasses,
    verifyFolioReference,
    verifyCourtOrder,
    verifyCompletingParty,
    verifyArticles,
    verifyStaffPay
  }
})
