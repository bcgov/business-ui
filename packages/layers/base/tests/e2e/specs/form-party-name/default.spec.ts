import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

function getElements(page: Page) {
  const section = page.getByRole('group', { name: 'Person or Business Name' })
  const personRadio = section.getByRole('radio', { name: 'Individual Person' })
  const businessRadio = section.getByRole('radio', { name: 'Business' })
  const firstNameInput = section.getByLabel('First Name')
  const middleNameInput = section.getByLabel('Middle Name')
  const lastNameInput = section.getByLabel('Last Name')
  const businessNameInput = section.getByLabel('Business Name')
  const lastNameGroup = page.getByTestId('form-group-last-name')
  const businessNameGroup = page.getByTestId('form-group-business-name')
  const doneButton = page.getByRole('button', { name: 'Done' })

  return {
    section,
    personRadio,
    businessRadio,
    firstNameInput,
    middleNameInput,
    lastNameInput,
    businessNameInput,
    lastNameGroup,
    businessNameGroup,
    doneButton
  }
}

test.describe('FormPartyName', () => {
  test('Should render correct elements', async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/Party/Name')
    await page.waitForLoadState('networkidle')

    const {
      section,
      personRadio,
      businessRadio,
      firstNameInput,
      middleNameInput,
      lastNameInput,
      businessNameInput
    } = getElements(page)

    await expect(section).toBeVisible()

    await expect(personRadio).toBeVisible()
    await expect(businessRadio).toBeVisible()
    await expect(firstNameInput).toBeVisible()
    await expect(middleNameInput).toBeVisible()
    await expect(lastNameInput).toBeVisible()
    await expect(businessNameInput).not.toBeVisible()

    await businessRadio.click()

    await expect(firstNameInput).not.toBeVisible()
    await expect(middleNameInput).not.toBeVisible()
    await expect(lastNameInput).not.toBeVisible()
    await expect(businessNameInput).toBeVisible()
  })

  test('Should clear validation errors when radio option changes', async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/Party/Name')
    await page.waitForLoadState('networkidle')

    const {
      section,
      personRadio,
      businessRadio,
      lastNameInput,
      businessNameInput,
      lastNameGroup,
      businessNameGroup,
      doneButton
    } = getElements(page)

    await expect(section).toBeVisible()

    await doneButton.click()

    await expect(lastNameInput).toBeFocused()
    await expect(lastNameGroup).toContainText('This field is required')

    await businessRadio.click()
    await doneButton.click()

    await expect(businessNameInput).toBeFocused()
    await expect(businessNameGroup).toContainText('This field is required')

    await personRadio.click()
    await expect(lastNameGroup).not.toContainText('This field is required')

    await businessRadio.click()
    await expect(businessNameGroup).not.toContainText('This field is required')
  })

  test('Should clear input values when radio option changes', async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/Party/Name')
    await page.waitForLoadState('networkidle')

    const {
      section,
      personRadio,
      businessRadio,
      firstNameInput,
      middleNameInput,
      lastNameInput,
      businessNameInput
    } = getElements(page)

    await expect(section).toBeVisible()
    await firstNameInput.fill('first')
    await middleNameInput.fill('middle')
    await lastNameInput.fill('last')

    await expect(firstNameInput).toHaveValue('first')
    await expect(middleNameInput).toHaveValue('middle')
    await expect(lastNameInput).toHaveValue('last')

    await businessRadio.click()

    await businessNameInput.fill('business')
    await expect(businessNameInput).toHaveValue('business')

    await personRadio.click()
    await expect(firstNameInput).toHaveValue('')
    await expect(middleNameInput).toHaveValue('')
    await expect(lastNameInput).toHaveValue('')

    await businessRadio.click()
    await expect(businessNameInput).toHaveValue('')
  })
})
