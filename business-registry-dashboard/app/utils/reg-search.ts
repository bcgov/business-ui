export async function regSearch (queryStr: string): Promise<RegSearchResult[]> {
  const keycloak = useKeycloak()
  const config = useRuntimeConfig().public
  const accountStore = useConnectAccountStore()
  const token = await keycloak.getToken()

  const response = await $fetch<RegSearchResponse>(`${config.regSearchApiUrl}/search/businesses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-apikey': config.xApiKey,
      'Account-Id': accountStore.currentAccount.id
    },
    body: {
      query: {
        value: queryStr
      },
      categories: {
        status: ['ACTIVE'],
        legalType: ['A', 'BC', 'BEN', 'C', 'CBEN', 'CC', 'CCC', 'CP', 'CUL', 'FI', 'GP', 'LL', 'LLC', 'LP', 'PA', 'S', 'SP', 'ULC', 'XCP', 'XL', 'XP', 'XS']
      },
      rows: 20,
      start: 0
    }
  })

  if (response.searchResults.results.length > 0) {
    return response.searchResults.results
  } else {
    return []
  }
}
