export default defineAppConfig({
  connect: {
    header: {
      whatsNew: false,
      localeSelect: false
    },
    login: {
      redirect: '/undefined'
    },
    logout: {
      redirect: '/auth/login'
    }
  }
})
