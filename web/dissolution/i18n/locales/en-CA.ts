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
    delayDissolution: {
      desc: 'The dissolution or cancellation of this business will be delayed until {boldStart}{date}{boldEnd}.',
      feeCode: 'NOCRM', // TODO: add correct fee code
      feeLabel: 'Delay of Dissolution',
      h1: 'Delay of Dissolution or Cancellation',
      title: 'Delay of Dissolution - Dissolution - BC Registries and Online Services'
    },
    stayDissolution: {
      desc: 'The dissolution or cancellation of this business will be delayed until {boldStart}{date}{boldEnd}.',
      feeCode: 'NOCRM', // TODO: add correct fee code
      feeLabel: 'Stay of Dissolution',
      h1: 'Stay of Dissolution or Cancellation',
      title: 'Stay of Dissolution - Dissolution - BC Registries and Online Services'
    }
  },
  text: {
    addToLedgerDescription: 'If you require this stay of dissolution to be ledgered, select the box below.',
    alertMaxTwoDelays: '{important} Businesses are only allowed to request up to two 6 month delays. If a business requires more time and has valid reasons for a longer delay, they may place a request by emailing {email}.',
    certifyDelayDescription: 'Confirm the legal name of the person authorized to complete and submit this filing.',
    delayDateDescription: 'Select how long the dissolution or cancellation will be delayed for.',
    yesCreateLedgerItemForDissolution: 'Yes create a ledger item for this stay of dissolution'
  }
}
