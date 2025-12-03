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
    trackOfficers: 'You can only view current officers. To track historical information, keep a personal record.',
    finishTaskBeforeSubmit: 'Finish this task before submitting.',
    finishTaskBeforeSave: 'Finish this task before saving.',
    liquidationRecordsOfficeAddressDesc: 'This is where the Liquidation Records Office is located.',
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
    manageLiquidators: {
      title: 'Manage Liquidators - People Roles - BC Registries and Online Services',
      h1: 'Manage Liquidators'
    },
    intentToLiquidate: {
      title: 'Intent to Liquidate - People Roles - BC Registries and Online Services',
      h1: 'Intent to Liquidate'
    },
    manageReceivers: {
      title: 'Manage Receivers - People Roles - BC Registries and Online Services',
      h1: 'Manage Receivers'
    },
    officerChange: {
      title: 'Officer Change - People Roles - BC Registries and Online Services',
      h1: 'Officer Change'
    }
  }
}
