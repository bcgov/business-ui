import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

type PartiesOverride = { index: number, key: string, value: string | boolean | number }

export const getPartiesMock = (overrides: PartiesOverride[] = []) => {
  const json: OrgPerson[] = JSON.parse(fs.readFileSync(resolve('./json/default.json'), 'utf8'))
  for (const override of overrides) {
    try {
      if (override.key === 'roleType') {
        // @ts-expect-error assume that we are giving allowable indexes and keys in the overrides
        json[override.index]['roles'][0]['roleType'] = override.value
      } else {
        // @ts-expect-error assume that we are giving allowable indexes and keys in the overrides
        json[index][override.key] = override.value
      }
    } catch (e) {
      console.error('Invalid party override given', e)
    }
  }
  return { parties: json }
}
