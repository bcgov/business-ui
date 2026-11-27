// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getLocalePrefixedUrl, isRootPath } from '~/utils/legacy-url'

const localeCodes = ['en-CA', 'fr-CA']

describe('legacy-url', () => {
  describe('isRootPath', () => {
    it.each([
      ['/', true],
      ['', true],
      ['/en-CA', true],
      ['/fr-CA/', true],
      ['/BC1234567', false],
      ['/en-CA/BC1234567', false],
      ['/errors/entity/BC1234567', false]
    ])('%s -> %s', (path, expected) => {
      expect(isRootPath(path, localeCodes)).toBe(expected)
    })
  })

  describe('getLocalePrefixedUrl', () => {
    it.each([
      ['/BC1234567', '/en-CA/BC1234567'],
      ['/BC1234567?accountid=1&filing_id=2', '/en-CA/BC1234567?accountid=1&filing_id=2'],
      ['/T1234567ab?filing_id=2#history', '/en-CA/T1234567ab?filing_id=2#history'],
      ['/errors/entity/BC1234567', '/en-CA/errors/entity/BC1234567'],
      ['/en-CAB/BC1234567', '/en-CA/en-CAB/BC1234567'],
      ['/en-CA/BC1234567', undefined],
      ['/fr-CA/BC1234567?accountid=1', undefined],
      ['/en-CA?accountid=1', undefined]
    ])('%s -> %s', (fullPath, expected) => {
      expect(getLocalePrefixedUrl(fullPath, localeCodes, 'en-CA')).toBe(expected)
    })
  })
})
