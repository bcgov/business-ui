import { test, expect } from '@playwright/test'

test.describe('FormAddress (default)', () => {
  test('Should render correct elements', async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/Address/default')
    await page.waitForLoadState('networkidle')
    // delivery address elements
    await expect(page.getByText('Delivery Address').first()).toBeVisible()
    const deliveryAddress = page.getByTestId('delivery-address-container')
    await expect(deliveryAddress).toBeVisible()
    await expect(deliveryAddress.getByTestId('delivery-address-field-country')).toBeVisible()
    await expect(deliveryAddress.getByTestId('delivery-address-field-street')).toBeVisible()
    await expect(deliveryAddress.getByTestId('delivery-address-field-streetAdditional')).toBeVisible()
    await expect(deliveryAddress.getByTestId('delivery-address-field-city')).toBeVisible()
    await expect(deliveryAddress.getByTestId('delivery-address-field-region')).toBeVisible()
    await expect(deliveryAddress.getByTestId('delivery-address-field-postalCode')).toBeVisible()
    await expect(deliveryAddress.getByTestId('delivery-address-field-locationDescription')).toBeVisible()
    // mailing address elements
    await expect(page.getByText('Mailing Address').first()).toBeVisible()
    const mailingAddress = page.getByTestId('mailing-address-container')
    await expect(mailingAddress).toBeVisible()
    await expect(mailingAddress.getByTestId('mailing-address-field-country')).toBeVisible()
    await expect(mailingAddress.getByTestId('mailing-address-field-street')).toBeVisible()
    await expect(mailingAddress.getByTestId('mailing-address-field-streetAdditional')).toBeVisible()
    await expect(mailingAddress.getByTestId('mailing-address-field-city')).toBeVisible()
    await expect(mailingAddress.getByTestId('mailing-address-field-region')).toBeVisible()
    await expect(mailingAddress.getByTestId('mailing-address-field-postalCode')).toBeVisible()
    await expect(mailingAddress.getByTestId('mailing-address-field-locationDescription')).toBeVisible()
    // same as checkbox
    await expect(page.getByRole('checkbox', { name: 'Same as Delivery Address' })).toBeVisible()
    // actions
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('Should show validation errors for delivery only on submit', async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/Address/default')
    await page.waitForLoadState('networkidle')
    // submit empty form
    await page.getByRole('button', { name: 'Done' }).click()
    // delivery address elements
    await expect(page.getByText('Delivery Address').first()).toBeVisible()
    const deliveryAddress = page.getByTestId('delivery-address-container')
    await expect(deliveryAddress).toBeVisible()
    expect(await deliveryAddress.getByText('This field is required').all()).toHaveLength(4)
    // mailing address elements
    await expect(page.getByText('Mailing Address').first()).toBeVisible()
    const mailingAddress = page.getByTestId('mailing-address-container')
    await expect(mailingAddress).toBeVisible()
    expect(await mailingAddress.getByText('This field is required').all()).toHaveLength(0)
  })

  test('Should hide mailing address on `same as` checkbox', async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/Address/default')
    await page.waitForLoadState('networkidle')
    // delivery address elements
    const deliveryAddress = page.getByTestId('delivery-address-container')
    await expect(deliveryAddress).toBeVisible()
    // mailing address elements
    const getMailingAddress = () => page.getByTestId('mailing-address-container')
    await expect(getMailingAddress()).toBeVisible()
    await page.getByText('Same as Delivery Address').click()

    // await page.getByRole('checkbox', { name: /same as/i }).check({ force: true })

    await expect(getMailingAddress()).not.toBeVisible()
  })

  test('Should open and reset mailing address if `same as` checked and user edits delivery address', async (
    { page }
  ) => {
    await page.goto('./en-CA/examples/components/Form/Address/default')
    await page.waitForLoadState('networkidle')
    // delivery address elements
    const deliveryAddress = page.getByTestId('delivery-address-container')
    const getAdditionalInput = () => deliveryAddress.getByTestId('delivery-address-input-streetAdditional')
    await expect(deliveryAddress).toBeVisible()
    await getAdditionalInput().fill('value')
    // mailing address elements
    const getMailingAddress = () => page.getByTestId('mailing-address-container')
    // const getCheckbox = () => page.getByRole('checkbox', { name: /same as/i })
    await expect(getMailingAddress()).toBeVisible()

    await page.getByText('Same as Delivery Address').click()
    // await getCheckbox().check({ force: true })

    await expect(getMailingAddress()).not.toBeVisible()
    // await expect(getCheckbox()).toHaveAttribute('aria-checked', 'true')

    await getAdditionalInput().fill('updated')

    await expect(getMailingAddress()).toBeVisible()
    await expect(getMailingAddress().getByTestId('mailing-address-input-streetAdditional')).toHaveValue('')
    // await expect(getCheckbox()).toHaveAttribute('aria-checked', 'false')
  })
})
