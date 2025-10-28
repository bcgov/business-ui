import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LedgerMockItem = { type: FilingType, overrides?: { key: string, value: any }[] }

export const getBusinessLedgerMock = (ledgerItems: LedgerMockItem[]) => {
  const mockedItems: BusinessLedgerItem[] = []
  for (const requestedItem of ledgerItems) {
    const json: BusinessLedgerItem = JSON.parse(fs.readFileSync(resolve(`./json/${requestedItem.type}.json`), 'utf8'))
    if (!json) {
      console.error('Attempting to add a ledger item mock that is not defined yet:', requestedItem.type)
      continue
    }
    for (const override of requestedItem.overrides || []) {
      // @ts-expect-error assume that we are giving allowable keys in the overrides
      json[override.key] = override.value
    }
    mockedItems.push(json)
  }
  return { filings: mockedItems }
}
