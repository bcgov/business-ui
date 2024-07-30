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
    }
  },
  currency: {
    cad: 'CAD',
    usd: 'USD'
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
    office: 'Office'
  },
  links: {
    busCorpAct: {
      main: 'Business Corporations Act',
      sect182: 'Business Corporations Act (Section 182)'
    }
  },
  words: {
    i: 'I',
    addresses: 'Addresses',
    directors: 'Directors',
    confirm: 'Confirm'
  },
  page: {
    notFound: {
      h1: 'Page Not Found'
    },
    home: {
      title: 'Home - Service BC Annual Report',
      h1: 'File your BC Annual Report'
    },
    createAccount: {
      title: 'Account Creation - Service BC Annual Report',
      h1: 'Service BC Account Creation',
      h2: 'Account Details',
      form: {
        infoSection: {
          fieldSet: 'Your Name',
          info: 'This is your legal name as it appears on your BC Services Card.'
        },
        accountNameSection: {
          fieldSet: 'Account Name',
          accountNameInputLabel: 'Account Name',
          error: {
            req: 'Please enter an Account Name',
            min: 'Account Name must be at least 2 characters',
            unique: 'Account Name must be unique'
          }
        },
        contactDetailsSection: {
          fieldSet: 'Contact Details',
          phoneInputLabel: 'Phone Number',
          phoneExtInputLabel: {
            main: 'Extension (Optional)',
            aria: 'Phone Number Extension, Optional'
          },
          emailInputLabel: 'Email Address',
          error: {
            phone: {
              req: 'Please enter a Phone Number',
              invalid: 'Please enter a valid phone number'
            },
            phoneExt: 'Please enter a valid extension',
            email: {
              req: 'Please enter an Email Address',
              invalid: 'Please enter a valid email address'
            }
          }
        }
      }
    },
    existingAccount: {
      title: 'Choose Existing Account - Service BC Annual Report',
      h1: 'Existing Account Found',
      h2: 'Your Existing Accounts',
      existingAccountWarning: 'It looks like you already have an account with Service BC Connect. You can use an existing account to proceed or create a new one.'
    },
    missingId: {
      title: 'Authorization Required - Service BC Annual Report',
      h1: 'Authorization Required'
    },
    annualReport: {
      title: 'File Your BC Annual Report - Service BC Annual Report',
      h1: '{year} Annual Report',
      h2: 'Annual Report for: {name}',
      reviewAndConfirm: {
        main: 'Please review the office addresses and current directors below. This information needs to be correct before you proceed.',
        help: 'To update your office addresses and directors, visit Corporate Online. Allow up to one business day for changes to take effect before returning here to file your annual report.'
      },
      form: {
        agmStatus: {
          question: 'The {year} Annual General Meeting (AGM) status of this business',
          tooltip: 'AGM information is used to calculate dates for AGM extensions and location changes. It also helps ensure your business stays compliant and in good standing.',
          opt1: 'Our {year} AGM was held',
          opt2: 'Our {year} AGM is to be held',
          opt3: 'The board voted to not hold our {year} AGM',
          error: 'Please select an AGM status to continue'
        },
        agmDate: {
          placeholder: 'AGM Date',
          label: 'AGM Date',
          format: 'Format: YYYY-MM-DD',
          error: 'You must select a date if you held an AGM'
        },
        voteDate: {
          placeholder: 'Unanimous Resolution Date',
          label: 'Unanimous Resolution Date',
          format: 'Format: YYYY-MM-DD',
          error: 'You must select a resolution date if the board voted to not hold an AGM'
        },
        complianceWarning: {
          main: '{boldStart}Important:{boldEnd} Generally, companies hold AGMs every year.',
          link: 'Review the {link} to make sure you meet the legislative requirements.'
        },
        certify: {
          question: 'I {boldStart}{name}{boldEnd} certify all information about the Office Addresses and Current Directors is correct.',
          error: 'You must confirm to continue'
        }
      },
      noAddresses: 'No addresses found',
      noDirectors: 'No directors found'
    },
    submitted: {
      title: 'Annual Report Complete - Service BC Annual Report',
      h1: 'Annual Report Complete'
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
  SbcHeader: {
    title: 'Service BC Connect',
    logoBtnLabel: 'Home', // <img> link aria-label
    navLabel: 'Main Navigation' // <nav> aria-label
  },
  SbcFooter: {
    navLabel: 'Useful Links', // <nav> aria-label
    home: 'Home',
    disclaimer: 'Disclaimer',
    privacy: 'Privacy',
    ally: 'Accessibility',
    copyright: 'Copyright',
    bcApp: 'A BC Online Application'
  },
  SbcLogo: {
    alt: 'Government of British Columbia Logo' // <img> alt
  },
  LocaleSelect: {
    // aria-label
    label: 'Select a Language, current language: English'
  }
}
