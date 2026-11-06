// @vitest-environment node
import { describe, it, expect } from 'vitest'

describe('draft rebase keys', () => {
  describe('getPartyRowId', () => {
    it('should read entity.identifier and treat an empty one as missing', () => {
      expect(getPartyRowId({ entity: { identifier: 123 } })).toBe('123')
      expect(getPartyRowId({ entity: { identifier: '' } })).toBeUndefined()
      expect(getPartyRowId({ entity: {} })).toBeUndefined()
    })
  })

  describe('getPartyNameKey', () => {
    it('should prefer the org name', () => {
      expect(getPartyNameKey({ entity: { businessName: ' Acme Ltd ', familyName: 'X' } })).toBe('ACME LTD')
    })

    it('should build LAST, FIRST and drop empty parts', () => {
      expect(getPartyNameKey({ entity: { givenName: 'Jane', familyName: 'Smith' } })).toBe('SMITH, JANE')
      expect(getPartyNameKey({ entity: { givenName: 'Jane', familyName: '' } })).toBe('JANE')
      expect(getPartyNameKey({ entity: {} })).toBeUndefined()
    })
  })

  it('getShareClassKey should strip the shares suffix and upper case', () => {
    expect(getShareClassKey('Common Shares')).toBe('COMMON')
    expect(getShareClassKey('COMMON SHARES')).toBe('COMMON')
    expect(getShareClassKey('Class A Value')).toBe('CLASS A')
    expect(getShareClassKey('')).toBeUndefined()
  })

  it('getResolutionKey should normalize the date and default the type', () => {
    expect(getResolutionKey('2026-01-05')).toBe('2026-01-05 (SPECIAL)')
    expect(getResolutionKey('2026-01-05T00:00:00', 'special')).toBe('2026-01-05 (SPECIAL)')
    expect(getResolutionKey(undefined)).toBeUndefined()
    expect(getResolutionEntityKey('2026-01-05 (SPECIAL)')).toBe('2026-01-05 (SPECIAL)')
    expect(getResolutionRowKey('2026-01-05')).toBe('2026-01-05 (SPECIAL)')
    expect(getResolutionRowKey({ date: '2026-01-05', type: 'SPECIAL' })).toBe('2026-01-05 (SPECIAL)')
  })

  it('stripEntityKeySuffix should drop the disambiguating id', () => {
    expect(stripEntityKeySuffix('SMITH, JANE #12')).toBe('SMITH, JANE')
    expect(stripEntityKeySuffix('SMITH, JANE')).toBe('SMITH, JANE')
  })

  it('getStaffModifiedRowKeys should key each section like the report', () => {
    expect(getStaffModifiedRowKeys({ id: '12' }, 'parties')).toEqual(['12'])
    expect(getStaffModifiedRowKeys({ type: OfficeType.REGISTERED }, 'offices')).toEqual([OfficeType.REGISTERED])
    expect(getStaffModifiedRowKeys({ name: 'Common' }, 'shareClasses')).toEqual(['COMMON'])
    expect(getStaffModifiedRowKeys({ id: '3', name: 'Nom' }, 'nameTranslations')).toEqual(['3', 'NOM'])
    expect(getStaffModifiedRowKeys({ date: '2026-01-05', type: 'SPECIAL' }, 'resolutions'))
      .toEqual(['2026-01-05 (SPECIAL)'])
    expect(getStaffModifiedRowKeys({}, 'parties')).toEqual([])
  })
})
