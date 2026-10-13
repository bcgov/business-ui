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
    agmDate: 'Annual General Meeting Date',
    registeredOfficeAddress: 'Registered Office Address'
  },
  page: {
    annualReport: {
      agmDateDesc: 'Enter the date of the annual general meeting (AGM) this annual report is for.',
      desc: 'File the annual report for your cooperative association.',
      feeCode: 'OTANN',
      feeLabel: 'Annual Report',
      h1: 'File {year} Annual Report',
      title: 'File Annual Report - BC Registries and Online Services'
    },
    changeOfAddress: {
      desc: 'Update the registered office address of your cooperative association.',
      feeCode: 'OTADD',
      feeLabel: 'Address Change',
      h1: 'Address Change',
      title: 'Address Change - BC Registries and Online Services'
    },
    changeOfDirectors: {
      desc: 'Appoint, cease or update the directors of your cooperative association.',
      effectiveDateDesc: 'Select the date the director changes take effect.',
      feeCode: 'OTCDR',
      feeLabel: 'Director Change',
      h1: 'Director Change',
      title: 'Director Change - BC Registries and Online Services'
    }
  },
  text: {
    // Placeholder - need the AGM date picker, registered office addresses and directors
    agmDateNotAvailable: 'Annual general meeting date entry is not available yet.',
    changeRegisteredOfficeAddress: 'Please change your Registered Office Address.',
    // Placeholder - need the effective date picker and the directors table
    directorChangeNotAvailable: 'Effective date entry is not available yet.',
    finishTaskBeforeSave: 'Finish this task before saving.',
    finishTaskBeforeSubmit: 'Finish this task before submitting.',
    noChangesToSave: 'There are no changes to save.',
    noChangesToSubmit: 'There are no changes to submit.'
  }
}
