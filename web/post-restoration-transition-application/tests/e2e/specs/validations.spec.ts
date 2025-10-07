import { test, expect } from '@playwright/test'
import { mockForIdentifier, impersonateUser } from '../test-utils/helpers'
import valid from '../../mocks/filingData/valid.json' with { type: 'json' }
import validSpecial from '../../mocks/filingData/validSpecial.json' with { type: 'json' }
import invalid from '../../mocks/filingData/invalid.json' with { type: 'json' }
import { base as baseBusiness } from '../../mocks/lear/business.ts'
import { base as baseAddress } from '../../mocks/lear/addresses.ts'
import { base as baseDirectors } from '../../mocks/lear/directors.ts'

import i18en from '~~/i18n/locales/en-CA'

const fillBasic = async (page: Page, values: object) => {
  const legalNameField = page.getByTestId('legalName-input').locator('input').first()
  if (await legalNameField.isEnabled()) {
    await legalNameField.fill(values.legalName)
  }
  await page.getByTestId('compPartyEmail-input').locator('input').first().fill(values.email)
  await page.getByTestId('folio-input').locator('input').first().fill(values.folio)
  if (values.certify) {
    await page.getByTestId('certify-section-checkbox').click()
  }
}

const fillDates = async (page: Page, values: object) => {
  // this is a loop but it currently only supports adding one date
  for (let i = 0; i < values.articlesDates.length; i++) {
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
    await page.locator(
      `[id="${year}-${(month + 1) < 10 ? '0' : ''}${month + 1}-${(day) < 10 ? '0' : ''}${day}"] div`
    ).click()
    await page.getByTestId('articles-current-date-edit-form_save').click()
  }
}

const fillShares = async (page: Page, values: object) => {
  for (let i = 0; i < values.shares.length; i++) {
    await page.getByTestId('add-share-button').click()
    await page.locator('input[placeholder="' + i18en.label.shareName + '"]')
      .first().fill(values.shares[i].shareClassName)
    if (values.shares[i].shareHasParValue) {
      await page.getByTestId('parValue-radio').click()
    } else {
      await page.getByTestId('noParValue-radio').click()
    }
    if (values.shares[i].shareHasMaxShares) {
      await page.getByTestId('maxShares-radio').click()
    } else {
      await page.getByTestId('noMaxShares-radio').click()
    }
    await page.locator('input[placeholder="' + i18en.label.shareMaximumNumberOf + '"]')
      .first().fill(values.shares[i].shareMax.toString())
    await page.locator('input[placeholder="' + i18en.label.parValue + '"]')
      .first().fill(values.shares[i].shareParValue.toString())
    await page.getByTestId('currency-select').first().click()
    await page.locator('div.group.select-none').getByText(values.shares[i].shareParValueCurrency).click()

    if (values.shares[i].shareColumnRightsRestrictions) {
      await page.locator('[aria-label="' + i18en.label.hasRightsOrRestrictions + '"]').click()
    }

    await page.getByTestId('addEditSharesDone').click()
  }
}

const fill = async (page: Page, values: object) => {
  await fillBasic(page, values)
  await fillDates(page, values)
  await fillShares(page, values)
}

const nonStaffUserName = 'TestFirst TestLast'

test.describe('Post restoration Transition Application Filing', () => {
  const identifier = 'CP1002605'
  test.beforeEach(async ({ page }) => {
    await impersonateUser(page, 'business')
    await mockForIdentifier(page, identifier)
  })
  // use saved login state
  // test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  test('Valid', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    await expect(page.getByTestId('legalName-input').locator('input').first()).toBeDisabled()
    await expect(page.getByTestId('legalName-input').locator('input')).toHaveValue(nonStaffUserName)
    await fill(page, valid)
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(0)
    await page.getByTestId('submit-button').click()
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(0)
  })

  test('Invalid', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(0)
    await expect(page.getByTestId('legalName-input').locator('input').first()).toBeDisabled()
    await expect(page.getByTestId('legalName-input').locator('input')).toHaveValue(nonStaffUserName)
    await fill(page, invalid)
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(2)
    await page.getByTestId('submit-button').click()
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(2)
  })

  test('Test cancel pop up for date when share with special rights added/edited', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    await expect(page.getByTestId('legalName-input').locator('input').first()).toBeDisabled()
    await expect(page.getByTestId('legalName-input').locator('input')).toHaveValue(nonStaffUserName)
    await fillBasic(page, validSpecial)
    await fillShares(page, validSpecial)
    await expect(page.getByTestId('modal-date-input')).toBeVisible()
    await page.getByTestId('modal-date-cancel').click()
    await expect(page.getByTestId('modal-date-input')).not.toBeVisible()
    await expect(page.getByText(i18en.errors.articles)).toBeVisible()
    await fillDates(page, validSpecial)
    await expect(page.getByText(i18en.errors.articles)).not.toBeVisible()
    await page.getByTestId('submit-button').click()
  })

  test('Test save pop up for date when share with special rights added/edited', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    await expect(page.getByTestId('legalName-input').locator('input').first()).toBeDisabled()
    await expect(page.getByTestId('legalName-input').locator('input')).toHaveValue(nonStaffUserName)
    await fillBasic(page, validSpecial)
    await fillShares(page, validSpecial)
    await expect(page.getByTestId('modal-date-input')).toBeVisible()
    await page.getByTestId('modal-date-done').click()
    // should still be up as we haven't entered a date
    await expect(page.getByTestId('modal-date-input')).toBeVisible()

    await page.getByTestId('modal-date-input').click()
    const today = new Date()
    const selector
      = `${today.getFullYear()}`
      + `-${(today.getMonth() + 1) < 10 ? '0' : ''}${today.getMonth() + 1}`
      + `-${(today.getDate() < 10 ? '0' : '')}${today.getDate()}`
    await page.locator(`[id="${selector}"] div`).click()
    await page.getByTestId('modal-date-done').click()

    await expect(page.getByText(i18en.errors.articles)).not.toBeVisible()
    await page.getByTestId('submit-button').click()
    await expect(page.getByText(i18en.errors.articles)).not.toBeVisible()
  })

  test('Cancel save -- no changes', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    await page.getByTestId('cancel-button').click()
    await page.waitForURL(`**/login`)
  })

  test('Cancel save -- with changes', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    await page.getByTestId('compPartyEmail-input').locator('input').first().fill('a')
    await page.getByTestId('cancel-button').click()
    await page.locator('button').getByText(i18en.btn.keepEditing).click()
    await expect(page.getByTestId('compPartyEmail-input').locator('input').first()).toHaveValue('a')
    await page.getByTestId('compPartyEmail-input').locator('input').first().clear()
    await page.getByTestId('cancel-button').click()
    await page.waitForURL(`**/login`)
  })
})

