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
        idpEnforcement: true,
        alert: {
          title: 'Welcome to the new Business Registry',
          message: 'To complete the move of your business, sign in or create an account using your BC Services '
            + 'Card below.'
        }
      }
    }
  }
})
