export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const { $keycloak } = useNuxtApp()
    const localePath = useLocalePath()
    
    // Check if this is an affiliation invitation acceptance route
    const isAffiliationAcceptance = to.path.includes('/affiliationInvitation/acceptToken/')
    
    if (to.meta.order !== 0 && !$keycloak.authenticated) {
      // Store the original URL if it's an affiliation acceptance
      if (isAffiliationAcceptance) {
        sessionStorage.setItem('REDIRECT_AFTER_AUTH', to.fullPath)
      }
      return navigateTo(localePath('/'))
    }

    // Check for stored redirect after authentication
    if ($keycloak.authenticated && isAffiliationAcceptance) {
      const storedPath = sessionStorage.getItem('REDIRECT_AFTER_AUTH')
      if (storedPath) {
        sessionStorage.removeItem('REDIRECT_AFTER_AUTH')
        return navigateTo(storedPath)
      }
    }
  }
})
