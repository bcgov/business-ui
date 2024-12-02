export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const { $keycloak } = useNuxtApp()
    const localePath = useLocalePath()

    // If it's an invitation acceptance URL, handle it differently
    if (to.path.includes('/affiliationInvitation/acceptToken/')) {
      // Option 1: Force reload
      window.location.href = localePath('/')
      return
    }

    // Regular auth check
    if (to.meta.order !== 0 && !$keycloak.authenticated) {
      return navigateTo(localePath('/'))
    }
  }
})
