import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { navigateToTransitionPage } from '../../test-utils'
import { fillOutCertify, fillOutFolio } from '#business/tests/e2e/test-utils'
import {
  mockCommonApiCallsForFiling,
  getBusinessAddressesMock,
  getPartiesMock,
  getShareClassesMock
} from '#test-mocks'
import { TRANP } from '~~/tests/mocks'

const identifier = 'BC1234567'

const staffHeaderPayload = {
  name: 'transition',
  certifiedBy: 'TestFirst TestLast',
  accountId: 1234,
  date: new Date().toISOString().split('T')[0],
  staffPaymentOption: 'BCOL',
  waiveFees: false,
  bcolAccountNumber: '123456',
  datNumber: 'C1234567',
  folioNumber: 'test-folio-123',
  priority: true
}

const clientHeaderPayload = {
  name: 'transition',
  certifiedBy: 'John Smith',
  accountId: 1222,
  date: new Date().toISOString().split('T')[0],
  folioNumber: 'client-folio-123'
}

const contactPoint = { email: 'comp-party@example.com' }

async function setupPage(page: Page, accountType: 'STAFF' | 'PREMIUM') {
  await mockCommonApiCallsForFiling(
    page,
    identifier,
    getPartiesMock([
      { index: 0, key: 'roleType', value: 'Director' },
      { index: 1, key: 'roleType', value: 'Director' },
      { index: 2, key: 'roleType', value: 'Director' }
    ]),
    TRANP,
    getBusinessAddressesMock(),
    accountType,
    getShareClassesMock()
  )
  await navigateToTransitionPage(page, identifier)
  await page.waitForLoadState('networkidle')
}

async function confirmOffices(page: Page) {
  await page.getByRole('checkbox', {
    name: 'I confirm that the office address information listed for this business is correct.'
  }).check()
}

async function editAndConfirmDirectors(page: Page) {
  const directors = page.getByTestId('current-directors-section').locator('tbody')
  const rowToEdit = directors.locator('tr').filter({ hasText: 'WALLABY WAY ' })
  await rowToEdit.getByRole('button', { name: 'Change' }).click()
  await directors.getByTestId('delivery-address-input-streetAdditional').fill('Unit 1A')
  await directors.getByRole('button', { name: 'Done' }).click()

  await page.getByRole('checkbox', {
    name: 'I confirm that the director information listed for this business is correct.'
  }).check()
}

