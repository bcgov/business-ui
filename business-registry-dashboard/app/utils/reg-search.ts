export async function regSearch (queryStr: string): Promise<RegSearchResult[]> {
  const keycloak = useKeycloak()
  const config = useRuntimeConfig().public
  const accountStore = useConnectAccountStore()
  const token = await keycloak.getToken()

  const legalType = 'A,BC,BEN,C,CBEN,CC,CCC,CP,CUL,FI,GP,LL,LLC,LP,PA,S,SP,ULC,XCP,XL,XP,XS'
  let url = `${config.regSearchApiUrl}/businesses/search/facets?start=0&rows=20`
  url += `&categories=legalType:${legalType}`
  url += `&query=value:${encodeURIComponent(queryStr)}`

  const response = await $fetch<RegSearchResponse>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-apikey': config.xApiKey,
      'Account-Id': accountStore.currentAccount.id
    }
  })

  if (response.searchResults.results.length > 0) {
    return response.searchResults.results
  } else {
    return []
  }
}
