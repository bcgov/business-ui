import { describe, it, expect } from 'vitest'

describe('getStaffPaymentSchema', () => {
  const schema = getStaffPaymentSchema()

  const base = {
    bcolAccountNumber: '',
    datNumber: '',
    folioNumber: '',
    isPriority: false,
    routingSlipNumber: ''
  }

  describe('BCOL option', () => {
    const bcol = { ...base, option: StaffPaymentOption.BCOL, bcolAccountNumber: '123456' }

    it('should pass with an upper case DAT number', () => {
      const result = schema.safeParse({ ...bcol, datNumber: 'C1234567' })
      expect(result.success).toBe(true)
    })

    it('should pass with a lower case DAT number', () => {
      const result = schema.safeParse({ ...bcol, datNumber: 'c1234567' })
      expect(result.success).toBe(true)
    })

    it('should pass with a 9 digit DAT number', () => {
      const result = schema.safeParse({ ...bcol, datNumber: 'c123456789' })
      expect(result.success).toBe(true)
    })

    it('should fail when DAT number is empty', () => {
      const result = schema.safeParse({ ...bcol, datNumber: '' })
      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Enter DAT Number')
      expect(issues[0]!.path).toEqual(['datNumber'])
    })

    it.each([
      '1234567', // missing letter
      'CC123456', // two letters
      'C123456', // too few digits
      'C1234567890', // too many digits
      'C 1234567' // whitespace
    ])('should fail when DAT number is "%s"', (datNumber) => {
      const result = schema.safeParse({ ...bcol, datNumber })
      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('DAT Number must be in standard format (eg, C1234567)')
      expect(issues[0]!.path).toEqual(['datNumber'])
    })

    it('should fail when BCOL account number is invalid', () => {
      const result = schema.safeParse({ ...bcol, bcolAccountNumber: '12345', datNumber: 'C1234567' })
      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.path).toEqual(['bcolAccountNumber'])
    })
  })

  describe('FAS option', () => {
    const fas = { ...base, option: StaffPaymentOption.FAS }

    it('should pass with a 9 digit routing slip number', () => {
      const result = schema.safeParse({ ...fas, routingSlipNumber: '123456789' })
      expect(result.success).toBe(true)
    })

    it('should fail when routing slip number is not 9 digits', () => {
      const result = schema.safeParse({ ...fas, routingSlipNumber: '12345678' })
      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Routing Slip Number must be 9 digits')
      expect(issues[0]!.path).toEqual(['routingSlipNumber'])
    })
  })

  describe('NO_FEE option', () => {
    it('should pass without payment details', () => {
      const result = schema.safeParse({ ...base, option: StaffPaymentOption.NO_FEE })
      expect(result.success).toBe(true)
    })
  })

  describe('NONE option', () => {
    it('should fail as a payment option must be selected', () => {
      const result = schema.safeParse({ ...base, option: StaffPaymentOption.NONE })
      expect(result.success).toBe(false)
      expect(result.error!.issues[0]!.path).toEqual(['option'])
    })
  })
})
