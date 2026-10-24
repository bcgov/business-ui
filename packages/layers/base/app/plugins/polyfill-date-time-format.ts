export default defineNuxtPlugin(async () => {
  console.group('Timezone Polyfill')

  const getFormatter = () => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver',
    timeZoneName: 'shortOffset',
    hour: 'numeric',
    minute: '2-digit'
  })

  const beforeFormatter = getFormatter()

  const beforeString = beforeFormatter.format(new Date('2026-11-15T12:00:00Z'))
  console.log('Formatted before polyfill: ', beforeString)

  const isTzOutdated = beforeString.includes('GMT-8')

  if (isTzOutdated) {
    console.log('OUTDATED')

    await import('@formatjs/intl-datetimeformat/polyfill-force.js')
    await import('@formatjs/intl-datetimeformat/locale-data/en.js')
    await import('@formatjs/intl-datetimeformat/add-all-tz.js')
  } else {
    console.log('NOT OUTDATED')
  }

  const afterFormatter = getFormatter()

  console.log('Formatted after polyfill: ', afterFormatter.format(new Date('2026-11-15T12:00:00Z')))

  console.groupEnd()
})
