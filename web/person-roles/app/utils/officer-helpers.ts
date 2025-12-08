import { isEqual } from 'es-toolkit'

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

export function formatOfficerPayload(newState: OfficerTableState[]): ChangeOfOfficersPayload {
  const addressSchema = getRequiredAddressSchema()

  const changedOfficers = newState.filter((s) => {
    if (!s.old) {
      return true
    }

    if (s.new && s.old) {
      return !isEqual(s.new, s.old)
    }

    return true
  })

  const data = changedOfficers.map((s) => {
    const officer = s.new

    const roles = officer.roles.map((r) => {
      return {
        ...r,
        roleType: UI_ROLE_TO_API_ROLE_MAP[r.roleType]
      }
    })

    const o = {
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
      o.mailingAddress = {
        streetAddress: officer.mailingAddress.street,
        streetAddressAdditional: officer.mailingAddress.streetAdditional,
        addressCity: officer.mailingAddress.city,
        addressCountry: officer.mailingAddress.country,
        addressRegion: officer.mailingAddress.region,
        postalCode: officer.mailingAddress.postalCode,
        deliveryInstructions: officer.mailingAddress.locationDescription
      }
    }

    return o
  })

  return {
    changeOfOfficers: {
      relationships: data
    }
  } as ChangeOfOfficersPayload // TODO: fix roles return type
}

/**
*  Returns an empty officer object
*  @returns Officer
*/
export function getNewOfficer(): Officer {
  return {
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    roles: [],
    mailingAddress: {
      street: '',
      streetAdditional: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'CA',
      locationDescription: ''
    },
    deliveryAddress: {
      street: '',
      streetAdditional: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'CA',
      locationDescription: ''
    },
    sameAsDelivery: false,
    hasPreferredName: false
  }
}

/**
*  Returns an array of differences in officer state by section (name, roles, address)
*  @param {Officer} oldVal Previous Officer State
*  @param {Officer} newVal New Officer State
*  @returns {OfficerTableEditSection[]} ex: ['roles', 'address']
*/
export function getOfficerStateDiff(oldVal: Officer, newVal: Officer): OfficerTableEditSection[] {
  const oldMap: Record<OfficerTableEditSection, Partial<Officer>> = {
    name: {
      firstName: oldVal.firstName,
      middleName: oldVal.middleName,
      lastName: oldVal.lastName,
      preferredName: oldVal.preferredName,
      hasPreferredName: oldVal.hasPreferredName
    },
    roles: {
      roles: oldVal.roles
    },
    address: {
      mailingAddress: oldVal.mailingAddress,
      deliveryAddress: oldVal.deliveryAddress,
      sameAsDelivery: oldVal.sameAsDelivery
    }
  }
  const newMap: Record<OfficerTableEditSection, Partial<Officer>> = {
    name: {
      firstName: newVal.firstName,
      middleName: newVal.middleName,
      lastName: newVal.lastName,
      preferredName: newVal.preferredName,
      hasPreferredName: newVal.hasPreferredName
    },
    roles: {
      roles: newVal.roles
    },
    address: {
      mailingAddress: newVal.mailingAddress,
      deliveryAddress: newVal.deliveryAddress,
      sameAsDelivery: newVal.sameAsDelivery
    }
  }

  const changedSections: OfficerTableEditSection[] = []

  for (const section in oldMap) {
    const s = section as OfficerTableEditSection
    if (!isEqual(oldMap[s], newMap[s])) {
      changedSections.push(s)
    }
  }

  return changedSections
}
