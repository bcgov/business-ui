export async function regSearch (queryStr: string): Promise<RegSearchResult[]> {
  const keycloak = useKeycloak()
  const config = useRuntimeConfig().public
  const accountStore = useConnectAccountStore()
  const token = await keycloak.getToken()
  const ldStore = useConnectLaunchdarklyStore()

  const legalType = ldStore.getStoredFlag(LDFlags.AllowableBusinessSearchTypes)
  let url = `${config.regSearchApiUrl}/businesses/search/facets?start=0&rows=20`
  url += `&categories=legalType:${legalType}`
  url += `&query=value:${encodeURIComponent(queryStr)}`

  const response = await $fetch<RegSearchResponse>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-apikey': config.registriesSearchApiKey as string,
      'Account-Id': accountStore.currentAccount.id
    }
  })

  if (response.searchResults.results.length > 0) {
    return response.searchResults.results
  } else {
    return []
  }
}
