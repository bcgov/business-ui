import type { FetchOptions } from 'ofetch'

type AuthApiClient = ReturnType<typeof $fetch.create>

interface SearchAPI {
  namexSearch: (query: string) => Promise<NamexResult[]>
  regSearch: (query: string) => Promise<RegSearchResult[]>
}

declare module '#app' {
  interface NuxtApp {
    $authApiBRD: AuthApiClient
    $searchAPI: SearchAPI
    }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $authApiBRD: AuthApiClient
    $searchAPI: SearchAPI

  }
}


