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

  test('Series Par Value to Update', async ({ page }) => {
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

  // this test tests that the badges are updated when the shares and series are reordered
  // and up down works as expected in shares with series
  test('Reorder Shares with Series, Verify Badges', async ({ page }) => {
    const longId = 'BC0000002'
    await mockForIdentifier(page, longId)
    await page.goto(`./en-CA/${longId}`)
    const sv = JSON.parse(JSON.stringify(series))
    const restSeries = sv.shares.splice(0, sv.shares.length - 1)
    await fillSeries(page, sv)

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('modal-date-cancel').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    sv.shares = restSeries
    await fillSeries(page, sv)
    await expect(page.getByRole('dialog')).not.toBeVisible()

    const checkHelper = async (index: number) => {
      await expect(page.getByText(i18en.label.changed)).toHaveCount(2)
      await expect(page.getByText(i18en.label.added)).toHaveCount(3)
      await expect(
        page.locator('section[aria-label="' + i18en.text.sharesTitle + '"]')
        .first().locator('tr').nth(index + 2)
      ).toContainText('Sample Shares')
      await expect(
        page.locator('section[aria-label="' + i18en.text.sharesTitle + '"]')
        .first().locator('tr').nth(index + 2)
      ).toContainText(i18en.label.changed)
    }

    let expectedIndex = 0
    await checkHelper(expectedIndex)
    await page.locator('[aria-label="Actions"]').first().click()
    await expect(page.getByText(i18en.label.moveUp)).toBeDisabled()
    await expect(page.getByText(i18en.label.moveDown)).not.toBeDisabled()
    await page.getByText(i18en.label.moveDown).first().click()
    expectedIndex += 2

    await checkHelper(expectedIndex)
    await page.locator('[aria-label="Actions"]').nth(expectedIndex).click()
    await expect(page.getByText(i18en.label.moveUp)).not.toBeDisabled()
    await expect(page.getByText(i18en.label.moveDown)).not.toBeDisabled()
    await page.getByText(i18en.label.moveDown).first().click()
    expectedIndex++

    await checkHelper(expectedIndex)
    await page.locator('[aria-label="Actions"]').nth(expectedIndex).click()
    await expect(page.getByText(i18en.label.moveUp)).not.toBeDisabled()
    await expect(page.getByText(i18en.label.moveDown)).toBeDisabled()
    await page.getByText(i18en.label.moveUp).first().click()
    expectedIndex--

    await checkHelper(expectedIndex)
    await page.locator('[aria-label="Actions"]').nth(expectedIndex).click()
    await expect(page.getByText(i18en.label.moveUp)).not.toBeDisabled()
    await expect(page.getByText(i18en.label.moveDown)).not.toBeDisabled()
    await page.getByText(i18en.label.moveUp).first().click()
    expectedIndex -= 2

    await checkHelper(expectedIndex)
    await page.locator('[aria-label="Actions"]').nth(expectedIndex).click()
    await expect(page.getByText(i18en.label.moveUp)).toBeDisabled()
    await expect(page.getByText(i18en.label.moveDown)).not.toBeDisabled()
  })

  // this test tests reordering series on a share
  test('Reorder Just Series', async ({ page }) => {
    const longId = 'BC0000002'
    await mockForIdentifier(page, longId)
    await page.goto(`./en-CA/${longId}`)
    const sv = JSON.parse(JSON.stringify(series))
    const restSeries = sv.shares.splice(0, sv.shares.length - 1)
    sv.shares[0].shareClassName = 'Test Series 1'
    await fillSeries(page, sv)

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('modal-date-cancel').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    sv.shares[0].shareClassName = 'Test Series 2'
    await fillSeries(page, sv)
    await expect(page.getByRole('dialog')).not.toBeVisible()

    sv.shares = restSeries
    sv.shares[0].shareClassName = 'Test Series 3'
    await fillSeries(page, sv)
    await expect(page.getByRole('dialog')).not.toBeVisible()

    const checkHelper = async (order: number[]) => {
      await expect(
        page.locator('section[aria-label="' + i18en.text.sharesTitle + '"]')
        .first().locator('tr').nth(1 + 2)
      ).toContainText('Test Series ' + order[0] + ' Shares')

      await expect(
        page.locator('section[aria-label="' + i18en.text.sharesTitle + '"]')
        .first().locator('tr').nth(2 + 2)
      ).toContainText('Test Series ' + order[1] + ' Shares')

      await expect(
        page.locator('section[aria-label="' + i18en.text.sharesTitle + '"]')
        .first().locator('tr').nth(3 + 2)
      ).toContainText('Test Series ' + order[2] + ' Shares')
    }

    await checkHelper([1, 2, 3])
    await page.locator('[aria-label="Actions"]').nth(1).click()
    await page.getByText(i18en.label.moveDown).first().click()

    await checkHelper([2, 1, 3])
    await page.locator('[aria-label="Actions"]').nth(2).click()
    await page.getByText(i18en.label.moveDown).first().click()

    await checkHelper([2, 3, 1])
    await page.locator('[aria-label="Actions"]').nth(3).click()
    await page.getByText(i18en.label.moveUp).first().click()

    await checkHelper([2, 1, 3])
    await page.locator('[aria-label="Actions"]').nth(2).click()
    await page.getByText(i18en.label.moveUp).first().click()

    await checkHelper([1, 2, 3])
  })

  test('Can\'t add a series to a series', async({ page }) => {
    const longId = 'BC0000002'
    await mockForIdentifier(page, longId)
    await page.goto(`./en-CA/${longId}`)
    const sv = JSON.parse(JSON.stringify(series))
    const restSeries = sv.shares.splice(0, sv.shares.length - 1)
    await fillSeries(page, sv)

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('modal-date-cancel').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    sv.shares = restSeries
    await fillSeries(page, sv)
    await expect(page.getByRole('dialog')).not.toBeVisible()

    await page.locator('[aria-label="Actions"]').nth(1).click()
    await expect(page.getByText(i18en.label.addSeries)).toBeDisabled()
    
  })

  // delete shares / series
  test('Delete and Undo Shares/sSeries', async ({ page }) => {
    const longId = 'BC0000002'
    await mockForIdentifier(page, longId)
    await page.goto(`./en-CA/${longId}`)
    const sv = JSON.parse(JSON.stringify(series))
    const restSeries = sv.shares.splice(0, sv.shares.length - 1)
    await fillSeries(page, sv)

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('modal-date-cancel').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    sv.shares = restSeries
    await fillSeries(page, sv)
    await expect(page.getByRole('dialog')).not.toBeVisible()

    const checkHelper = async (deletedRows: number[], expectedRows: number) => {
      for (let i = 0; i < expectedRows; i++) {
        if (deletedRows.includes(i)) {
          await expect(
            page.locator('section[aria-label="' + i18en.text.sharesTitle + '"]')
            .first().locator('tr').nth(i + 2)
          ).toContainText(i18en.label.deleted)
        } else {
          await expect(
            page.locator('section[aria-label="' + i18en.text.sharesTitle + '"]')
            .first().locator('tr').nth(i + 2)
          ).not.toContainText(i18en.label.deleted)
        }
      }
      await expect(
        page.locator('section[aria-label="' + i18en.text.sharesTitle + '"]')
        .first().getByText(i18en.label.deleted)
      ).toHaveCount(deletedRows.length)
    }

    let expectedRows = 6
    const deletedRows = []
    await expect(page.getByText('Test Series 2 Shares')).toHaveCount(1)
    await checkHelper(deletedRows, expectedRows)
    await page.locator('[aria-label="Actions"]').nth(1).click()

    // test when you delete an added item it is removed from list
    await page.getByText(i18en.label.delete).first().click()
    await expect(page.getByText('Test Series 2 Shares')).not.toBeAttached()
    expectedRows--
    await checkHelper(deletedRows, expectedRows)

    // test deleting just a share
    await page.locator('[aria-label="Actions"]').nth(4).click()
    await page.getByText(i18en.label.delete).first().click()
    deletedRows.push(4)
    await checkHelper(deletedRows, expectedRows)

    // test deleting just a series
    await page.locator('[aria-label="Actions"]').nth(3).click()
    await page.locator('button').getByText(i18en.label.delete).first().click()
    deletedRows.push(3)
    await checkHelper(deletedRows, expectedRows)

    // undo a delete of a series
    await page.locator('button').getByText('Undo').first().click()
    deletedRows.pop()
    await checkHelper(deletedRows, expectedRows)

    // delete a share (and it's child series)
    await page.locator('[aria-label="Actions"]').nth(2).click()
    await page.locator('button').getByText(i18en.label.delete).first().click()
    deletedRows.push(2)
    deletedRows.push(3)
    await checkHelper(deletedRows, expectedRows)

    // undo delete of a share and series
    await page.locator('button').getByText('Undo').first().click()
    deletedRows.pop()
    deletedRows.pop()
    await checkHelper(deletedRows, expectedRows)

    // delete a modified share should clear added series
    await page.locator('[aria-label="Actions"]').nth(0).click()
    await page.locator('button').getByText(i18en.label.delete).first().click()
    for (let i = 0; i < deletedRows.length; i++) {
      deletedRows[i]--
    }
    deletedRows.push(0)
    expectedRows--
    await checkHelper(deletedRows, expectedRows)
  })
})
