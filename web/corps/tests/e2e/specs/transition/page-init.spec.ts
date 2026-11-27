import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  navigateToTransitionPage,
  assertCommonFilingElements,
  assertOfficeRows,
  assertDirectorCount
} from '../../test-utils'
import {
  mockCommonApiCallsForFiling,
  getBusinessAddressesMock,
  getPartiesMock,
  getBusinessSettingsMock,
  getShareClassesMock
} from '#test-mocks'
import { TRANP } from '~~/tests/mocks'

const identifier = 'BC1234567'

async function assertTransitionOffices(page: Page) {
  await assertOfficeRows(page, {
    present: ['Registered Office', 'Records Office'],
    absent: ['Business Office', 'Custodial Office', 'Liquidation Records Office']
  })

  const rows = page.getByTestId('office-addresses-section').locator('tbody').locator('tr')

  const registeredRow = rows.filter({ hasText: 'Registered Office' })
  await expect(registeredRow).toContainText('1800 - 510 West Georgia Street')
  await expect(registeredRow).toContainText('Same as Mailing Address')

  const recordsRow = rows.filter({ hasText: 'Records Office' })
  await expect(recordsRow).toContainText('1800 - 510 West Georgia Street')
  await expect(recordsRow).toContainText('Same as Mailing Address')
}

async function assertTransitionDirectors(page: Page) {
  await assertDirectorCount(page, 3)

  const rows = page.getByTestId('current-directors-section').locator('tbody').locator('tr')

  const firstRow = rows.filter({ hasText: 'TESTER TESTING' })
  await expect(firstRow).toContainText('5-14505 Boul De Pierrefonds')
  await expect(firstRow).toContainText('Same as Mailing Address')
  await expect(firstRow).toContainText('August 16, 2023 to current')

  const secondRow = rows.filter({ hasText: 'WALLABY WAY' })
  await expect(secondRow).toContainText('7 Wallaby Way')
  await expect(secondRow).toContainText('Same as Mailing Address')
  await expect(secondRow).toContainText('August 16, 2023 to current')

  const thirdRow = rows.filter({ hasText: 'MIHAI DINU TEST' })
  await expect(thirdRow).toContainText('2-940 Blanshard')
  await expect(thirdRow).toContainText('Same as Mailing Address')
  await expect(thirdRow).toContainText('July 12, 2023 to current')
}

async function assertDocumentDelivery(page: Page) {
  const section = page.getByTestId('document-delivery-section')
  await expect(section).toContainText(getBusinessSettingsMock().contacts[0]!.email)
}

async function assertCorrectShareStructure(page: Page) {
  const section = page.getByTestId('share-structure-section')
  const tbody = section.locator('tbody')

  const rows = tbody.locator('tr')

  const classAColumns = rows.filter({ hasText: 'Class A Voting Common Shares' }).locator('td')
  await expect(classAColumns).toHaveCount(6)
  await expect(classAColumns).toContainText([
    'Class A Voting Common Shares',
    'No Maximum',
    'No Par Value',
    '',
    'Yes'
  ])

  const classDColumns = rows.filter({ hasText: 'Class D Voting Common Shares' }).locator('td')
  await expect(classDColumns).toHaveCount(6)
  await expect(classDColumns).toContainText([
    'Class D Voting Common Shares',
    'No Maximum',
    '$1.00',
    'CAD',
    'Yes'
  ])

  const classIColumns = rows.filter({ hasText: 'Class I Non-Voting Preferred Shares' }).locator('td')
  await expect(classIColumns).toHaveCount(6)
  await expect(classIColumns).toContainText([
    'Class I Non-Voting Preferred Shares',
    '1000',
    '$1.00',
    'CAD',
    'Yes'
  ])

  const classISeries1Columns = rows.filter({ hasText: 'Class I Series 1 Shares' }).locator('td')
  await expect(classISeries1Columns).toHaveCount(6)
  await expect(classISeries1Columns).toContainText([
    'Class I Series 1 Shares',
    '500',
    'No Par Value',
    '',
    'No'
  ])

  const classISeries2Columns = rows.filter({ hasText: 'Class I Series 2 Shares' }).locator('td')
  await expect(classISeries2Columns).toHaveCount(6)
  await expect(classISeries2Columns).toContainText([
    'Class I Series 2 Shares',
    '500',
    'No Par Value',
    '',
    'No'
  ])
}

async function assertTransitionElements(page: Page, step?: 1 | 2) {
  await assertCommonFilingElements(page, { title: 'Post Restoration Transition Application', isNoFee: true })
  // has office addresses
  await expect(page.getByTestId('office-addresses-section')).toBeVisible()
  await assertTransitionOffices(page)
  // has directors
  await expect(page.getByTestId('current-directors-section')).toBeVisible()
  await assertTransitionDirectors(page)
  // has share structure
  await expect(page.getByTestId('share-structure-section')).toBeVisible()
  await assertCorrectShareStructure(page)

  // common for staff and client per step assertions
  // add as necessary
  if (step === 2) {
    await expect(page.getByTestId('provisions-section')).toBeVisible()
    await assertDocumentDelivery(page)
  }
}

test.describe('Transition - Page init', () => {
  const testCases = [
    {
      testName: 'Non-staff',
      isStaff: false
    },
    {
      testName: 'Staff',
      isStaff: true
    }
  ]

  testCases.forEach(({ testName, isStaff }) => {
    test(testName, async ({ page }) => {
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
        isStaff ? 'STAFF' : 'PREMIUM',
        getShareClassesMock()
      )
      await navigateToTransitionPage(page, identifier)
      await page.waitForLoadState('networkidle')

      // step 1
      await assertTransitionElements(page)
      await page.getByRole('checkbox', {
        name: 'I confirm that the office address information listed for this business is correct.'
      }).check()
      await page.getByRole('checkbox', {
        name: 'I confirm that the director information listed for this business is correct.'
      }).check()
      // step 2
      await page.getByRole('button', { name: 'Review and Confirm' }).click()
      // should still have common elements
      await assertTransitionElements(page, 2)

      // step 2 staff only sections
      if (isStaff) {
        await expect(page.getByTestId('staff-payment-section')).toBeVisible()

        // step 2 client only which should not be visible
        await expect(page.getByTestId('folio-section')).not.toBeVisible()
        await expect(page.getByTestId('certify-section')).not.toBeVisible()
      } else {
        // step 2 client only sections
        await expect(page.getByTestId('folio-section')).toBeVisible()
        await expect(page.getByTestId('certify-section')).toBeVisible()

        // step 2 staff only which should not be visible
        await expect(page.getByTestId('staff-payment-section')).not.toBeVisible()
      }
    })
  })
})
