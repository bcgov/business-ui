export default defineNuxtRouteMiddleware(async (to) => {
  const businessId = to.params.businessId as string
  const draftId = to.query.filingId as string
  const filingStore = usePostRestorationTransitionApplicationStore()
  await filingStore.init(businessId, draftId)
})
