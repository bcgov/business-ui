import { test, expect } from '@playwright/test'
import type { Page, Locator } from '@playwright/test'
import { getFakeAddress, getFakePerson, getRandomRoles, provinceSubdivisions } from '../test-utils'
// import { scanA11y } from '../test-utils/a11y'
import { NOCOI, businessBC1234567, tasksBC1234567, authInfoBC1234567 } from '~~/tests/mocks'

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

function getTableRowForPerson(page: Page, person: ReturnType<typeof getFakePerson>) {
  const table = page.getByRole('table')
  expect(table).toBeDefined()
  const row = table.getByRole('row').filter({ hasText: person.lastName.toUpperCase() })
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

test.describe('Adding Officers', () => {
  test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  const identifier = 'BC1234567'

  test.beforeEach(async ({ page }) => {
    // mock all api calls
    await page.route(`*/**/entities/${identifier}`, async (route) => {
      await route.fulfill({ json: authInfoBC1234567 })
    })
    await page.route(`*/**/businesses/${identifier}`, async (route) => {
      await route.fulfill({ json: businessBC1234567 })
    })
    await page.route(`*/**/businesses/${identifier}/tasks`, async (route) => {
      await route.fulfill({ json: tasksBC1234567 })
    })
    await page.route(`*/**/businesses/${identifier}/parties?classType=officer`, async (route) => {
      await route.fulfill({ json: { parties: [] } })
    })
    await page.route('*/**/fees/**/NOCOI', async (route) => {
      await route.fulfill({ json: NOCOI })
    })
    await page.route(`*/**/businesses/${identifier}/filings`, async (route) => {
      await route.fulfill({ status: 201 })
    })

    // go to officer change page
    await page.goto(`./en-CA/officer-change/${identifier}`)
    await page.waitForLoadState('networkidle')

    // wait for page to be visible
    await expect(page.getByText('Officer Change').first()).toBeVisible()
  })

  test('submit single officer, multiple roles, delivery/mailing address equal', async ({ page }) => {
    // get random test data
    const person = getFakePerson()
    const roles = getRandomRoles()
    const deliveryAddress = getFakeAddress()

    await completeOfficerForm(
      page,
      person,
      roles,
      deliveryAddress,
      'same'
    )

    // assert table data
    const row = getTableRowForPerson(page, person)
    assertNameFields(row, person)
    assertRoles(row, roles)
    assertAddress(row, 2, deliveryAddress)
    assertAddress(row, 3, 'same')

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should be redirected to dashboard page
    await expect(page).toHaveURL(/.*business-dashboard.*/)
    expect(page.getByText(businessBC1234567.business.legalName).first()).toBeDefined()
  })

  test('submit multiple officers, multiple roles, different delivery/mailing addresses', async ({ page }) => {
    // get random test data
    const person1 = getFakePerson()
    const roles1 = getRandomRoles()
    const deliveryAddress1 = getFakeAddress()
    const mailingAddress1 = getFakeAddress()
    const person2 = getFakePerson()
    const roles2 = getRandomRoles()
    const deliveryAddress2 = getFakeAddress()
    const mailingAddress2 = getFakeAddress()

    await completeOfficerForm(
      page,
      person1,
      roles1,
      deliveryAddress1,
      mailingAddress1
    )
    await completeOfficerForm(
      page,
      person2,
      roles2,
      deliveryAddress2,
      mailingAddress2
    )

    // assert table columns for first officer
    const row1 = getTableRowForPerson(page, person1)
    assertNameFields(row1, person1)
    assertRoles(row1, roles1)
    assertAddress(row1, 2, deliveryAddress1)
    assertAddress(row1, 3, mailingAddress1)
    // assert table columns for second officer
    const row2 = getTableRowForPerson(page, person2)
    assertNameFields(row2, person2)
    assertRoles(row2, roles2)
    assertAddress(row2, 2, deliveryAddress2)
    assertAddress(row2, 3, mailingAddress2)

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should be redirected to dashboard page
    await expect(page).toHaveURL(/.*business-dashboard.*/)
    expect(page.getByText(businessBC1234567.business.legalName).first()).toBeDefined()
  })

  test('should allow canceling the form without adding an officer', async ({ page }) => {
    // get random test data
    const person = getFakePerson()
    const roles = getRandomRoles()
    const deliveryAddress = getFakeAddress()

    // // open form
    await page.getByRole('button', { name: 'Add Officer' }).click()
    const form = page.getByTestId('officer-form')
    await expect(form).toBeVisible()

    // fill out name fields
    await fillNameFields(page, person)
    // select roles
    await selectRoles(page, roles)
    // fill out delivery address
    await fillAddress(page, 'delivery', deliveryAddress)

    // cancel form
    await form.getByRole('button', { name: 'Cancel' }).click()
    // form should be closed
    await expect(page.getByTestId('officer-form')).not.toBeVisible()

    // assert officer not added to table
    const table = page.getByRole('table')
    expect(table).toBeDefined()
    const row = table.getByRole('row').filter({ hasText: person.lastName.toUpperCase() })
    expect(row).toHaveCount(0)

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should display error/alert text stating no data to submit
    await expect(page.getByTestId('business-filing-button-control')).toContainText('There are no changes to submit.')
  })

  test('should be able to remove a newly added officer', async ({ page }) => {
    // complete form
    const person = getFakePerson()
    await completeOfficerForm(page, person, ['President'], getFakeAddress(), 'same')
    const row = getTableRowForPerson(page, person)
    await expect(row).toBeVisible()

    // open more actions button, select remove
    await row.getByRole('button', { name: 'More Actions' }).click()
    await page.getByRole('menuitem', { name: 'Remove' }).click()

    await expect(row).not.toBeVisible()

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should display error/alert text stating no data to submit
    await expect(page.getByTestId('business-filing-button-control')).toContainText('There are no changes to submit.')
  })

  test('should display an error modal if the filing POST request fails', async ({ page }) => {
    const person = getFakePerson()
    await completeOfficerForm(page, person, ['Secretary'], getFakeAddress(), 'same')

    await page.route(`*/**/businesses/${identifier}/filings`, async (route) => {
      await route.fulfill({ status: 500, json: { message: 'Internal Server Error' } })
    })

    await page.getByRole('button', { name: 'Submit' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('An Error Occurred')
    await expect(modal)
      .toContainText("We couldn't complete your request due to an internal error. Please try again later.")
    await expect(page).not.toHaveURL(/.*business-dashboard.*/)
  })

  test('should submit with the minumum required info', async ({ page }) => {
    const person = getFakePerson()
    const roles = ['Chief Executive Officer']
    const deliveryAddress = getFakeAddress()

    // open form
    await page.getByRole('button', { name: 'Add Officer' }).click()
    const form = page.getByTestId('officer-form')
    await expect(form).toBeVisible()

    // fill out last name only
    await page.getByTestId('last-name-input').fill(person.lastName)
    // select 1 role only
    await selectRoles(page, roles)
    // fill out delivery address - DO NOT fill out mailing address
    await fillAddress(page, 'delivery', deliveryAddress)

    // submit form
    await form.getByRole('button', { name: 'Done' }).click()
    // form should be closed
    await expect(page.getByTestId('officer-form')).not.toBeVisible()

    // assert table columns
    const row = getTableRowForPerson(page, person)
    await expect(row.getByRole('cell').nth(0)).not.toContainText(person.firstName.toUpperCase())
    await expect(row.getByRole('cell').nth(0)).not.toContainText(person.middleName.toUpperCase())
    await expect(row.getByRole('cell').nth(0)).toContainText(person.lastName.toUpperCase())
    await expect(row.getByRole('cell').nth(0)).not.toContainText('Preferred Name')
    await expect(row.getByRole('cell').nth(0)).toContainText('ADDED')
    assertRoles(row, roles)
    assertAddress(row, 2, deliveryAddress)
    assertAddress(row, 3, undefined)

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should be redirected to dashboard page
    await expect(page).toHaveURL(/.*business-dashboard.*/)
    expect(page.getByText(businessBC1234567.business.legalName).first()).toBeDefined()
  })
})
