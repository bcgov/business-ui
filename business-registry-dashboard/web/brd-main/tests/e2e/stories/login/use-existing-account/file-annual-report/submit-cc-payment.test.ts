import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import lang from '../../../../../../locales/en-CA'
// load default env
// eslint-disable-next-line import/no-named-as-default-member
dotenv.config()

// not completing until reset is available in colin
test('test', async ({ page }) => {
  const today: Date = new Date()
  const dayNumber: number = today.getDate() // use todays date for datepicker select
  const baseURL = process.env.NUXT_BASE_URL!
  // do login steps
  await page.goto(`${baseURL}en-CA?nanoid=QgoA8BAchiV_hYpIQJQRh`) // will need to update this nanoid when reset is available, using business BC0870574 from dev db, any changes to this business could break this test
  await expect(page.getByText(lang.page.home.h1, { exact: true })).toBeVisible() // wait for homepage to be rendered
  await page.getByRole('button', { name: lang.btn.loginBCSC }).click()
  await page.getByLabel('Log in with Test with').click()
  await page.getByLabel('Email or username').click()
  await page.getByLabel('Email or username').fill(process.env.PLAYWRIGHT_TEST_USERNAME!)
  await page.getByLabel('Password').click()
  await page.getByLabel('Password').fill(process.env.PLAYWRIGHT_TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.reload() // keycloak redirect not working for some reason after login, refreshing the page works though
  await page.waitForURL('**/accounts/choose-existing') // wait for redirect
  await expect(page.getByText(lang.page.existingAccount.h1, { exact: true })).toBeVisible() // wait for page to be rendered
  await page.getByTestId('choose-existing-account-button').first().click()
  await page.waitForURL('**/annual-report') // wait for redirect
  await page.getByRole('radio').first().click() // select first radio option in form
  await page.getByLabel(lang.page.annualReport.form.agmDate.label).click() // select date input
  await page.getByRole('gridcell', { name: dayNumber.toString(), exact: true }).click() // select todays date in datepicker
  await page.getByRole('checkbox').check() // check final confirm textbox
  // not submitting filing + payment until reset is complete
})
