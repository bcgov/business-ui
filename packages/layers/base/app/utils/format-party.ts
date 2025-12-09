import { isEqual } from 'es-toolkit'
import { formatAddressApi } from './format-address'

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
    roles,
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
    roles: party.roles ?? [],
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
    roles: party.roles || [],
    actions: party.actions
  }
}
