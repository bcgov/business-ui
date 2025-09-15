/* eslint-disable max-len */
export default {
  badge: {
    rolesChanged: 'ROLES CHANGED',
    nameChanged: 'NAME CHANGED',
    addressChanged: 'ADDRESS CHANGED',
    added: 'ADDED',
    removed: 'REMOVED'
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
    roles: 'Roles',
    haspreferredName: 'This person also has another name they prefer to use',
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
    },
    filingNotAvailable: {
      title: 'Page not available',
      description: 'The Change of Officers filing is not available for this type of business. If you believe this is an error, please contact support.'
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
