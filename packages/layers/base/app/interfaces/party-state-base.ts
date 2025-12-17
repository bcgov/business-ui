// TODO: solidify type definition and maybe rename file
// this type is required for the getPartyTableColumns util and the .playground/examples/components/Table/Business
export type PartyStateBase = {
  actions: ActionType[]
  address: AddressSchema
  name: PartyNameSchema
  roles: Role[]
  id?: string
}
