import type { FetchOptions } from 'ofetch'

interface SearchAPI {
  namexSearch: (query: string) => Promise<NamexResult[]>
  regSearch: (query: string) => Promise<RegSearchResult[]>
}

declare module '#app' {
  interface NuxtApp {
    $searchAPI: SearchAPI
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $searchAPI: SearchAPI
  }
}
