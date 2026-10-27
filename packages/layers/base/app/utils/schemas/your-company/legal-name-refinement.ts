// eslint-disable-next-line
// https://bcgov.sharepoint.com/:x:/r/teams/07717/_layouts/15/doc2.aspx?sourcedoc=%7B7b629286-81cb-475e-8e34-03647c1e23db%7D&action=edit&activeCell=%27Sheet1%27!B11&wdinitialsession=a1a7719b-d79c-b301-703f-52d188c70428&wdrldsc=3&wdrldc=1&wdrldr=Save%2CAccessTokenExpiredWarningUnauthenticated%2CRefr
import type { z } from 'zod'

const CORP_DESIGNATIONS = [
  'Corporation',
  'Incorporated',
  'Limited',
  'CORP',
  'INC',
  'LTD'
]

const NUMBERED_CORP_DESIGNATIONS = [
  'B.C. LTD.'
]

const ULC_DESIGNATIONS = [
  'Unlimited Liability Company',
  'ULC'
]

const NUMBERED_ULC_DESIGNATIONS = [
  'B.C. UNLIMITED LIABILITY COMPANY'
]

const NUMBERED_CC_DESIGNATIONS = [
  'B.C. COMMUNITY CONTRIBUTION COMPANY LTD.'
]

const COOP_DESIGNATIONS = [
  'CO-OPERATIVE',
  'COOPERATIVE',
  'CO-OP',
  'COOP'
]

/**
 * 'suffix' - Designation must be the suffix for the company name,
 * preceeded by a whitespace and text.
 * 'CompanyLTD' -> invalid
 * 'LTD' -> invalid
 * 'Company LTD' -> valid
 *
 * 'nonPrefix' - Designation must be either the suffix of the company name or included
 * but cannot be the prefix.
 * 'CompanyCOOP' -> invalid
 * 'COOP Company' -> invalid
 * 'COOP' -> invalid
 * 'Company COOP' -> valid
 * 'Company COOP Name' -> valid
 *
 * 'none' - No special designation rules for this corp type.
 */
type DesignationRule = 'suffix' | 'nonPrefix' | 'none'

type DesignationConfig = Partial<Record<CorpTypeCd, { rule: DesignationRule, allowed: string[] }>>

const DESIGNATION_CONFIG: DesignationConfig = {
  [CorpTypeCd.BC_COMPANY]: { // BC
    rule: 'suffix',
    allowed: [...NUMBERED_CORP_DESIGNATIONS, ...CORP_DESIGNATIONS]
  },
  [CorpTypeCd.BENEFIT_COMPANY]: { // BEN
    rule: 'suffix',
    allowed: [...NUMBERED_CORP_DESIGNATIONS, ...CORP_DESIGNATIONS]
  },
  [CorpTypeCd.CONTINUE_IN]: { // C
    rule: 'suffix',
    allowed: [...NUMBERED_CORP_DESIGNATIONS, ...CORP_DESIGNATIONS]
  },
  [CorpTypeCd.BEN_CONTINUE_IN]: { // CBEN
    rule: 'suffix',
    allowed: [...NUMBERED_CORP_DESIGNATIONS, ...CORP_DESIGNATIONS]
  },
  [CorpTypeCd.BC_CCC]: { // CC
    rule: 'suffix',
    allowed: [...NUMBERED_CC_DESIGNATIONS, ...CORP_DESIGNATIONS]
  },
  [CorpTypeCd.CCC_CONTINUE_IN]: { // CCC
    rule: 'suffix',
    allowed: [...NUMBERED_CC_DESIGNATIONS, ...CORP_DESIGNATIONS]
  },
  [CorpTypeCd.COOP]: { // CP
    rule: 'nonPrefix',
    allowed: COOP_DESIGNATIONS
  },
  [CorpTypeCd.ULC_CONTINUE_IN]: { // CUL
    rule: 'suffix',
    allowed: [...NUMBERED_ULC_DESIGNATIONS, ...ULC_DESIGNATIONS]
  },
  [CorpTypeCd.BC_ULC_COMPANY]: { // ULC
    rule: 'suffix',
    allowed: [...NUMBERED_ULC_DESIGNATIONS, ...ULC_DESIGNATIONS]
  },
  [CorpTypeCd.SOLE_PROP]: { // SP
    rule: 'none',
    allowed: []
  },
  [CorpTypeCd.PARTNERSHIP]: { // GP
    rule: 'none',
    allowed: []
  }
}

