export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const { $keycloak } = useNuxtApp()
    const localePath = useLocalePath()

    // Check if this is a magic link authentication redirect
    if (to.path.includes('/affiliationInvitation/acceptToken') &&
        to.query.state &&
        to.query.code &&
        to.query.session_state) {
      // Store the original magic link URL (without auth params) in session storage
      const originalUrl = new URL(window.location.href)
      const params = new URLSearchParams(originalUrl.search)

      // Keep only the token and orgName parameters
      const tokenParam = params.get('token')
      const orgNameParam = params.get('orgName')
      const cleanUrl = `${originalUrl.pathname}?token=${tokenParam}${orgNameParam ? '&orgName=' + orgNameParam : ''}`

      sessionStorage.setItem('magicLinkRedirect', cleanUrl)

      // Let Keycloak complete its auth flow
      return
    }

    // After authentication, check if we need to redirect to stored magic link URL
    if ($keycloak.authenticated) {
      const storedMagicLink = sessionStorage.getItem('magicLinkRedirect')
      if (storedMagicLink) {
        sessionStorage.removeItem('magicLinkRedirect')
        return navigateTo(storedMagicLink)
      }
    }

    // Original auth check
    if (to.meta.order !== 0 && !$keycloak.authenticated) {
      return navigateTo(localePath('/'))
    }
  }
})
