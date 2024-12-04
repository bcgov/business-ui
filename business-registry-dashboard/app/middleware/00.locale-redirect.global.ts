export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/affiliationInvitation/acceptToken') && !to.path.startsWith('/en-CA/')) {
    // Convert query params to URLSearchParams
    const searchParams = new URLSearchParams(to.query as Record<string, string>)
    const queryString = searchParams.toString()

    // Construct the full URL and force a page reload
    const newUrl = `/en-CA${to.path}${queryString ? '?' + queryString : ''}`
    window.location.href = newUrl

    // Prevent further navigation handling
    return abortNavigation()
  }
})
