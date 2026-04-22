export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig().public
  const localePath = useLocalePath()

  if (to.query?.token && !to.query.return) {
    // FUTURE: #32612 - remove this middleware after email ticket is done
    to.query.return = config.brdUrl + 'affiliationInvitation/acceptToken'
    return navigateTo({ path: localePath('/auth/account/select'), query: to.query })
  }
})
