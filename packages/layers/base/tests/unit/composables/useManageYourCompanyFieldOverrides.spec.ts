// @vitest-environment node
import { describe, it, expect } from 'vitest'

describe('useManageYourCompanyFieldOverrides', () => {
  describe('getIsVisible', () => {
    it('returns true when overrides is undefined', () => {
      const { getIsVisible } = useManageYourCompanyFieldOverrides()

      expect(getIsVisible('nameRequest')).toBe(true)
      expect(getIsVisible(['jurisdiction', 'newJurisdiction'])).toBe(true)
    })

    it('returns false when key display mode is "hide"', () => {
      const overrides: YourCompanyFieldOverrides = {
        nameRequest: 'hide',
        jurisdiction: 'readonly'
      }
      const { getIsVisible } = useManageYourCompanyFieldOverrides(overrides)

      expect(getIsVisible('nameRequest')).toBe(false)
      expect(getIsVisible('jurisdiction')).toBe(true)
    })

    it('returns true if AT LEAST ONE key in an array is not "hide"', () => {
      const overrides: YourCompanyFieldOverrides = {
        jurisdiction: 'hide',
        newJurisdiction: 'readonly',
        previousJurisdiction: 'hide'
      }
      const { getIsVisible } = useManageYourCompanyFieldOverrides(overrides)

      expect(getIsVisible(['jurisdiction', 'newJurisdiction', 'previousJurisdiction'])).toBe(true)
    })

    it('returns false if ALL keys in an array are "hide"', () => {
      const overrides: YourCompanyFieldOverrides = {
        jurisdiction: 'hide',
        newJurisdiction: 'hide'
      }
      const { getIsVisible } = useManageYourCompanyFieldOverrides(overrides)

      expect(getIsVisible(['jurisdiction', 'newJurisdiction'])).toBe(false)
    })
  })

  describe('getIsReadOnly', () => {
    it('returns true when isReadOnlyVariant is true, regardless of overrides', () => {
      const overrides: YourCompanyFieldOverrides = {
        legalType: 'default'
      }
      const { getIsReadOnly } = useManageYourCompanyFieldOverrides(overrides, true)

      expect(getIsReadOnly('legalType')).toBe(true)
      expect(getIsReadOnly('nameRequest')).toBe(true)
    })

    it('returns true when field override is "readonly"', () => {
      const overrides: YourCompanyFieldOverrides = {
        legalType: 'readonly',
        outDate: 'hide'
      }
      const { getIsReadOnly } = useManageYourCompanyFieldOverrides(overrides, false)

      expect(getIsReadOnly('legalType')).toBe(true)
      expect(getIsReadOnly('outDate')).toBe(false)
    })

    it('returns true if AT LEAST ONE key in an array is "readonly"', () => {
      const overrides: YourCompanyFieldOverrides = {
        jurisdiction: 'hide',
        newJurisdiction: 'readonly'
      }
      const { getIsReadOnly } = useManageYourCompanyFieldOverrides(overrides, false)

      expect(getIsReadOnly(['jurisdiction', 'newJurisdiction'])).toBe(true)
    })

    it('returns false if NO keys in an array are "readonly"', () => {
      const overrides: YourCompanyFieldOverrides = {
        jurisdiction: 'hide',
        newJurisdiction: 'hide'
      }
      const { getIsReadOnly } = useManageYourCompanyFieldOverrides(overrides, false)

      expect(getIsReadOnly(['jurisdiction', 'newJurisdiction'])).toBe(false)
    })
  })

  describe('Reactivity', () => {
    it('should update with override changes', () => {
      const overrides = ref<YourCompanyFieldOverrides>({ nameRequest: 'readonly' })

      const { getIsVisible, getIsReadOnly } = useManageYourCompanyFieldOverrides(
        () => overrides.value,
        false
      )

      expect(getIsVisible('nameRequest')).toBe(true)
      expect(getIsReadOnly('nameRequest')).toBe(true)

      overrides.value = { nameRequest: 'hide' }

      expect(getIsVisible('nameRequest')).toBe(false)
      expect(getIsReadOnly('nameRequest')).toBe(false)
    })

    it('should update with isReadOnlyVariant changes', () => {
      const isReadOnlyVariant = ref(false)

      const { getIsReadOnly } = useManageYourCompanyFieldOverrides(
        undefined,
        isReadOnlyVariant
      )

      expect(getIsReadOnly('legalType')).toBe(false)

      isReadOnlyVariant.value = true

      expect(getIsReadOnly('legalType')).toBe(true)
    })
  })
})
