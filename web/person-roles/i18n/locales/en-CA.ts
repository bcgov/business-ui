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
      // TODO: remove once sub types are in
      // h1: 'Manage Liquidators',
      // title: 'Manage Liquidators - People Roles - BC Registries and Online Services',
      // feeCode: 'LQSIN',
      // feeLabel: 'Manage Liquidators',
      intentToLiquidate: {
        desc: 'Some intent to liquidate descriptive text',
        feeCode: 'LQSIN',
        feeLabel: 'Intent to Liquidate',
        h1: 'Intent to Liquidate',
        title: 'Intent to Liquidate - People Roles - BC Registries and Online Services'
      },
      appointLiquidator: {
        desc: 'Some appoint Liquidator descriptive text',
        feeCode: 'NOAPL',
        feeLabel: 'Appoint Liquidators',
        h1: 'Appoint Liquidators',
        title: 'Appoint Liquidators - People Roles - BC Registries and Online Services'
      },
      ceaseLiquidator: {
        desc: 'Some cease Liquidator descriptive text',
        feeCode: 'NOCEL',
        feeLabel: 'Cease Liquidators',
        h1: 'Cease Liquidators',
        title: 'Cease Liquidators - People Roles - BC Registries and Online Services'
      },
      changeAddressLiquidator: {
        desc: 'Some change address Liquidator descriptive text',
        feeCode: 'NOCAL',
        feeLabel: 'Change Addresses of Liquidators',
        h1: 'Change Addresses of Liquidators',
        title: 'Change Addresses of Liquidators - People Roles - BC Registries and Online Services'
      }
      // TODO: liquidation report
      // liquidationReport: {
      //   desc: 'Some liquidation descriptive text',
      //   feeCode: 'LIQUR',
      //   feeLabel: 'Liquidation Report',
      //   h1: 'Liquidation Report',
      //   title: 'Liquidation Report - People Roles - BC Registries and Online Services'
      // }
    },
    changeOfReceivers: {
      amendReceiver: {
        desc: 'Some amend receiver descriptive text',
        feeCode: 'AMEND',
        feeLabel: 'Amend Receiver or Receiver Manager Information',
        h1: 'Amend Receiver or Receiver Manager Information',
        title: 'Amend Receivers - People Roles - BC Registries and Online Services'
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
    changeOfOfficers: {
      desc: 'Officer information is not required by BC Registries, but will show on the business summary if it is submitted. To make updates, simply submit another officer change.',
      feeCode: 'NOCOI',
      feeLabel: 'Officer Change',
      h1: 'Officer Change',
      title: 'Officer Change - People Roles - BC Registries and Online Services'
    }
  }
}
