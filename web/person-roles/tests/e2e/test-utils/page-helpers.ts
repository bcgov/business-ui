import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import type { ApiAddress } from '#business/app/interfaces/address'
import type { BusinessRelationship } from '#business/app/interfaces/business-relationship'
import { NOCOI, businessBC1234567, tasksBC1234567, partiesBC1234567 } from '~~/tests/mocks'
import { provinceSubdivisions } from './data'
import { mockCommonApiCallsForFiling } from '#test-mocks'

const identifier = businessBC1234567.business.identifier

export async function navigateToOfficerChangePage(page: Page) {
  const networkResponse = page.waitForResponse('*/**/businesses/**/*')
  // navigate to page
  await page.goto(`./en-CA/officer-change/${identifier}`)
  // wait for api response to settle
  await networkResponse
  // wait for heading, this will wait for the loading state to finish on initial page mount
  await expect(page.getByText('Officer Change').first()).toBeVisible()
}

export async function navigateToManageReceiversPage(page: Page, filingSubType: ReceiverType) {
  const networkResponse = page.waitForResponse('*/**/businesses/**/*')
  // navigate to page
  await page.goto(`./en-CA/manage-receivers/${identifier}/${filingSubType}`)
  // wait for api response to settle
  await networkResponse
  // wait for heading, this will wait for the loading state to finish on initial page mount
  await expect(page.getByText('1. Receiver Information').first()).toBeVisible()
}

export async function navigateToManageLiquidatorsPage(page: Page, filingSubType: LiquidateType) {
  const networkResponse = page.waitForResponse('*/**/businesses/**/*')
  // navigate to page
  await page.goto(`./en-CA/manage-liquidators/${identifier}/${filingSubType}`)
  // wait for api response to settle
  await networkResponse
  // wait for heading, this will wait for the loading state to finish on initial page mount
  await expect(page.getByText('1. Liquidator Information').first()).toBeVisible()
}

export async function setupOfficerChangePage(page: Page, includeNavigation = true) {
  await mockCommonApiCallsForFiling(
    page,
    identifier,
    partiesBC1234567,
    NOCOI,
    undefined
  )
  // business api business tasks GET
  await page.route(`*/**/businesses/${identifier}/tasks`, async (route) => {
    await route.fulfill({ json: tasksBC1234567 })
  })
  // business api filing creation POST
  await page.route(`*/**/businesses/${identifier}/filings`, async (route) => {
    await route.fulfill({ status: 201 })
  })

  if (includeNavigation) {
    // navigate to page and wait for settled state
    await navigateToOfficerChangePage(page)
  }
}

export function getTableRowForPerson(page: Page, lastName: string) {
  const table = page.getByRole('table')
  expect(table).toBeDefined()
  const row = table.locator('tbody').getByRole('row').filter({
    has: page.locator('td:first-child', { hasText: lastName.toUpperCase() })
  })
  expect(row).toBeDefined()
  return row
}

export async function openOfficerForm(page: Page, row?: Locator) {
  if (row) { // pass a row to open the form in edit mode
    await expect(row).toBeVisible()
    const changeButton = row.getByRole('button', { name: 'Change' })
    if (await changeButton.isVisible()) { // if no edits or newly added, there will be a change button
      await changeButton.click()
    } else { // if edits to existing officer, need to access change button in more actions menu
      await row.getByRole('button', { name: 'More Actions' }).click()
      await page.getByRole('menuitem', { name: 'Change' }).click()
    }
  } else { // if no row, open new 'Add Officer' form
    await page.getByRole('button', { name: 'Add Officer' }).click()
    const addOfficerButton = page.getByRole('button', { name: 'Add Officer' })
    await expect(addOfficerButton).toBeEnabled()
    await addOfficerButton.click()
  }
  // form should be visible after either scenario
  await expect(page.getByTestId('party-details-form')).toBeVisible()
}

export async function assertNameTableCell(
  page: Page,
  relationship: BusinessRelationship,
  badges?: Array<'ADDED' | 'REMOVED' | 'NAME CHANGED' | 'ROLES CHANGED' | 'ADDRESS CHANGED'>,
  notBadges?: Array<'ADDED' | 'REMOVED' | 'NAME CHANGED' | 'ROLES CHANGED' | 'ADDRESS CHANGED'>
) {
  const row = getTableRowForPerson(page, relationship.entity.familyName!)
  const tableCell = row.getByRole('cell').first()
  const person = relationship.entity
  if (person.givenName) {
    await expect(tableCell).toContainText(person.givenName.toUpperCase())
  }
  if (person.middleInitial) {
    await expect(tableCell).toContainText(person.middleInitial.toUpperCase())
  }
  if (person.familyName) {
    await expect(tableCell).toContainText(person.familyName.toUpperCase())
  }
  if (person.alternateName) {
    await expect(tableCell).toContainText('Preferred Name')
    await expect(tableCell).toContainText(person.alternateName.toUpperCase())
  }
  if (badges) {
    for (const badge of badges) {
      await expect(tableCell).toContainText(badge)
    }
  }
  if (notBadges) {
    for (const badge of notBadges) {
      await expect(tableCell).not.toContainText(badge)
    }
  }
}

export async function assertRoles(page: Page, person: BusinessRelationship, roles: string[]) {
  const row = getTableRowForPerson(page, person.entity.familyName!)
  for (const role of roles) {
    await expect(row.getByRole('cell').nth(1)).toContainText(role)
  }
}

export async function assertAddress(
  page: Page,
  person: BusinessRelationship,
  column: 2 | 3,
  address: ApiAddress | 'same'
) {
  const row = getTableRowForPerson(page, person.entity.familyName!)
  if (address === 'same') {
    await expect(row.getByRole('cell').nth(column)).toContainText('Same as Delivery Address')
  } else {
    await expect(row.getByRole('cell').nth(column)).toContainText(address.streetAddress)
    await expect(row.getByRole('cell').nth(column)).toContainText(address.addressCity)
    const region = address.addressRegion!.length === 2 // dont convert if region already in iso2 format
      ? address.addressRegion
      : provinceSubdivisions.find(province => province.name === address.addressRegion)!.code
    await expect(row.getByRole('cell').nth(column)).toContainText(region!)
    await expect(row.getByRole('cell').nth(column)).toContainText(address.postalCode)
    await expect(row.getByRole('cell').nth(column)).toContainText('Canada')
    await expect(row.getByRole('cell').nth(column)).toContainText(address.deliveryInstructions || '')
  }
}
