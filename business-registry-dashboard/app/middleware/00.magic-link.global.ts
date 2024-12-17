export default defineNuxtRouteMiddleware((to) => {
  // Check if the route is an affiliation invitation link without locale prefix
  if ((to.path.startsWith('/affiliationInvitation/acceptToken') || to.path.startsWith('/magicLink')) && !to.path.startsWith('/en-CA/')) {
    // Convert query params to URLSearchParams to maintain all existing query parameters
    const searchParams = new URLSearchParams(to.query as Record<string, string>)
    const queryString = searchParams.toString()

    // Construct the full URL with the en-CA locale prefix and existing query parameters
    const newUrl = `/en-CA${to.path}${queryString ? '?' + queryString : ''}`
    // Force a full page reload with the new URL to ensure proper locale handling
    window.location.href = newUrl

    // Prevent Nuxt from handling the navigation since we're doing a full page reload
    return abortNavigation()
  }
})
