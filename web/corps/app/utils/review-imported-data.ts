import { cloneDeep } from 'es-toolkit'

// the api flags a field as missing (NO_) or as on record but invalid (INVALID_) - both unlock it the same way
const CODE_KINDS = ['NO_', 'INVALID_']
const CODE_SUBJECTS = ['REGISTERED_OFFICE', 'RECORDS_OFFICE', 'DIRECTOR']
const ADDRESS_TYPES: Record<string, MissingAddressField['addressType']> = {
  MAILING_ADDRESS: 'mailingAddress',
  DELIVERY_ADDRESS: 'deliveryAddress'
}
const FIELD_NAMES: Record<string, MissingAddressFieldName> = {
  STREET: 'street',
  CITY: 'city',
  COUNTRY: 'country',
  POSTAL_CODE: 'postalCode',
  REGION: 'region'
}
const ADDRESS_FORM_FIELDS: AddressFormFieldName[] = [
  'country', 'street', 'streetAdditional', 'city', 'region', 'postalCode', 'locationDescription'
]

/**
 * Parses a corps missing / invalid info warning code into the address part it names, eg
 * `NO_DIRECTOR_MAILING_ADDRESS_POSTAL_CODE` -> mailing address, postal code,
 * `INVALID_REGISTERED_OFFICE_DELIVERY_ADDRESS_REGION` -> delivery address, region and
 * `NO_RECORDS_OFFICE` -> nothing (the office itself is missing).
 */
export function parseMissingInfoCode(code: string): MissingAddressField {
  const kind = CODE_KINDS.find(k => code.startsWith(k))
  const subject = kind && CODE_SUBJECTS.find(s => code.slice(kind.length).startsWith(s))
  if (!kind || !subject) {
    return {}
  }
  const rest = code.slice(kind.length + subject.length).replace(/^_/, '')
  const addressKey = Object.keys(ADDRESS_TYPES).find(a => rest.startsWith(a))
  if (!addressKey) {
    return {}
  }
  const fieldKey = rest.slice(addressKey.length).replace(/^_/, '')
  return {
    addressType: ADDRESS_TYPES[addressKey],
    ...(FIELD_NAMES[fieldKey] ? { field: FIELD_NAMES[fieldKey] } : {})
  }
}

/**
 * Groups the MISSING_REQUIRED_BUSINESS_INFO warnings by office / director.
 * The api stamps `data.officeType` on office codes and `data.partyId` on director codes (lear #4867).
 */
export function getMissingInfoSummary(warnings: BusinessWarning[] = []): MissingInfoSummary {
  const summary: MissingInfoSummary = { offices: {}, directors: {} }
  for (const warning of warnings) {
    if (warning.warningType !== ApiWarningType.MISSING_REQUIRED_BUSINESS_INFO) {
      continue
    }
    const field = parseMissingInfoCode(warning.code)
    if (warning.data?.officeType) {
      (summary.offices[warning.data.officeType] ??= []).push(field)
    } else if (warning.data?.partyId !== undefined) {
      (summary.directors[String(warning.data.partyId)] ??= []).push(field)
    }
  }
  return summary
}

/**
 * Adds an empty, unsaved row for each office type the business has no record of so the user
 * can enter it - the api flags these corps with NO_REGISTERED_OFFICE / NO_RECORDS_OFFICE.
 * NB: `old` is left undefined so the first edit marks the row ADDED (see useManageOffices.editSubject).
 */
export function seedMissingOffices(
  offices: TableBusinessState<OfficesSchema>[],
  officeTypes: OfficeType[]
): TableBusinessState<OfficesSchema>[] {
  const seeded = cloneDeep(offices)
  for (const type of officeTypes) {
    if (!seeded.some(o => o.new.type === type)) {
      seeded.push({ old: undefined, new: createDefaultOffice({ type }) })
    }
  }
  return seeded
}

/**
 * The address inputs to lock for an office / director so only the fields the api flagged can be edited.
 * A record or address with no flags is locked entirely. An office flagged as missing altogether (no address
 * type) or an address flagged as a whole (no field) stays fully editable. A flagged country also unlocks the
 * region and postal code, since what is valid for those depends on the country entered.
 * NB: legal-api validate_office_address_changes / validate_relationship_address_changes enforce the same rules.
 */
export function getLockedAddressFields(missing: MissingAddressField[] = []): AddressFormProps['disabledFields'] {
  if (missing.some(m => !m.addressType)) {
    return undefined
  }
  const locked: NonNullable<AddressFormProps['disabledFields']> = {}
  for (const addressType of ['mailingAddress', 'deliveryAddress'] as const) {
    const flags = missing.filter(m => m.addressType === addressType)
    if (flags.some(m => !m.field)) {
      continue
    }
    const editable = new Set<AddressFormFieldName>(flags.map(m => m.field!))
    if (editable.has('country')) {
      editable.add('region').add('postalCode')
    }
    locked[addressType] = ADDRESS_FORM_FIELDS.filter(f => !editable.has(f))
  }
  return locked
}

/**
 * This filing has no 'same as mailing' checkbox, so every row keeps its own delivery address. Applied to both
 * sides of the row when the filing loads so opening an address form never registers as a change.
 */
export function withSeparateDeliveryAddress<T extends { address: { sameAs: boolean } }>(
  rows: TableBusinessState<T>[]
): TableBusinessState<T>[] {
  const rowsCopy = cloneDeep(rows)
  for (const row of rowsCopy) {
    row.new.address.sameAs = false
    if (row.old) {
      row.old.address.sameAs = false
    }
  }
  return rowsCopy
}
