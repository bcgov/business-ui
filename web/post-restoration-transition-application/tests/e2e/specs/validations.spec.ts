import { test, expect } from '@playwright/test'
import { mockForIdentifier, impersonateUser } from '../test-utils/helpers'
import valid from '../../mocks/filingData/valid.json' with { type: 'json' }
import invalid from '../../mocks/filingData/invalid.json' with { type: 'json' }

const fill = async (page: Page, values: object) => {
  await page.getByTestId('legalName-input').locator('input').first().fill(values.legalName)
  await page.getByTestId('compPartyEmail-input').locator('input').first().fill(values.email)
  await page.getByTestId('courtOrderNumber-input').locator('input').first().fill(values.courtOrderNumber)
  await page.getByTestId('folio-input').locator('input').first().fill(values.folio)
  if (values.certify){
    await page.getByTestId('certify-section-checkbox').click()
  }
  //this is a loop but it currently only supports adding one date
  for (let i=0; i<values.articlesDates.length; i++) {
    const now = new Date()
    const date = new Date(values.articlesDates[i])
    
    const month = now.getMonth() === date.getMonth() ? now.getMonth() + (now.getMonth() <= 1 ? 1 : -1) : date.getMonth()
    const year = now.getFullYear()
    const day = now.getDate() === date.getDate() ? now.getDate() + (now.getDate() <= 1 ? 1 : -1) : date.getDate()
    // const month = now.getMonth()
    // const year = now.getFullYear()
    // const day = now.getDate()
    await page.locator('[data-testid="add-date-button"]').click()
    await page.getByTestId('articles-current-date_id').click()
    await page.locator('button[aria-label="Open months overlay"]').click()
    await expect(page.locator('[aria-label="Articles"] .dp__overlay_col').first()).toBeVisible()
    await page.locator('[aria-label="Articles"] .dp__overlay_col').nth(month).click()
    await page.locator(`[id="${year}-${(month+1) < 10 ? '0' : ''}${month+1}-${(day) < 10 ? '0' : ''}${day}"] div`).click()
    await page.getByTestId('articlesCurrentDate_save').click()
  }

  for (let i=0; i<values.shares.length; i++){
    await page.getByTestId('add-share-button').click()
    await page.locator('input[placeholder="Class Name [Shares]"]').first().fill(values.shares[i].shareClassName)
    await page.locator('input[placeholder="Maximum Number of Shares"]').first().fill(values.shares[i].shareMax.toString())
    await page.locator('input[placeholder="Par Value"]').first().fill(values.shares[i].shareParValue.toString())
    await page.getByTestId('currency-select').first().click()
    await page.locator('div.group.select-none').getByText(values.shares[i].shareParValueCurrency).click()
  }
}
  

test.describe('Post restoration Transition Application Filing', () => {
  const identifier = 'CP1002605'
  test.beforeEach(async ({ page }) => {
    await mockForIdentifier(page, identifier)
  })
  // use saved login state
  // test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  test('Valid', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    await fill(page, valid)
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(0)
    await page.getByTestId('submit-button').click()
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(0)
  })

  test('Invalid', async ({ page }) => {
    await impersonateUser(page, 'staff')
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(0)
    await fill(page, invalid)
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(4)
    await page.getByTestId('submit-button').click()
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(4)
  })
})
