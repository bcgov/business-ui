/**
 * Row keys mirroring legal-api's draft_rebase entity keys, so report entries, draft rows and table rows pair up.
 * - parties: id, then 'LAST, FIRST' / org name
 * - offices: type
 * - share classes: name
 * - name translations: id, then name
 * - resolutions: date + type
 */
type JsonRow = Record<string, unknown>

export function asJsonRow(value: unknown): JsonRow {
  return value !== null && typeof value === 'object' ? value as JsonRow : {}
}

/** Trims and collapses empties so '' and a missing key compare equal (legal-api _norm_value) */
function normValue(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }
  const text = String(value).trim()
  return text === '' ? undefined : text
}

/** Drops the ' #<id>' suffix the report adds when two rows share a name */
export function stripEntityKeySuffix(entityKey: string): string {
  return entityKey.replace(/ #\d+$/, '')
}

/** The party id - entity.identifier in the relationships shape */
export function getPartyRowId(row: JsonRow): string | undefined {
  return normValue(asJsonRow(row.entity).identifier)
}

/** The party natural key: org name, or 'LAST, FIRST' (upper cased) */
export function getPartyNameKey(row: JsonRow): string | undefined {
  const entity = asJsonRow(row.entity)
  const orgName = normValue(entity.businessName)
  if (orgName) {
    return orgName.toUpperCase()
  }
  const lastName = normValue(entity.familyName)
  const firstName = normValue(entity.givenName)
  if (!lastName && !firstName) {
    return undefined
  }
  return [lastName, firstName].filter(Boolean).map(part => part!.toUpperCase()).join(', ')
}

/** Share class/series names compare without the 'Shares' suffix the table rows strip */
export function getShareClassKey(name: unknown): string | undefined {
  const text = normValue(name)?.replace(/\s*\b(shares|share|value)\b/gi, '').trim().toUpperCase()
  return text || undefined
}

/** 'YYYY-MM-DD (TYPE)' - the report's resolution entity key */
export function getResolutionKey(date: unknown, type?: unknown): string | undefined {
  const dateText = normValue(date)
  if (!dateText) {
    return undefined
  }
  return `${dateText.slice(0, 10)} (${(normValue(type) ?? 'SPECIAL').toUpperCase()})`
}

/** Normalizes a report resolution entity key through getResolutionKey */
export function getResolutionEntityKey(entityKey: string): string {
  const match = /^(.+?) \((.+)\)$/.exec(entityKey)
  return (match ? getResolutionKey(match[1], match[2]) : getResolutionKey(entityKey)) ?? entityKey
}

/** Resolution date payload rows are objects or bare date strings */
export function getResolutionRowKey(row: unknown): string | undefined {
  if (typeof row === 'string') {
    return getResolutionKey(row)
  }
  const resolution = asJsonRow(row)
  return getResolutionKey(resolution.date, resolution.type)
}

export function getNameTranslationId(row: JsonRow): string | undefined {
  return normValue(row.id)
}

export function getNameTranslationNameKey(row: JsonRow): string | undefined {
  return normValue(row.name)?.toUpperCase()
}

/** The keys a table row (party / office / share class / name translation / resolution schema) answers to */
export function getStaffModifiedRowKeys(item: unknown, section: DraftChangesSection): string[] {
  const row = asJsonRow(item)
  const keys: Record<DraftChangesSection, Array<string | undefined>> = {
    parties: [normValue(row.id)],
    offices: [normValue(row.type)],
    shareClasses: [getShareClassKey(row.name)],
    nameTranslations: [getNameTranslationId(row), getNameTranslationNameKey(row)],
    resolutions: [getResolutionKey(row.date, row.type)],
    business: [normValue(row.field)]
  }
  return keys[section].filter((key): key is string => !!key)
}
