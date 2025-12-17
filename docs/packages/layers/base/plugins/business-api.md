# Business API Plugin ($businessApi)

This Nuxt plugin provides a pre-configured and authenticated $fetch instance specifically for interacting with the Business API. It simplifies API calls by automatically handling the baseURL and all required headers for every request.

The plugin adds the helper as $businessApi, which can be accessed from the useNuxtApp() composable. It has the same options as [Nuxt's standard $fetch](https://nuxt.com/docs/4.x/api/utils/dollarfetch).

## Requirements

This plugin requires the user to be authenticated and have an account.
This plugin requires the following env values:

```bash
NUXT_PUBLIC_BUSINESS_API_URL="https://test.api.connect.gov.bc.ca/business-dev"
NUXT_PUBLIC_BUSINESS_API_VERSION="/api/v2"
NUXT_PUBLIC_X_API_KEY=""
```

## Example:

```ts
// In a component or composable
const { $businessApi } = useNuxtApp()

async function fetchBusiness(businessId: string) {
  try {
    const businessData = await $businessApi(`/businesses/${businessId}`)
    return businessData
  } catch (error) {
    console.error('Failed to fetch business:', error)
  }
}
```

## Features

Every request made with $businessApi is configured with the following:

**Base URL**: The baseURL is set by the businessApiUrl and businessApiVersion values in the runtime config. You only need to provide the specific endpoint path (e.g., /businesses/123).

**Authentication Headers**: An onRequest interceptor runs before each request is sent to add the following required headers:

- **Authorization:** A Bearer token is fetched from useConnectAuth.
- **Account-Id:** The current user's account ID is retrieved from useConnectAccountStore.
- **App-Name:** The application name from the runtime config (set by package.json name property).
- **X-Apikey:** The specific API key from the runtime config.

This ensures that all API calls are correctly authenticated and identified without needing to manually add headers in every service or component.