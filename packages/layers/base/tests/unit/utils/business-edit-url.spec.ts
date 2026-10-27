import { describe, expect, it } from 'vitest'

describe('getBusinessEditUrl', () => {
  it('links a coop to the special resolution page', () => {
    expect(getBusinessEditUrl('CP1234567', 'CP', 3602))
      .toBe('http://edit/CP1234567/special-resolution?accountid=3602&businessid=CP1234567')
  })

  it.each(['SP', 'GP'])('links a %s firm to the change page', (legalType) => {
    expect(getBusinessEditUrl('FM1234567', legalType, 3602))
      .toBe('http://edit/FM1234567/change?accountid=3602&businessid=FM1234567')
  })

  it.each(['BC', 'BEN', 'CC', 'ULC', 'C'])('links a %s company to the alteration page', (legalType) => {
    expect(getBusinessEditUrl('BC0886475', legalType, 3602))
      .toBe('http://edit/BC0886475/alteration?accountid=3602&businessid=BC0886475')
  })

  it('leaves the account id out when there is none', () => {
    expect(getBusinessEditUrl('BC0886475', 'BC')).toBe('http://edit/BC0886475/alteration?businessid=BC0886475')
  })
})
