import Keycloak from 'keycloak-js'

export default defineNuxtPlugin(async () => {
  // create mock keycloak for vitest environment
  if (process.env.VITEST_WORKER_ID) {
    // must import inside if block, will cause context warning and app wont load if not
    const { mockedKeycloak } = await import('~/tests/mocks/mockedKeycloak')
    return {
      provide: {
        keycloak: mockedKeycloak as Keycloak
      }
    }
  }

  const config = useRuntimeConfig()
  // define new keycloak
  const keycloak = new Keycloak({
    url: config.public.keycloakAuthUrl,
    realm: config.public.keycloakRealm,
    clientId: config.public.keycloakClientId
  })

  try {
    // init keycloak instance
    await keycloak.init({
      onLoad: 'check-sso',
      responseMode: 'query',
      pkceMethod: 'S256'
    })

    // remove keycloak query params from route
    // const router = useRouter()
    // need to figure out how to include locale here
    // router.replace('/')
  } catch (error) {
    console.error('Failed to initialize Keycloak adapter: ', error)
  }

  return {
    provide: {
      // provide global keycloak instance
      keycloak
    }
  }
})
