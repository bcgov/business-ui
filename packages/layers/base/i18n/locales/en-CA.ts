/* eslint-disable max-len */
export default {
  /* Ordering should be alphabetical unless otherwise specified */
  act: {
    businessCorpPreExistingCompanyProvisions: 'Business Corporations Act (Section 442.1)'
  },
  badge: {
    added: 'ADDED',
    addressChanged: 'ADDRESS CHANGED',
    emailChanged: 'EMAIL CHANGED',
    nameChanged: 'NAME CHANGED',
    removed: 'REMOVED',
    rolesChanged: 'ROLES CHANGED'
  },
  businessAlert: {
    /* Alert text based on BusinessAlert enum */
    amalgamation: {
      content: 'If you have any questions, please contact BC Registries staff:',
      label: 'This corporation is part of an amalgamation and is scheduled to become historical on {date}'
    },
    disabled: {
      content: 'This business is disabled.',
      contentExtra: {
        default: 'For assistance, please contact BC Registries staff:'
      },
      label: 'This business is disabled'
    },
    dissolution: {
      content: 'The business may be struck from the Corporate Registry as soon as {boldStart}{date}{boldEnd} due to overdue annual reports. Please file the annual reports immediately to return the business to good standing.',
      contentExtra: {
        default: 'You can request up to two 6-month delays to postpone dissolution. If a business requires more time and has valid reasons for a longer delay, they may place a request by emailing {link}',
        maxDelaysReached: 'Businesses are only allowed to request up to two 6 month delays. If a business requires more time and has valid reasons for a longer delay, they may place a request by emailing {link}',
        emailLink: "BCRegistries{'@'}gov.bc.ca",
        emailTo: "mailto:bcregistries{'@'}gov.bc.ca"
      },
      label: 'Urgent - this business is in the process of being dissolved'
    },
    frozen: {
      content: 'This business is frozen and therefore no filings can be completed at this time.',
      contentExtra: {
        default: 'For assistance, please contact BC Registries staff:'
      },
      label: 'This business is frozen'
    },
    goodstanding: {
      content: 'The most common reason a business is not in good standing is an overdue annual report. Any outstanding annual reports must filed to bring the business back into good standing.',
      contentExtra: {
        default: 'If further action is required, please contact BC Registries staff:'
      },
      label: 'This business is not in good standing'
    },
    missinginfo: {
      content: 'BC Registries is missing information about your business (e.g., business start date, nature of business, business address, etc.). Please contact BC Registries to input any missing business information. Missing information must be entered before you can file changes or dissolve this business.',
      contentExtra: {
        default: 'If further action is required, please contact BC Registries staff:'
      },
      label: 'Missing Information'
    },
    transitionrequired: {
      content: 'A new {italicStart}Business Corporations Act{italicEnd} came into effect while this business was dissolved. To restore good standing, transition this business so that it operates under this new legislation.',
      contentExtra: {
        default: 'If you don’t file a post restoration transition application within a year of your restoration date, this business will be dissolved.'
      },
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
      href: 'tel:+1-877-370-1033',
      title: 'Toll Free:',
      value: '1-877-370-1033'
    },
    victoriaOffice: {
      href: 'tel:+1-250-387-7848',
      title: 'Victoria Office:',
      value: '1-250-370-1033'
    },
    email: {
      href: "mailto:bcregistries{'@'}gov.bc.ca",
      title: 'Email:',
      value: "BCRegistries{'@'}gov.bc.ca"
    },
    hours: {
      title: 'Hours of Operation:',
      value: 'Monday to Friday, 8:30am - 4:30pm Pacific Time'
    }
  },
  modal: {
    error: {
      business: {
        contact: {
          400: {
            title: 'Page Not Found',
            description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
          },
          401: {
            title: 'Access Restricted',
            description: 'You don’t have permission to access this business. Go to your business registry page to request access to this business.'
          },
          403: {
            title: 'Access Restricted',
            description: 'You don’t have permission to access this business. Go to your business registry page to request access to this business.'
          },
          404: {
            title: 'Invalid Link',
            description: 'The link you entered is invalid. To access this business, try searching for it on your business registry page.'
          },
          500: {
            title: 'Page Not Found',
            description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
          },
          503: {
            title: 'Page Not Found',
            description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
          },
          undefined: {
            title: 'Unable to retrieve business contact information',
            description: 'We are currently unable to retrieve the business contact. Please try again later.'
          }
        },
        init: {
          400: {
            title: 'Page Not Found',
            description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
          },
          401: {
            title: 'Access Restricted',
            description: 'You don’t have permission to access this business. Go to your business registry page to request access to this business.'
          },
          403: {
            title: 'Access Restricted',
            description: 'You don’t have permission to access this business. Go to your business registry page to request access to this business.'
          },
          404: {
            title: 'Invalid Link',
            description: 'The link you entered is invalid. To access this business, try searching for it on your business registry page.'
          },
          500: {
            title: 'Page Not Found',
            description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
          },
          503: {
            title: 'Page Not Found',
            description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
          },
          undefined: {
            title: 'Unable to retrieve business information',
            description: 'We are currently unable to retrieve this business. Please try again later.'
          }
        },
        ledger: {
          undefined: {
            title: 'Unable to retrieve business ledger',
            description: 'We are currently unable to retrieve the business ledger information. Please try again later.'
          }
        },
        parties: {
          400: {
            title: 'Page Not Found',
            description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
          },
          401: {
            title: 'Access Restricted',
            description: 'You don’t have permission to access this business. Go to your business registry page to request access to this business.'
          },
          403: {
            title: 'Access Restricted',
            description: 'You don’t have permission to access this business. Go to your business registry page to request access to this business.'
          },
          404: {
            title: 'Invalid Link',
            description: 'The link you entered is invalid. To access this business, try searching for it on your business registry page.'
          },
          500: {
            title: 'Page Not Found',
            description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
          },
          503: {
            title: 'Page Not Found',
            description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
          },
          undefined: {
            title: 'Page Not Found',
            description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
          }
        }
      },
      documentDownload: {
        undefined: {
          title: 'Unable to Download Documents',
          description: 'We are currently unable to retrieve this document. Please try again later.'
        }
      },
      filing: {
        init: {
          401: {
            title: 'Access Restricted',
            description: 'You don’t have permission to access this business. Go to your business registry page to request access to this business.'
          },
          403: {
            title: 'Access Restricted',
            description: 'You don’t have permission to access this business. Go to your business registry page to request access to this business.'
          },
          404: {
            title: 'Invalid Link',
            description: 'The link you entered is invalid. To access this business, try searching for it on your business registry page.'
          },
          undefined: {
            title: 'Page Not Found',
            description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
          }
        },
        getDraft: {
          undefined: {
            title: 'Page not found',
            description: 'We cannot display this page right now. Try refreshing the page or go back to the main page of this business.'
          }
        },
        submit: {
          400: {
            title: 'Invalid Submission',
            description: 'There was an issue with the data submitted. Please review the form and try again.'
          },
          401: {
            title: 'Permission Denied',
            description: 'You do not have permission to perform this action for this business.'
          },
          403: {
            title: 'Permission Denied',
            description: 'You do not have permission to perform this action for this business.'
          },
          404: {
            title: 'Business Not Found',
            description: 'This business could not be found in our records.'
          },
          422: {
            title: 'Invalid Submission',
            description: 'There was an issue with the data submitted. Please review the form and try again.'
          },
          500: {
            title: 'An Error Occurred',
            description: "We couldn't complete your request due to an internal error. Please try again later."
          },
          undefined: {
            title: 'Unknown Error',
            description: 'An unknown error occured while trying to submit this filing, please try again later.'
          }
        },
        notAllowed: {
          undefined: {
            title: 'Page not available',
            description: 'This page is not available for this business. Check that your business type hasn’t changed and if any drafts or tasks are waiting to be completed.'
          }
        },
        notAvailable: {
          title: 'Page not available',
          description: 'This filing is not available for this type of business. If you believe this is an error, please contact support.'
        },
        pendingTaskOnSaveOrSubmit: {
          undefined: {
            title: 'Unable to submit filing',
            description: 'Another draft filing already exists. Please complete it before creating a new filing.'
          }
        }
      }
    },
    padConfirmationPeriod: {
      undefined: {
        title: 'PAD Account in Confirmation Period',
        description: 'This account will not be able to perform any PAD transactions until the mandatory (3) day confirmation period has ended. Until then you may continue to pay using credit card.'
      }
    },
    unsavedChanges: {
      title: 'Unsaved changes',
      description: 'You have unsaved changes. Are you sure you want to exit your filing?'
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
    back: 'Back',
    bcRegistriesContactInformation: 'BC Registries Contact Information',
    bcRegistriesDashboard: 'BC Registries Dashboard',
    bcRegistriesStaff: 'BC Registries Staff',
    bcOnLine: 'BC OnLine',
    bcOnLineAccountNumber: 'BC OnLine Account Number',
    bootstrapComplete: '{name} Complete',
    business: 'Business',
    businessName: 'Business Name',
    businessNumber: 'Business Number',
    cancel: 'Cancel',
    cashOrCheque: 'Cash or Cheque',
    certify: 'Certify',
    change: 'Change',
    close: 'Close',
    closeDetails: 'Close Details',
    companyInformationPage: 'Company Information Page',
    completingParty: 'Completing Party',
    continuationPending: 'Continuation Pending',
    continuationOutComplete: 'Continuation Out Complete',
    continueToPayment: 'Continue to Payment',
    courtOrderAndPoa: 'Court Order and Plan of Arrangement',
    courtOrderNumber: 'Court Order Number',
    courtOrderNumberOpt: 'Court Order Number (Optional)',
    date: 'Date',
    datNumber: 'DAT Number',
    deliveryAddress: 'Delivery Address',
    details: 'Details',
    dissolutionCompleted: 'Dissolution Completed',
    documentDelivery: 'Document Delivery',
    documentId: 'Document Id',
    documentIdOpt: 'Document Id (Optional)',
    done: 'Done',
    downloadAll: 'Download All',
    edit: 'Edit',
    effectiveDates: 'Effective Dates',
    email: 'Email',
    emailAddressOpt: 'Email Address (Optional)',
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
    filingPursuantToPlanOfArrangement: 'This filing is pursuant to a Plan of Arrangement',
    folioNumberOpt: 'Folio Number (Optional)',
    folioOrRefNumber: 'Folio or Reference Number',
    folioOrRefNumberOpt: 'Folio or Reference Number (Optional)',
    futureEffectiveDate: 'Future Effective Date',
    goBack: 'Go Back',
    goToBRD: 'Go to Business Registry Dashboard',
    goToMyBusinessRegistry: 'Go to My Business Registry',
    hideDocuments: 'Hide Documents',
    history: 'History',
    incorporation: 'Incorporation',
    incorporationDate: 'Incorporation Date',
    incorporationNumber: 'Incorporation Number',
    incorporationPending: 'Incorporation Pending',
    individualPerson: 'Individual Person',
    keepEditing: 'Keep Editing',
    lastName: 'Last Name',
    legalName: 'Legal Name',
    legalNameOfAuthorizedPerson: 'Legal name of authorized person',
    limitedRestorationPeriod: 'Limited Restoration Period',
    loading: 'Loading',
    mailingAddress: 'Mailing Address',
    makeChanges: 'Make Changes',
    manageDocumentRecord: 'Manage Document Record',
    maxNumberOfShares: 'Maximum Number of Shares',
    middleName: 'MiddleName',
    middleNameOpt: 'Middle Name (Optional)',
    moreActions: 'More Actions',
    myBusinessRegistry: 'My Business Registry',
    name: 'Name',
    next: 'Next',
    notAvailable: 'Not Available',
    notEntered: 'Not Entered',
    noFee: 'No Fee',
    noticeOfWithdrawalForm: 'Notice of Withdrawal Form',
    noMaximum: 'No Maximum',
    numberedAmalgamatedCompany: 'Numbered Amalgamated Company',
    office: 'Office',
    PAID: 'PAID',
    payment: 'Payment',
    PAYMENTCOMPLETED: 'PAYMENT COMPLETED',
    PENDING: 'PENDING',
    pacificTime: 'Pacific time',
    personOrOrgName: 'Person or Business Name',
    phone: 'Phone',
    planOfArrangement: 'Plan of Arrangement',
    preExistingCompanyProvisions: 'Pre-existing Company Provisions',
    preExistingCompanyProvisionsApplyToCompany: 'The Pre-existing Company Provisions apply to this company',
    preferredName: 'Preferred Name',
    preferredNameOpt: 'Preferred Name (Optional)',
    priorityStaffPay: 'Priority (Add $100.00)',
    pursuantToPlanOfArrangement: 'Pursuant to a Plan of Arrangement',
    REJECTED: 'REJECTED',
    refreshPage: 'Refresh Page',
    registration: 'Registration',
    registrationDate: 'Registration Date',
    registrationNumber: 'Registration Number',
    remove: 'Remove',
    requestACopy: 'Request a Copy',
    retrieveBusinessInformation: 'Retrieve Business Information',
    routingSlipNumber: 'Routing Slip Number',
    sameAsDeliveryAddress: 'Same as Delivery Address',
    sameAsMailAddress: 'Same as Mailing Address',
    save: 'Save',
    saveResumeLater: 'Save and Resume Later',
    shareClassOrSeriesName: 'Name of Share Class or Series',
    staffPayment: 'Staff Payment',
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
    agmExtension: 'The {agmyear} AGM must be held by {boldStart}{agmduedate}{boldEnd}.'
  },
  officeType: {
    registeredOffice: 'Registered Office',
    recordsOffice: 'Records Office',
    businessOffice: 'Business Office',
    liquidationRecordsOffice: 'Liquidation Records Office',
    custodial: 'Custodial Office',
    unknown: 'Unknown Office', // FUTURE: remove once 'add' functionality complete in ManageOffices
    undefined: 'Unknown Office' // FUTURE: remove once 'add' functionality complete in ManageOffices
  },
  text: {
    addressChange: 'address change',
    alteration: 'alteration',
    alterationWasSuccessfullyAlteredToTypeOn: '{name} was successfully altered from a {fromLegalType} to a {toLegalType} on',
    amalgamateOut: 'amalgamate out',
    amalgamation: 'amalgamation',
    at1159PacificTime: 'at 11:59 pm Pacific time',
    certifyIsAuthorized: 'I, {boldStart}{legalname}{boldEnd} certify that I have relevant knowledge of the business and am authorized to make this filing.',
    completeYourFilingToDisplay: 'Complete your filing to display',
    continuation: 'continuation',
    continueOut: 'continue out',
    courtOrderAndPoaDescription: 'If this filing is pursuant to a court order, enter the court order number. If this filing is pursuant to a plan of arrangement, enter the court order number and select the Plan of Arrangement checkbox.',
    courtOrdersHaveBeenFiled: 'Court order(s) have been filed on this company. Review the filing history for impacts to business information.',
    dateToCurrent: '{date} to current',
    dissolution: 'dissolution',
    dissolutionCompletedFirm: 'The statement of dissolution for {entitytitle} {name} was successfully submitted on {boldStart}{submitteddate}{boldEnd} with dissolution date of {boldStart}{dissolutiondate}{boldEnd}. The {entitytitle} has been struck from the register and dissolved, and ceased to be a registered {entitytitle} under the {acttitle} Act.',
    dissolutionCompletedNonFirm: 'The {entitytitle} {name} was successfully {boldStart}dissolved on {effectivedate}{boldEnd}. The {entitytitle} has been struck from the register and dissolved, and ceased to be a registered {entitytitle} under the {acttitle} Act.',
    documentDeliveryDescription: 'Copies of the transition documents will be sent to the email addresses listed below.',
    documentIdDescription: 'Enter the 8-digit Document ID number, also referred to as the barcode number. If you do not have one, leave the field empty to generate a Document ID upon submission.',
    effectiveAsOf: 'EFFECTIVE as of',
    expiredConsent: 'This consent is expired. Please resubmit the {name} application for authorization to become a foreign corporation.',
    FiledBySubmitterOn: 'Filed by {submitter} on',
    filedBySubmitterOn: 'filed by {submitter} on',
    filing: 'filing',
    filingAvailableOnPaperOnly: 'This filing is available on paper only. To request copies of paper documents, contact BC Registries staff.',
    filingDateWillBeDate: 'The {filing} date and time for {name} will be {boldStart}{date}{boldEnd}.',
    filingWillTakeEffectOnDate: 'The {filing} will take effect on {boldStart}{date}{boldEnd}.',
    finishTaskBeforeOtherChanges: 'Finish this task before making other changes.',
    folioDescription: 'This is meant for your own tracking purposes and will appear on your receipt.',
    incorporation: 'incorporation',
    itMayTake1hourToProcessFiling: 'It may take up to one hour to process this filing. If this issue persists, please contact us.',
    limitedRestorationWasSuccessful: 'The Company {boldStart}{name}{boldEnd} was successfully restored and is active {boldStart}until {date} at 11:59 pm Pacific time{boldEnd}. At the end of the limited restoration period, the company will be automatically dissolved. If you require assistance to extend a limited restoration/reinstatement or wish to convert your restoration from a limited period to a full restoration, please contact BC Registries staff.',
    limitedRestorationExtensionWasSuccessful: 'The period of restoration was successfully extended and is active {boldStart}until {date}{boldEnd}. At the end of the extended limited restoration period, the company will be automatically dissolved. If you require assistance to extend a limited restoration/reinstatement or wish to convert your restoration from a limited period to a full restoration, please contact BC Registries staff.',
    noDataToDisplay: 'No data to display',
    noDocumentsAvailable: 'No documents available',
    noLongerWishToFileWithdraw: ['If you no longer wish to file this {filing}, you must submit a', 'and a $20.00 fee to BC Registries. You must provide BC Registries with enough time to process the withdrawal before the effective date and time. If you withdraw this record, your filing fees will not be refunded.'],
    moreInfoReadTheLink: 'For more information, read the {link}',
    offenceToMakeMisleadingStatement: '{boldStart}Note:{boldEnd} It is an offence to make a false or misleading statement in respect of a material fact in a record submitted to the Corporate Registry for filing. See section 427 of the Business Corporations Act.',
    paidButNotCompletedByRegistry: 'This {name} is paid, but the filing has not been completed by the Business Registry yet. Some filings may take longer than expected.',
    pendingButNotCompletedByRegistry: 'Your submission is still being processed.',
    pendingButNotCompletedByRegistry1: 'Some submissions may take longer than usual to complete. If this issue continues, please contact us.',
    pleaseSubmitANewApplication: 'Please submit a new application if you’d like to continue your business into B.C.',
    preExistingCompanyProvisionsDescription: 'A pre-existing company is a company that was incorporated in British Columbia before March 29, 2004. The regulations within legislation contain provisions that apply to a pre-existing company. These provisions can be removed by filing a Notice of Alteration.',
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
    theCompanyWasSuccessfullyAmalgamatedOut: 'The Company {name} was successfully {boldStart}Amalgamated Out on {date}, to {foreignjurisdiction} under the name "{newname}"{boldEnd}. The Company has been struck from the register and ceased to be an incorporated company under the Business Corporations Act. You are required to retain a copy of all the Amalgamation Out documents in your records books.',
    theCompanyWasSuccessfullyContinuedOut: 'The Company {name} was successfully {boldStart}Continued Out on {date}, to {foreignjurisdiction} under the name "{newname}"{boldEnd}. The Company has been struck from the register and ceased to be an incorporated company under the Business Corporations Act. You are required to retain a copy of all the Continuation Out documents in your records books.',
    thisCompany: 'this company',
    thisConsentToIsValidUntilDate: 'This consent to {name} to {foreignjurisdiction} is valid {boldStart}until {date}{boldEnd}.',
    undefinedStaffRejectionMessage: 'Staff rejection message unavailable',
    unknown: 'unknown',
    withdrawnOn: 'WITHDRAWN on',
    youHaveNoBusinessLedger: 'You have no filing history',
    yourFilingsWillAppearHere: 'Your completed filings and transactions will appear here'
  },
  validation: {
    bcolAccountNumber: 'BC OnLine Account Number must be 6 digits',
    bcolAccountNumberEmpty: 'Enter BC OnLine Account Number',
    datNumber: 'DAT Number must be in standard format (eg, C1234567)',
    datNumberEmpty: 'Enter DAT Number',
    fieldRequired: 'This field is required',
    routingSlipNumber: 'Routing Slip Number must be 9 digits',
    routingSlipNumberEmpty: 'Enter FAS Routing Slip Number',
    selectAPaymentOption: 'Select a payment option',
    exactDocIDChars: 'Document ID must be 8 characters',
    duplicateDocId: 'A document record already exists with this document ID',
    invalidDocId: 'The number entered is not recognized in our system',
    invalidEmailAddress: 'Enter a valid email address'
  }
}
