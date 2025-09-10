import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { NOCOI, businessBC1234567, tasksBC1234567, authInfoBC1234567, partiesBC1234567 } from '~~/tests/mocks'
import type { getFakePerson, getFakeAddress } from './data'
import { provinceSubdivisions } from './data'

type Person = ReturnType<typeof getFakePerson>
type PersonLastNameRequired = Partial<Person> & Pick<Person, 'lastName'>

export function getOfficerForm(page: Page) {
  return page.getByTestId('officer-form')
}

export async function setupOfficerChangePage(page: Page, includeNavigation = true) {
  const identifier = 'BC1234567'
  // auth api business info GET
  await page.route(`*/**/entities/${identifier}`, async (route) => {
    await route.fulfill({ json: authInfoBC1234567 })
  })
  // business api business info GET
  await page.route(`*/**/businesses/${identifier}`, async (route) => {
    await route.fulfill({ json: businessBC1234567 })
  })
  // business api business tasks GET
  await page.route(`*/**/businesses/${identifier}/tasks`, async (route) => {
    await route.fulfill({ json: tasksBC1234567 })
  })
  // business api perties/officers GET
  await page.route(`*/**/businesses/${identifier}/parties?classType=officer`, async (route) => {
    await route.fulfill({ json: partiesBC1234567 })
  })
  // pay api officer fee GET
  await page.route('*/**/fees/**/NOCOI', async (route) => {
    await route.fulfill({ json: NOCOI })
  })
  // business api filing creation POST
  await page.route(`*/**/businesses/${identifier}/filings`, async (route) => {
    await route.fulfill({ status: 201 })
  })
  // user accounts GET request
  await page.route('*/**/users/test/settings', async (route) => {
    await route.fulfill({
      json: [
        {
          accountStatus: 'ACTIVE',
          accountType: 'PREMIUM',
          id: 1234,
          label: 'Test Account Label',
          productSettings: '/account/1234/restricted-product',
          type: 'ACCOUNT',
          urlorigin: 'https://dev.account.bcregistry.gov.bc.ca',
          urlpath: '/account/1234/settings'
        }
      ]
    })
  })

  if (includeNavigation) {
    // navigate to page
    await page.goto(`./en-CA/officer-change/${identifier}`)
    // wait for heading, this will wait for the loading state to finish on initial page mount
    await expect(page.getByText('Officer Change').first()).toBeVisible()
  }
}

export function getTableRowForPerson(page: Page, person: PersonLastNameRequired) {
  const table = page.getByRole('table')
  expect(table).toBeDefined()
  const row = table.getByRole('row').filter({ hasText: person.lastName.toUpperCase() })
  expect(row).toBeDefined()
  return row
}

export async function fillNameFields(page: Page, person: PersonLastNameRequired) {
  if (person.firstName) {
    await page.getByTestId('first-name-input').fill(person.firstName)
  }
  if (person.middleName) {
    await page.getByTestId('middle-name-input').fill(person.middleName)
  }
  if (person.lastName) {
    await page.getByTestId('last-name-input').fill(person.lastName)
  }
  if (person.preferredName) {
    await page.getByRole('checkbox', { name: 'This person also has another name they prefer to use' }).setChecked(true)
    await page.getByTestId('preferred-name-input').fill(person.preferredName)
  }
}

export async function fillAddress(page: Page, type: 'mailing' | 'delivery', data: ReturnType<typeof getFakeAddress>) {
  const fieldset = page.getByTestId(`${type}-address-fieldset`)
  await fieldset.getByTestId(`${type}-address-input-street`).fill(data.street)
  await fieldset.getByTestId(`${type}-address-input-streetAdditional`).fill(data.streetAdditional)
  await fieldset.getByTestId(`${type}-address-input-city`).fill(data.city)
  // region - this is flaky, must focus first and wait for listbox or test may fail
  await fieldset.getByTestId(`${type}-address-input-region`).focus()
  await fieldset.getByTestId(`${type}-address-input-region`).click()
  const optionsList = page.getByRole('listbox') // listbox is a teleport on the page body
  await expect(optionsList).toBeVisible()
  await optionsList.getByRole('option', { name: data.region, exact: true }).click()
  await expect(optionsList).not.toBeVisible()
  await fieldset.getByTestId(`${type}-address-input-postalCode`).fill(data.postalCode)
  await fieldset.getByTestId(`${type}-address-input-locationDescription`).fill(data.locationDescription)
}

export async function selectRoles(page: Page, roles: string[]) {
  const rolesFieldset = page.locator('fieldset').filter({ hasText: 'Roles' })

  for (const role of roles) {
    await rolesFieldset.getByRole('checkbox', { name: role, exact: true }).click({ force: true })
  }
}

