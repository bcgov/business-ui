export default {
  alerts: {
    'future-filing': {
      title: '',
      description: 'The next Annual Report for this company is not due until {date}. Please file the Annual Report on or after that date.'
    },
    'invalid-next-ar-year': {
      title: 'Invalid Annual Report Year',
      description: 'The next Annual Report year is invalid or missing.'
    },
    'missing-token': {
      title: '',
      description: 'Missing token to retrieve business details.'
    },
    'internal-server-error': {
      title: '',
      description: 'Internal server error, please try again later or contact us for assistance.'
    },
    'invalid-token': {
      title: 'Invalid Token',
      description: 'Error retrieving business details with the provided token.'
    },
    'business-details': {
      title: '',
      description: 'Error retrieving business details.'
    },
    'account-access': {
      title: 'Access Denied',
      description: 'Your account does not have permission to complete this task.'
    },
    'payment-error': {
      title: 'Payment Not Complete',
      description: 'Your payment was not completed, please try again.'
    },
    'ar-submit-error': {
      title: 'Submission Error',
      description: 'An error occurred while processing your request. Please confirm your information and try again. If the issue persists, contact support for assistance.'
    },
    'create-account': {
      title: 'Account Creation Error',
      description: 'Please verify your details and try again. If the issue persists, please contact support for assistance.'
    },
    'tos-patch-error': {
      title: 'Terms of Use Error',
      description: 'We could not update the Terms of Use at this time, please try again later or contact us for assistance.'
    },
    'filing-in-progress': {
      title: 'Filing in Progress',
      description: 'Your filing has been paid and is currently being processed.'
    },
    'document-download': {
      title: 'Download Failed',
      description: 'Unable to download the document at this time. Please try again or contact support if the issue persists.'
    },
    'future-effective-filings': {
      title: 'Pending Filing Found',
      description: 'There is a pending filing for this business found in CorporateOnLine that needs to be completed before you can proceed with this task. Please return after that filing has been completed.'
    },
    'inactive-corp-state': {
      title: 'Inactive Business',
      description: 'This business is currently inactive. You cannot proceed with this task until the business is reactivated. Please contact support for assistance.'
    },
    'fee-info': {
      title: 'Fee Error',
      description: 'Error retrieving fees, please try again or come back later.'
    }
  },
  btn: {
    getStarted: 'Get Started',
    goHome: 'Go Home',
    goBack: 'Go Back',
    dashboard: 'Dashboard',
    sbcConnect: 'Service BC Connect',
    copy: 'Copy',
    copied: 'Copied!',
    submit: 'Submit',
    next: 'Next',
    previous: 'Previous',
    openMainNav: 'Open Main Navigation Menu',
    closeMainNav: 'Close Main Navigation Menu',
    loginBCSC: 'Login with BC Services Card',
    createNewAccount: 'Create New Account',
    createAccount: 'Create Account',
    useThisAccount: {
      main: 'Use this Account',
      aria: 'Use this Account, {name}'
    },
    logout: 'Log out',
    saveAccountAndFileAr: 'Save Account & File Annual Report',
    submitAndPay: 'Submit & Pay',
    accountOptions: 'Account Options Menu',
    accept: 'Accept',
    decline: 'Decline',
    close: 'Close',
    openHelpDocs: 'Read the Overview',
    downloadReceipt: 'Download Receipt',
    downloadReport: 'Download Report',
    info: {
      show: 'Show information',
      hide: 'Hide information'
    },
    colsToShow: {
      label: 'Columns to Show',
      aria: 'Columns to Show, {count} selected'
    },
    busGetStarted: {
      label: 'Get Started with a B.C. Based Business',
      tooltip: 'Go to Name Request to get started with a named or numbered business.'
    },
    busStartHelp: {
      show: 'Help with Starting and Managing a Business',
      hide: 'Hide Help'
    },
    moreOptions: 'More Options',
    clearFilters: 'Clear Filters',
    help: 'Help',
    hideHelp: 'Hide Help',
    tryAgain: 'Try Again',
    cancel: 'Cancel',
    ok: 'OK'
  },
  contactInfo: {
    bcRegGeneral: {
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
    }
  },
  currency: {
    cad: 'CAD',
    usd: 'USD'
  },
  error: {
    generic: {
      title: 'Something Went Wrong',
      description: 'An error occurred, please try again. If this error persists, please contact us.'
    },
    businessAdd: {
      title: 'Error Adding Existing Business',
      description: 'An error occurred adding your business. Please try again.'
    },
    businessUnavailable: {
      changeName: {
        title: 'Business Unavailable',
        description: 'You are not authorized to access the business to change its name. Please add this business to your table to continue.'
      },
      generic: {
        title: 'Business Unavailable',
        description: 'You are not authorized to access the business you wish to {action}. Please add this business to your table to continue.'
      }
    }
  },
  entityAlertTypes: {
    FROZEN: 'This business is frozen',
    BAD_STANDING: 'This business is not in good standing',
    LIQUIDATION: 'This business is in liquidation',
    DISSOLUTION: 'This business is in the process of being dissolved',
    PROCESSING: 'This name request is still processing, it may take up to 10 minutes.',
    EXPIRED: 'This incorporation application is no longer valid; the name request is expired.'
  },
  form: {
    manageNR: {
      heading: 'Manage a Name Request',
      requestedNames: 'Requested Name: | Requested Names:',
      nrNum: 'Name Request Number:',
      legend: 'Enter either the applicant phone number OR applicant email that were used when the name was requested:',
      fields: {
        phone: {
          help: 'Example: 555-555-5555',
          placeholder: 'Applicant Phone Number',
          arialabel: 'Applicant Phone Number',
          error: {
            invalid: 'Please enter a valid phone number (e.g., 123-456-7890).'
          }
        },
        email: {
          help: "Example: name{'@'}email.com",
          placeholder: 'Applicant Email Address',
          arialabel: 'Applicant Email Address',
          error: {
            invalid: "Please enter a valid email (e.g., name{'@'}email.com)."
          }
        },
        alert: {
          bothEmpty: 'At least one contact method (email or phone) must be provided.',
          bothInvalid: 'Both fields are invalid. Please enter either a valid phone number or a valid email.'
        }
      },
      submitBtn: 'Manage this Name Request',
      help: {
        heading: 'Need Help?',
        description: 'If you have lost your receipt or name results email and need assistance finding your Name Request (NR) Number, please contact us at:'
      },
      error: {
        default: {
          title: 'Error Adding Name Request',
          description: 'Unable to add name request at this time, please try again or come back later.'
        },
        400: {
          title: 'Error Adding Name Request',
          description: "We couldn't find a name request associated with the phone number or email address you entered. Please try again."
        },
        404: {
          title: 'Name Request Not Found',
          description: 'The specified name request was not found.'
        },
        500: {
          title: 'Internal Server Error',
          description: 'Unable to add name request at this time, please try again or come back later.'
        }
      },
      successToast: '{nrNum} was successfully added to your table.'
    },
    manageBusiness: {
      heading: 'Manage a B.C. Business',
      businessName: '{boldStart}Business Name:{boldEnd} {name}',
      businessNumber: '{boldStart}Incorporation Number:{boldEnd} {number}',
      missingInfo: {
        p1: 'Some required information for this business is missing.',
        p2: "The business doesn't have a password / passcode or email on record. Please contact us for help:"
      },
      legend: 'You must be authorized to manage this business. You can be authorized in one of the following ways:',
      authOption: {
        passcode: {
          accordianLabel: {
            default: 'Use the business password',
            coopOrBen: 'Use the business passcode'
          },
          fields: {
            passcode: {
              arialabel: {
                coop: 'Enter the business passcode',
                default: 'Enter the business password'
              },
              placeholder: {
                coop: 'Passcode',
                default: 'Password'
              },
              help: {
                coop: 'Passcode must be exactly 9 digits',
                default: 'Password must be 8 to 15 characters'
              },
              error: {
                coop: {
                  required: 'Passcode is required, enter the passcode you have setup in Corporate Online',
                  length: 'Passcode must be exactly 9 digits',
                  type: 'Passcode must be numeric'
                },
                default: {
                  required: 'Password is required',
                  length: 'Password must be 8 to 15 characters'
                }
              }
            }
          }
        },
        firm: {
          accordianLabel: {
            default: 'Use the name of a proprietor or partner'
          },
          fields: {
            name: {
              arialabel: 'Propietor or Partner Name (e.g., Last Name, First Name Middlename)',
              placeholder: 'Propietor or Partner Name (e.g., Last Name, First Name Middlename)',
              help: 'Name as it appears on the Business Summary or the Statement of Registration',
              error: {
                required: 'Proprietor or Partner Name is required',
                max: 'Maximum 150 characters'
              }
            },
            certify: {
              label: '{boldStart}{name}{boldEnd} certifies that they have relevant knowledge of the registered entity and is authorized to act on behalf of this business.',
              error: 'Please certify in order to continue'
            }
          }
        },
        email: {
          accordianLabel: {
            default: 'Confirm authorization using your email address',
            firm: 'Confirm authorization using your business email address',
            corpOrBenOrCoop: "Confirm authorization using your registered office email address (If you forgot or don't have a business passcode)"
          },
          sentTo: {
            default: 'An email will be sent to the contact email of the business:',
            firm: 'An email will be sent to the business contact email of the business:',
            corpOrBenOrCoop: 'An email will be sent to the registered office contact email of the business:'
          },
          instructions: 'To confirm your access, please click on the link in the email. This will add the business to your Business Registry List. The link is valid for 15 minutes.'
        },
        delegation: {
          accordianLabel: {
            default: 'Request authorization from an account currently managing the business'
          },
          fields: {
            account: {
              label: 'Select an account:',
              placeholder: 'Select an account',
              arialabel: 'Select an account: current selection, {account}',
              error: {
                required: 'Please select an account to proceed'
              }
            },
            message: {
              label: 'You can add a message that will be included as part of your authorization request.',
              placeholder: 'Request access additional message'
            }
          }
        }
      },
      emailSent: {
        heading: 'Authorization Email Sent',
        p1: 'An email was sent to {boldStart}{email}{boldEnd}',
        p2: 'Confirm your access by clicking the link inside. This will add the business to your Business Registry List. The link is valid for 15 minutes.'
      },
      toast: {
        success: '{identifier} was successfully added to your table.',
        emailSent: 'Confirmation email sent, pending authorization.'
      },
      error: {
        email: {
          title: 'Error Sending Authorization Email',
          description: 'An error occurred sending authorization email. Please try again.'
        },
        delegation: {
          title: 'Error creating authorization invitation request',
          description: 'An error occurred creating authorization invitation. Please try again later.'
        },
        passcode: {
          401: {
            coop: {
              title: 'Invalid Passcode',
              description: 'Unable to add the business. The provided passcode is invalid.'
            },
            default: {
              title: 'Invalid Password',
              description: 'Unable to add the business. The provided password is invalid.'
            }
          },
          404: {
            title: 'Business Not Found',
            description: 'The specified business was not found.'
          },
          400: {
            title: 'Business Already Added',
            description: 'The business {name} with the business number {identifier} is already in your Business Registry List.'
          },
          406: {
            title: 'Passcode Already Claimed',
            description: 'This passcode has already been claimed. If you have questions, please contact us'
          },
          default: {
            title: 'Something Went Wrong',
            description: 'An error occurred, please try again. If this error persists, please contact us.'
          }
        },
        firm: {
          401: {
            title: 'Invalid Proprietor or Partner Name (e.g., Last Name, First Name Middlename)',
            description: 'Unable to add the business. The provided proprietor or partner name (e.g., last name, first name middlename) is invalid.'
          },
          404: {
            title: 'Business Not Found',
            description: 'The specified business was not found.'
          },
          400: {
            title: 'Business Already Added',
            description: 'The business {name} with the business number {identifier} is already in your Business Registry List.'
          },
          default: {
            title: 'Something Went Wrong',
            description: 'An error occurred, please try again. If this error persists, please contact us.'
          }
        }
      },
      submitBtn: 'Manage this Business',
      noOptionAlert: 'Please select an option from the list above'
    }
  },
  labels: {
    note: 'Note',
    optional: 'Optional',
    characters: 'characters',
    buttons: {
      back: 'Back',
      cancel: 'Cancel',
      fileNowNoFee: 'File Now (no fee)',
      reviewConfirm: 'Review and Confirm',
      save: 'Save',
      saveExit: 'Save and Resume Later'
    },
    birthdate: 'Birthdate',
    competency: 'Competency',
    citizenship: 'Citizenship',
    citizenshipPR: 'Citizenship/Permanent Residency',
    emailAddress: 'Email Address',
    fullName: 'Full Legal Name',
    preferredName: 'Preferred Name',
    address: 'Address',
    addressResidential: 'Residential Address',
    state: 'State',
    country: 'Country',
    line1: 'Address Line 1',
    line2: 'Address Line 2 (Optional)',
    city: 'City',
    region: 'Region (Optional)',
    postalCode: 'Postal Code',
    locationDescription: 'Location Description (Optional)',
    countryOfCitizenship: {
      citizen: 'Citizen of Canada',
      pr: 'Permanent resident of Canada',
      others: 'Other citizenship(s)',
      selectAll: 'Select all countries of which this person is a citizen.',
      placeholder: 'Countries of Citizenship',
      findCountry: 'Find a Country',
      select: 'Select',
      selected: 'Selected'
    },
    findACountry: 'Find a country',
    services: {
      bcsc: 'BC Services Card',
      bceid: 'BCeID',
      idir: 'IDIR'
    },
    socialInsuranceNumber: 'Social Insurance Number (SIN)',
    taxNumber: 'Tax Number',
    busName: 'Business Name',
    corpNum: 'Incorporation Number',
    busNum: 'Business Number',
    arDate: 'Date of Annual Report',
    name: 'Name',
    mailingAddress: 'Mailing Address',
    deliveryAddress: 'Delivery Address',
    effectiveDates: 'Effective Dates',
    apptDate: '{date} to current',
    sameAsMailAddress: 'Same as Mailing Address',
    registeredOffice: 'Registered Office',
    recordsOffice: 'Records Office',
    office: 'Office',
    status: 'Status',
    number: 'Number',
    type: 'Type',
    actions: 'Actions',
    myList: '{boldStart}My List{boldEnd} ({count})',
    amalgamateNow: 'Amalgamate Now',
    alterNow: 'Alter Now',
    changeNameNow: 'Change Name Now',
    continueInNow: 'Continue In Now',
    downloadForm: 'Download Form',
    registerNow: 'Register Now',
    restoreNow: 'Restore Now',
    reinstateNow: 'Reinstate Now',
    openNameRequest: 'Open Name Request',
    resumeDraft: 'Resume Draft',
    removeFromTable: 'Remove From Table',
    manageBusiness: 'Manage Business',
    cancelRequest: 'Cancel Request',
    amalgamateNowShortForm: 'Amalgamate Now (Short Form)',
    noAffiliationRecords: 'No Affiliation Records',
    newRequest: 'New Request',
    resendEmail: 'Resend Email',
    removeFromList: 'Remove From List',
    removeBusiness: 'Remove Business',
    bcRegDashboard: 'BC Registries Dashboard'
  },
  links: {
    busCorpAct: {
      main: 'Business Corporations Act',
      sect182: 'Business Corporations Act (Section 182)'
    }
  },
  modal: {
    removeBusiness: {
      generic: {
        NR: {
          title: 'Remove Name Request?',
          description: 'Removing this Name Request will remove the request from your Business Registry list. You can add it back at a later time by selecting Add an Existing... Name Request. This Name Request will still be valid until it is used or cancelled, or it expires.',
          primaryBtnLabel: 'Remove Name Request',
          secondaryBtnLabel: 'Keep Name Request'
        },
        TMP: {
          title: 'Delete Incorporation Application?',
          description: 'Deleting this incorporation application will remove the application from your Business Registry list. The business associated with this application will not be incorporated. If this incorporation application was associated with a Name Request, the Name Request can still be used to incorporate a business.',
          primaryBtnLabel: 'Delete Incorporation Application',
          secondaryBtnLabel: 'Keep Incorporation Application'
        },
        ATMP: {
          title: 'Delete Amalgamation Application?',
          description: 'Deleting this amalgamation application will remove the application from your Business Registry list. If this amalgamation application was associated with a Name Request, the Name Request can still be used to start an amalgamation application.',
          primaryBtnLabel: 'Delete Amalgamation Application',
          secondaryBtnLabel: 'Keep Amalgamation Application'
        },
        RTMP: {
          title: 'Delete Registration?',
          description: 'Deleting this registration will remove the application from your Business Registry list. The business associated with this application will not be registered. If this registration was associated with a Name Request, the Name Request can still be used to register a business.',
          primaryBtnLabel: 'Delete Registration',
          secondaryBtnLabel: 'Keep Registration'
        },
        GP: {
          title: 'Remove Registration?',
          description: 'Removing this registration will remove the associated business from your Business Registry list. To add the business back to the My Business Registry list later, you will need the business registration number and the name of the proprietor exactly as it appears on the registration application.',
          primaryBtnLabel: 'Remove Registration',
          secondaryBtnLabel: 'Keep Registration'
        },
        SP: {
          title: 'Remove Registration?',
          description: 'Removing this registration will remove the associated business from your Business Registry list. To add the business back to the My Business Registry list later, you will need the business registration number and the name of the proprietor exactly as it appears on the registration application.',
          primaryBtnLabel: 'Remove Registration',
          secondaryBtnLabel: 'Keep Registration'
        }
      },
      passcode: {
        form: {
          radio: {
            reset: {
              label: 'Reset my passcode and remove business',
              help: 'Business will be removed from this account,New business passcode will be generated and will cancel the old business passcode,New business passcode will be sent through email to the person who will be responsible for managing this business moving forward'
            },
            noReset: {
              label: 'Do not reset my passcode and remove business',
              help: 'Business will be removed from this account,The current passcode for this business will be cancelled,You will not be able to add this business back to your account without a new passcode'
            },
            legend: 'Please select one of the two choices below to remove this business from the account'
          },
          email: {
            arialabel: 'Email Address',
            placeholder: 'Email Address',
            error: {
              required: 'Email address is required.',
              invalid: 'Please enter a valid email address.'
            }
          },
          confirmEmail: {
            arialabel: 'Confirm Email Address',
            placeholder: 'Confirm Email Address',
            error: {
              required: 'Email confirmation is required.',
              invalid: 'Please enter a valid email address.',
              match: 'Email addresses must match'
            }
          }
        }
      },
      index: {
        successToast: 'Business successfully removed from your list.'
      }
    }
  },
  words: {
    i: 'I',
    addresses: 'Addresses',
    directors: 'Directors',
    confirm: 'Confirm',
    select: 'Select',
    none: 'None',
    or: 'or',
    Or: 'Or',
    error: 'error',
    Error: 'Error',
    OK: 'OK',
    remove: 'remove',
    Remove: 'Remove',
    added: 'added',
    Added: 'Added'
  },
  page: {
    notFound: {
      h1: 'Page Not Found'
    },
    home: {
      title: 'Home - My Business Registry Dashboard',
      h1: 'My Business Registry',
      intro: 'Start B.C. based businesses and keep business records up to date.',
      busOrNRSearch: {
        label: 'Retrieve an existing business or active Name Request to manage:',
        placeholder: 'My business name, incorporation number, or registration number',
        help: 'For example: "Joe\'s Plumbing Inc.", "BC1234567", "FM1234567"',
        opts: {
          legend: 'Select to search either for an existing business or name request',
          existingBus: 'Existing Business',
          nr: 'Name Request'
        }
      }
    },
    tos: {
      title: 'Terms of Use - Service BC Annual Report',
      h1: 'Terms of Use',
      form: {
        checkboxLabel: 'I have read and accept the Terms of Use',
        scrollError: 'Please scroll to the bottom of the document to accept the Terms of Use',
        checkedError: 'You must accept the Terms of Use to continue'
      },
      modal: {
        title: 'Decline Terms of Use',
        content: 'By declining the Terms of Use, you will not be able to continue using this service. Please accept the Terms of Use to proceed.'
      }
    },
    help: {
      title: 'Annual Report Overview - Service BC Annual Report'
    }
  },
  search: {
    reg: {
      placeholder: 'My business name, incorporation number or registration number',
      arialabel: 'Start typing to search by business name, incorporation number or registration number',
      empty: {
        title: 'No active B.C. business found',
        content: 'Ensure you have entered the correct business name or number.'
      }
    },
    namex: {
      placeholder: 'My business name or name request number',
      arialabel: 'Start typing to search by business name or name request number',
      empty: {
        title: 'No active Name Request found',
        content: 'Ensure you have entered a Name Request that has not expired or been cancelled.'
      }
    }
  },
  table: {
    affiliation: {
      filter: {
        busName: {
          aria: 'Filter by Business Name',
          placeholder: 'Name',
          clear: {
            tooltip: 'Reset Name',
            aria: 'Reset business name'
          }
        },
        busNumber: {
          aria: 'Filter by Business Number',
          placeholder: 'Number',
          clear: {
            tooltip: 'Reset Number',
            aria: 'Reset business number'
          }
        },
        legalType: {
          aria: 'Filter by legal type, current filter: {filter}',
          placeholder: 'Type',
          selected: '{count} selected',
          clear: {
            tooltip: 'Reset Types',
            aria: 'Reset legal types'
          }
        },
        busStates: {
          aria: 'Filter by business status, current filter: {filter}',
          placeholder: 'Status',
          selected: '{count} selected',
          clear: {
            tooltip: 'Reset Status',
            aria: 'Reset business status'
          }
        }
      },
      cell: {
        name: {
          approved: 'Name request, {name}, approved',
          rejected: 'Name request, {name}, rejected'
        }
      }
    }
  },
  toast: {
    unableToAddNr: 'Unable to add name request',
    unableToAddBusiness: 'Unable to add business',
    errorResendingAffInvite: 'Error resending affiliation invitation'
  },
  tooltips: {
    affiliationActionBtn: 'Go to {option} to access this business'
  },
  widgets: {
    feeSummary: {
      title: 'Fee Summary',
      total: 'Total Fees',
      noFee: 'No Fee',
      priorityFees: 'Priority Fees',
      futureEffectiveFees: 'Future Effective Fees',
      serviceFees: 'Service Fee',
      itemLabels: {
        TEST: 'This is test entry',
        REGSIGIN: 'Significant Individual Change',
        BCANN: 'BC Annual Report'
      }
    }
  },
  // components
  ConnectHeader: {
    title: 'BC Registries and Online Services'
  },
  AsyncComboBox: {
    resultsCount: '{count} results',
    error: 'Error retrieving search results, please try again later.',
    resultListLabel: 'Search Results',
    noResults: 'No results found'
  }
}
