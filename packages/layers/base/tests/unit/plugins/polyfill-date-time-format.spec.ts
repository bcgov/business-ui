// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

function createDtfMock(formattedOutput: string, tzValue: string) {
  return function () {
    return {
      format: () => formattedOutput,
      formatToParts: () => [
        { type: 'hour', value: '4' },
        { type: 'literal', value: ':' },
        { type: 'minute', value: '00' },
        { type: 'literal', value: ' ' },
        { type: 'dayPeriod', value: 'a.m.' },
        { type: 'literal', value: ' ' },
        { type: 'timeZoneName', value: tzValue }
      ]
    } as unknown as Intl.DateTimeFormat
  }
}

describe('Timezone Polyfill Plugin', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it.each([
    ['standard short offset', '4:00 a.m. GMT-8', 'GMT-8'],
    ['padded hour format (Safari)', '4:00 a.m. GMT-08', 'GMT-08'],
    ['full minutes format', '4:00 a.m. GMT-08:00', 'GMT-08:00'],
    ['unicode minus sign', '4:00 a.m. GMT\u22128', 'GMT\u22128'],
    ['unicode minus with padding', '4:00 a.m. GMT\u221208:00', 'GMT\u221208:00']
  ])('should import the polyfills when timezone output is %s (%s)', async (_, formattedOutput, tzValue) => {
    const importSpy = vi.fn()

    vi.doMock('@formatjs/intl-datetimeformat/polyfill-force.js', () => {
      importSpy('polyfill-force')
      return {}
    })
    vi.doMock('@formatjs/intl-datetimeformat/locale-data/en.js', () => ({}))
    vi.doMock('@formatjs/intl-datetimeformat/add-all-tz.js', () => ({}))

    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(createDtfMock(formattedOutput, tzValue))

    const { default: plugin } = await import('#business/app/plugins/polyfill-date-time-format')
    await plugin({} as any)

    expect(importSpy).toHaveBeenCalledWith('polyfill-force')
  })

  it.each([
    ['GMT-7', '4:00 a.m. GMT-7', 'GMT-7'],
    ['GMT-07', '4:00 a.m. GMT-07', 'GMT-07'],
    ['standard abbreviation', '4:00 a.m. PST', 'PST'],
    ['daylight abbreviation', '4:00 a.m. PDT', 'PDT']
  ])('should not import the polyfills when timezone output is %s (%s)', async (_, formattedOutput, tzValue) => {
    const importSpy = vi.fn()

    vi.doMock('@formatjs/intl-datetimeformat/polyfill-force.js', () => {
      importSpy('polyfill-force')
      return {}
    })
    vi.doMock('@formatjs/intl-datetimeformat/locale-data/en.js', () => ({}))
    vi.doMock('@formatjs/intl-datetimeformat/add-all-tz.js', () => ({}))

    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(createDtfMock(formattedOutput, tzValue))

    const { default: plugin } = await import('#business/app/plugins/polyfill-date-time-format')
    await plugin({} as any)

    expect(importSpy).not.toHaveBeenCalled()
  })
})
