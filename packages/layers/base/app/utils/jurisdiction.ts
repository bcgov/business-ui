import type { InputMenuItem } from '@nuxt/ui'

export function getJurisdictionLabel(country?: string, region?: string | null): string {
  const t = useNuxtApp().$i18n.t

  if (!country) {
    return ''
  }

  if (country === 'CA') {
    if (region === 'FEDERAL') {
      return t('label.federal')
    }
    const provinceDisplay = countrySubdivisions.ca.find(p => p.code === region)?.name || region
    return `${provinceDisplay}, Canada`
  }

  const countryDisplay = isoCountriesListSortedByName.find(c => c.alpha_2 === country)?.name || country
  return countryDisplay
}

export function getJurisdictionMenuItems(): InputMenuItem[][] {
  const t = useNuxtApp().$i18n.t

  const caOpts: InputMenuItem[] = [
    { type: 'label', label: t('label.canadian') },
    ...countrySubdivisions.ca
      .filter(p => p.code !== 'BC')
      .map(p => ({
        label: `${p.name}, Canada`,
        region: p.code,
        country: 'CA'
      })),
    { type: 'separator' },
    { region: 'FEDERAL', country: 'CA', label: t('label.federal') }
  ]

  const internationalOpts: InputMenuItem[] = [
    { type: 'label', label: t('label.international') },
    ...isoCountriesListSortedByName
      .filter(c => c.alpha_2 !== 'CA')
      .sort((a, b) => {
        if (a.alpha_2 === 'US') {
          return -1
        }
        if (b.alpha_2 === 'US') {
          return 1
        }
        return 0
      })
      .map(c => ({
        label: c.name,
        region: null,
        country: c.alpha_2
      }))
  ]

  return [
    caOpts,
    internationalOpts
  ]
}
