export default defineNuxtRouteMiddleware((to) => {
  // Check if the route is an affiliation invitation link without locale prefix
  if (to.path.startsWith('/account')) {
    // Construct the full URL with the en-CA locale prefix
    const newUrl = `/en-CA${to.path}`
    // Force a full page reload with the new URL to ensure proper locale handling
    window.location.href = newUrl

    // Prevent Nuxt from handling the navigation since we're doing a full page reload
    return abortNavigation()
  }
})
