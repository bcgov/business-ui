import { isEqual } from 'es-toolkit'
import { formatAddressApi } from './format-address'

export function formatPartyUi(party: OrgPerson, roleType?: RoleType): PartyStateBase {
  const mailingAddress = formatAddressUi(party.mailingAddress)
  const deliveryAddress = formatAddressUi(party.deliveryAddress)
  const roles = party.roles?.filter(role => roleType ? role.roleType === roleType : true) || []
  const id = party.officer.id ? String(party.officer.id) : undefined
  return {
    id,
    name: {
      firstName: party.officer.firstName ?? '',
      middleName: party.officer.middleInitial ?? '',
      lastName: party.officer.lastName ?? '',
      businessName: party.officer.organizationName,
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

export function formatPartyApi(party: PartyStateBase): OrgPerson {
  const mailingAddress = formatAddressApi(party.address.mailingAddress as ConnectAddress)
  const deliveryAddress = formatAddressApi(party.address.deliveryAddress as ConnectAddress)
  return {
    officer: {
      firstName: party.name.firstName ?? '',
      middleInitial: party.name.middleName ?? '',
      lastName: party.name.lastName ?? '',
      organizationName: party.name.businessName,
      partyType: party.name.partyType
    },
    mailingAddress,
    deliveryAddress,
    roles: party.roles || [],
    actions: party.actions
  }
}
