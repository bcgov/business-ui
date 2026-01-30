export const useBusinessPermissionsStore = defineStore('business-permissions-store', () => {
  const service = useBusinessService()

  const authorizedActions = shallowRef<AuthorizedAction[]>([])

  async function init(identifier: string) {
    authorizedActions.value = await service.getAuthorizedActions(identifier)
  }

  function isAuthorized(action: AuthorizedAction) {
    return authorizedActions.value.includes(action)
  }

  function isAuthorizedByFilingType(filingType: FilingType, filingSubType?: FilingSubType) {
    let authorized = false

    switch (filingType) {
      case FilingType.ADMIN_FREEZE: {
        // this covers both Freeze and Unfreeze
        authorized = isAuthorized(AuthorizedAction.STAFF_FILINGS)
        break
      }
      case FilingType.ALTERATION: {
        authorized = isAuthorized(AuthorizedAction.ALTERATION_FILING)
        break
      }
      case FilingType.AGM_EXTENSION: {
        authorized = isAuthorized(AuthorizedAction.AGM_EXTENSION_FILING)
        break
      }
      case FilingType.AGM_LOCATION_CHANGE: {
        authorized = isAuthorized(AuthorizedAction.AGM_CHG_LOCATION_FILING)
        break
      }
      case FilingType.AMALGAMATION_APPLICATION: {
        authorized = isAuthorized(AuthorizedAction.AMALGAMATION_FILING)
        break
      }
      case FilingType.AMALGAMATION_OUT: {
        authorized = isAuthorized(AuthorizedAction.STAFF_FILINGS)
        break
      }
      case FilingType.ANNUAL_REPORT: {
        authorized = isAuthorized(AuthorizedAction.ANNUAL_REPORT_FILING)
        break
      }
      case FilingType.CHANGE_OF_ADDRESS: {
        authorized = isAuthorized(AuthorizedAction.ADDRESS_CHANGE_FILING)
        break
      }
      // case FilingType.CHANGE_OF_COMPANY_INFO:   not used here yet
      case FilingType.CHANGE_OF_DIRECTORS: {
        authorized = isAuthorized(AuthorizedAction.DIRECTOR_CHANGE_FILING)
        break
      }
      case FilingType.CHANGE_OF_OFFICERS: {
        authorized = isAuthorized(AuthorizedAction.OFFICER_CHANGE_FILING)
        break
      }
      case FilingType.CHANGE_OF_LIQUIDATORS: {
        authorized = isAuthorized(AuthorizedAction.STAFF_FILINGS)
        break
      }
      case FilingType.CHANGE_OF_RECEIVERS: {
        authorized = isAuthorized(AuthorizedAction.STAFF_FILINGS)
        break
      }
      // case FilingType.CHANGE_OF_NAME:    not used here yet
      case FilingType.CHANGE_OF_REGISTRATION: {
        authorized = isAuthorized(AuthorizedAction.FIRM_CHANGE_FILING)
        break
      }
      case FilingType.CONSENT_AMALGAMATION_OUT: {
        authorized = isAuthorized(AuthorizedAction.CONSENT_AMALGAMATION_OUT_FILING)
        break
      }
      case FilingType.CONSENT_CONTINUATION_OUT: {
        authorized = isAuthorized(AuthorizedAction.CONSENT_CONTINUATION_OUT_FILING)
        break
      }
      // case FilingType.CONTINUATION_IN: not used here yet
      case FilingType.CONTINUATION_OUT: {
        authorized = isAuthorized(AuthorizedAction.STAFF_FILINGS)
        break
      }
      case FilingType.CONVERSION: {
        authorized = isAuthorized(AuthorizedAction.FIRM_CONVERSION_FILING)
        break
      }
      case FilingType.CORRECTION: {
        authorized = isAuthorized(AuthorizedAction.CORRECTION_FILING)
        break
      }
      case FilingType.COURT_ORDER: {
        authorized = isAuthorized(AuthorizedAction.COURT_ORDER_FILING)
        break
      }
      case FilingType.DISSOLUTION: {
        if (filingSubType === FilingSubType.DISSOLUTION_ADMINISTRATIVE) {
          authorized = isAuthorized(AuthorizedAction.ADMIN_DISSOLUTION_FILING)
          break
        }
        if (filingSubType === FilingSubType.DISSOLUTION_DELAY) {
          authorized = isAuthorized(AuthorizedAction.DISSOLUTION_DELAY_FILING)
          break
        }
        if (filingSubType === FilingSubType.DISSOLUTION_VOLUNTARY) {
          authorized = isAuthorized(AuthorizedAction.VOLUNTARY_DISSOLUTION_FILING)
          break
        }
        break
      }
      // case FilingType.DISSOLVED:                      not used here yet
      // case FilingType.INCORPORATION_APPLICATION:      not used here yet
      case FilingType.NOTICE_OF_WITHDRAWAL: {
        authorized = isAuthorized(AuthorizedAction.NOTICE_WITHDRAWAL_FILING)
        break
      }
      case FilingType.PUT_BACK_ON: {
        authorized = isAuthorized(AuthorizedAction.STAFF_FILINGS)
        break
      }
      // case FilingType.PUT_BACK_OFF:    not used here yet
      // case FilingType.REGISTRATION:    not used here yet
      case FilingType.REGISTRARS_NOTATION: {
        authorized = isAuthorized(AuthorizedAction.STAFF_FILINGS)
        break
      }
      case FilingType.REGISTRARS_ORDER: {
        authorized = isAuthorized(AuthorizedAction.STAFF_FILINGS)
        break
      }
      case FilingType.RESTORATION: {
        // this covers the sub-types:
        // LIMITED_RESTORATION_TO_FULL, LIMITED_RESTORATION_EXTENSION, FULL_RESTORATION, LIMITED_RESTORATION
        authorized = isAuthorized(AuthorizedAction.RESTORATION_REINSTATEMENT_FILING)
        break
      }
      case FilingType.SPECIAL_RESOLUTION: {
        authorized = isAuthorized(AuthorizedAction.SPECIAL_RESOLUTION_FILING)
        break
      }
      case FilingType.TRANSITION: {
        authorized = isAuthorized(AuthorizedAction.TRANSITION_FILING)
        break
      }
      default:
        break
    }

    if (!authorized) {
      /* eslint-disable-next-line max-len */
      logDevOnly(`Permissions missing for filingType: ${filingType}${filingSubType ? `, subType: ${filingSubType}` : ''}.`)
    }

    return authorized
  }

  function $reset() {
    authorizedActions.value = []
  }

  return {
    authorizedActions,
    init,
    isAuthorized,
    isAuthorizedByFilingType,
    $reset
  }
})
