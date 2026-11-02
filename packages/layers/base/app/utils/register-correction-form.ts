// NB: direct import so this util can be used outside the Nuxt runtime (e.g. e2e tests)
import { CorpTypeCd } from '#business/app/enums/corp-type-cd'

const REGISTRIES_FORMS_URL = 'https://www2.gov.bc.ca/assets/gov/employment-business-and-economic-development/'
  + 'business-management/permits-licences-and-registration/registries-forms/'

/** Register correction form for each business type that has its own; everything else uses form 47 */
const CORRECTION_FORM_BY_TYPE: Partial<Record<string, string>> = {
  [CorpTypeCd.COOP]: 'form_58_coo_-_cooperative_correction.pdf',
  [CorpTypeCd.EXTRA_PRO_A]: 'form_47_n_correct_the_corporate_register.pdf',
  [CorpTypeCd.EXTRA_PRO_B]: 'form_47_n_correct_the_corporate_register.pdf',
  [CorpTypeCd.SOLE_PROP]: 'form_02cor_correction_for_sp_gp_registration.pdf',
  [CorpTypeCd.PARTNERSHIP]: 'form_02cor_correction_for_sp_gp_registration.pdf',
  [CorpTypeCd.SOCIETY]: 'form_37_soc_-_corporate_register_correction.pdf'
}

// BC, benefit, community contribution and unlimited liability companies (and their continued-in types)
const DEFAULT_CORRECTION_FORM = 'register_correction_form_47.pdf'

/**
 * Returns the BC Registries register correction form (PDF) for a business type, used by the
 * spelling-mistake hint under a party's legal name.
 */
export function getRegisterCorrectionFormUrl(legalType?: string): string {
  const form = (legalType && CORRECTION_FORM_BY_TYPE[legalType]) || DEFAULT_CORRECTION_FORM
  return `${REGISTRIES_FORMS_URL}${form}`
}