export async function openOfficerForm(page: Page, row?: Locator) {
  if (row) { // pass a row to open the form in edit mode
    const changeButton = row.getByRole('button', { name: 'Change' })
    if (await changeButton.isVisible()) { // if no edits or newly added, there will be a change button
      await changeButton.click()
    } else { // if edits to existing officer, need to access change button in more actions menu
      await row.getByRole('button', { name: 'More Actions' }).click()
      await page.getByRole('menuitem', { name: 'Change' }).click()
    }
  } else { // if no row, open new 'Add Officer' form
    await page.getByRole('button', { name: 'Add Officer' }).click()
  }
  // form should be visible after either scenario
  await expect(page.getByTestId('officer-form')).toBeVisible()
}

// must open form before using this as this can be used for the add or edit flow
export async function completeOfficerForm(
  page: Page,
  person: PersonLastNameRequired,
  roles: string[],
  deliveryAddress: ReturnType<typeof getFakeAddress>,
  mailingAddress?: ReturnType<typeof getFakeAddress> | 'same',
  cancel: boolean = false
) {
  const form = page.getByTestId('officer-form')

  // reset all roles before continuing
  const rolesFieldset = page.locator('fieldset').filter({ hasText: 'Roles' })
  const checkedCheckboxes = await rolesFieldset.getByRole('checkbox', { checked: true }).all()
  for (const checkbox of checkedCheckboxes) {
    await checkbox.setChecked(false)
  }

  // fill out name fields
  await fillNameFields(page, person)
  // select roles
  await selectRoles(page, roles)
  // fill out delivery address
  await fillAddress(page, 'delivery', deliveryAddress)
  // fill out mailing address
  if (mailingAddress) {
    if (mailingAddress === 'same') {
      // check mailing same as delivery
      form.getByRole('checkbox', { name: 'Same as Delivery Address' }).click({ force: true })
    } else {
      await fillAddress(page, 'mailing', mailingAddress)
    }
  }

  if (cancel) {
    await form.getByRole('button', { name: 'Cancel' }).click()
  } else {
    await form.getByRole('button', { name: 'Done' }).click()
  }
  // form should be closed
  await expect(form).not.toBeVisible()
}

export async function assertNameTableCell(
  page: Page,
  person: PersonLastNameRequired,
  badges?: Array<'ADDED' | 'REMOVED' | 'NAME CHANGED' | 'ROLES CHANGED' | 'ADDRESS CHANGED'>,
  notBadges?: Array<'ADDED' | 'REMOVED' | 'NAME CHANGED' | 'ROLES CHANGED' | 'ADDRESS CHANGED'>
) {
  const row = getTableRowForPerson(page, person)
  const tableCell = row.getByRole('cell').first()

  if (person.firstName) {
    await expect(tableCell).toContainText(person.firstName.toUpperCase())
  }
  if (person.middleName) {
    await expect(tableCell).toContainText(person.middleName.toUpperCase())
  }
  if (person.lastName) {
    await expect(tableCell).toContainText(person.lastName.toUpperCase())
  }
  if (person.preferredName) {
    await expect(tableCell).toContainText('Preferred Name')
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

export async function assertRoles(page: Page, person: PersonLastNameRequired, roles: string[]) {
  const row = getTableRowForPerson(page, person)
  for (const role of roles) {
    await expect(row.getByRole('cell').nth(1)).toContainText(role)
  }
}

export async function assertAddress(
  page: Page,
  person: PersonLastNameRequired,
  column: 2 | 3,
  address?: ReturnType<typeof getFakeAddress> | 'same'
) {
  const row = getTableRowForPerson(page, person)
  if (!address) {
    await expect(row.getByRole('cell').nth(column)).toContainText('Not Entered')
  } else if (address === 'same') {
    await expect(row.getByRole('cell').nth(column)).toContainText('Same as Delivery Address')
  } else {
    await expect(row.getByRole('cell').nth(column)).toContainText(address.street)
    await expect(row.getByRole('cell').nth(column)).toContainText(address.city)
    const region = address.region.length === 2 // dont convert if region already in iso2 format
      ? address.region
      : provinceSubdivisions.find(province => province.name === address.region)!.code
    await expect(row.getByRole('cell').nth(column)).toContainText(region)
    await expect(row.getByRole('cell').nth(column)).toContainText(address.postalCode)
    await expect(row.getByRole('cell').nth(column)).toContainText('Canada')
    await expect(row.getByRole('cell').nth(column)).toContainText(address.locationDescription)
  }
}
