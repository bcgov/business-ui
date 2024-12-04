export default defineNuxtRouteMiddleware((to) => {
  if (to.path.includes('/affiliationInvitation/acceptToken')) {
    window.location.reload()
    return
  }
})
