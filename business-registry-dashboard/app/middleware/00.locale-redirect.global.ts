export default defineNuxtRouteMiddleware((to) => {
  // Check if the path starts with /affiliationInvitation/acceptToken and doesn't have a locale prefix
  if (to.path.startsWith('/affiliationInvitation/acceptToken') && !to.path.startsWith('/en-CA/')) {
    // Preserve all query parameters in the redirect
    const query = { ...to.query }
    // Redirect to the same path but with locale prefix, maintaining query params
    return navigateTo({
      path: `/en-CA${to.path}`,
      query
    })
  }
})
