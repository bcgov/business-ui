// handle choose existing account page setup
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) { return }
  const localePath = useLocalePath()
  try {
    const accountStore = useAccountStore()
    const accounts = await accountStore.getUserAccounts()
    if (accounts?.orgs.length === 0 || accounts === undefined) {
      return navigateTo(localePath('/accounts/create-new'))
    }
  } catch {
    return navigateTo(localePath('/accounts/create-new'))
  }
})
