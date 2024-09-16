export interface InvitationMembership {
  membershipType: string
  org: Organization
}

export interface CreateInvitationRequestBody {
  recipientEmail: string
  sentDate: Date
  membership: InvitationMembership[]
}

export interface Invitation {
  id: number
  recipientEmail: string
  sentDate: Date
  membership: InvitationMembership[]
  expiresOn?: Date
  status: string
}

export interface Invitations {
  invitations: Invitation []
}

export interface CreateAffiliationInvitation {
  fromOrgId: number
  toOrgId?: string
  businessIdentifier: string
  toOrgUuid?: string
  type?: string
  additionalMessage?: string
}
