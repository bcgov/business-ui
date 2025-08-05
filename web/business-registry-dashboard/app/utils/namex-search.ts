export async function namexSearch (query: string): Promise<NamexResult[]> {
  const keycloak = useKeycloak()
  const config = useRuntimeConfig()
  let namexApiUrl = config.public.namexApiUrl
  let useNamexApiKey = false
  const token = await keycloak.getToken()

  // Check feature flag to determine which API to use
  try {
    const ldStore = useConnectLaunchdarklyStore()
    if (ldStore.ldInitialized && ldStore.getStoredFlag(LDFlags.UseNamexGwUrl)) {
      namexApiUrl = config.public.namexApiGwUrl
      useNamexApiKey = true
    }
  } catch (error) {
    // LaunchDarkly not ready or error accessing store, use default namex API
    console.error('LaunchDarkly not available, using Namex API:', namexApiUrl)
  }

  // Set up headers
  const appName = config.public.appName
  const accountStore = useConnectAccountStore()

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'App-Name': appName
  }
  if (useNamexApiKey && config.public.namexApiKey) {
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
