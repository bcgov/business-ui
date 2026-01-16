import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import type { ApiAddress } from '#business/app/interfaces/address'

// FUTURE: consolidate with fill-address-fields once officers is consolidated
export async function fillOutAddress(page: Page, address: ApiAddress, type = 'delivery', sameAs = true) {
  await expect(async () => {
    const streetInput = page.getByTestId(`${type}-address-input-street`)
    const cityInput = page.getByTestId(`${type}-address-input-city`)
    const provinceSelect = page.getByTestId(`${type}-address-input-region`)
    const postalCodeInput = page.getByTestId(`${type}-address-input-postalCode`)
    const sameAsCheckbox = page.getByRole('checkbox', { name: 'Same as Delivery Address' })
    expect(streetInput).toBeVisible()
    await streetInput.fill(address.streetAddress)
    expect(cityInput).toBeVisible()
    await cityInput.fill(address.addressCity)
    expect(provinceSelect).toBeVisible()
    await provinceSelect.click()
    await page.getByRole('option', { name: 'British Columbia' }).click()
    expect(postalCodeInput).toBeVisible()
    await postalCodeInput.fill(address.postalCode)
    if (sameAs) {
      expect(sameAsCheckbox).toBeVisible()
      await sameAsCheckbox.click()
    }
  }).toPass()
}
