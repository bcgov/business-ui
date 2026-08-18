import { describe, it, expect } from 'vitest'

describe('formatStaffPaymentApi', () => {
  it('should return empty object when option is NONE', () => {
    expect(formatStaffPaymentApi({
      option: StaffPaymentOption.NONE,
      bcolAccountNumber: '',
      datNumber: '',
      routingSlipNumber: ''
    })).toEqual({})
  })

  it('should upper case the DAT number for BCOL', () => {
    expect(formatStaffPaymentApi({
      option: StaffPaymentOption.BCOL,
      bcolAccountNumber: '123456',
      datNumber: 'c1234567',
      folioNumber: 'F1',
      isPriority: true,
      routingSlipNumber: ''
    })).toEqual({
      staffPaymentOption: StaffPaymentOption.BCOL,
      waiveFees: false,
      bcolAccountNumber: '123456',
      datNumber: 'C1234567',
      folioNumber: 'F1',
      priority: true
    })
  })

  it('should only include populated values for FAS', () => {
    expect(formatStaffPaymentApi({
      option: StaffPaymentOption.FAS,
      bcolAccountNumber: '',
      datNumber: '',
      routingSlipNumber: '123456789'
    })).toEqual({
      staffPaymentOption: StaffPaymentOption.FAS,
      waiveFees: false,
      routingSlipNumber: '123456789'
    })
  })

  it('should set waiveFees for NO_FEE', () => {
    expect(formatStaffPaymentApi({
      option: StaffPaymentOption.NO_FEE,
      bcolAccountNumber: '',
      datNumber: '',
      routingSlipNumber: ''
    })).toEqual({
      staffPaymentOption: StaffPaymentOption.NO_FEE,
      waiveFees: true
    })
  })
})

describe('formatStaffPaymentUi', () => {
  it('should map header fields with defaults', () => {
    expect(formatStaffPaymentUi({} as FilingHeaderResponse)).toEqual({
      bcolAccountNumber: '',
      datNumber: '',
      folioNumber: '',
      isPriority: false,
      option: StaffPaymentOption.NONE,
      routingSlipNumber: ''
    })
  })
})
