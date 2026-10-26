export default defineNuxtPlugin(async () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver',
    timeZoneName: 'shortOffset'
  })

  const parts = formatter.formatToParts(new Date('2026-11-15T12:00:00Z'))
  const timeZoneName = parts.find(p => p.type === 'timeZoneName')?.value || ''
  const isTzOutdated = /8/.test(timeZoneName) && /GMT|UTC/i.test(timeZoneName)

  if (isTzOutdated) {
    await import('@formatjs/intl-datetimeformat/polyfill-force.js')
    await import('@formatjs/intl-datetimeformat/locale-data/en.js')
    await import('@formatjs/intl-datetimeformat/add-all-tz.js')
  }
})