test.describe('Post restoration Transition Application Filing - staff', () => {
  const identifier = 'CP1002605'
  test.beforeEach(async ({ page }) => {
    await impersonateUser(page, 'staff')
    await mockForIdentifier(page, identifier)
  })

  test('Staff, Pay Section and Court Section', async ({ page }) => {
    let payload = {}
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByTestId('legalName-input')).toBeVisible()
    await expect(page.getByTestId('legalName-input').locator('input').first()).toBeEnabled()
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(0)
    await fill(page, valid)
    await page.getByTestId('courtOrderNumber-input').locator('input').first().fill(valid.courtOrderNumber)
    await page.route(`**/**/businesses/${identifier}/filings`, async (route) => {
      payload = route.request().postDataJSON()
      await route.fulfill({ json: {} })
    })

    await page.getByTestId('submit-button').click()
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(0)
    await expect(page.locator('p.text-red-600').getByText('Payment')).toHaveCount(1)

    await page.locator('[aria-label="Cash or Cheque"]').click()
    await page.getByTestId('submit-button').click()
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(1)

    await page.locator('[aria-label="BC Online"]').click()
    await page.getByTestId('submit-button').click()
    await expect(page.locator('.text-\\(--ui-error\\)')).toHaveCount(2)

    await page.locator('[aria-label="No Fee"]').click()

    await page.getByTestId('submit-button').click()

    await expect(payload.filing.header.name).toBe('transition')
    await expect(payload.filing.header.certifiedBy).toBe(valid.legalName)
    // await expect(payload.filing.header.accountId).toBe(3040)
    const d = new Date()
    const expectedD = d.getFullYear() + '-'
      + (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1) + '-'
      + (d.getDate() < 10 ? '0' : '') + d.getDate()
    await expect(payload.filing.header.date).toBe(expectedD)

    await expect(payload.filing.header.type).toBe('LEGAL')
    await expect(payload.filing.business.identifier).toBe(identifier)
    await expect(payload.filing.business.foundingDate).toBe(baseBusiness.business.foundingDate)
    await expect(payload.filing.business.legalName).toBe(baseBusiness.business.legalName)
    await expect(payload.filing.business.legalType).toBe(baseBusiness.business.legalType)
    await expect(payload.filing.transition.nameTranslations).toStrictEqual([])

    const expectedA = JSON.parse(JSON.stringify(baseAddress))
    delete expectedA.recordsOffice.deliveryAddress.addressType
    delete expectedA.recordsOffice.deliveryAddress.id
    delete expectedA.recordsOffice.mailingAddress.addressType
    delete expectedA.recordsOffice.mailingAddress.id
    delete expectedA.registeredOffice.deliveryAddress.addressType
    delete expectedA.registeredOffice.deliveryAddress.id
    delete expectedA.registeredOffice.mailingAddress.addressType
    delete expectedA.registeredOffice.mailingAddress.id
    await expect(payload.filing.transition.offices).toStrictEqual(expectedA)

    await expect(payload.filing.transition.parties).toStrictEqual(baseDirectors.parties)
    await expect(payload.filing.transition.hasProvisions).toBe(false)
    await expect(payload.filing.transition.contactPoint).toStrictEqual({ email: valid.email })

    const expectedShares = {
      shareClasses: [
        {
          currency: null,
          hasMaximumShares: false,
          hasParValue: false,
          hasRightsOrRestrictions: false,
          id: 474535,
          maxNumberOfShares: null,
          name: 'Sample Shares',
          parValue: null,
          priority: 1,
          series: []
        },
        {
          added: true,
          currency: 'CAD',
          hasMaximumShares: true,
          hasParValue: true,
          hasRightsOrRestrictions: false,
          maxNumberOfShares: 1000000,
          name: 'Test Shares Shares',
          parValue: 1,
          priority: 2,
          series: []
        }
      ]
    }
    await expect(payload.filing.transition.shareStructure).toStrictEqual(expectedShares)

    // you are not logged in actually and get sent to login instead of dashboard
    await page.waitForURL(`**/login`)
  })
})
