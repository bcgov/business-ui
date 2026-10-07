// NB: direct imports needed so that this util can be used in e2e tests
import { ActionType } from '#business/app/enums/action-type'
import { ManageAllowedAction } from '#business/app/enums/manage-allowed-action'
import { RoleClass } from '#business/app/enums/role-class'
import { RoleTypeUi } from '#business/app/enums/role-type'
import { formatRelationshipApi } from '#business/app/utils/format-party'

/**
 * Structural ManageParties props shared by director-change filings.
 */
export function getDirectorChangeManagePartiesProps() {
  return {
    roleType: RoleTypeUi.DIRECTOR,
    columnsToDisplay: ['name', 'mailing', 'delivery', 'effectiveDates', 'actions'] as TablePartyColumnName[],
    allowedActions: [
      ManageAllowedAction.ADD,
      ManageAllowedAction.REMOVE,
      ManageAllowedAction.NAME_CHANGE,
      ManageAllowedAction.ADDRESS_CHANGE
    ],
    partyFormProps: {
      partyNameProps: {
        allowBusinessName: false,
        requireNameChangeConfirmation: true
      },
      partyRoleProps: {
        allowedRoles: [RoleTypeUi.DIRECTOR],
        roleClass: RoleClass.DIRECTOR
      }
    }
  }
}

/**
 * Builds the changeOfDirectors `relationships` payload from the ManageParties table state.
 *
 * Only changed rows are submitted.
 *
 * @param options.removedCessationDate overrides the cessation date stamped on REMOVED
 * directors' roles (defaults to today)
 */
export function buildChangeOfDirectorsRelationships(
  tableState: TableBusinessState<PartySchema>[],
  options?: { removedCessationDate?: string }
): BusinessRelationship[] {
  return tableState
    .filter(row => row.new.actions.length > 0)
    .map((row) => {
      const relationship = formatRelationshipApi(row.new)
      if (options?.removedCessationDate && row.new.actions.includes(ActionType.REMOVED)) {
        relationship.roles = relationship.roles.map(role => ({
          ...role,
          cessationDate: options.removedCessationDate
        }))
      }
      return relationship
    })
}

export interface DirectorWarningConfig {
  /** minimum number of active directors required by the business's governing legislation */
  minCount: number
  /** warn when no director is a BC resident (coops) */
  bcResidency?: boolean
  /** warn when the majority of directors are not Canadian residents (coops) */
  canadianResidency?: boolean
}

export interface DirectorWarning {
  type: 'minCount' | 'bcResidency' | 'canadianResidency'
  message: string
}

function directorRegion(director: PartySchema): string {
  return director.address.deliveryAddress?.region || director.address.mailingAddress?.region || ''
}

function directorCountry(director: PartySchema): string {
  return director.address.deliveryAddress?.country || director.address.mailingAddress?.country || ''
}

/**
 * Returns the first applicable statutory director warning for the current table state, or undefined.
 */
export function getDirectorWarning(
  tableState: TableBusinessState<PartySchema>[],
  config: DirectorWarningConfig
): DirectorWarning | undefined {
  const t = useNuxtApp().$i18n.t

  const activeDirectors = tableState
    .filter(row => !row.new.actions.includes(ActionType.REMOVED))
    .map(row => row.new)

  if (activeDirectors.length < config.minCount) {
    return { type: 'minCount', message: t('text.directorWarningMinCount', config.minCount) }
  }

  if (config.bcResidency && activeDirectors.every(d => directorRegion(d) !== 'BC')) {
    return { type: 'bcResidency', message: t('text.directorWarningBcResidency') }
  }

  if (config.canadianResidency) {
    const notCanadian = activeDirectors.filter(d => directorCountry(d) !== 'CA').length
    if (notCanadian / activeDirectors.length > 0.5) {
      return { type: 'canadianResidency', message: t('text.directorWarningCanadianResidency') }
    }
  }

  return undefined
}

/**
 * Keeps the fee widget in sync with the paid/free director-change fee split.
 *
 * @param options.feeOptions passed through to addReplaceFee (e.g. priority/waived state)
 */
export async function syncDirectorChangeFee(
  tableState: TableBusinessState<PartySchema>[],
  options: {
    paidCode: string
    freeCode: string
    feeOptions?: { futureEffective?: boolean, priority?: boolean, waived?: boolean }
  }
): Promise<void> {
  const feeStore = useConnectFeeStore()

  const isPaidChange = tableState.some(row =>
    row.new.actions.includes(ActionType.ADDED) || row.new.actions.includes(ActionType.REMOVED)
  )
  const activeCode = isPaidChange ? options.paidCode : options.freeCode
  const inactiveCode = isPaidChange ? options.freeCode : options.paidCode

  if (!feeStore.feesCached[activeCode]) {
    const entityType = useBusinessStore().business?.legalType ?? ''
    const label = feeStore.feesCached[inactiveCode]?.label ?? feeStore.placeholderFeeItem.label ?? ''
    await feeStore.initFees(
      [{ code: activeCode, entityType, label }],
      { label: feeStore.placeholderFeeItem.label ?? '' }
    )
  }

  feeStore.removeFee(inactiveCode)
  feeStore.addReplaceFee(activeCode, options.feeOptions)
}
