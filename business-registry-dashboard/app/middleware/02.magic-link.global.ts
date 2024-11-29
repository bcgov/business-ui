export default defineNuxtRouteMiddleware((to) => {
  const localePath = useLocalePath()

  // Check if path contains affiliationInvitation and extract token
  if (to.path.includes('affiliationInvitation/acceptToken/')) {
    const token = to.path.split('acceptToken/')[1]
    if (token) {
      sessionStorage.setItem('affiliationToken', token)
    }
    window.location.href = localePath('/')
    return
  }
})
