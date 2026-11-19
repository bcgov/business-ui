import { describe, it, expect } from 'vitest'

const getMessages = (data: object) => {
  const result = getLiquidatorAppointmentSchema().safeParse(data)
  return result.success ? [] : result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
}

describe('getLiquidatorAppointmentSchema', () => {
  it('requires an appointment method', () => {
    expect(getMessages({})).toEqual([
      { path: 'appointmentMethod', message: 'Select how the liquidator was appointed.' }
    ])
  })

  it('does not require a court order number when appointed by the company', () => {
    expect(getMessages({ appointmentMethod: LiquidatorAppointmentMethod.COMPANY })).toEqual([])
  })

  it('requires a court order number when appointed by the court', () => {
    expect(getMessages({ appointmentMethod: LiquidatorAppointmentMethod.COURT })).toEqual([
      { path: 'courtOrderNumber', message: 'Court order number is required.' }
    ])
    expect(getMessages({ appointmentMethod: LiquidatorAppointmentMethod.COURT, courtOrderNumber: '   ' })).toEqual([
      { path: 'courtOrderNumber', message: 'Court order number is required.' }
    ])
  })

  it('limits the court order number to a court order file number length (5 - 20)', () => {
    const court = { appointmentMethod: LiquidatorAppointmentMethod.COURT }
    expect(getMessages({ ...court, courtOrderNumber: '1234' })).toHaveLength(1)
    expect(getMessages({ ...court, courtOrderNumber: '1'.repeat(21) })).toHaveLength(1)
    expect(getMessages({ ...court, courtOrderNumber: 'S-12345' })).toEqual([])
  })
})
