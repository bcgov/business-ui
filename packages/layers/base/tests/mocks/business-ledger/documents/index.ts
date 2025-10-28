import fs from 'fs'
import { createResolver } from 'nuxt/kit'

import { FilingType } from '../../../../app/enums/filing-type'

const { resolve } = createResolver(import.meta.url)

// FUTURE: add other groups of documents (i.e. incorporationApplication)
export const getDocumentsMock = (type: FilingType.CHANGE_OF_ADDRESS = FilingType.CHANGE_OF_ADDRESS) => {
  const json: BusinessFilingDocumentUrls = JSON.parse(fs.readFileSync(resolve(`./json/${type}.json`), 'utf8'))
  return json
}
