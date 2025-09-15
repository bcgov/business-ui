export default defineAppConfig({
  connect: {
    header: {
      whatsNew: false,
      localeSelect: false
    },
    login: {
      redirect: '/officer-change/undefined'
    },
    logout: {
      redirect: '/auth/login'
    }
  }
})
