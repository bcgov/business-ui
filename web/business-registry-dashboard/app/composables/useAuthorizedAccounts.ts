/** Loads the accounts that have access to view and manage a business, for the View Access screen. */
export function useAuthorizedAccounts (businessIdentifier: MaybeRefOrGetter<string>) {
  const { $authApi } = useNuxtApp()

  const accounts = ref<AuthorizedAccount[]>([])
  const loading = ref(true)
  const error = ref(false)

  async function load () {
    const identifier = toValue(businessIdentifier)
    if (!identifier) { return }

    loading.value = true
    error.value = false
    try {
      const response = await $authApi<AuthorizedAccountsResponse>(
        `/entities/${identifier}/authorized-accounts`
      )
      accounts.value = response.authorizedAccounts ?? []
    } catch (e) {
      error.value = true
      accounts.value = []
      logFetchError(e, `Error retrieving authorized accounts for ${identifier}`)
    } finally {
      loading.value = false
    }
  }

  return { accounts, loading, error, load }
}
