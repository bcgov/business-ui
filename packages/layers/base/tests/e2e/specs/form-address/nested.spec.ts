import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const getElements = (page: Page) => {
  const doneButton = page.getByRole('button', { name: 'Done' })
  const firstNameInput = page.getByLabel('First Name')
  const middleNameInput = page.getByLabel('Middle Name')
  const lastNameInput = page.getByLabel('Last Name')
  const deliveryAddress = page.getByTestId('delivery-address-container')
  const mailingAddress = page.getByTestId('mailing-address-container')
  const checkbox = page.getByRole('checkbox', { name: 'Same as Delivery Address' })

  return {
    doneButton,
    firstNameInput,
    middleNameInput,
    lastNameInput,
    deliveryAddress,
    mailingAddress,
    checkbox
  }
}

test.describe('FormAddress (nested)', () => {
  test('Should render correct elements', async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/Address/nested')
    await page.waitForLoadState('networkidle')
    const {
      doneButton,
      firstNameInput,
      middleNameInput,
      lastNameInput,
      deliveryAddress,
      mailingAddress,
      checkbox
    } = getElements(page)

    await expect(page.getByRole('group', { name: 'Legal Name' })).toBeVisible()
    await expect(firstNameInput).toBeVisible()
    await expect(middleNameInput).toBeVisible()
    await expect(lastNameInput).toBeVisible()
    await expect(doneButton).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await expect(page.getByRole('group', { name: 'Delivery Address' })).toBeVisible()
    await expect(deliveryAddress).toBeVisible()
    await expect(page.getByRole('group', { name: 'Mailing Address' })).toBeVisible()
    await expect(mailingAddress).toBeVisible()
    await expect(checkbox).toBeVisible()
  })

  test('Should show validation errors for parent and nested forms on submit', async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/Address/nested')
    await page.waitForLoadState('networkidle')
    const { doneButton } = getElements(page)

    await doneButton.click()

    const form = page.locator('form').first()
    const requiredErrors = form.getByText('This field is required')
    await expect(requiredErrors).toHaveCount(11)
  })
})
