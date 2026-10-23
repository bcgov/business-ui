// eslint-disable-next-line
// https://bcgov-my.sharepoint.com/:x:/r/personal/thayne_werdal_gov_bc_ca/Documents/Attachments/Requirements%20-%20Filings%20vs%20Corrections%20Fields.xlsx?d=w8812eaf09920404ca709eb17fc5a78c1
import { toMerged } from 'es-toolkit'

const DEFAULT_YOUR_COMPANY_FIELD_OVERRIDES = {
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

const YOUR_COMPANY_FIELDS: Partial<Record<FilingType, ManageYourCompanyProps['fieldOverrides']>> = {
  [FilingType.INCORPORATION_APPLICATION]: {
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
  [FilingType.AMALGAMATION_OUT]: {
    outDate: 'default',
    nameNewJurisdiction: 'default',
    newJurisdiction: 'default'
  }
}

export function getYourCompanyFieldOverrides(filingType: FilingType) {
  const sections = YOUR_COMPANY_FIELDS[filingType] ?? {}
  return toMerged(DEFAULT_YOUR_COMPANY_FIELD_OVERRIDES, sections)
}
