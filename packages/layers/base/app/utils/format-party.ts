import { isEqual } from 'es-toolkit'
import { formatAddressApi } from './format-address'

const ROLE_RELATIONSHIPS: [RoleTypeUi, RoleType][] = [
  [RoleTypeUi.APPLICANT, RoleType.APPLICANT],
  [RoleTypeUi.COMPLETING_PARTY, RoleType.COMPLETING_PARTY],
  [RoleTypeUi.CUSTODIAN, RoleType.CUSTODIAN],
  [RoleTypeUi.DIRECTOR, RoleType.DIRECTOR],
  [RoleTypeUi.INCORPORATOR, RoleType.INCORPORATOR],
  [RoleTypeUi.LIQUIDATOR, RoleType.LIQUIDATOR],
  [RoleTypeUi.OFFICER, RoleType.OFFICER],
  [RoleTypeUi.PARTNER, RoleType.PARTNER],
  [RoleTypeUi.PROPRIETOR, RoleType.PROPRIETOR],
  [RoleTypeUi.RECEIVER, RoleType.RECEIVER],
  // Officer class
  [RoleTypeUi.CEO, RoleType.CEO],
  [RoleTypeUi.CFO, RoleType.CFO],
  [RoleTypeUi.PRESIDENT, RoleType.PRESIDENT],
  [RoleTypeUi.VICE_PRESIDENT, RoleType.VICE_PRESIDENT],
  [RoleTypeUi.CHAIR, RoleType.CHAIR],
  [RoleTypeUi.TREASURER, RoleType.TREASURER],
  [RoleTypeUi.SECRETARY, RoleType.SECRETARY],
  [RoleTypeUi.ASSISTANT_SECRETARY, RoleType.ASSISTANT_SECRETARY],
  [RoleTypeUi.OTHER, RoleType.OTHER]
]

export const UI_ROLE_TO_API_ROLE_MAP = Object.fromEntries(ROLE_RELATIONSHIPS)

export const API_ROLE_TO_UI_ROLE_MAP = Object.fromEntries(
  ROLE_RELATIONSHIPS.map(([uiValue, apiValue]) => [apiValue, uiValue])
)

function formatRelationshipRolesUi(roles: Role[]): PartyRoleSchema {
  return roles.map((role) => {
    return {
      ...role,
      roleType: role.roleType
        ? API_ROLE_TO_UI_ROLE_MAP[role.roleType]
        : undefined
    }
  })
}

function formatRelationshipRolesApi(roles: PartyRoleSchema, isRemoved = false): Role[] {
  return roles.map((role) => {
    return {
      ...role,
      cessationDate: isRemoved && !role.cessationDate ? getToday() : role.cessationDate,
      roleType: role.roleType
        ? UI_ROLE_TO_API_ROLE_MAP[role.roleType]
        : undefined
    }
  })
}

export function formatPartyUi(party: OrgPerson, roleType?: RoleType): PartySchema {
  const mailingAddress = formatAddressUi(party.mailingAddress)
  const deliveryAddress = formatAddressUi(party.deliveryAddress)
  const roles = party.roles?.filter(role => roleType ? role.roleType === roleType : true) || []
  const id = party.officer.id ? String(party.officer.id) : ''
  return {
    id,
    name: {
      firstName: party.officer.firstName ?? '',
      middleName: party.officer.middleInitial ?? '',
      lastName: party.officer.lastName ?? '',
      businessName: party.officer.organizationName ?? '',
      partyType: party.officer.partyType || PartyType.PERSON
    },
    address: {
      mailingAddress,
      deliveryAddress,
      sameAs: isEqual(mailingAddress, deliveryAddress)
    },
    roles: roles ? formatRelationshipRolesUi(roles) : [],
    actions: []
  }
}

export function formatRelationshipUi(party: BusinessRelationship): PartySchema {
  const mailingAddress = formatAddressUi(party.mailingAddress)
  const deliveryAddress = formatAddressUi(party.deliveryAddress)
  const partyType = party.entity.businessName ? PartyType.ORGANIZATION : PartyType.PERSON
  return {
    id: party.entity.identifier ?? '',
    name: {
      firstName: party.entity.givenName ?? '',
      middleName: party.entity.middleInitial ?? '',
      lastName: party.entity.familyName ?? '',
      businessName: party.entity.businessName ?? '',
      partyType
    },
    address: {
      mailingAddress,
      deliveryAddress,
      sameAs: isEqual(mailingAddress, deliveryAddress)
    },
    roles: party.roles ? formatRelationshipRolesUi(party.roles) : [],
    actions: party.actions ?? []
  }
}

export function formatRelationshipApi(party: PartySchema): BusinessRelationship {
  const mailingAddress = formatAddressApi(party.address.mailingAddress as ConnectAddress)
  const deliveryAddress = formatAddressApi(party.address.deliveryAddress as ConnectAddress)
  return {
    entity: {
      identifier: party.id,
      givenName: party.name.firstName ?? '',
      middleInitial: party.name.middleName ?? '',
      familyName: party.name.lastName ?? '',
      businessName: party.name.businessName ?? ''
    },
    mailingAddress,
    deliveryAddress,
    roles: formatRelationshipRolesApi(party.roles, party.actions.includes(ActionType.REMOVED)),
    actions: party.actions
  }
}
