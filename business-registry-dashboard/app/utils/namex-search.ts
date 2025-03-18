export async function namexSearch (query: string): Promise<NamexResult[]> {
  const keycloak = useKeycloak()
  const namexApiUrl = useRuntimeConfig().public.namexApiUrl
  const token = await keycloak.getToken()

  const response = await $fetch<NamexResult[]>(namexApiUrl + '/requests/search', {
    headers: {
      Authorization: `Bearer ${token}`,
      'App-Name': useRuntimeConfig().public.appName
    },
    params: {
      query,
      start: 0,
      rows: 20
    }
  })

  return response
}
