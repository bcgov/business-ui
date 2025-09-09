import { test, expect } from '@playwright/test'
import type { Page, Locator } from '@playwright/test'
import { getFakeAddress, getFakePerson, getRandomRoles, provinceSubdivisions } from '../test-utils'
// import { scanA11y } from '../test-utils/a11y'
import { NOCOI, businessBC1234567, tasksBC1234567, authInfoBC1234567, partiesBC1234567 } from '~~/tests/mocks'

// TODO: fix a11y checks
// await scanA11y(page, ['#connect-system-banner', '#business-filing-tombstone'])

async function fillAddress(page: Page, type: 'mailing' | 'delivery', data: ReturnType<typeof getFakeAddress>) {
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

async function fillNameFields(page: Page, person: ReturnType<typeof getFakePerson>) {
  await page.getByTestId('first-name-input').fill(person.firstName)
  await page.getByTestId('middle-name-input').fill(person.middleName)
  await page.getByTestId('last-name-input').fill(person.lastName)
  await page.getByRole('checkbox', { name: 'This person also has another name they prefer to use' }).click()
  await page.getByTestId('preferred-name-input').fill(person.preferredName)
}

async function selectRoles(page: Page, roles: string[]) {
  const rolesFieldset = page.locator('fieldset').filter({ hasText: 'Roles' })

  for (const role of roles) {
    await rolesFieldset.getByRole('checkbox', { name: role, exact: true }).click({ force: true })
  }
}

async function completeOfficerForm(
  page: Page,
  person: ReturnType<typeof getFakePerson>,
  roles: string[],
  deliveryAddress: ReturnType<typeof getFakeAddress>,
  mailingAddress?: ReturnType<typeof getFakeAddress> | 'same'
) {
  // open form
  await page.getByRole('button', { name: 'Add Officer' }).click()
  const form = page.getByTestId('officer-form')
  await expect(form).toBeVisible()

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

  // submit form
  await form.getByRole('button', { name: 'Done' }).click()
  // form should be closed
  await expect(page.getByTestId('officer-form')).not.toBeVisible()
}

function getTableRowForPerson(
  page: Page,
  lastName: string
) {
  const table = page.getByRole('table')
  expect(table).toBeDefined()
  const row = table.getByRole('row').filter({ hasText: lastName.toUpperCase() })
  expect(row).toBeDefined()
  return row
}

async function assertNameFields(row: Locator, person: ReturnType<typeof getFakePerson>) {
  await expect(row.getByRole('cell').nth(0)).toContainText(person.firstName.toUpperCase())
  await expect(row.getByRole('cell').nth(0)).toContainText(person.middleName.toUpperCase())
  await expect(row.getByRole('cell').nth(0)).toContainText(person.lastName.toUpperCase())
  await expect(row.getByRole('cell').nth(0)).toContainText('Preferred Name')
  await expect(row.getByRole('cell').nth(0)).toContainText('ADDED')
}

async function assertRoles(row: Locator, roles: string[]) {
  roles.forEach(async (role) => {
    await expect(row.getByRole('cell').nth(1)).toContainText(role)
  })
}

async function assertAddress(row: Locator, column: 2 | 3, address?: ReturnType<typeof getFakeAddress> | 'same') {
  if (!address) {
    await expect(row.getByRole('cell').nth(column)).toContainText('Not Entered')
  } else if (address === 'same') {
    await expect(row.getByRole('cell').nth(column)).toContainText('Same as Delivery Address')
  } else {
    await expect(row.getByRole('cell').nth(column)).toContainText(address.street)
    await expect(row.getByRole('cell').nth(column)).toContainText(address.city)
    const region = provinceSubdivisions.find(province => province.name === address.region)
    await expect(row.getByRole('cell').nth(column)).toContainText(region!.code)
    await expect(row.getByRole('cell').nth(column)).toContainText(address.postalCode)
    await expect(row.getByRole('cell').nth(column)).toContainText('Canada')
    await expect(row.getByRole('cell').nth(column)).toContainText(address.locationDescription)
  }
}

test.describe('Editing Officers', () => {
  test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  const identifier = 'BC1234567'
  const initialOfficer = partiesBC1234567.parties[0]!

  test.beforeEach(async ({ page }) => {
    await page.route(`*/**/entities/${identifier}`, route => route.fulfill({ json: authInfoBC1234567 }))
    await page.route(`*/**/businesses/${identifier}`, route => route.fulfill({ json: businessBC1234567 }))
    await page.route(`*/**/businesses/${identifier}/tasks`, route => route.fulfill({ json: tasksBC1234567 }))
    await page.route('*/**/fees/**/NOCOI', route => route.fulfill({ json: NOCOI }))
    await page.route(`*/**/businesses/${identifier}/parties?classType=officer`, async (route) => {
      await route.fulfill({ json: partiesBC1234567 })
    })
    await page.route(`*/**/businesses/${identifier}/filings`, route => route.fulfill({ status: 201 }))
    await page.goto(`./en-CA/officer-change/${identifier}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Officer Change').first()).toBeVisible()
  })

  test('should edit multiple fields of an existing officer', async ({ page }) => {
    const updatedPerson = getFakePerson()
    const updatedRoles = getRandomRoles()
    const updatedAddress = getFakeAddress()

    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)
    await expect(row).toBeVisible()

    await row.getByRole('button', { name: 'Change' }).click()
    const form = page.getByTestId('officer-form')
    await expect(form).toBeVisible()

    // edit first name and last name only
    await form.getByLabel('First Name').fill(updatedPerson.firstName)
    await form.getByLabel('Last Name').fill(updatedPerson.lastName)
    // edit roles
    await selectRoles(page, updatedRoles)
    // edit delivery address - do not edit mailing (mailing will be cleared when delivery changes)
    await fillAddress(page, 'delivery', updatedAddress)
    // submit form
    await form.getByRole('button', { name: 'Done' }).click()

    const updatedRow = getTableRowForPerson(page, updatedPerson.lastName)
    await expect(updatedRow).toBeVisible()
    await expect(updatedRow.getByRole('cell').nth(0)).toContainText(updatedPerson.firstName.toUpperCase())
    await expect(updatedRow.getByRole('cell').nth(0)).toContainText(initialOfficer.officer.middleInitial.toUpperCase())
    await expect(updatedRow.getByRole('cell').nth(0)).toContainText(updatedPerson.lastName.toUpperCase())
    await expect(updatedRow.getByRole('cell').nth(0)).toContainText('NAME CHANGED')
    await expect(updatedRow.getByRole('cell').nth(0)).toContainText('ROLES CHANGED')
    await expect(updatedRow.getByRole('cell').nth(0)).toContainText('ADDRESS CHANGED')

    // delivery should be updated
    await assertAddress(updatedRow, 2, updatedAddress)
    // mailing should be empty
    await assertAddress(updatedRow, 3, undefined)

    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page).toHaveURL(/.*business-dashboard.*/)
  })

  test('should cancel an edit without saving changes', async ({ page }) => {
    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)
    const originalName = initialOfficer.officer.firstName
    const editedName = 'Edited Name'

    await row.getByRole('button', { name: 'Change' }).click()
    const form = page.getByTestId('officer-form')
    await form.getByLabel('First Name').fill(editedName)
    await form.getByRole('button', { name: 'Cancel' }).click()

    await expect(form).not.toBeVisible()

    await expect(row.getByRole('cell').first()).toContainText(originalName.toUpperCase())
    await expect(row.getByRole('cell').first()).not.toContainText(editedName)
    await expect(row.getByRole('cell').first()).not.toContainText('NAME CHANGED')
  })

  test('should be able to remove an existing officer', async ({ page }) => {
    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)

    await row.getByRole('button', { name: 'Change' }).click()
    const form = page.getByTestId('officer-form')
    await form.getByLabel('First Name').fill('Edited Name')
    await form.getByRole('button', { name: 'Done' }).click()

    await expect(row.getByRole('cell').first()).toContainText('NAME CHANGED')

    await row.getByRole('button', { name: 'More Actions' }).click()
    await page.getByRole('menuitem', { name: 'Remove' }).click()

    await expect(row).toContainText('REMOVED')

    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page).toHaveURL(/.*business-dashboard.*/)
  })

  test('should be able to undo edits to original state', async ({ page }) => {
    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)

    // edit/assert address once
    const newAddress1 = getFakeAddress()
    await row.getByRole('button', { name: 'Change' }).click()
    await expect(page.getByTestId('officer-form')).toBeVisible()
    await fillAddress(page, 'delivery', newAddress1)
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(row.getByRole('cell').nth(2)).toContainText(newAddress1.street)
    await assertAddress(row, 2, newAddress1)
    await expect(row.getByRole('cell').nth(0)).toContainText('ADDRESS CHANGED')
    // edit/assert address a second time
    const newAddress2 = getFakeAddress()
    await row.getByRole('button', { name: 'More Actions' }).click()
    await page.getByRole('menuitem', { name: 'Change' }).click()
    await expect(page.getByTestId('officer-form')).toBeVisible()
    await fillAddress(page, 'delivery', newAddress2)
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(row.getByRole('cell').nth(2)).toContainText(newAddress2.street)
    await expect(row.getByRole('cell').nth(0)).toContainText('ADDRESS CHANGED')

    // undo changes
    await row.getByRole('button', { name: 'Undo' }).click()

    // address should have initial state
    await expect(row.getByRole('cell').nth(2)).not.toContainText(newAddress1.street)
    await expect(row.getByRole('cell').nth(2)).not.toContainText(newAddress2.street)
    await expect(row.getByRole('cell').nth(2)).toContainText(initialOfficer.deliveryAddress.streetAddress)
    // name column shouldnt have ADDRESS CHANGED badge anymore
    await expect(row.getByRole('cell').nth(0)).not.toContainText('ADDRESS CHANGED')
  })

  test('should only have "ADDED" badge when editing a new officer', async ({ page }) => {
    // start with no existing parties
    await page.route(`*/**/businesses/${identifier}/parties?classType=officer`, async (route) => {
      await route.fulfill({ json: { parties: [] } })
    })

    const person = getFakePerson()
    const roles = getRandomRoles()
    const deliveryAddress = getFakeAddress()

    // add new officer
    await completeOfficerForm(page, person, roles, deliveryAddress)

    const row = getTableRowForPerson(page, person.lastName)

    // assert table state
    await assertNameFields(row, person)
    await assertRoles(row, roles)
    await assertAddress(row, 2, deliveryAddress)
    await expect(row.getByRole('cell').nth(0)).toContainText('ADDED')

    // edit/assert address
    const newAddress = getFakeAddress()
    await row.getByRole('button', { name: 'Change' }).click()
    await expect(page.getByTestId('officer-form')).toBeVisible()
    await fillAddress(page, 'delivery', newAddress)
    await page.getByRole('button', { name: 'Done' }).click()
    await assertAddress(row, 2, newAddress)
    await expect(row.getByRole('cell').nth(0)).toContainText('ADDED')
    await expect(row.getByRole('cell').nth(0)).not.toContainText('ADDRESS CHANGED')

    // edit/assert name
    const newPerson = getFakePerson()
    await row.getByRole('button', { name: 'Change' }).click()
    await expect(page.getByTestId('officer-form')).toBeVisible()
    await page.getByTestId('first-name-input').fill(newPerson.firstName)
    await page.getByRole('button', { name: 'Done' }).click()
    await assertNameFields(row, { ...person, firstName: newPerson.firstName })
    await expect(row.getByRole('cell').nth(0)).toContainText('ADDED')
    await expect(row.getByRole('cell').nth(0)).not.toContainText('NAME CHANGED')

    // edit/roles name
    const newRoles = getRandomRoles()
    await row.getByRole('button', { name: 'Change' }).click()
    await expect(page.getByTestId('officer-form')).toBeVisible()
    await selectRoles(page, newRoles)
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(row.getByRole('cell').nth(0)).toContainText('ADDED')
    await expect(row.getByRole('cell').nth(0)).not.toContainText('ROLES CHANGED')
  })
})
