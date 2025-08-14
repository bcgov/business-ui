export default defineNuxtPlugin((nuxtApp) => {
  const namexSearch = async (query: string): Promise<NamexResult[]> => {
    const keycloak = useKeycloak()
    const config = useRuntimeConfig()
    const namexApiUrl = config.public.namexApiGwUrl
    const token = await keycloak.getToken()

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

    return await $fetch<NamexResult[]>(`${namexApiUrl}/requests/search`, {
      headers,
      params: {
        query,
        start: 0,
        rows: 20
      }
    })
  }

  const regSearch = async (queryStr: string): Promise<RegSearchResult[]> => {
    if (!IsAuthorized(AuthorizedActions.SEARCH_BUSINESS_NR)) {
      throw new Error('Not authorized to search businesses')
    }

    const keycloak = useKeycloak()
    const config = useRuntimeConfig().public
    const accountStore = useConnectAccountStore()
    const ldStore = useConnectLaunchdarklyStore()
    const token = await keycloak.getToken()

    const legalType = ldStore.getStoredFlag(LDFlags.AllowableBusinessSearchTypes)
    let url = `${config.regSearchApiUrl}/businesses/search/facets?start=0&rows=20`
    url += `&categories=legalType:${legalType}`
    url += `&query=value:${encodeURIComponent(queryStr)}`

    const response = await $fetch<RegSearchResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-apikey': config.registriesSearchApiKey as string,
        'Account-Id': accountStore.currentAccount.id,
        'App-Name': config.appName
      }
    })

    return response.searchResults.results ?? []
  }

  nuxtApp.provide('searchAPI', {
    namexSearch,
    regSearch
  })
})
