import type { FetchOptions } from 'ofetch'

type AuthApiClient = ReturnType<typeof $fetch.create>

declare module '#app' {
  interface NuxtApp {
    $authApiBRD: AuthApiClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $authApiBRD: AuthApiClient
  }
}
