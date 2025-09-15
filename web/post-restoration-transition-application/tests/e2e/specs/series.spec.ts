import { test, expect } from '@playwright/test'
import { mockForIdentifier } from '../test-utils/helpers'
import series from '../../mocks/filingData/series.json' with { type: 'json' }

import i18en from '~~/i18n/locales/en-CA'

// since we're editing it needs to be nth(1) as the add share form is v-show not v-if
const fillSeries = async (page: Page, values: object) => {
  for (let i = 0; i < values.shares.length; i++) {
    await page.locator('[aria-label="Actions"]').first().click()
    await page.locator('[role="menuitem"]').first().click()
    await page.locator('input[placeholder="' + i18en.label.seriesName + '"]')
      .first().fill(values.shares[i].shareClassName)
    if (values.shares[i].shareHasMaxShares) {
      await page.getByTestId('maxShares-radio').nth(1).click()
    } else {
      await page.getByTestId('noMaxShares-radio').nth(1).click()
    }
    await page.locator('input[placeholder="' + i18en.label.seriesMaximumNumberOf + '"]')
      .fill(values.shares[i].shareMax.toString())

    if (values.shares[i].shareColumnRightsRestrictions) {
      await page.locator('[aria-label="' + i18en.label.hasRightsOrRestrictions + '"]').nth(1).click()
    }

    await page.getByTestId('addEditSharesDone').nth(1).click()
  }
}

test.describe('Share Series', () => {
  const identifier = 'BC0000001'
  test.beforeEach(async ({ page }) => {
    await mockForIdentifier(page, identifier)
  })

  test('Expect pop up', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    const sv = JSON.parse(JSON.stringify(series))
    sv.shares.splice(0, sv.shares.length - 1)
    await fillSeries(page, sv)
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('Expect valid', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    const sv = JSON.parse(JSON.stringify(series))
    const restSeries = sv.shares.splice(0, sv.shares.length - 1)
    await fillSeries(page, sv)

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('modal-date-cancel').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    sv.shares = restSeries
    await fillSeries(page, sv)
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('Expect error and no par value text', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    const sv = JSON.parse(JSON.stringify(series))
    const restSeries = sv.shares.splice(0, sv.shares.length - 1)
    await fillSeries(page, sv)

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('modal-date-cancel').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    restSeries[0].shareMax = 1001
    sv.shares = restSeries
    await fillSeries(page, sv)
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(2)
    await expect(page.getByText(i18en.label.noPar)).toHaveCount(2)
  })

  test('series par value to udpate', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    const sv = JSON.parse(JSON.stringify(series))
    const restSeries = sv.shares.splice(0, sv.shares.length - 1)
    await fillSeries(page, sv)

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('modal-date-cancel').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    sv.shares = restSeries
    await fillSeries(page, sv)
    await expect(page.getByRole('dialog')).not.toBeVisible()

    await page.locator('[aria-label="Change"]').nth(1).click()
    await page.getByTestId('parValue-radio').nth(1).click()
    await page.locator('input[placeholder="' + i18en.label.parValue + '"]')
      .nth(1).fill('10')
    await page.getByTestId('currency-select').nth(1).click()
    await page.locator('div.group.select-none').getByText('CAD').click()
    await page.getByTestId('addEditSharesDone').nth(1).click()

    await expect(page.getByText('$10')).toHaveCount(4)
  })
})
