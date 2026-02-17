import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { navigateToTransitionPage } from '../../test-utils'
import {
  mockCommonApiCallsForFiling,
  getBusinessAddressesMock,
  getPartiesMock,
  getBusinessSettingsMock,
  getShareClassesMock
} from '#test-mocks'
import { TRANP } from '~~/tests/mocks'

const identifier = 'BC1234567'

async function assertCorrectOffices(page: Page) {
  const section = page.getByTestId('office-addresses-section')
  const tbody = section.locator('tbody')
  await expect(tbody).toContainText('Registered Office')
  await expect(tbody).toContainText('Records Office')
  await expect(tbody).not.toContainText('Business Office')
  await expect(tbody).not.toContainText('Custodial Office')
  await expect(tbody).not.toContainText('Liquidation Records Office')

  const rows = tbody.locator('tr')
  await expect(rows).toHaveCount(2)

  const registeredRow = rows.filter({ hasText: 'Registered Office' })
  await expect(registeredRow).toContainText('1800 - 510 West Georgia Street')
  await expect(registeredRow).toContainText('Same as Delivery Address')

  const recordsRow = rows.filter({ hasText: 'Records Office' })
  await expect(recordsRow).toContainText('1800 - 510 West Georgia Street')
  await expect(recordsRow).toContainText('Same as Delivery Address')
}

async function assertCorrectDirectors(page: Page) {
  const section = page.getByTestId('current-directors-section')
  const tbody = section.locator('tbody')

  const rows = tbody.locator('tr')
  await expect(rows).toHaveCount(3)

  const firstRow = rows.filter({ hasText: 'TESTER TESTING' })
  await expect(firstRow).toContainText('5-14505 Boul De Pierrefonds')
  await expect(firstRow).toContainText('Same as Delivery Address')
  await expect(firstRow).toContainText('August 16, 2023 to current')

  const secondRow = rows.filter({ hasText: 'WALLABY WAY' })
  await expect(secondRow).toContainText('7 Wallaby Way')
  await expect(secondRow).toContainText('Same as Delivery Address')
  await expect(secondRow).toContainText('August 16, 2023 to current')

  const thirdRow = rows.filter({ hasText: 'MIHAI DINU TEST' })
  await expect(thirdRow).toContainText('2-940 Blanshard')
  await expect(thirdRow).toContainText('Same as Delivery Address')
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
  expect(classAColumns).toHaveCount(6)
  await expect(classAColumns).toContainText([
    'Class A Voting Common Shares',
    'No Maximum',
    'No Par Value',
    '',
    'Yes'
  ])

  const classDColumns = rows.filter({ hasText: 'Class D Voting Common Shares' }).locator('td')
  expect(classDColumns).toHaveCount(6)
  await expect(classDColumns).toContainText([
    'Class D Voting Common Shares',
    'No Maximum',
    '$1.00',
    'CAD',
    'Yes'
  ])

  const classIColumns = rows.filter({ hasText: 'Class I Non-Voting Preferred Shares' }).locator('td')
  expect(classIColumns).toHaveCount(6)
  await expect(classIColumns).toContainText([
    'Class I Non-Voting Preferred Shares',
    '1000',
    '$1.00',
    'CAD',
    'Yes'
  ])

  const classISeries1Columns = rows.filter({ hasText: 'Class I Series 1 Shares' }).locator('td')
  expect(classISeries1Columns).toHaveCount(6)
  await expect(classISeries1Columns).toContainText([
    'Class I Series 1 Shares',
    '500',
    'No Par Value',
    '',
    'No'
  ])

  const classISeries2Columns = rows.filter({ hasText: 'Class I Series 2 Shares' }).locator('td')
  expect(classISeries2Columns).toHaveCount(6)
  await expect(classISeries2Columns).toContainText([
    'Class I Series 2 Shares',
    '500',
    'No Par Value',
    '',
    'No'
  ])
}

async function assertCommonElements(page: Page, step?: 1 | 2) {
  await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
  // has auth header
  await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
  // has breadcrumb
  await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-breadcrumb-wrapper').getByText(
    'Post Restoration Transition Application')).toBeVisible()
  // has tombstone
  await expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-tombstone-wrapper')
    .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
  ).toBeVisible()
  // has heading
  await expect(page.getByRole('heading', { name: 'Post Restoration Transition Application' })).toBeVisible()
  // has fee summary
  await expect(page.getByTestId('fee-widget')).toBeVisible()
  // has fee summary text
  await expect(page.getByTestId('fee-widget').getByText('Post Restoration Transition Application')).toBeVisible()
  await expect(page.getByTestId('fee-widget').getByText('No Fee')).toBeVisible()
  // has buttons
  await expect(page.getByTestId('connect-button-control')).toBeVisible()
  // has footer
  await expect(page.getByTestId('connect-main-footer')).toBeVisible()
  // has office addresses
  await expect(page.getByTestId('office-addresses-section')).toBeVisible()
  await assertCorrectOffices(page)
  // has directors
  await expect(page.getByTestId('current-directors-section')).toBeVisible()
  await assertCorrectDirectors(page)
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
  test.describe('Staff Only', () => {
    test.beforeEach(async ({ page }) => {
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
        'STAFF'
      )
      await page.route(`**/api/v2/businesses/${identifier}/share-classes`, async (route) => {
        await route.fulfill({ json: getShareClassesMock() })
      })

      await navigateToTransitionPage(page, identifier)
      await page.waitForLoadState('networkidle')
    })

    test('Page elements', async ({ page }) => {
      // step 1
      await assertCommonElements(page)
      // step 2
      await page.getByRole('button', { name: 'Review and Confirm' }).click()
      // should still have common elements
      await assertCommonElements(page, 2)

      // step 2 staff only sections
      await expect(page.getByTestId('court-order-section')).toBeVisible()
      await expect(page.getByTestId('staff-payment-section')).toBeVisible()

      // step 2 client only which should not be visible
      await expect(page.getByTestId('folio-section')).not.toBeVisible()
      await expect(page.getByTestId('certify-section')).not.toBeVisible()
    })
  })

  test.describe('Client Only', () => {
    test.beforeEach(async ({ page }) => {
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
        'PREMIUM'
      )
      await page.route(`**/api/v2/businesses/${identifier}/share-classes`, async (route) => {
        await route.fulfill({ json: getShareClassesMock() })
      })

      await navigateToTransitionPage(page, identifier)
      await page.waitForLoadState('networkidle')
    })

    test('Page elements', async ({ page }) => {
      // step 1
      await assertCommonElements(page)
      // step 2
      await page.getByRole('button', { name: 'Review and Confirm' }).click()
      // should still have common elements
      await assertCommonElements(page, 2)

      // step 2 client only sections
      await expect(page.getByTestId('folio-section')).toBeVisible()
      await expect(page.getByTestId('certify-section')).toBeVisible()

      // step 2 staff only which should not be visible
      await expect(page.getByTestId('court-order-section')).not.toBeVisible()
      await expect(page.getByTestId('staff-payment-section')).not.toBeVisible()
    })
  })
})
