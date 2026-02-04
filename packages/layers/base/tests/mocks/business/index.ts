import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

type BusinessOverride = { key: string, value: string | boolean | number | object[] }

export const getBusinessMock = (overrides: BusinessOverride[] = [], slim = false) => {
  const json: BusinessDataPublic = JSON.parse(fs.readFileSync(
    slim ? resolve('./json/slim.json') : resolve('./json/full.json'), 'utf8'))
  for (const override of overrides) {
    // @ts-expect-error assume that we are giving allowable keys in the overrides
    json[override.key] = override.value
  }
  return { business: json }
}

export const getBusinessSettingsMock = (overrides: BusinessOverride[] = []) => {
  const json: AuthInformation = JSON.parse(fs.readFileSync(resolve('./json/businessSettings.json'), 'utf8'))
  for (const override of overrides) {
    // @ts-expect-error assume that we are giving allowable keys in the overrides
    json[override.key] = override.value
  }
  return json
}
