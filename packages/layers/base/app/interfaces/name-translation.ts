/**
 * A name translation's object from the API. See:
 * https://github.com/bcgov/business-schemas/blob/master/src/registry_schemas/schemas/name_translations.json
 */
export interface NameTranslation {
  id?: string
  name: string
}

/** A business alias entry returned by the /aliases endpoint. */
export interface Alias {
  id: string
  name: string
  type: string // e.g. 'TRANSLATION', 'DBA'
}
