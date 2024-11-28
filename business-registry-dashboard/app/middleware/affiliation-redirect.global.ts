export default defineNuxtRouteMiddleware((to) => {
  // Only proceed if we're hitting the affiliation invitation route
  if (!to.path.includes('/affiliationInvitation/acceptToken/')) {
    return
  }

  // Check if the path already has a locale prefix
  const hasLocale = /^\/[a-zA-Z]{2}-[a-zA-Z]{2}\//.test(to.path)
  console.log('hasLocale', hasLocale)

  if (!hasLocale) {
    // Add en-CA to the beginning of the path
    console.log('to', to.path)
    const newPath = `/en-CA${to.path}`
    console.log('newPath', newPath)
    return navigateTo(newPath, { redirectCode: 301 })
  }
})
