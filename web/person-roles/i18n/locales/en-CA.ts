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
    addLiquidator: 'Add Liquidator',
    addOfficer: 'Add Officer',
    addReceiver: 'Add Receiver',
    changeAddress: 'Change Address',
    changeName: 'Change Name',
    changeRoles: 'Change Roles',
    editLiquidator: 'Edit Liquidator',
    editReceiver: 'Edit Receiver',
    haspreferredName: 'This person also has another name they prefer to use',
    liquidationRecordsOfficeAddress: 'Liquidation Records Office Address',
    loading: 'Loading',
    officerChange: 'Officer Change',
    receiverChange: 'Receiver Change',
    liquidatorChange: 'Liquidator Change',
    officerInfo: 'Officer Information',
    receiverInfo: 'Receiver Information',
    liquidatorInfo: 'Liquidator Information',
    roles: 'Roles'
  },
  text: {
    noLiquidators: 'There are currently no liquidators.',
    noOfficers: 'There are currently no officers.',
    noReceivers: 'There are currently no Receivers.',
    ifIssuePersistsContactUs: 'If this issue persists, please contact us.',
    finishTaskBeforeSubmit: 'Finish this task before submitting.',
    finishTaskBeforeSave: 'Finish this task before saving.',
    liquidationRecordsOfficeAddressDesc: 'This is where the Liquidation Records Office is located.',
    noChangesToSave: 'There are no changes to save.',
    noChangesToSubmit: 'There are no changes to submit.',
    finishTaskBeforeOtherChanges: 'Finish this task before making other changes.',
    officerInfoDescription: 'You can only view current officers. Keep current and former officer information in the company’s records.',
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
    // Below sections are named based on filing type and filing sub type
    changeOfLiquidators: {
      // TODO: add other sub types
      intentToLiquidate: {
        title: 'Intent to Liquidate - People Roles - BC Registries and Online Services',
        h1: 'Intent to Liquidate'
      }
    },
    changeOfReceivers: {
      ammendReceiver: {
        desc: 'Some ammend receiver descriptive text',
        feeCode: 'AMEND',
        feeLabel: 'Ammend Receiver or Receiver Manager Information',
        h1: 'Ammend Receiver or Receiver Manager Information',
        title: 'Ammend Receivers - People Roles - BC Registries and Online Services'
      },
      appointReceiver: {
        desc: 'Some appoint receiver descriptive text',
        feeCode: 'NOARM',
        feeLabel: 'Appoint Receivers or Receiver Managers',
        h1: 'Appoint Receivers or Receiver Managers',
        title: 'Appoint Receivers - People Roles - BC Registries and Online Services'
      },
      ceaseReceiver: {
        desc: 'Some cease receiver descriptive text',
        feeCode: 'NOCER',
        feeLabel: 'Cease Receivers or Receiver Managers',
        h1: 'Cease Receivers or Reveiver Managers',
        title: 'Cease Receivers - People Roles - BC Registries and Online Services'
      },
      changeAddressReceiver: {
        desc: 'Some change address receiver descriptive text',
        feeCode: 'NOCRM',
        feeLabel: 'Change Addresses of Receivers or Reveiver Managers',
        h1: 'Change Addresses of Receivers or Reveiver Managers',
        title: 'Change Receiver Addresses - People Roles - BC Registries and Online Services'
      }
    },
    manageReceivers: {
      title: 'Manage Receivers - People Roles - BC Registries and Online Services',
      h1: 'Manage Receivers'
    },
    changeOfOfficers: {
      title: 'Officer Change - People Roles - BC Registries and Online Services',
      h1: 'Officer Change',
      desc: 'Officer information is not required by BC Registries, but will show on the business summary if it is submitted. To make updates, simply submit another officer change.',
    }
  }
}
