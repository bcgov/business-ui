export default defineNuxtRouteMiddleware((to) => {
  // Only proceed if we're hitting the affiliation invitation route
  if (!to.path.includes('/affiliationInvitation/acceptToken/')) {
    return
  }

  // Check if the path already has a locale prefix
  const hasLocale = /^\/[a-zA-Z]{2}-[a-zA-Z]{2}\//.test(to.path)

  if (!hasLocale) {
    // Decode the orgId portion and re-encode it properly
    const pathParts = to.path.split('/')
    const encodedOrgId = pathParts[1] ? decodeURIComponent(pathParts[1]) : ''

    // Add en-CA to the beginning of the path and reconstruct with properly encoded orgId
    const newPath = `/en-CA/${encodedOrgId}${pathParts[1] ? to.path.substring(pathParts[1].length + 1) : ''}`
    return navigateTo(newPath, { redirectCode: 301 })
  }
})
