import { z } from 'zod'

import { certifySchema } from '~/interfaces/certify'
import { shareSchema } from '~/interfaces/shares'

export const usePostRestorationErrorsStore
  = defineStore('post-restoration-errors-store', () => {
  const certifyErrors = ref<{[key: string]: string[]}>({})
  const shareErrors = ref<{[key: string]: string[]}>({})
  const folioErrors = ref<{[key: string]: string[]}>({})
  const courtOrderErrors = ref<{[key: string]: string[]}>({})
  const completingPartyErrors = ref<{[key: string]: string[]}>({})
  const articlesErrors = ref<{[key: string]: string[]}>({})

  const clearErrors = () => {
    certifyErrors.value = {}
    shareErrors.value = {}
    folioErrors.value = {}
    courtOrderErrors.value = {}
    completingPartyErrors.value = {}
    articlesErrors.value = {}
  }

  const verify = (certify: certify,
    shareClasses: Share[],
    folioReference: folioReference,
    courtOrder: courtOrder,
    completingParty: completingParty,
    articles: Articles
  ) => {
    clearErrors()
    const certifyResult = certifySchema.safeParse(certify)
    if (!certifyResult.success) {
      certifyErrors.value = certifyResult.error.flatten().fieldErrors
    }
    const shareResult = shareSchema.safeParse(shareClasses)
    if (!shareResult.success) {
      shareErrors.value = shareResult.error.flatten().fieldErrors
    }
    const folioResult = folioReferenceSchema.safeParse(folioReference)
    if (!folioResult.success) {
      folioErrors.value = folioResult.error.flatten().fieldErrors
    }
    const courtOrderResult = courtOrderSchema.safeParse(courtOrder)
    if (!courtOrderResult.success) {
      courtOrderErrors.value = courtOrderResult.error.flatten().fieldErrors
    }
    const completingPartyResult = completingPartySchema.safeParse(completingParty)
    if (!completingPartyResult.success) {
      completingPartyErrors.value = completingPartyResult.error.flatten().fieldErrors
    }
    const articlesResult = articlesSchema.safeParse(articles)
    if (!articlesResult.success) {
      articlesErrors.value = articlesResult.error.flatten().fieldErrors
    }
  }

  const hasErrors = computed(() => {
    return Object.keys(certifyErrors.value).length > 0 ||
      Object.keys(folioErrors.value).length > 0 ||
      Object.keys(shareErrors.value).length > 0 ||
      Object.keys(courtOrderErrors.value).length > 0 ||
      Object.keys(completingPartyErrors.value).length > 0 ||
      Object.keys(articlesErrors.value).length > 0
  })

  const verifyThenHasErrors = (certify: certify,
    shareClasses: Share[],
    folioReference: folioReference,
    courtOrder: courtOrder,
    completingParty: completingParty,
    articles: Articles
  ) => {
    verify(certify, shareClasses, folioReference, courtOrder, completingParty, articles)
    return hasErrors.value
  }

  return {
    certifyErrors,
    folioErrors,
    shareErrors,
    courtOrderErrors,
    completingPartyErrors,
    articlesErrors,
    clearErrors,
    verify,
    hasErrors,
    verifyThenHasErrors
  }
})
