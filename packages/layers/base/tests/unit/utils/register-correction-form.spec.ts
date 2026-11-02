import { describe, it, expect } from 'vitest'

const FORMS_URL = 'https://www2.gov.bc.ca/assets/gov/employment-business-and-economic-development/'
  + 'business-management/permits-licences-and-registration/registries-forms/'

describe('getRegisterCorrectionFormUrl', () => {
  it.each([
    ['BC', 'register_correction_form_47.pdf'],
    ['BEN', 'register_correction_form_47.pdf'],
    ['CC', 'register_correction_form_47.pdf'],
    ['ULC', 'register_correction_form_47.pdf'],
    ['C', 'register_correction_form_47.pdf'],
    ['CP', 'form_58_coo_-_cooperative_correction.pdf'],
    ['A', 'form_47_n_correct_the_corporate_register.pdf'],
    ['B', 'form_47_n_correct_the_corporate_register.pdf'],
    ['SP', 'form_02cor_correction_for_sp_gp_registration.pdf'],
    ['GP', 'form_02cor_correction_for_sp_gp_registration.pdf'],
    ['S', 'form_37_soc_-_corporate_register_correction.pdf']
  ])('should return the correction form for %s', (legalType, form) => {
    expect(getRegisterCorrectionFormUrl(legalType)).toBe(`${FORMS_URL}${form}`)
  })

  it('should fall back to form 47 when the business type is missing or unknown', () => {
    expect(getRegisterCorrectionFormUrl()).toBe(`${FORMS_URL}register_correction_form_47.pdf`)
    expect(getRegisterCorrectionFormUrl('XYZ')).toBe(`${FORMS_URL}register_correction_form_47.pdf`)
  })
})
