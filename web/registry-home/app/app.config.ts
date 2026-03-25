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
    }
  }
})
