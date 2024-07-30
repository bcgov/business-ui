import { describe, expect, it } from 'vitest'
import { handleFormInputVariant } from '~/utils/handleFormInputVariant'

describe('handleFormInputVariant', () => {
  it('returns the expected string', () => {
    const formErrors = [
      { path: 'email', message: 'Invalid email format' },
      { path: 'password', message: 'Password is required' }
    ]

    const tests = [
      ['random', 'bcGov'],
      ['email', 'error'],
      ['no match', 'bcGov'],
      ['password', 'error']
    ]

    tests.forEach((test) => {
      const result = handleFormInputVariant(test[0], formErrors)

      expect(result).toBe(test[1])
    })
  })

  it('returns bcGov if formErrors is undefined', () => {
    const result = handleFormInputVariant('some path', undefined)

    expect(result).toBe('bcGov')
  })
})
