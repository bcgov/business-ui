const ROLE_RELATIONSHIPS: [OfficerRole, string][] = [
  [OfficerRole.CEO, 'CEO'],
  [OfficerRole.CFO, 'CFO'],
  [OfficerRole.PRESIDENT, 'President'],
  [OfficerRole.VP, 'Vice President'],
  [OfficerRole.CHAIR, 'Chair'],
  [OfficerRole.TREASURER, 'Treasurer'],
  [OfficerRole.SECRETARY, 'Secretary'],
  [OfficerRole.ASSISTANT_SECRETARY, 'Assistant Secretary'],
  [OfficerRole.OTHER, 'Other']
]

export const UI_ROLE_TO_API_ROLE_MAP = Object.fromEntries(ROLE_RELATIONSHIPS)

export const API_ROLE_TO_UI_ROLE_MAP = Object.fromEntries(
  ROLE_RELATIONSHIPS.map(([uiValue, apiValue]) => [apiValue.toLowerCase(), uiValue])
)

export function formatOfficerPayload(newState: OfficerTableState[]): OfficerPayload {
  const addressSchema = getRequiredAddressSchema()

  const payload = newState.map((s) => {
    const officer = s.state.officer

    const roles = officer.roles.map((r) => {
      return {
        ...r,
        roleType: UI_ROLE_TO_API_ROLE_MAP[r.roleType]
      }
    })

    const p = {
      entity: {
        identifier: officer.id,
        givenName: officer.firstName,
        familyName: officer.lastName,
        alternateName: officer.preferredName,
        middleInitial: officer.middleName
      },
      deliveryAddress: {
        streetAddress: officer.deliveryAddress.street,
        streetAddressAdditional: officer.deliveryAddress.streetAdditional,
        addressCity: officer.deliveryAddress.city,
        addressCountry: officer.deliveryAddress.country,
        addressRegion: officer.deliveryAddress.region,
        postalCode: officer.deliveryAddress.postalCode,
        deliveryInstructions: officer.deliveryAddress.locationDescription
      },
      roles
    }

    // only submit mailing address if fully entered
    const isValidAddress = (addressSchema.safeParse(officer.mailingAddress)).success

    if (isValidAddress) {
      // @ts-expect-error - mailing address doesnt exist on entity // TODO: fix entity object type
      p.mailingAddress = {
        streetAddress: officer.mailingAddress.street,
        streetAddressAdditional: officer.mailingAddress.streetAdditional,
        addressCity: officer.mailingAddress.city,
        addressCountry: officer.mailingAddress.country,
        addressRegion: officer.mailingAddress.region,
        postalCode: officer.mailingAddress.postalCode,
        deliveryInstructions: officer.mailingAddress.locationDescription
      }
    }

    return p
  })

  return { relationships: payload } as OfficerPayload // TODO: fix roles return type
}
