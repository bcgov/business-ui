import { test, expect } from '@playwright/test'
import { AuthorizedAction } from '#business/app/enums/authorized-action'
import {
  mockCommonApiCallsForFiling,
  getBusinessAddressesMock,
  getBusinessMock,
  getPartiesMock,
  getPermissionsMock
} from '#test-mocks'

const identifier = 'BC1234567'
const taskMessage = 'Finish this task before making other changes.'

test.describe('Review Imported Data - task guards', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApiCallsForFiling(
      page,
      identifier,
      getPartiesMock([{ index: 0, key: 'roleType', value: 'Director' }]),
      undefined,
      getBusinessAddressesMock()
    )
    // the shared business and permissions mocks do not include this filing, later routes take precedence
    const { business } = getBusinessMock([{ key: 'identifier', value: identifier }])
    await page.route(`**/api/v2/businesses/${identifier}`, async (route) => {
      await route.fulfill({
        json: {
          business: {
            ...business,
            allowedActions: {
              digitalBusinessCard: false,
              filing: {
                filingSubmissionLink: '',
                filingTypes: [
                  { displayName: 'Review Migrated Information', feeCode: 'NOFEE', name: 'reviewImportedData' }
                ]
              },
              viewAll: false
            }
          }
        }
      })
    })
    const permissions = getPermissionsMock()
    permissions.authorizedPermissions.push(AuthorizedAction.REVIEW_IMPORTED_DATA_FILING)
    await page.route('**/api/v2/permissions', async (route) => {
      await route.fulfill({ json: permissions })
    })

    await Promise.all([
      page.waitForResponse('*/**/businesses/**/*'),
      page.goto(`./en-CA/review-imported-data/${identifier}`)
    ])
    await page.waitForLoadState('networkidle')
    await expect(page.getByTestId('current-directors-section')).toContainText('Current Directors')
  })

  test('should prevent review and confirm while a director address sub form is open', async ({ page }) => {
    await page.getByTestId('current-directors-section').getByRole('button', { name: 'Change Address' }).first().click()
    const subForm = page.getByTestId('party-details-form')
    await expect(subForm).toBeVisible()

    await page.getByRole('button', { name: 'Review and Confirm' }).click()

    await expect(subForm).toContainText(taskMessage)
    await expect(subForm).toBeVisible()
  })

  test('should prevent save while a director address sub form is open', async ({ page }) => {
    await page.getByTestId('current-directors-section').getByRole('button', { name: 'Change Address' }).first().click()
    const subForm = page.getByTestId('party-details-form')
    await expect(subForm).toBeVisible()

    await page.getByRole('button', { name: 'Save and Resume Later', exact: true }).click()

    await expect(subForm).toContainText(taskMessage)
    await expect(subForm).toBeVisible()
  })
})
