export interface BusinessEntity {
  alternateName: string
  businessName: string
  businessIdentifier: string
  email: string
  familyName: string
  givenName: string
  identifier: string
  middleInitial: string
}

export interface BusinessRelationship {
  deliveryAddress: ApiAddress
  mailingAddress?: ApiAddress
  roles: Role[]
  entity: Partial<BusinessEntity>
  actions?: ActionType[]
}
