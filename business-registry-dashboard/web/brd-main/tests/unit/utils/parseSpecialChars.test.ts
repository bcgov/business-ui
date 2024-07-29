import { describe, expect, it } from 'vitest'
import { parseSpecialChars } from '~/utils/parseSpecialChars'

describe('parseSpecialChars', () => {
  it('returns fallback for undefined input', () => {
    const result = parseSpecialChars(undefined)
    expect(result).toBe('N/A')
  })

  it('returns fallback for null input', () => {
    const result = parseSpecialChars(null)
    expect(result).toBe('N/A')
  })

  it('returns custom fallback for undefined input', () => {
    const result = parseSpecialChars('Custom Fallback', 'Custom Fallback')
    expect(result).toBe('Custom Fallback')
  })

  it('returns custom fallback for null input', () => {
    const result = parseSpecialChars('Custom Fallback', 'Custom Fallback')
    expect(result).toBe('Custom Fallback')
  })

  it('returns original text if no special characters', () => {
    const text = 'Hello World'
    const result = parseSpecialChars(text)
    expect(result).toBe(text)
  })

  it('handles text containing special characters', () => {
    const text = 'Hello! How are you?'
    const parsedText = 'Hello! How are you?'

    const result = parseSpecialChars(text)
    expect(result).toBe(parsedText)
  })

  it('handles text with accented characters', () => {
    const text = 'Café'
    const parsedText = 'Café'

    const result = parseSpecialChars(text)
    expect(result).toBe(parsedText)
  })

  it('handles special character strings', () => {
    const tests = [
      ['<div>Some HTML content</div>', 'Some HTML content'],
      ['àèìòù', 'àèìòù'],
      ['&amp; &gt; &lt;', '& > <'],
      ['&copy; &reg;', '© ®'],
      ['😊', '😊'],
      ['@#$%^&*()', '@#$%^&*()'],
      ['&lt; &gt; &amp;', '< > &'],
      ['&#955;UG&#695;AL&#601;S', 'λUGʷALəS'],
      ['&#247; &#215; &#162;', '÷ × ¢'],
      ['&#128515; &reg; &copy;', '😃 ® ©'],
      ['&#171; &#8220;Hello&#8221; &#187;', '« “Hello” »']
    ]

    tests.forEach((test: string[]) => {
      const result = parseSpecialChars(test[0])
      expect(result).toEqual(test[1])
    })
  })
})
