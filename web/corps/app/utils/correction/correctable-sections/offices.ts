// eslint-disable-next-line
// https://bcgov-my.sharepoint.com/:x:/r/personal/thayne_werdal_gov_bc_ca/Documents/Attachments/Requirements%20-%20Filings%20vs%20Corrections%20Fields.xlsx?d=w8812eaf09920404ca709eb17fc5a78c1
import { toMerged } from 'es-toolkit'

// NB: This util is only used to initialize the correct offices in the corrections store.
// The config is not currently passed down to the ManageOffices component.
// This allows formatOfficesSection and formatOfficesApi to format the correct data per filing type.
// Update as necessary for new requirements (e.g., if props need to be passed down to ManageOffices).

type ConfigVariant = boolean

type OfficeConfig = Partial<Record<OfficeType, ConfigVariant>>

type FilingSubTypeOfficeConfig = Partial<Record<FilingSubType, OfficeConfig>>

type FilingTypeOfficeConfig = OfficeConfig | FilingSubTypeOfficeConfig

type OfficesConfig = Partial<Record<FilingType, FilingTypeOfficeConfig>>

const DEFAULT_OFFICES_CONFIG: OfficeConfig = {
  registeredOffice: false,
  recordsOffice: false,
  liquidationRecordsOffice: false

  // FUTURE ?
  // custodialOffice?: ApiBaseAddressObj
  // businessOffice?: ApiBaseAddressObj
} as const

const OFFICES_CONFIG: OfficesConfig = {
  [FilingType.INCORPORATION_APPLICATION]: {
    registeredOffice: true,
    recordsOffice: true
  },
  [FilingType.CHANGE_OF_ADDRESS]: {
    registeredOffice: true,
    recordsOffice: true
  },
  [FilingType.AMALGAMATION_APPLICATION]: { // covers regular, short form horizontal and short form vertical
    registeredOffice: true,
    recordsOffice: true
  },
  [FilingType.CONTINUATION_IN]: {
    registeredOffice: true,
    recordsOffice: true
  },
  [FilingType.CHANGE_OF_LIQUIDATORS]: {
    [FilingSubType.APPOINT_LIQUIDATOR]: { // A liquidationRecordsOffice is allowed to be submitted with the Appoint Liquidator filing if one does not yet exist
      liquidationRecordsOffice: true
    },
    [FilingSubType.INTENT_TO_LIQUIDATE]: {
      liquidationRecordsOffice: true
    },
    [FilingSubType.CHANGE_ADDRESS_LIQUIDATOR]: {
      liquidationRecordsOffice: true
    }
  }
}

const FILING_SUB_TYPES = new Set<string>(Object.values(FilingSubType))

export function getOfficesConfig(
  filingType: FilingType,
  filingSubType?: FilingSubType
): OfficeConfig {
  const entry = OFFICES_CONFIG[filingType]

  if (!entry) {
    return DEFAULT_OFFICES_CONFIG
  }

  const hasSubTypeConfig = Object.keys(entry).some(key => FILING_SUB_TYPES.has(key))

  const config = hasSubTypeConfig
    ? entry[filingSubType as keyof typeof entry] ?? {}
    : entry

  return toMerged(DEFAULT_OFFICES_CONFIG, config)
}

const OFFICE_TYPES = Object.values(OfficeType)

export function getCorrectableOfficeTypes(filingType: FilingType, filingSubType?: FilingSubType): OfficeType[] {
  const config = getOfficesConfig(filingType, filingSubType)

  return OFFICE_TYPES.filter(type => config[type] === true)
}
