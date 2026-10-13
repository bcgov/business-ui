/** Per-legal-type director change behaviour. */
export interface DirectorsConfig {
  paidFeeCode: string
  freeFeeCode: string
  /** corps confirm an authorization checkbox; coops certify with a legal name */
  certify: 'authorization' | 'certified-by'
  /** lower bound source for the effective date (FUTURE: the date picker) */
  minDateSource: 'lastDirectorChange' | 'latestOfCodAr'
  /** statutory soft warnings for the directors table (FUTURE: the directors table) */
  warnings: DirectorWarningConfig
  /** the corps-only `enable-backdated-cod` flag relaxes the min date to the founding date */
  allowBackdatingFlag: boolean
}

/** Defaults to the corps configuration. */
export function getDirectorsConfig(legalType?: string): DirectorsConfig {
  if (legalType === 'CP') {
    return {
      paidFeeCode: 'OTCDR',
      freeFeeCode: 'OTFDR',
      certify: 'certified-by',
      minDateSource: 'latestOfCodAr',
      warnings: { minCount: 3, bcResidency: true, canadianResidency: true },
      allowBackdatingFlag: false
    }
  }

  return {
    paidFeeCode: 'BCCDR',
    freeFeeCode: 'BCFDR',
    certify: 'authorization',
    minDateSource: 'lastDirectorChange',
    warnings: { minCount: ['CC', 'CCC'].includes(legalType ?? '') ? 3 : 1 },
    allowBackdatingFlag: true
  }
}
