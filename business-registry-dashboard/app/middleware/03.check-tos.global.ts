export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) { return }
  const localePath = useLocalePath()
  const tosStore = useTosStore()
  const alertStore = useAlertStore()
  try {
    // all protected routes
    if (to.meta.order !== 0) {
      const tos = await tosStore.getTermsOfUse()

      // redirect to tos page if not accepted
      if (!tos?.isTermsOfUseAccepted && !to.meta.isTos) {
        return navigateTo(localePath('/tos'))
      }

      // redirect home if is accepted and is navigating to the tos page (prevent manual navigation)
      if (tos?.isTermsOfUseAccepted && to.meta.isTos) {
        return navigateTo(localePath('/'))
      }
    }
  } catch {
    // navigate home if any errors in tos get and add alert
    console.error('Error retrieving Terms of Use, navigating home.')
    alertStore.addAlert({
      severity: 'error',
      category: AlertCategory.INTERNAL_SERVER_ERROR
    })
    return navigateTo({ path: localePath('/'), query: { fromTos: 'true' } })
  }
})
