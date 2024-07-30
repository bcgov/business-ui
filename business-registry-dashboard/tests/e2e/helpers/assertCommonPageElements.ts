import { expect, type Page } from '@playwright/test'

class CommonPageElements {
  readonly page: Page

  constructor (page: Page) {
    this.page = page
  }

  async assertCommonPageElements () {
    const logo = this.page.getByAltText('Government of British Columbia Logo')
    const localeDropdown = this.page.getByTestId('locale-select-dropdown')
    const header = this.page.getByTestId('sbc-main-header')
    const footer = this.page.getByTestId('sbc-main-footer')
    const footerLinks = footer.locator('a')

    expect(logo).toBeTruthy()
    expect(header).toBeInViewport()
    expect(footer).toBeTruthy()
    expect(footer).toContainText('A BC Online Application')
    expect(footerLinks).toHaveCount(5)
    await expect(localeDropdown).toBeInViewport()
    await expect(localeDropdown).toBeEnabled()
  }
}

export async function assertCommonElements (page: Page) {
  const commonEls = new CommonPageElements(page)
  await commonEls.assertCommonPageElements()
}
