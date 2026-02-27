import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

type FilingOverride = { key: string, value: object | object[] }

export const getFilingMock = (filingType: string, status: string, overrides: FilingOverride[] = []) => {
  const json = JSON.parse(fs.readFileSync(resolve(`./json/${filingType}${status}.json`), 'utf8'))
  for (const override of overrides) {
    try {
      json[override.key] = override.value
    } catch (e) {
      console.error('Invalid filing override given', e)
    }
  }
  return json
}
