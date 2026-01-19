import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import type { ApiAddress } from '#business/app/interfaces/address'

// FUTURE: consolidate with fill-address-fields once officers is consolidated
export async function fillOutAddress(
  page: Page,
  address: ApiAddress,
  type = 'delivery',
  sameAs = true,
  parent?: Locator
) {
  const addressLocator = parent ?? page
  await expect(async () => {
    const streetInput = addressLocator.getByTestId(`${type}-address-input-street`)
    const cityInput = addressLocator.getByTestId(`${type}-address-input-city`)
    const provinceSelect = addressLocator.getByTestId(`${type}-address-input-region`)
    const postalCodeInput = addressLocator.getByTestId(`${type}-address-input-postalCode`)
    const sameAsCheckbox = addressLocator.getByRole('checkbox', { name: 'Same as Delivery Address' })
    await expect(streetInput).toBeVisible()
    await streetInput.fill(address.streetAddress)
    await expect(cityInput).toBeVisible()
    await cityInput.fill(address.addressCity)
    await expect(provinceSelect).toBeVisible()
    await provinceSelect.click()
    await page.getByRole('option', { name: 'British Columbia' }).click()
    await expect(postalCodeInput).toBeVisible()
    await postalCodeInput.fill(address.postalCode)
    if (sameAs) {
      await expect(sameAsCheckbox).toBeVisible()
      await sameAsCheckbox.check()
    }
  }).toPass()
}
