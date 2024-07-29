// inspired by https://nuxt.com/docs/guide/recipes/custom-usefetch
import type { NitroFetchRequest, NitroFetchOptions } from 'nitropack'

// type for $fetch options
type BarApiOptions<R extends NitroFetchRequest = NitroFetchRequest> = NitroFetchOptions<R>;

// type for credentials param
type Credentials = 'all' | 'token' | 'account'

/**
 * A composable function to make a BAR API request with optional authorization and error handling.
 *
 * @template T - The expected response type.
 * @param {string} endpoint - Append the specific endpoint on top of the base BAR api url to fetch from.
 * @param {BarApiOptions} [options={}] - Options for the fetch request, extends $fetch options.
 * @param {Credentials} [credentials] - Credentials to include in the request headers ('all', 'token', or 'account').
 * @param {string} [errorMessage='An unexpected error occurred. Please try again later.'] - Default error message if the API does not return one.
 * @returns {Promise<T>} - A promise that resolves to the fetched data of type T.
 */
export const useBarApi = <T>(
  endpoint: string,
  options: BarApiOptions = {},
  credentials?: Credentials,
  errorMessage: string = 'An unexpected error occurred. Please try again later.'
): Promise<T> => {
  const apiUrl = useRuntimeConfig().public.barApiUrl
  const accountStore = useAccountStore()
  const alertStore = useAlertStore()
  const { $keycloak } = useNuxtApp()
  const token = $keycloak.token

  // return $fetch request with otions
  return $fetch<T>(apiUrl + endpoint, {
    ...options, // add any fetch options as defined in the options param
    onRequest ({ options }) { // add request headers based off credentials param
      if (credentials) {
        const headers = options.headers ||= {}

        // Helper function to set headers correctly based on their type
        const setHeader = (key: string, value: string) => {
          if (Array.isArray(headers)) {
            headers.push([key, value])
          } else if (headers instanceof Headers) {
            headers.set(key, value)
          } else {
            headers[key] = value
          }
        }

        // add authorization header if required
        if (credentials === 'all' || credentials === 'token') {
          setHeader('Authorization', `Bearer ${token}`)
        }
        // add account-id header if required
        if (credentials === 'all' || credentials === 'account') {
          setHeader('Account-Id', accountStore.currentAccount.id.toString())
        }
      }
    },
    onResponseError ({ response }) {
      if (response.status === 500) { // specifically handle 500 error
        alertStore.addAlert({
          severity: 'error',
          category: AlertCategory.INTERNAL_SERVER_ERROR
        })
        console.error('Internal Server Error, please try again later or contact us for assistance.')
      } else {
        // use error message from the API or the default error message
        const errorMsg = response._data?.message ?? errorMessage
        console.error(errorMsg)
      }
    }
  })
}
