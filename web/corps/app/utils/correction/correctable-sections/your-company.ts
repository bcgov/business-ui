// eslint-disable-next-line
// https://bcgov-my.sharepoint.com/:x:/r/personal/thayne_werdal_gov_bc_ca/Documents/Attachments/Requirements%20-%20Filings%20vs%20Corrections%20Fields.xlsx?d=w8812eaf09920404ca709eb17fc5a78c1
import { toMerged } from 'es-toolkit'

type ConfigVariant = 'default' | 'hide' | 'readonly'

type YourCompanyField = keyof ManageYourCompanyProps['fieldOverrides']

type YourCompanyConfig = Partial<Record<YourCompanyField, ConfigVariant>>

type FilingSubTypeYourCompanyConfig = Partial<Record<FilingSubType, YourCompanyConfig>>

type FilingTypeYourCompanyConfig = YourCompanyConfig | FilingSubTypeYourCompanyConfig

type YourCompanyFieldsConfig = Partial<Record<FilingType, FilingTypeYourCompanyConfig>>

const DEFAULT_YOUR_COMPANY_FIELD_OVERRIDES: Record<YourCompanyField, ConfigVariant> = {
  nameNewJurisdiction: 'hide',
  namePreviousJurisdiction: 'hide',
  numberExpro: 'hide',
  numberPreviousJurisdiction: 'hide',
  outDate: 'hide',
  jurisdiction: 'readonly',
  previousJurisdiction: 'hide',
  newJurisdiction: 'hide',
  nameRequest: 'readonly',
  legalType: 'readonly',
  nameTranslations: 'hide',
  foundingDate: 'readonly',
  contactInfo: 'readonly'
} as const

const YOUR_COMPANY_FIELDS: YourCompanyFieldsConfig = {
  [FilingType.INCORPORATION_APPLICATION]: {
    nameRequest: 'default',
    nameTranslations: 'default'
  },
  [FilingType.CONTINUATION_IN]: {
    nameTranslations: 'default',
    numberExpro: 'default',
    numberPreviousJurisdiction: 'default',
    namePreviousJurisdiction: 'default',
    previousJurisdiction: 'default'
  },
  [FilingType.CONTINUATION_OUT]: {
    outDate: 'default',
    nameNewJurisdiction: 'default',
    newJurisdiction: 'default'
  },
  [FilingType.AMALGAMATION_APPLICATION]: {
    [FilingSubType.AMALGAMATION_REGULAR]: {
      nameRequest: 'default'
    }
  },
  [FilingType.AMALGAMATION_OUT]: {
    outDate: 'default',
    nameNewJurisdiction: 'default',
    newJurisdiction: 'default'
  }
}

const FILING_SUB_TYPES = new Set<string>(Object.values(FilingSubType))

export function getYourCompanyFieldOverrides(
  filingType: FilingType,
  filingSubType?: FilingSubType
) {
  const entry = YOUR_COMPANY_FIELDS[filingType]

  if (!entry) {
    return DEFAULT_YOUR_COMPANY_FIELD_OVERRIDES
  }

  const hasSubTypeConfig = Object.keys(entry).some(key => FILING_SUB_TYPES.has(key))

  const config = hasSubTypeConfig
    ? entry[filingSubType as keyof typeof entry] ?? {}
    : entry

  return toMerged(DEFAULT_YOUR_COMPANY_FIELD_OVERRIDES, config)
}
