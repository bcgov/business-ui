export const useBusinessPermissionsStore = defineStore('business-permissions', () => {
  const { getAuthorizedActions } = useBusinessApi()

  const authorizedActions = shallowRef<AuthorizedAction[]>([])

  async function init() {
    if (!authorizedActions.value.length) {
      authorizedActions.value = await getAuthorizedActions()
    }
  }

  function isAuthorized(action: AuthorizedAction) {
    return authorizedActions.value.includes(action)
  }

  function isAuthorizedByFilingType(filingType: FilingType, filingSubType?: FilingSubType) {
    switch (filingType) {
      case FilingType.ADMIN_FREEZE: {
        // this covers both Freeze and Unfreeze
        return isAuthorized(AuthorizedAction.STAFF_FILINGS)
      }
      case FilingType.ALTERATION: {
        return isAuthorized(AuthorizedAction.ALTERATION_FILING)
      }
      case FilingType.AGM_EXTENSION: {
        return isAuthorized(AuthorizedAction.AGM_EXTENSION_FILING)
      }
      case FilingType.AGM_LOCATION_CHANGE: {
        return isAuthorized(AuthorizedAction.AGM_CHG_LOCATION_FILING)
      }
      case FilingType.AMALGAMATION_APPLICATION: {
        return isAuthorized(AuthorizedAction.AMALGAMATION_FILING)
      }
      case FilingType.AMALGAMATION_OUT: {
        return isAuthorized(AuthorizedAction.STAFF_FILINGS)
      }
      case FilingType.ANNUAL_REPORT: {
        return isAuthorized(AuthorizedAction.ANNUAL_REPORT_FILING)
      }
      case FilingType.CHANGE_OF_ADDRESS: {
        return isAuthorized(AuthorizedAction.ADDRESS_CHANGE_FILING)
      }
      // case FilingType.CHANGE_OF_COMPANY_INFO:   not used here yet
      case FilingType.CHANGE_OF_DIRECTORS: {
        return isAuthorized(AuthorizedAction.DIRECTOR_CHANGE_FILING)
      }
      case FilingType.CHANGE_OF_OFFICERS: {
        return isAuthorized(AuthorizedAction.OFFICER_CHANGE_FILING)
      }
      case FilingType.CHANGE_OF_LIQUIDATORS, FilingType.CHANGE_OF_RECEIVERS: {
        return isAuthorized(AuthorizedAction.STAFF_FILINGS)
      }
      // case FilingType.CHANGE_OF_NAME:    not used here yet
      case FilingType.CHANGE_OF_REGISTRATION: {
        return isAuthorized(AuthorizedAction.FIRM_CHANGE_FILING)
      }
      case FilingType.CONSENT_AMALGAMATION_OUT: {
        return isAuthorized(AuthorizedAction.CONSENT_AMALGAMATION_OUT_FILING)
      }
      case FilingType.CONSENT_CONTINUATION_OUT: {
        return isAuthorized(AuthorizedAction.CONSENT_CONTINUATION_OUT_FILING)
      }
      // case FilingType.CONTINUATION_IN: not used here yet
      case FilingType.CONTINUATION_OUT: {
        return isAuthorized(AuthorizedAction.STAFF_FILINGS)
      }
      case FilingType.CONVERSION: {
        return isAuthorized(AuthorizedAction.FIRM_CONVERSION_FILING)
      }
      case FilingType.CORRECTION: {
        return isAuthorized(AuthorizedAction.CORRECTION_FILING)
      }
      case FilingType.COURT_ORDER: {
        return isAuthorized(AuthorizedAction.COURT_ORDER_FILING)
      }
      case FilingType.DISSOLUTION: {
        if (filingSubType === FilingSubType.DISSOLUTION_ADMINISTRATIVE) {
          return isAuthorized(AuthorizedAction.ADMIN_DISSOLUTION_FILING)
        }
        if (filingSubType === FilingSubType.DISSOLUTION_DELAY) {
          return isAuthorized(AuthorizedAction.DISSOLUTION_DELAY_FILING)
        }
        if (filingSubType === FilingSubType.DISSOLUTION_VOLUNTARY) {
          return isAuthorized(AuthorizedAction.VOLUNTARY_DISSOLUTION_FILING)
        }
        break
      }
      // case FilingType.DISSOLVED:                      not used here yet
      // case FilingType.INCORPORATION_APPLICATION:      not used here yet
      case FilingType.NOTICE_OF_WITHDRAWAL: {
        return isAuthorized(AuthorizedAction.NOTICE_WITHDRAWAL_FILING)
      }
      case FilingType.PUT_BACK_ON: {
        return isAuthorized(AuthorizedAction.STAFF_FILINGS)
      }
      // case FilingType.PUT_BACK_OFF:    not used here yet
      // case FilingType.REGISTRATION:    not used here yet
      case FilingType.REGISTRARS_NOTATION: {
        return isAuthorized(AuthorizedAction.STAFF_FILINGS)
      }
      case FilingType.REGISTRARS_ORDER: {
        return isAuthorized(AuthorizedAction.STAFF_FILINGS)
      }
      case FilingType.RESTORATION: {
        // this covers the sub-types:
        // LIMITED_RESTORATION_TO_FULL, LIMITED_RESTORATION_EXTENSION, FULL_RESTORATION, LIMITED_RESTORATION
        return isAuthorized(AuthorizedAction.RESTORATION_REINSTATEMENT_FILING)
      }
      case FilingType.SPECIAL_RESOLUTION: {
        return isAuthorized(AuthorizedAction.SPECIAL_RESOLUTION_FILING)
      }
      case FilingType.TRANSITION: {
        return isAuthorized(AuthorizedAction.TRANSITION_FILING)
      }
      default:
        return false // should never happen
    }
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