async function editShares(page: Page) {
  const shares = page.getByTestId('share-structure-section')
  await shares.getByRole('button', { name: 'Add Share Class' }).click()

  const addForm = page.getByTestId('add-share-class-form')
  await expect(addForm).toBeVisible()

  await addForm.getByTestId('share-class-name-input').fill('New Class')
  await addForm.getByTestId('max-number-shares-input').fill('1000')
  await addForm.getByTestId('par-value-input').fill('1.35')
  const currencyInput = addForm.getByTestId('par-value-currency-input')
  await currencyInput.click()
  await page.getByRole('option', { name: 'CAD' }).click()
  await addForm.getByRole('checkbox', { name: 'This share class has special rights or restrictions' }).check()
  await addForm.getByRole('button', { name: 'Done' }).click()
  await expect(addForm).not.toBeVisible()

  const newRow = shares.getByRole('row').filter({ hasText: 'New Class Shares' })
  await newRow.getByLabel('More Actions').click()
  await page.getByRole('menuitem', { name: 'Add Series' }).click()

  const addSeriesForm1 = page.getByTestId('add-share-series-form')
  await expect(addSeriesForm1).toBeVisible()
  await addSeriesForm1.getByTestId('share-series-name-input').fill('New Series 1')
  await addSeriesForm1.getByTestId('max-number-shares-input').fill('500')
  await addSeriesForm1.getByRole('checkbox', { name: 'This share class has special rights or restrictions' }).check()
  await addSeriesForm1.getByRole('button', { name: 'Done' }).click()
  await expect(addSeriesForm1).not.toBeVisible()

  await newRow.getByLabel('More Actions').click()
  await page.getByRole('menuitem', { name: 'Add Series' }).click()

  const addSeriesForm2 = page.getByTestId('add-share-series-form')
  await expect(addSeriesForm2).toBeVisible()
  await addSeriesForm2.getByTestId('share-series-name-input').fill('New Series 2')
  await addSeriesForm2.getByTestId('max-number-shares-input').fill('500')
  await addSeriesForm2.getByRole('checkbox', { name: 'This share class has special rights or restrictions' }).check()
  await addSeriesForm2.getByRole('button', { name: 'Done' }).click()
  await expect(addSeriesForm2).not.toBeVisible()

  const classIRow = shares.getByRole('row').filter({ hasText: 'Class I Non-Voting Preferred Shares' })
  await classIRow.getByLabel('More Actions').click()
  await page.getByRole('menuitem', { name: 'Remove' }).click()
  await page.locator('div')
    .filter({ hasText: 'Remove Share Class with Series' })
    .getByRole('button', { name: 'Remove' })
    .click()

  const classFRow = shares.getByRole('row').filter({ hasText: 'Class F Non-Voting Preferred Shares' })
  await classFRow.getByRole('button', { name: 'Change' }).click()

  const editForm = page.getByTestId('edit-share-class-form')
  await expect(editForm).toBeVisible()

  await editForm.getByRole('radio', { name: 'Maximum Number of Shares' }).click()
  await editForm.getByTestId('max-number-shares-input').fill('341')
  await editForm.getByRole('radio', { name: 'Par Value' }).first().click()
  await editForm.getByTestId('par-value-input').fill('0.123456')
  await editForm.getByTestId('par-value-currency-input').click()
  await page.getByRole('option', { name: 'CAD' }).click()
  await editForm.getByRole('button', { name: 'Done' }).click()
  await expect(editForm).not.toBeVisible()

  const classHRow = shares.getByRole('row').filter({ hasText: 'Class H Voting Preferred Shares' })
  for (let i = 0; i < 8; i++) {
    await classHRow.getByLabel('More Actions').click()
    await page.getByRole('menuitem', { name: 'Move Up' }).click()
  }
}

async function goToReview(page: Page) {
  await page.getByRole('button', { name: 'Review and Confirm' }).click()
}

async function fillCompletingParty(page: Page) {
  await page.getByTestId('completing-party-email-input').fill(contactPoint.email)
}

