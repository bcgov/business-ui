import { describe, it, expect } from 'vitest'

describe('getConfirmCompletingPartySchema', () => {
  it('should pass with a name and the confirmation checked', () => {
    const result = getConfirmCompletingPartySchema().safeParse({
      completingPartyName: 'Jane Smith',
      confirmed: true
    })
    expect(result.success).toBe(true)
  })

  it('should fail without a completing party name', () => {
    const result = getConfirmCompletingPartySchema().safeParse({
      completingPartyName: '',
      confirmed: true
    })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('Please enter the full legal name of the completing party')
    expect(result.error!.issues[0]!.path).toEqual(['completingPartyName'])
  })

  it('should fail when the confirmation is unchecked', () => {
    const result = getConfirmCompletingPartySchema().safeParse({
      completingPartyName: 'Jane Smith',
      confirmed: false
    })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('Check this box to continue')
    expect(result.error!.issues[0]!.path).toEqual(['confirmed'])
  })

  it('should show the required message when the name is undefined (cleared input)', () => {
    const result = getConfirmCompletingPartySchema().safeParse({
      completingPartyName: undefined,
      confirmed: true
    })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('Please enter the full legal name of the completing party')
    expect(result.error!.issues[0]!.path).toEqual(['completingPartyName'])
  })

  it('should show the checkbox message when confirmed is undefined', () => {
    const result = getConfirmCompletingPartySchema().safeParse({
      completingPartyName: 'Jane Smith',
      confirmed: undefined
    })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('Check this box to continue')
    expect(result.error!.issues[0]!.path).toEqual(['confirmed'])
  })
})
