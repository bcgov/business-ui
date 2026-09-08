import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

type BusinessOverride = { key: string, value: string | boolean | number | object[] }

export const getBusinessExtendedMock = (
  overrides: BusinessOverride[] = [],
  filingType: FilingType.AMALGAMATION_APPLICATION, // add filing types as necessary,
  forCorrection: boolean
) => {
  const forCorrectionPath = forCorrection ? 'for-correction' : 'not-for-correction'
  const json = JSON.parse(fs.readFileSync(
    resolve(`./json/${filingType}/${forCorrectionPath}.json`), 'utf8')
  )
  for (const override of overrides) {
    json[override.key] = override.value
  }
  return json
}
