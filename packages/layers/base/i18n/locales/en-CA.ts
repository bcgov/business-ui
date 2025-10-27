/* eslint-disable max-len */

export default {
  /* Ordering should be alphabetical unless otherwise specified */
  businessAlert: {
    /* Alert text based on BusinessAlert enum */
    amalgamation: {
      content: 'If you have any questions, please contact BC Registries staff:',
      label: 'This corporation is part of an amalgamation and is scheduled to become historical on {date}'
    },
    disabled: {
      content: 'This business is disabled.',
      contentExtra: ['For assistance, please contact BC Registries staff:'],
      label: 'This business is disabled'
    },
    dissolution: {
      content: 'This means that the business will be struck from the Corporate Registry in {boldStart}{days} days{boldEnd} due to overdue annual reports. Please file the annual reports immediately to bring this business back into good standing or request a delay of dissolution if more time is needed.',
      contentExtra: ['For assistance, please contact BC Registries staff:'],
      label: 'Urgent - this business is in the process of being dissolved'
    },
    frozen: {
      content: 'This business is frozen and therefore no filings can be completed at this time.',
      contentExtra: ['For assistance, please contact BC Registries staff:'],
      label: 'This business is frozen'
    },
    goodstanding: {
      content: 'The most common reason a business is not in good standing is an overdue annual report. Any outstanding annual reports must filed to bring the business back into good standing.',
      contentExtra: ['If further action is required, please contact BC Registries staff:'],
      label: 'This business is not in good standing'
    },
    missinginfo: {
      content: 'BC Registries is missing information about your business (e.g., business start date, nature of business, business address, etc.). Please contact BC Registries to input any missing business information. Missing information must be entered before you can file changes or dissolve this business.',
      contentExtra: ['If further action is required, please contact BC Registries staff:'],
      label: 'Missing Information'
    },
    transitionrequired: {
      content: 'A new {italicizedStart}Business Corporations Act{italicizedEnd} came into effect while this business was dissolved. To restore good standing, transition this business so that it operates under this new legislation.',
      contentExtra: ['If you don’t file a post restoration transition application within a year of your restoration date, this business will be dissolved.'],
      label: 'This business is not in good standing'
    }
  },
  businessConfig: {
    /* Configured text based on legal type */
    corp: {
      /* BC, BEN, C, CBEN, CC, CCC, CUL, ULC */
      act: 'Business Corporations',
      entityTitle: 'Company'
    },
    CP: {
      act: 'Cooperative Association',
      entityTitle: 'Cooperative Association'
    },
    GP: {
      act: 'Partnership',
      entityTitle: 'General Partnerships'
    },
    SP: {
      act: 'Partnership',
      entityTitle: 'Sole Proprietorship'
    }
  },
  connect: {
    breadcrumb: {
      default: 'BC Registries and Online Services' // default breadcrumb item text - will be shown before breadcrumbs have been set
    },
    header: {
      title: 'BC Registries and Online Services' // header component title text
    }
  },
  /* Common translations only */
  contactInfo: {
    tollFree: {
      title: 'Toll Free:',
      value: '1-877-370-1033'
    },
    victoriaOffice: {
      title: 'Victoria Office:',
      value: '1-250-370-1033'
    },
    email: {
      title: 'Email:',
      value: "BCRegistries{'@'}gov.bc.ca"
    },
    hours: {
      title: 'Hours of Operation:',
      value: 'Monday to Friday, 8:30am - 4:30pm Pacific Time'
    }
  },
  label: {
    actions: 'Actions',
    addDetail: 'Add Detail',
    alerts: 'Alerts',
    alterationComplete: 'Alteration Complete',
    alterationPending: 'Alteration Pending',
    amalgamation: 'Amalgamation',
    amalgamationOutComplete: 'Amalgamation Out Complete',
    bcRegistriesContactInformation: 'BC Registries Contact Information',
    bcRegistriesDashboard: 'BC Registries Dashboard',
    bcRegistriesStaff: 'BC Registries Staff',
    bootstrapComplete: '{name} Complete',
    businessNumber: 'Business Number',
    cancel: 'Cancel',
    change: 'Change',
    close: 'Close',
    closeDetails: 'Close Details',
    companyInformationPage: 'Company Information Page',
    continuationPending: 'Continuation Pending',
    continuationOutComplete: 'Continuation Out Complete',
    courtOrderNumber: 'Court Order Number',
    deliveryAddress: 'Delivery Address',
    details: 'Details',
    dissolutionCompleted: 'Dissolution Completed',
    done: 'Done',
    downloadAll: 'Download All',
    edit: 'Edit',
    email: 'Email',
    exitWithoutSaving: 'Exit Without Saving',
    extensionOfLimitedRestoration: 'Extension of Limited Restoration',
    FILED: 'FILED',
    FILEDANDPAID: 'FILED AND PAID',
    FILEDANDPENDING: 'FILED AND PENDING',
    FUTUREEFFECTIVEFILING: 'FUTURE EFFECTIVE FILING',
    firstName: 'First Name',
    filedAndPending: 'Filed and Pending',
    filing: 'Filing',
    filingNameUnavailable: 'Filing Name Unavailable',
    filingPending: 'Filing Pending',
    folioOrRefNumber: 'Folio or Reference Number',
    folioOrRefNumberOpt: 'Folio or Reference Number (Optional)',
    futureEffectiveDate: 'Future Effective Date',
    goBack: 'Go Back',
    goToBRD: 'Go to Business Registry Dashboard',
    goToMyBusinessRegistry: 'Go to My Business Registry',
    hideDocuments: 'Hide Documents',
    incorporation: 'Incorporation',
    incorporationNumber: 'Incorporation Number',
    incorporationPending: 'Incorporation Pending',
    keepEditing: 'Keep Editing',
    lastName: 'Last Name',
    legalName: 'Legal Name',
    limitedRestorationPeriod: 'Limited Restoration Period',
    mailingAddress: 'Mailing Address',
    makeChanges: 'Make Changes',
    manageDocumentRecord: 'Manage Document Record',
    middleName: 'MiddleName',
    middleNameOpt: 'Middle Name (Optional)',
    moreActions: 'More Actions',
    myBusinessRegistry: 'My Business Registry',
    name: 'Name',
    notAvailable: 'Not Available',
    notEntered: 'Not Entered',
    noticeOfWithdrawalForm: 'Notice of Withdrawal Form',
    numberedAmalgamatedCompany: 'Numbered Amalgamated Company',
    PAID: 'PAID',
    PAYMENTCOMPLETED: 'PAYMENT COMPLETED',
    PENDING: 'PENDING',
    pacificTime: 'Pacific time',
    phone: 'Phone',
    preferredName: 'Preferred Name',
    preferredNameOpt: 'Preferred Name (Optional)',
    pursuantToPlanOfArrangement: 'Pursuant to a Plan of Arrangement',
    REJECTED: 'REJECTED',
    refreshPage: 'Refresh Page',
    registration: 'Registration',
    remove: 'Remove',
    requestACopy: 'Request a Copy',
    retrieveBusinessInformation: 'Retrieve Business Information',
    sameAsDeliveryAddress: 'Same as Delivery Address',
    sameAsMailAddress: 'Same as Mailing Address',
    save: 'Save',
    saveResumeLater: 'Save and Resume Later',
    submit: 'Submit',
    undo: 'Undo',
    unknown: 'Unknown',
    viewDetails: 'View Details',
    viewDocuments: 'View Documents',
    voluntaryDissolutionPending: 'Voluntary Dissolution Pending',
    WITHDRAWN: 'WITHDRAWN'
  },
  /* Mappings here are based from the FilingType enum */
  filingName: {
    adminFreeze: 'Freeze Business',
    adminUnfreeze: 'Unfreeze Business',
    agmExtension: 'AGM Extension',
    agmLocationChange: 'AGM Location Change',
    alteration: 'Alteration',
    amalgamationApplication: {
      horizontal: 'Amalgamation Application Short-form (Horizontal)',
      regular: 'Amalgamation Application (Regular)',
      vertical: 'Amalgamation Application Short-form (Vertical)',
      undefined: 'Amalgamation Application'
    },
    amalgamationOut: 'Amalgamation Out',
    annualReport: 'Annual Report {year}',
    changeOfAddress: 'Address Change',
    changeOfCompanyInfo: 'Company Information Change',
    changeOfDirectors: 'Director Change',
    changeOfName: 'Legal Name Change',
    changeOfOfficers: 'Officer Change',
    changeOfRegistration: 'Change of Registration',
    consentAmalgamationOut: 'Consent to Amalgamation Out',
    consentContinuationOut: 'Consent to Continuation Out',
    continuationAuthorization: 'Continuation Authorization',
    continuationIn: 'Continuation Application',
    continuationOut: 'Continuation Out',
    conversion: 'Record Conversion',
    correction: 'Correction',
    courtOrder: 'Court Order',
    dissolution: {
      administrative: 'Administrative Dissolution',
      involuntary: 'Involuntary Dissolution',
      voluntary: 'Voluntary Dissolution',
      undefined: 'Dissolution'
    },
    dissolved: 'Involuntary Dissolution',
    incorporationApplication: 'Incorporation Application',
    noticeOfWithdrawal: 'Notice of Withdrawal',
    putBackOff: 'Put Back Off',
    putBackOn: 'Put Back On',
    registrarsNotation: "Registrar's Notation",
    registrarsOrder: "Registrar's Order",
    registration: 'Registration',
    restoration: {
      limitedRestorationToFull: 'Limited Restoration to Full',
      limitedRestorationExtension: 'Limited Restoration Extension',
      fullRestoration: 'Full Restoration',
      limitedRestoration: 'Limited Restoration',
      undefined: 'Restoration Application'
    },
    specialResolution: 'Special Resolution',
    transition: 'Transition Application'
  },
  /* Mappings here are based from the FilingType enum */
  filingText: {
    agmExtension: 'The {agmYear} AGM must be held by {boldStart}{agmDueDate}{boldEnd}.'
  },
  text: {
    addressChange: 'address change',
    alteration: 'alteration',
    alterationWasSuccessfullyAlteredToTypeOn: '{name} was successfully altered from a {fromLegalType} to a {toLegalType} on',
    amalgamateOut: 'amalgamate out',
    amalgamation: 'amalgamation',
    at1159PacificTime: 'at 11:59 pm Pacific time',
    completeYourFilingToDisplay: 'Complete your filing to display',
    continuation: 'continuation',
    continueOut: 'continue out',
    courtOrdersHaveBeenFiled: 'Court order(s) have been filed on this company. Review the filing history for impacts to business information.',
    dissolution: 'dissolution',
    dissolutionCompletedFirm: 'The statement of dissolution for {entityTitle} {name} was successfully submitted on {boldStart}{submittedDate}{boldEnd} with dissolution date of {boldStart}{dissolutionDate}{boldEnd}. The {entityTitle} has been struck from the register and dissolved, and ceased to be a registered {entityTitle} under the {actTitle} Act.',
    dissolutionCompletedNonFirm: 'The {entityTitle} {name} was successfully {boldStart}dissolved on {effectiveDate}{boldEnd}. The {entityTitle} has been struck from the register and dissolved, and ceased to be a registered {entityTitle} under the {actTitle} Act.',
    effectiveAsOf: 'EFFECTIVE as of',
    expiredConsent: 'This consent is expired. Please resubmit the {name} application for authorization to become a foreign corporation.',
    FiledBySubmitterOn: 'Filed by {submitter} on',
    filedBySubmitterOn: 'filed by {submitter} on',
    filing: 'filing',
    filingAvailableOnPaperOnly: 'This filing is available on paper only. To request copies of paper documents, contact BC Registries staff.',
    filingDateWillBeDate: 'The {filing} date and time for {name} will be {boldStart}{date}{boldEnd}.',
    filingWillTakeEffectOnDate: 'The {filing} will take effect on {boldStart}{date}{boldEnd}.',
    incorporation: 'incorporation',
    itMayTake1hourToProcessFiling: 'It may take up to one hour to process this filing. If this issue persists, please contact us.',
    limitedRestorationWasSuccessful: 'The Company {boldStart}{name}{boldEnd} was successfully restored and is active {boldStart}until {expiryDate} at 11:59 pm Pacific time{boldEnd}. At the end of the limited restoration period, the company will be automatically dissolved. If you require assistance to extend a limited restoration/reinstatement or wish to convert your restoration from a limited period to a full restoration, please contact BC Registries staff.',
    limitedRestorationExtensionWasSuccessful: 'The period of restoration was successfully extended and is active {boldStart}until {expiryDate}{boldEnd}. At the end of the extended limited restoration period, the company will be automatically dissolved. If you require assistance to extend a limited restoration/reinstatement or wish to convert your restoration from a limited period to a full restoration, please contact BC Registries staff.',
    noDocumentsAvailable: 'No documents available',
    noLongerWishToFileWithdraw: 'If you no longer wish to file this {filing}, you must submit aLINKand a $20.00 fee to BC Registries. You must provide BC Registries with enough time to process the withdrawal before the effective date and time. If you withdraw this record, your filing fees will not be refunded.',
    paidButNotCompletedByRegistry: 'This {name} is paid, but the filing has not been completed by the Business Registry yet. Some filings may take longer than expected.',
    pendingButNotCompletedByRegistry: 'Your submission is still being processed.',
    pendingButNotCompletedByRegistry1: 'Some submissions may take longer than usual to complete. If this issue continues, please contact us.',
    pleaseSubmitANewApplication: 'Please submit a new application if you’d like to continue your business into B.C.',
    refreshScreenOrContact: 'Refresh this screen in a few minutes or you can come back later to check on the progress. If this issue persists, please contact us.',
    requiredToRetainDissolution: 'You are required to retain a copy of all the dissolution documents in your records book.',
    reviewReasonsYourFilingWasRejected: 'Review the reasons your filing was rejected below',
    SubmittedBySubmitterOn: 'Submitted by {submitter} on',
    submittedBySubmitterOn: 'submitted by {submitter} on',
    successfullyAmalgamated: '{name} has been successfully amalgamated.',
    successfullyContinuedIn: '{name} has been successfully continued in.',
    successfullyIncorporated: '{name} has been successfully incorporated.',
    successfullyRegistered: '{name} has been successfully registered.',
    systemCompletedProcessingFiling: 'The system has completed processing your filing. You can now retrieve the business information.',
    ThisCompany: 'This company',
    theCompanyWasSuccessfullyAmalgamatedOut: 'The Company {name} was successfully {boldStart}Amalgamated Out on {date}, to {foreignJurisdiction} under the name "{newName}"{boldEnd}. The Company has been struck from the register and ceased to be an incorporated company under the Business Corporations Act. You are required to retain a copy of all the Amalgamation Out documents in your records books.',
    theCompanyWasSuccessfullyContinuedOut: 'The Company {name} was successfully {boldStart}Continued Out on {date}, to {foreignJurisdiction} under the name "{newName}"{boldEnd}. The Company has been struck from the register and ceased to be an incorporated company under the Business Corporations Act. You are required to retain a copy of all the Continuation Out documents in your records books.',
    thisCompany: 'this company',
    thisConsentToIsValidUntilDate: 'This consent to {name} to {foreignJurisdiction} is valid {boldStart}until {date}{boldEnd}.',
    undefinedStaffRejectionMessage: 'Staff rejection message unavailable',
    unknown: 'unknown',
    withdrawnOn: 'WITHDRAWN on',
    youHaveNoBusinessLedger: 'You have no filing history',
    yourFilingsWillAppearHere: 'Your completed filings and transactions will appear here'
  },
  validation: {
    fieldRequired: 'This field is required'
  }
}
