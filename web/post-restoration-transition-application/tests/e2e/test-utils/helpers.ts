import type { Page } from '@playwright/test'

import * as entities from '../../mocks/auth/entities'
import * as businesses from '../../mocks/lear/business'
import * as shares from '../../mocks/lear/shares'
import * as addresses from '../../mocks/lear/addresses'
import * as directors from '../../mocks/lear/directors'

type library = {
  [key: string]: object
}

const getMockForIdentifier = (identifier: string, current: object, lib: library) => {
  try {
    current = lib[identifier]
  } catch (e) {
    current = lib.base
  }
  return current
}


export const mockForIdentifier = async (page: Page, identifier: string) => {

  const entity = getMockForIdentifier(identifier, entities.base, entities)
  const business = getMockForIdentifier(identifier, businesses.base, businesses)
  const share = getMockForIdentifier(identifier, shares.base, shares)
  const address = getMockForIdentifier(identifier, addresses.base, addresses)
  const director = getMockForIdentifier(identifier, directors.base, directors)
  
  await page.route(`*/**/entities/${identifier}`, async (route) => {
    await route.fulfill({ json: entity })
  })
  await page.route(`*/**/businesses/${identifier}?slim=true`, async (route) => {
    await route.fulfill({ json: business })
  })
  await page.route(`*/**/businesses/${identifier}/share-classes`, async (route) => {
    await route.fulfill({ json: share })
  })
  await page.route(`*/**/businesses/${identifier}/addresses`, async (route) => {
    await route.fulfill({ json: address })
  })
  await page.route(`*/**/businesses/${identifier}/parties?type=director`, async (route) => {
    await route.fulfill({ json: director })
  })
}