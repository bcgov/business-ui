/* eslint-disable max-len */
export default {
  label: {
    addToLedger: 'Add to ledger',
    addToLedgerOpt: 'Add to ledger (Optional)',
    chooseAnEndDate: 'Choose an end date',
    delayDate: 'Delay the Time of Dissolution or Cancellation',
    delayFor: 'Delay For',
    important: 'Important',
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
        h1Staff: 'Stay of Dissolution or Cancellation',
        title: 'Delay of Dissolution - Dissolution - BC Registries and Online Services',
        titleStaff: 'Stay of Dissolution - Dissolution - BC Registries and Online Services'
      }
    },
    transition: {
      desc: 'Transition your business so that it operates under the new {italicStart}Business Corporations Act.{italicEnd}',
      feeCode: 'TRANP',
      feeLabel: 'Post Restoration Transition Application',
      h1: 'Post Restoration Transition Application',
      // h1Staff: 'Stay of Dissolution or Cancellation',
      title: 'Post Restoration Transition Application - BC Registries and Online Services'
      // titleStaff: 'Stay of Dissolution - Dissolution - BC Registries and Online Services'
    }
  },
  text: {
    addToLedgerDescription: 'If you require this stay of dissolution to be ledgered, select the box below.',
    alertMaxTwoDelays: '{important} Businesses are only allowed to request up to two 6 month delays. If a business requires more time and has valid reasons for a longer delay, they may place a request by emailing {email}.',
    certifyDelayDescription: 'Confirm the legal name of the person authorized to complete and submit this filing.',
    delayDateDescription: 'Select how long the dissolution or cancellation will be delayed for.',
    formatYYYYMMDD: 'Format: YYYY-MM-DD',
    yesCreateLedgerItemForDissolution: 'Yes create a ledger item for this stay of dissolution'
  },
  validation: {
    date: {
      invalid: 'Please enter a valid date.',
      invalidFormat: 'Date must be in YYYY-MM-DD format.',
      tooSmall: 'The delay date must be a valid date after today.'
    }
  }
}
