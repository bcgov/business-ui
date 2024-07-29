import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockedBusinessNano } from '../../../mocks/mockedData'
import lang from '../../../../locales/en-CA'
import { assertCommonElements, assertH1Text, assertNuxtContent, assertAlertText } from '../../helpers'
import { mockRoute } from '../../utils/mock-route'
import { createScreenshotPath } from '../../utils/create-screenshot-path'

test.describe('Unauthenticated', () => {
  test.afterEach(async ({ page }, testInfo) => {
    // assert common page elements
    assertCommonElements(page)

    // assert h1 text
    await assertH1Text(page, lang.page.home.h1)

    // assert nuxt content correctly rendered
    await assertNuxtContent(page, 'initial', true)

    // validate a11y after every test
    // @ts-ignore // 'page' type from axe-core mismatch with playwright after upgrading but tests still passing
    const a11yResults = await new AxeBuilder({ page })
      .exclude(['#locale-select-dropdown']) // headless ui dropdown fails the axe check
      .disableRules(['heading-order']) // disable heading order rule because the nuxt content card has an h3
      .analyze()
    expect(a11yResults.violations).toEqual([])

    // generate unique filename with describe block text and take screenshot after each test
    const filename = createScreenshotPath(testInfo.titlePath)
    await page.screenshot({ fullPage: true, path: filename })
  })

  test('Valid Nano ID', async ({ page }) => {
    await mockRoute(page, '**/business/token/123', { json: mockedBusinessNano }) // mock 200 response with nanoid GET
    await page.goto('/en-CA?nanoid=123') // navigate to home page with mocked token response
    await expect(page.getByText(lang.page.home.h1, { exact: true })).toBeVisible() // wait for page to be rendered

    // assert business details card
    const busDetails = page.getByTestId('bus-details-card')
    expect(busDetails).toBeVisible()
    const expectedDetails = [
      'Business Name',
      mockedBusinessNano.legalName,
      'Incorporation Number',
      mockedBusinessNano.identifier,
      'Business Number',
        `${mockedBusinessNano.taxId!.slice(0, 9)} ${mockedBusinessNano.taxId!.slice(9)}`
    ]
    expectedDetails.forEach((detail) => {
      expect(busDetails).toContainText(detail!)
    })

    // assert login button
    const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
    expect(loginButton).toBeEnabled()
    expect(loginButton).toBeVisible()
  })

  test('Invalid Nano ID', async ({ page }) => {
    await mockRoute(page, '**/business/token/123', { status: 400 }) // mock 400 response with nanoid GET
    await page.goto('/en-CA?nanoid=123') // navigate to home page
    await expect(page.getByText(lang.page.home.h1, { exact: true })).toBeVisible() // wait for page to be rendered

    // assert business details card
    const busDetails = page.getByTestId('bus-details-card')
    expect(busDetails).not.toBeVisible()

    // assert alert text
    await assertAlertText(page, lang.alerts['invalid-token'].title, lang.alerts['invalid-token'].description)

    // assert login button
    const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
    expect(loginButton).not.toBeVisible()
  })

  test('Missing Nano ID', async ({ page }) => {
    await page.goto('/en-CA?nanoid=') // navigate to home page with missing token
    await expect(page.getByText(lang.page.home.h1, { exact: true })).toBeVisible() // wait for page to be rendered

    // assert business details card
    const busDetails = page.getByTestId('bus-details-card')
    expect(busDetails).not.toBeVisible()

    // assert alert text
    await assertAlertText(page, lang.alerts['missing-token'].title, lang.alerts['missing-token'].description)

    // assert login button
    const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
    expect(loginButton).not.toBeVisible()
  })
})
