/* eslint-disable max-len */
export default {
  badge: {
    rolesChanged: 'ROLES CHANGED',
    nameChanged: 'NAME CHANGED',
    addressChanged: 'ADDRESS CHANGED',
    added: 'ADDED',
    removed: 'REMOVED'
  },
  btn: {
    done: 'Done',
    cancel: 'Cancel',
    submit: 'Submit',
    save: 'Save',
    saveExit: 'Save and Resume Later',
    goToBRD: 'Go to Business Registry Dashboard',
    keepEditing: 'Keep Editing',
    exitWithoutSaving: 'Exit Without Saving',
    close: 'Close',
    goBack: 'Go Back',
    refreshPage: 'Refresh Page',
    goToMyBusinessRegistry: 'Go to My Business Registry'
  },
  contactInfo: {
    bcros: {
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
  enum: {
    officerRole: {
      CEO: 'Chief Executive Officer',
      TREASURER: 'Treasurer',
      CFO: 'Chief Financial Officer',
      SECRETARY: 'Secretary',
      PRESIDENT: 'President',
      ASSISTANT_SECRETARY: 'Assistant Secretary',
      VP: 'Vice President',
      OTHER: 'Other Office(s)',
      CHAIR: 'Chair',
      Officer: 'Officer' // TODO: update when subtype/roles are defined in api
    }
  },
  label: {
    addOfficer: 'Add Officer',
    name: 'Name',
    legalName: 'Legal Name',
    roles: 'Roles',
    firstName: 'First Name',
    middleNameOpt: 'Middle Name (Optional)',
    lastName: 'Last Name',
    preferredNameOpt: 'Preferred Name (Optional)',
    preferredName: 'Preferred Name',
    preferredNameColon: 'Preferred Name:',
    haspreferredName: 'This person also has another name they prefer to use',
    actions: 'Actions',
    changeName: 'Change Name',
    changeRoles: 'Change Roles',
    changeAddress: 'Change Address',
    undo: 'Undo',
    remove: 'Remove',
    moreActions: 'More Actions',
    edit: 'Edit',
    businessNumber: 'Business Number',
    incorporationNumber: 'Incorporation Number',
    email: 'Email',
    phone: 'Phone',
    change: 'Change',
    makeChanges: 'Make Changes',
    myBusinessRegistry: 'My Business Registry',
    bcRegistriesDashboard: 'BC Registries Dashboard',
    notEntered: 'Not Entered',
    notAvailable: 'Not Available',
    folioNumber: 'Folio or Reference Number',
    folioNumberOpt: 'Folio or Reference Number (Optional)',
    officerInfo: 'Officer Information',
    officerChange: 'Officer Change'
  },
  modal: {
    error: {
      initOfficerStore: {
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
        undefined: {
          title: 'Page Not Found',
          description: 'We cannot display this information right now. Please try refreshing the page. If this problem continues, please contact us for help.'
        }
      },
      getDraftFiling: {
        undefined: {
          title: 'Page not found',
          description: 'We cannot display this page right now. Try refreshing the page or go back to the main page of this business.'
        }
      },
      submitFiling: {
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
      filingNotAllowed: {
        undefined: {
          title: 'Page not available',
          description: 'This page is not available for this business. Check that your business type hasn’t changed and if any drafts or tasks are waiting to be completed.'
        }
      },
      pendingTaskOnSaveOrSubmit: {
        undefined: {
          title: 'Unable to submit filing',
          description: 'Another draft filing already exists. Please complete it before creating a new filing.'
        }
      }
    },
    unsavedChanges: {
      title: 'Unsaved changes',
      description: 'You have unsaved changes. Are you sure you want to exit your filing?'
    },
    padConfirmationPeriod: {
      undefined: {
        title: 'PAD Account in Confirmation Period',
        description: 'This account will not be able to perform any PAD transactions until the mandatory (3) day confirmation period has ended. Until then you may continue to pay using credit card.'
      }
    }
  },
  text: {
    noOfficers: 'There are currently no officers.',
    ifIssuePersistsContactUs: 'If this issue persists, please contact us.',
    trackOfficers: 'You can only view current officers. To track historical information, keep a personal record.',
    finishTaskBeforeSubmit: 'Finish this task before submitting.',
    finishTaskBeforeSave: 'Finish this task before saving.',
    noChangesToSave: 'There are no changes to save.',
    noChangesToSubmit: 'There are no changes to submit.',
    finishTaskBeforeOtherChanges: 'Finish this task before making other changes.',
    trackFolio: 'This is meant for your own tracking purposes and will appear on your receipt.'
  },
  validation: {
    required: 'Required',
    fieldRequired: 'This field is required',
    minChars: 'Minimum 0 characters | Minimum 1 character | Minimum {count} characters', // 0/1 most likely will never be used but required for pluralization
    maxChars: 'Maximum 0 characters | Maximum 1 character | Maximum {count} characters', // 0/1 most likely will never be used but required for pluralization
    address: {
      country: 'Please select a country',
      street: 'Please enter a street address',
      streetName: 'Please enter a street name',
      streetNumber: 'Please enter a street number',
      city: 'Please enter a city',
      region: 'Please select a region',
      postalCode: 'Please enter a postal code',
      unitNumber: 'Please enter a unit number'
    },
    name: {
      first: 'Please enter a first name',
      last: 'Please enter a last name',
      full: 'Please enter a full legal name'
    },
    role: {
      min: 'Choose at least one role'
    }
  },
  page: {
    officerChange: {
      title: 'Officer Change - People Roles - BC Registries and Online Services',
      h1: 'Officer Change'
    }
  }
}
