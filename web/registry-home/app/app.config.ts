export default defineAppConfig({
  connect: {
    header: {
      localeSelect: false
    },
    logout: {
      redirect: '/auth/login'
    }
  },
  connectOverrides: {
    bcscUser: {
      login: {
        idps: ['bcsc'],
        idpEnforcement: true
      }
    },
    bceidUser: {
      login: {
        idps: ['bceid'],
        idpEnforcement: true
      }
    },
    idirUser: {
      login: {
        idps: ['idir'],
        idpEnforcement: true
      }
    },
    bcscBceidUser: {
      login: {
        idps: ['bcsc', 'bceid'],
        idpEnforcement: true
      }
    },
    bcscIdirUser: {
      login: {
        idps: ['bcsc', 'idir'],
        idpEnforcement: true
      }
    },
    bceidIdirUser: {
      login: {
        idps: ['bceid', 'idir'],
        idpEnforcement: true
      }
    }
  }
})