// need to escape regex metacharacters to accurately check punctuation
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getCurrentDesignation(
  name: string,
  rule: DesignationRule,
  allowed: string[]
): string | null {
  if (rule === 'none' || !allowed.length || !name) {
    return null
  }

  // Sort longest first to avoid partial matches (eg LTD before B.C. LTD.)
  const sorted = [...allowed].sort((a, b) => b.length - a.length)

  if (rule === 'suffix') {
    for (const item of sorted) {
      // Requires at least one non-whitespace character, followed by whitespace, then the designation
      const regex = new RegExp(`\\S+\\s+${escapeRegex(item)}$`, 'i')
      if (regex.test(name.trim())) {
        return item
      }
    }
  }

  if (rule === 'nonPrefix') {
    for (const item of sorted) {
      // Requires text + whitespace before the designation (can't start with designation)
      // and either whitespace or suffix after
      const regex = new RegExp(`\\S+\\s+${escapeRegex(item)}(?:\\s+|$)`, 'i')
      if (regex.test(name.trim())) {
        return item
      }
    }
  }

  return null
}

export function getLegalNameRefinement(
  context?: {
    business?: BusinessData | BusinessDataPublic
  }
) {
  const t = useNuxtApp().$i18n.t
  return (
    data: { legalName?: string | null },
    ctx: z.RefinementCtx
  ) => {
    const newLegalName = data.legalName?.trim() || ''
    const currentLegalName = context?.business?.legalName?.trim() || ''
    const legalType = context?.business?.legalType

    if (!newLegalName) {
      ctx.addIssue({
        code: 'custom',
        path: ['legalName'],
        message: t('validation.companyNameRequired')
      })
      return
    }

    if (!currentLegalName || !legalType) {
      if (newLegalName !== currentLegalName) {
        ctx.addIssue({
          code: 'custom',
          path: ['legalName'],
          message: 'Legal name edits are disabled: business details could not be loaded.'
        })
      }
      return
    }

    if (newLegalName === currentLegalName) {
      return
    }

    const config = DESIGNATION_CONFIG[legalType]

    // if no config found, do not allow any edits
    if (!config) {
      ctx.addIssue({
        code: 'custom',
        path: ['legalName'],
        message: 'Legal name edits are disabled: no designation rules are configured for this business type.'
      })
      return
    }

    // allow free edits if no rule or an empty allowed list
    if (config.rule === 'none' || !config.allowed.length) {
      return
    }

    const { rule, allowed } = config
    const currentDesignation = getCurrentDesignation(currentLegalName, rule, allowed)

    // block edits if a designation could not be matched
    if (!currentDesignation) {
      ctx.addIssue({
        code: 'custom',
        path: ['legalName'],
        message: 'Legal name edits are disabled: existing designation could not be verified.'
      })
      return
    }

    let hasValidDesignation = false

    if (rule === 'suffix') {
      // Requires preceding text + space, ending with the designation
      const endRegex = new RegExp(`\\S+\\s+${escapeRegex(currentDesignation)}$`)
      hasValidDesignation = endRegex.test(newLegalName)
    } else if (rule === 'nonPrefix') {
      // Cannot start with designation, requires preceding text + space and space or suffix after
      const includeRegex = new RegExp(`\\S+\\s+${escapeRegex(currentDesignation)}(?:\\s+|$)`)
      hasValidDesignation = includeRegex.test(newLegalName)
    }

    if (!hasValidDesignation) {
      ctx.addIssue({
        code: 'custom',
        path: ['legalName'],
        message: t('validation.designationCannotBeChanged', { designation: currentDesignation })
      })
      return
    }

    // fail if more than one designation found
    // remove matched current designation from newLegalName
    const sanitizedName = newLegalName.replace(
      new RegExp(`(?<=^|\\s)${escapeRegex(currentDesignation)}(?=\\s|$)`),
      ''
    ).trim()

    const sortedAllowed = [...allowed].sort((a, b) => b.length - a.length)
    const anyDesignationRegex = new RegExp(
      `(?<=^|\\s)(?:${sortedAllowed.map(escapeRegex).join('|')})(?=\\s|$)`,
      'g'
    )

    if (anyDesignationRegex.test(sanitizedName)) {
      ctx.addIssue({
        code: 'custom',
        path: ['legalName'],
        message: 'A company name cannot contain multiple designations.'
      })
    }
  }
}
