export async function namexSearch (query: string): Promise<NamexResult[]> {
  const keycloak = useKeycloak()
  const config = useRuntimeConfig()
  const namexApiUrl = config.public.namexApiGwUrl
  const token = await keycloak.getToken()

  // Set up headers
  const appName = config.public.appName
  const accountStore = useConnectAccountStore()

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'App-Name': appName
  }
  if (accountStore.currentAccount?.id && config.public.namexApiKey) {
    headers['Account-Id'] = accountStore.currentAccount.id
    headers['X-Apikey'] = config.public.namexApiKey as string
  }

  const response = await $fetch<NamexResult[]>(namexApiUrl + '/requests/search', {
    headers,
    params: {
      query,
      start: 0,
      rows: 20
    }
  })

  return response
}
