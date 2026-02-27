import { expect } from '@playwright/test'
import { nextTick } from 'vue'
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
    const deliveryInstructionsInput = addressLocator.getByTestId(`${type}-address-input-locationDescription`)
    const sameAsCheckbox = addressLocator.getByRole('checkbox', { name: 'Same as Delivery Address' })
    await expect(streetInput).toBeVisible()
    await streetInput.fill(address.streetAddress)
    await expect(cityInput).toBeVisible()
    await cityInput.fill(address.addressCity)
    await expect(provinceSelect).toBeVisible()
    await provinceSelect.click()
    const optionsList = page.getByRole('listbox') // listbox is a teleport on the page body
    await expect(optionsList).toBeVisible()
    // use keyboard instead of click actions
    // element out of viewport bug on firefox (works fine when manually testing but failing in pw browser)
    await page.keyboard.type(address.addressRegion!)
    await page.keyboard.press('Enter')
    await expect(optionsList).not.toBeVisible()
    await expect(postalCodeInput).toBeVisible()
    await postalCodeInput.fill(address.postalCode)
    await deliveryInstructionsInput.fill(address.deliveryInstructions || '')
    // Sometimes it needs a tick to update the store after this
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (sameAs) {
      await expect(sameAsCheckbox).toBeVisible()
      await sameAsCheckbox.check({ force: true })
    }
  }).toPass()
}
