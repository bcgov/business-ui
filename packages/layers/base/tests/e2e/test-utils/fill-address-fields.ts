import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import type { getFakeAddress } from '#e2e-utils'

export async function fillAddressFields(
  page: Page,
  type: 'mailing' | 'delivery',
  data: ReturnType<typeof getFakeAddress> | 'same'
) {
  const fieldset = page.getByTestId(`${type}-address-fieldset`)

  if (type === 'mailing' && data === 'same') {
    await fieldset.getByRole('checkbox', { name: /same as/i }).check({ force: true })
    return
  } else if (type === 'delivery' && data === 'same') {
    throw new Error("Can't set 'Same as' on Delivery Address")
  }

  if (data === 'same') {
    throw new Error(`Invalid data state: ${data} - should use an address created by getFakeAddress`)
  }
  await expect(async () => {
  // country - this is flaky, must focus first and wait for listbox or test may fail
    await fieldset.getByTestId(`${type}-address-input-country`).focus()
    await fieldset.getByTestId(`${type}-address-input-country`).click()
    const countryList = page.getByRole('listbox') // listbox is a teleport on the page body
    await countryList.scrollIntoViewIfNeeded()
    await expect(countryList).toBeVisible()
    await page.keyboard.type('canada')
    await page.keyboard.press('Enter')
    await expect(countryList).not.toBeVisible()
    await fieldset.getByTestId(`${type}-address-input-street`).click()
    await fieldset.getByTestId(`${type}-address-input-street`).fill(data.street)
    await fieldset.getByTestId(`${type}-address-input-streetAdditional`).click()
    await fieldset.getByTestId(`${type}-address-input-streetAdditional`).fill(data.streetAdditional)
    await fieldset.getByTestId(`${type}-address-input-city`).click()
    await fieldset.getByTestId(`${type}-address-input-city`).fill(data.city)
    // region - this is flaky, must focus first and wait for listbox or test may fail
    await fieldset.getByTestId(`${type}-address-input-region`).focus()
    await fieldset.getByTestId(`${type}-address-input-region`).click()
    const optionsList = page.getByRole('listbox') // listbox is a teleport on the page body
    await optionsList.scrollIntoViewIfNeeded()
    await expect(optionsList).toBeVisible()
    // use keyboard instead of click actions
    // element out of viewport bug on firefox (works fine when manually testing but failing in pw browser)
    await page.keyboard.type(data.region)
    await page.keyboard.press('Enter')
    await expect(optionsList).not.toBeVisible()
    await fieldset.getByTestId(`${type}-address-input-postalCode`).click()
    await fieldset.getByTestId(`${type}-address-input-postalCode`).fill(data.postalCode)
    await fieldset.getByTestId(`${type}-address-input-locationDescription`).click()
    await fieldset.getByTestId(`${type}-address-input-locationDescription`).fill(data.locationDescription)
  }).toPass()
}
