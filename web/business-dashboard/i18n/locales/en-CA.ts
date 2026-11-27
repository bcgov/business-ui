/* eslint-disable max-len */
export default {
  connect: {
    label: {
      sbcAccountCreation: 'Create a BC Registries Account'
    },
    page: {
      createAccount: {
        description: ['Create a new account to use your services and manage all of your businesses within BC Registries.']
      },
      login: {
        h1: 'Log in to the BC Business Registry',
        description: '',
        descriptionBCSC: 'You’ll need a BC Services Card account to use this service. Signing in will securely link your account to BC Registries and prove your identity online.'
      }
    }
  },
  label: {
    exit: 'Exit',
    retry: 'Retry'
  },
  page: {
    dashboard: {
      title: 'Business Dashboard - BC Registries and Online Services'
    },
    entityError: {
      desc: 'Your account is currently unable to access this Business. This may be because of the following:',
      h1: 'Unable to Access Business',
      reason: {
        invalidIdentifier: 'The specified Business Identifier is not valid.',
        notAuthorized: 'Your account is not authorized to access this Business — contact the Business owner to get access.',
        sessionTimedOut: 'Your login session has timed out — please exit and then login again.'
      },
      retryOrExit: 'You can retry now, or you can exit and try to access this Business at another time.',
      title: 'Business Dashboard - BC Registries and Online Services'
    }
  }
}
