import { initialize, type LDClient, type LDFlagSet, type LDOptions, type LDMultiKindContext } from 'launchdarkly-js-client-sdk'

export const useLaunchdarklyStore = defineStore('bar-sbc-launchdarkly', () => {
  const { $keycloak } = useNuxtApp()
  const accountStore = useAccountStore()
  const ldClient: Ref<LDClient | null> = ref(null)
  const ldContext = ref({
    kind: 'multi',
    org: { key: 'anonymous' },
    user: { key: 'anonymous' }
  } as LDMultiKindContext)
  const ldFlagSet: Ref<LDFlagSet> = ref({})
  const ldInitialized = ref(false)

  function init () {
    if (ldInitialized.value) {
      console.info('Launchdarkly already initialized.')
      return
    }
    const ldClientId = useRuntimeConfig().public.ldClientId
    if (!ldClientId) {
      console.info('No launchdarkly sdk variable set. Aborting launchdarkly setup.')
      return
    }
    let user: any = { key: 'anonymous' }
    let org: any = { key: 'anonymous' }
    if ($keycloak.authenticated) {
      user = {
        key: $keycloak.tokenParsed?.sub || '',
        firstName: $keycloak.tokenParsed?.firstName,
        lastName: $keycloak.tokenParsed?.lastName,
        email: $keycloak.tokenParsed?.email,
        roles: $keycloak.tokenParsed?.roles, // should this be realm_access.roles?
        loginSource: $keycloak.tokenParsed?.loginSource
      }
    }
    if (accountStore.currentAccount.id) {
      org = {
        key: accountStore.currentAccount.id,
        accountType: accountStore.currentAccount.orgType,
        accountStatus: accountStore.currentAccount.orgStatus
        // type: accountStore.currentAccount.type,
        // label: accountStore.currentAccount.label
      }
    }
    ldContext.value = { kind: 'multi', org, user }
    const options: LDOptions = {
      streaming: true,
      useReport: true,
      diagnosticOptOut: true
    }
    ldClient.value = initialize(ldClientId, ldContext.value, options)
    ldClient.value.on('initialized', () => {
      ldFlagSet.value = ldClient.value?.allFlags() || {}
      ldInitialized.value = true
      console.info('launchdarkly initialization complete.')
    })
  }

  return {
    ldClient,
    ldContext,
    ldFlagSet,
    ldInitialized,
    init
  }
})