function assertTransitionPayload(requestBody: FilingSubmissionBody<{ transition: TransitionPayload }>) {
  const filing = requestBody.filing
  expect(filing.transition.offices).toHaveProperty('recordsOffice')
  expect(filing.transition.offices).toHaveProperty('registeredOffice')
  expect(filing.transition.offices.registeredOffice.deliveryAddress!.addressCity).toBe('Vancouver')

  expect(filing.transition.contactPoint).toEqual(contactPoint)

  expect(filing.transition.relationships).toHaveLength(3)
  expect(filing.transition.relationships[1]?.deliveryAddress.streetAddressAdditional).toEqual('Unit 1A')

  const classes = filing.transition.shareStructure.shareClasses
  expect(classes).toHaveLength(9)

  const getByName = (name: string) => classes.find(c => c.name === name)
  expect(getByName('New Class Shares')!.actions).toContain('ADDED')
  expect(getByName('Class F Non-Voting Preferred Shares')!.actions).toContain('CHANGED')
  expect(getByName('Class A Voting Common Shares')!.actions).toEqual([])
  expect(getByName('Class I Non-Voting Preferred Shares')).toBeUndefined()

  const order = classes.map(c => ({ name: c.name, priority: c.priority }))
  expect(order).toContainEqual({ name: 'Class H Voting Preferred Shares', priority: 1 })
  expect(order).toContainEqual({ name: 'New Class Shares', priority: 2 })
  expect(order).toContainEqual({ name: 'Class A Voting Common Shares', priority: 3 })
  expect(order).toContainEqual({ name: 'Class B Voting Common Shares', priority: 4 })
  expect(order).toContainEqual({ name: 'Class C Non-Voting Common Shares', priority: 5 })
  expect(order).toContainEqual({ name: 'Class D Voting Common Shares', priority: 6 })
  expect(order).toContainEqual({ name: 'Class E Non-Voting Preferred Shares', priority: 7 })
  expect(order).toContainEqual({ name: 'Class F Non-Voting Preferred Shares', priority: 8 })
  expect(order).toContainEqual({ name: 'Class G Non-Voting Preferred Shares', priority: 9 })

  const newClass = getByName('New Class Shares')
  expect(newClass).toMatchObject({
    actions: ['ADDED'],
    hasParValue: true,
    hasMaximumShares: true,
    hasRightsOrRestrictions: true
  })

  const newClassSeries = newClass!.series
  expect(newClassSeries).toHaveLength(2)
  expect(newClassSeries[0]!.actions).toContain('ADDED')

  expect(newClassSeries).toContainEqual(expect.objectContaining({
    name: 'New Series 1 Shares',
    priority: 2
  }))
  expect(newClassSeries).toContainEqual(expect.objectContaining({
    name: 'New Series 2 Shares',
    priority: 1
  }))

  const classB = getByName('Class B Voting Common Shares')!
  expect(classB.series).toHaveLength(2)
  expect(classB.series[0]!.actions).toEqual([])
  expect(classB.series[1]!.actions).toEqual([])

  const classF = getByName('Class F Non-Voting Preferred Shares')!
  expect(classF).toMatchObject({
    hasParValue: true,
    hasMaximumShares: true,
    parValue: 0.123456,
    currency: 'CAD',
    maxNumberOfShares: 341
  })

  const unchangedClasses = [
    'Class B Voting Common Shares',
    'Class C Non-Voting Common Shares',
    'Class D Voting Common Shares',
    'Class E Non-Voting Preferred Shares',
    'Class G Non-Voting Preferred Shares'
  ]

  for (const className of unchangedClasses) {
    const cls = getByName(className)
    expect(cls!.actions).toEqual([])
  }
}

async function assertFinalRedirect(page: Page) {
  // should be redirected to business dashboard on success
  await page.waitForURL(
    `${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}**`,
    { timeout: 5000 }
  )
  expect(page.url()).toContain(`${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}${identifier}`)
}

const testCases = [
  {
    type: 'Staff',
    accountType: 'STAFF' as const,
    header: staffHeaderPayload,
    accountSpecificStep2Actions: async (page: Page) => {
      await page.getByRole('radio', { name: 'BC OnLine' }).click()
      await page.getByTestId('bcolnumberinput').fill(staffHeaderPayload.bcolAccountNumber)
      await page.getByTestId('datnumberinput').fill(staffHeaderPayload.datNumber)
      await page.getByTestId('folionumber').fill(staffHeaderPayload.folioNumber)
      await page.getByRole('checkbox', { name: 'Priority (Add $100.00)' }).check()
    }
  },
  {
    type: 'Client',
    accountType: 'PREMIUM' as const,
    header: clientHeaderPayload,
    accountSpecificStep2Actions: async (page: Page) => {
      await fillOutFolio(page, clientHeaderPayload.folioNumber)
      await fillOutCertify(page, clientHeaderPayload.certifiedBy)
    }
  }
]

test.describe('Transition - Filing Submit', () => {
  for (const { type, accountType, header, accountSpecificStep2Actions } of testCases) {
    test(type, async ({ page }) => {
      await setupPage(page, accountType)
      await confirmOffices(page)
      await editAndConfirmDirectors(page)
      await editShares(page)
      await goToReview(page)
      await fillCompletingParty(page)
      await accountSpecificStep2Actions(page)

      const submitRequest = page.waitForRequest(`**/businesses/${identifier}/filings`, { timeout: 10000 })
      await page.getByRole('button', { name: 'Submit' }).click()
      const request = await submitRequest
      const requestBody = request.postDataJSON() as FilingSubmissionBody<{ transition: TransitionPayload }>

      expect(requestBody.filing.header).toEqual(header)
      assertTransitionPayload(requestBody)
      await assertFinalRedirect(page)
    })
  }
})
