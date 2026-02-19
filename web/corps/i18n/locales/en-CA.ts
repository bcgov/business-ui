/* eslint-disable max-len */
export default {
  label: {
    addToLedger: 'Add to ledger',
    addToLedgerOpt: 'Add to ledger (Optional)',
    addDirector: 'Add Director',
    addOffice: 'Add Office',
    chooseAnEndDate: 'Choose an end date',
    confirm: 'Confirm',
    currentDirectors: 'Current Directors',
    delayDate: 'Delay the Time of Dissolution or Cancellation',
    delayFor: 'Delay For',
    editDirector: 'Edit Director',
    editOffice: 'Edit Office',
    important: 'Important',
    noDirectors: 'No Directors',
    noOffices: 'No Offices',
    officeAddresses: 'Office Addresses',
    reviewAndConfirm: 'Review and Confirm',
    selectADate: 'Select a date',
    sixMonths: '6 Months'
  },
  page: {
    dissolution: {
      delay: {
        desc: 'The dissolution or cancellation of this business will be delayed until {boldStart}{date}{boldEnd}.',
        feeCode: 'DISDE',
        feeLabel: 'Delay of Dissolution',
        h1: 'Delay of Dissolution or Cancellation',
        title: 'Delay of Dissolution - Dissolution - BC Registries and Online Services'
      }
    },
    transition: {
      desc: 'Transition your business so that it operates under the new {italicStart}Business Corporations Act.{italicEnd}',
      feeCode: 'TRANP',
      feeLabel: 'Post Restoration Transition Application',
      h1: 'Post Restoration Transition Application',
      title: 'Post Restoration Transition Application - BC Registries and Online Services'
    }
  },
  text: {
    addToLedgerDescription: 'If you require this delay of dissolution to be ledgered, select the box below.',
    alertMaxTwoDelays: '{important} Businesses are only allowed to request up to two 6 month delays. If a business requires more time and has valid reasons for a longer delay, they may place a request by emailing {email}.',
    certifyDelayDescription: 'Confirm the legal name of the person authorized to complete and submit this filing.',
    certifyTransitionDescription: 'Confirm the legal name of the person authorized to complete and submit this application.',
    confirmDirectorsCorrect: 'I confirm that the director information listed for this business is correct.',
    confirmOfficesCorrect: 'I confirm that the office address information listed for this business is correct.',
    currentDirectorsMustBeCorrect: 'Current directors must be correct before filing your application.',
    delayDateDescription: 'Select how long the dissolution or cancellation will be delayed for.',
    formatYYYYMMDD: 'Format: YYYY-MM-DD',
    officeAddressesMustBeCorrect: 'Office addresses must be correct before filing your application.',
    shareStructureMustContainAtleastOneClass: 'Your share structure must contain at least one share class.',
    yesCreateLedgerItemForDissolution: 'Yes create a ledger item for this delay of dissolution'
  },
  validation: {
    date: {
      invalid: 'Please enter a valid date.',
      invalidFormat: 'Date must be in YYYY-MM-DD format.',
      tooSmall: 'The delay date must be a valid date after today.'
    }
  }
}
