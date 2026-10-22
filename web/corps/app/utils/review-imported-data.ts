import { cloneDeep } from 'es-toolkit'

const OFFICE_CODE_PREFIXES: Record<string, OfficeType> = {
  NO_REGISTERED_OFFICE: OfficeType.REGISTERED,
  NO_RECORDS_OFFICE: OfficeType.RECORDS
}
const DIRECTOR_CODE_PREFIX = 'NO_DIRECTOR'
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

/**
 * Parses a corps missing info warning code into the address part it names, eg
 * `NO_DIRECTOR_MAILING_ADDRESS_POSTAL_CODE` -> mailing address, postal code and
 * `NO_RECORDS_OFFICE` -> nothing (the office itself is missing).
 */
export function parseMissingInfoCode(code: string): MissingAddressField {
  const prefix = Object.keys(OFFICE_CODE_PREFIXES).find(p => code.startsWith(p))
    ?? (code.startsWith(DIRECTOR_CODE_PREFIX) ? DIRECTOR_CODE_PREFIX : undefined)
  if (!prefix) {
    return {}
  }
  const rest = code.slice(prefix.length).replace(/^_/, '')
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

type Translate = (key: string, params?: Record<string, unknown>) => string

/** One readable line per missing field, eg "Mailing Address is missing the postal code". */
export function describeMissingFields(fields: MissingAddressField[], t: Translate): string[] {
  return fields.map((f) => {
    if (!f.addressType) {
      return t('text.missingInfo.officeMissing')
    }
    const address = t(`label.${f.addressType}`)
    return f.field
      ? t('text.missingInfo.fieldMissing', { address, field: t(`text.missingInfo.field.${f.field}`) })
      : t('text.missingInfo.addressMissing', { address })
  })
}

/** The office bullets for the missing info alert, eg "Registered Office: Delivery Address is missing the city". */
export function describeMissingOffices(summary: MissingInfoSummary, t: Translate): string[] {
  return (Object.keys(summary.offices) as OfficeType[]).flatMap(type =>
    describeMissingFields(summary.offices[type] ?? [], t).map(line => `${t(`officeType.${type}`)}: ${line}`)
  )
}

/** The director bullets for the missing info alert, named from the directors table by party id. */
export function describeMissingDirectors(
  summary: MissingInfoSummary,
  directors: TableBusinessState<PartySchema>[],
  t: Translate
): string[] {
  return Object.keys(summary.directors).flatMap((partyId) => {
    const party = directors.find(d => d.new.id === partyId)?.new
    const name = party
      ? [party.name.firstName, party.name.middleName, party.name.lastName].filter(Boolean).join(' ')
      : t('label.director')
    return describeMissingFields(summary.directors[partyId] ?? [], t).map(line => `${name}: ${line}`)
  })
}
