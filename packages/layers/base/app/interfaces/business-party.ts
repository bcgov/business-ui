export interface BusinessParty extends Pick<OrgPerson,
  'officer' | 'roles' | 'actions'
> {
  deliveryAddress: UiAddress
  mailingAddress: UiAddress
}
