/* eslint-disable max-len */
export default {
  connect: {
    label: {
      sbcAccountCreation: 'Create a BC Registries Account'
    },
    page: {
      login: {
        h1: 'Log in to BC Registries',
        description: 'In order to use this service, you’ll need one of the following logins. This login will be'
          + ' linked to your BC Registries account for identity verification purposes.'
      }
    }
  },
  label: {
    agmLocation: 'AGM Location',
    agmYear: 'AGM Year',
    certify: 'Certify',
    reason: 'Reason',
    addCustodian: 'Add Custodian',
    addDirector: 'Add Director',
    addLiquidator: 'Add Liquidator',
    addOffice: 'Add Office',
    addReceiver: 'Add Receiver',
    addToLedger: 'Add to ledger',
    addToLedgerOpt: 'Add to ledger (Optional)',
    chooseAnEndDate: 'Choose an end date',
    confirm: 'Confirm',
    correctionComment: 'Correction Detail Comment',
    delayDate: 'Delay the Time of Dissolution or Cancellation',
    delayFor: 'Delay For',
    editDirector: 'Edit Director',
    fileAndPay: 'File and Pay',
    generalMeetingYear: 'General Meeting Year',
    important: 'Important',
    noCustodians: 'There are currently no custodians.',
    noDirectors: 'No Directors',
    noLiquidators: 'There are currently no liquidators.',
    noOffices: 'No Offices',
    originalFilingDate: 'Original Filing Date',
    noReceivers: 'There are currently no receivers.',
    officeAddresses: 'Office Addresses',
    reviewAndConfirm: 'Review and Confirm',
    selectADate: 'Select a date',
    sixMonths: '6 Months'
  },
  page: {
    agmLocationChange: {
      certifyDescription: 'Enter the legal name of the person authorized to complete and submit this filing.',
      feeCode: 'AGMLC',
      feeLabel: 'AGM Location Change',
      h1: 'Annual General Meeting (AGM) Location Change',
      helpLabel: 'Help with Annual General Meeting Location Change',
      helpText: 'Generally, company meetings must be in British Columbia (BC). However, there are exceptions to this rule. A company must request a location change if the meeting will be fully or partially in-person and none of the exceptions listed below apply. Partially in-person meetings combine both in-person and online participation. The location change request only applies to the in-person participants.',
      helpExceptionsTitle: 'Exceptions to the requirement for a location change request include the following:',
      helpExceptions: [
        'The meeting will be fully online;',
        'The company\'s articles permit a location outside BC;',
        'Nothing in the articles restrict a location change approved by resolution or by ordinary resolution, as the case may be.'
      ],
      locationChangeDetail: 'Location Change Detail',
      reviewH1: 'Review Annual General Meeting (AGM) Location Change',
      title: 'AGM Location Change - BC Registries and Online Services'
    },
    annualReport: {
      arDate: 'Annual Report Date',
      desc: 'Review the information below, then file and pay for your annual report.',
      feeCode: 'BCANN',
      feeLabel: 'Annual Report',
      h1: 'Annual Report {year}',
      title: 'Annual Report - BC Registries and Online Services'
    },
    changeOfAddress: {
      desc: 'Update the registered and records office addresses of this business.',
      feeCode: 'BCADD',
      feeLabel: 'Address Change',
      h1: 'Address Change',
      title: 'Address Change - BC Registries and Online Services'
    },
    consentAmalgamationOut: {
      desc: 'Request the Registrar’s consent to amalgamate this business out of British Columbia into a corporation in another jurisdiction. The consent is valid for six months.',
      feeCode: 'IAMGO',
      feeLabel: '6-Month Consent to Amalgamate Out',
      h1: 'Six-Month Consent to Amalgamate Out',
      jurisdictionDesc: 'Enter the Jurisdiction you will be Amalgamating Out to.',
      title: 'Six-Month Consent to Amalgamate Out - BC Registries and Online Services'
    },
    consentContinuationOut: {
      desc: 'Request the Registrar’s consent to continue this business out of British Columbia to another jurisdiction. The consent is valid for six months.',
      feeCode: 'CONTO',
      feeLabel: '6-Month Consent to Continue Out',
      h1: 'Six-Month Consent to Continue Out',
      jurisdictionDesc: 'Enter the Jurisdiction you will be Continuing Out to.',
      title: 'Six-Month Consent to Continue Out - BC Registries and Online Services'
    },
    continuationOut: {
      consentExpiredWarning: 'The Six-Month Consent to Continue Out for this business has expired. Manager approval is required to file this Continuation Out.',
      desc: 'Continue this business out of British Columbia to the jurisdiction it has received consent to continue out to. The business will become historical in B.C. once this filing is processed.',
      feeCode: 'COUTI',
      feeLabel: 'Continuation Out',
      h1: 'Continuation Out',
      title: 'Continuation Out - BC Registries and Online Services'
    },
    correction: {
      desc: 'This filing will correct the information in the original {boldStart}{filing-type}{boldEnd} filing from {boldStart}{filing-date}{boldEnd}. Changes made in this correction will be applied to the business record.',
      feeCode: 'CRCTN',
      feeLabel: 'Correction',
      h1: 'Correction',
      title: 'Correction - BC Registries and Online Services'
    },
    courtOrder: {
      desc: 'Enter the court order number and either the court order text or upload the court order document.',
      feeCode: 'COURT',
      feeLabel: 'Court Order',
      h1: 'Court Order',
      title: 'Court Order - BC Registries and Online Services'
    },
    dissolution: {
      delay: {
        desc: 'The dissolution or cancellation of this business will be delayed until {boldStart}{date}{boldEnd}.',
        feeCode: 'DISDE',
        feeLabel: 'Delay of Dissolution',
        h1: 'Delay of Dissolution or Cancellation',
        title: 'Delay of Dissolution - Dissolution - BC Registries and Online Services'
      }
    },
    reviewImportedData: {
      desc: 'Some office or director address information for this business was missing or incomplete when it was migrated. Review and complete the information below.',
      feeCode: 'NOFEE',
      feeLabel: 'Review Migrated Information',
      h1: 'Review Migrated Information',
      title: 'Review Migrated Information - BC Registries and Online Services'
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
    addressUpdateEffectiveTomorrow: 'Any address update will be effective tomorrow.',
    addToLedgerDescription: 'If you require this delay of dissolution to be ledgered, select the box below.',
    alertMaxTwoDelays: '{important} Businesses are only allowed to request up to two 6 month delays. If a business requires more time and has valid reasons for a longer delay, they may place a request by emailing {email}.',
    certifyCorrectionDescription: 'Confirm the legal name of the person authorized to complete and submit this correction.',
    certifyDelayDescription: 'Confirm the legal name of the person authorized to complete and submit this filing.',
    certifyTransitionDescription: 'Confirm the legal name of the person authorized to complete and submit this application.',
    confirmDirectorsCorrect: 'I confirm that the director information listed for this business is correct.',
    confirmOfficesCorrect: 'I confirm that the office address information listed for this business is correct.',
    consentNoCorrectionsAfterSubmission: '{boldStart}Important:{boldEnd} Make sure the information you are providing is correct. Corrections cannot be made after submission. You will need to resubmit if there are any errors.',
    correctionCommentDescription: 'Enter a detail comment that describes the reason for this correction.',
    correctionReviewDescription: 'Review the changes below. Only sections that have been modified will appear.',
    currentDirectorsMustBeCorrect: 'Current directors must be correct before filing your application.',
    delayDateDescription: 'Select how long the dissolution or cancellation will be delayed for.',
    liquidatorsMustBeCorrect: 'Liquidator information must be correct before filing your application.',
    nameTranslationsDescription: 'Name translations must use the Latin Alphabet (English, French, etc.). Names that use other writing systems must spell the name phonetically in English or French.',
    agmLocationHint: 'Enter the location of the AGM outside B.C.',
    reasonHint: 'Enter the reason for the location change.',
    missingInfo: {
      title: 'Missing information',
      officeMissing: 'No office address on record',
      addressMissing: '{address} is missing',
      fieldMissing: '{address} is missing the {field}',
      field: {
        street: 'street address',
        city: 'city',
        country: 'country',
        postalCode: 'postal code',
        region: 'province or state'
      }
    },
    officeAddressesMustBeCorrect: 'Office addresses must be correct before filing your application.',
    officeDirectorsSharesMustBeCorrectBeforeFiling: 'Office addresses, current directors and share structure must be correct before filing your application.',
    reviewImportedDataDirectors: 'Complete any director address that is missing information. Director names cannot be changed here.',
    reviewImportedDataOffices: 'Complete any office address that is missing information. Office delivery addresses must be in British Columbia.',
    reviewImportedDataReview: 'Review the changes below. Only the sections you changed will appear and be filed.',
    receiversMustBeCorrect: 'Receiver information must be correct before filing your application.',
    reviewCorrectionChanges: 'Review the correction changes below before submitting.',
    shareStructureMustContainAtleastOneClass: 'Your share structure must contain at least one share class.',
    yesCreateLedgerItemForDissolution: 'Yes create a ledger item for this delay of dissolution'
  },
  validation: {
    agmLocationChange: {
      yearRequired: 'AGM year field is required.',
      yearInvalid: 'Please enter a valid 4-digit year.',
      yearMin: 'Must be on or after {year}.',
      yearMax: 'Must be on or before {year}.',
      yearBeforeFounding: 'AGM year cannot be before the year the business was founded.',
      reasonRequired: 'Reason field is required.',
      reasonMax: 'Must be 2000 characters or less.',
      countryRequired: 'Country field is required.',
      cityRequired: 'City field is required.',
      cityMax: 'City must be 40 characters or less.',
      provinceRequired: 'Province field is required.',
      stateRequired: 'State field is required.',
      regionMax: 'Region must be 2 characters or less.'
    },
    appointmentDateBeforeFounding: 'Appointment date cannot be before the business founding date.',
    cessationDateInFuture: 'Cessation date cannot be in the future.',
    date: {
      invalid: 'Please enter a valid date.',
      invalidFormat: 'Date must be in YYYY-MM-DD format.',
      tooSmall: 'The delay date must be a valid date after today.'
    }
  }
}
