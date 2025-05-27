import { initialize } from 'launchdarkly-js-client-sdk'
import type { LDClient, LDFlagSet, LDOptions, LDMultiKindContext } from 'launchdarkly-js-client-sdk'
import { defineStore } from 'pinia'
import { useKeycloak, useConnectAccountStore } from '#imports'

export const useConnectLaunchdarklyStore = defineStore('brd-connect-ld-store', () => {
  const keycloak = reactive(useKeycloak())
  const accountStore = useConnectAccountStore()
  const ldClient: Ref<LDClient | null> = ref(null)
  const ldContext = ref({
    kind: 'multi',
    org: { key: 'anonymous' },
    user: { key: 'anonymous' }
  } as LDMultiKindContext)
  const ldFlagSet: Ref<LDFlagSet> = ref({})
  const ldInitialized = ref(false)
  const isInitializing = ref(false)
  const isAppLoaded = ref(false)

  // Only initialize LaunchDarkly after app is fully loaded and user is authenticated
  watch([() => keycloak.isAuthenticated, () => isAppLoaded.value], ([isAuthenticated, isLoaded]) => {
    if (isAuthenticated && isLoaded && !ldInitialized.value && !isInitializing.value) {
      init()
    } else if (isAuthenticated && isLoaded && ldInitialized.value) {
      // If the context has changed but we're already initialized, update the context
      updateUserContext()
    }
  })

  // Watch for account changes to update LaunchDarkly org context
  watch(() => accountStore.currentAccount.id, (accountId) => {
    if (accountId && ldInitialized.value) {
      updateUserContext()
    }
  })

  // Create the user and org context objects for LaunchDarkly
  function createLdContext () {
    const appName = useRuntimeConfig().public.appName

    // Create user context
    const user = {
      key: keycloak.kcUser.keycloakGuid,
      firstName: keycloak.kcUser.firstName,
      lastName: keycloak.kcUser.lastName,
      email: keycloak.kcUser.email,
      roles: keycloak.kcUser.roles,
      loginSource: keycloak.kcUser.loginSource,
      appSource: appName
    }

    // Default org to user key if no account
    let org = { key: user.key, appSource: appName }

    // Use account info if available
    if (accountStore.currentAccount.id) {
      org = {
        key: accountStore.currentAccount.id,
        accountType: accountStore.currentAccount.accountType,
        accountStatus: accountStore.currentAccount.accountStatus,
        type: accountStore.currentAccount.type,
        label: accountStore.currentAccount.label,
        appSource: appName
      }
    }

    return { kind: 'multi', org, user } as LDMultiKindContext
  }

  function updateUserContext () {
    if (!ldClient.value) { return }

    // Create new context using shared function
    const newContext = createLdContext()
    ldContext.value = newContext

    // Update the LaunchDarkly context
    ldClient.value.identify(newContext).then(() => {
      // Update flag values after context change
      ldFlagSet.value = ldClient.value?.allFlags() || {}
    }).catch((error) => {
      console.error('LaunchDarkly context update error:', error)
    })
  }

  function init () {
    if (ldInitialized.value || isInitializing.value) {
      return
    }

    // Skip initialization if user is not authenticated
    if (!keycloak.isAuthenticated || !keycloak.kcUser?.keycloakGuid) {
      return
    }

    isInitializing.value = true
    const ldClientId = useRuntimeConfig().public.ldClientId
    if (!ldClientId) {
      isInitializing.value = false
      return
    }

    // Create context using shared function
    ldContext.value = createLdContext()
    const options: LDOptions = {
      streaming: false,
      useReport: false,
      diagnosticOptOut: true
    }

    try {
      ldClient.value = initialize(ldClientId, ldContext.value, options)
      ldClient.value.on('initialized', () => {
        ldFlagSet.value = ldClient.value?.allFlags() || {}
        ldInitialized.value = true
        isInitializing.value = false
        console.info('LaunchDarkly initialization complete.')
      })

      // Handle initialization failure
      ldClient.value.on('error', (error) => {
        console.error('LaunchDarkly initialization error:', error)
        isInitializing.value = false
      })
    } catch (error) {
      console.error('LaunchDarkly failed to initialize:', error)
      isInitializing.value = false
    }
  }

  function getFeatureFlag (name: string): any {
    return ldClient.value ? ldClient.value.variation(name) : null
  }

  function getStoredFlag (name: string): any {
    if (!ldInitialized) {
      console.warn('Accessing ldarkly stored flag, but ldarkly is not initialized.')
    }
    return ldFlagSet.value[name]
  }

  function $reset () {
    ldInitialized.value = false
    isInitializing.value = false
    ldClient.value = null
    ldFlagSet.value = {}
  }

  return {
    init,
    getFeatureFlag,
    getStoredFlag,
    $reset
  }
})
