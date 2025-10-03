import { test, expect, type Locator } from '@playwright/test'
import { mockForIdentifier } from '../test-utils/helpers'
import draft from '../../mocks/filingData/draft.json' with { type: 'json' }
import { base as baseAddress } from '../../mocks/lear/addresses'
import { base as baseParties } from '../../mocks/lear/directors'

test.describe('Draft Filing Tests', () => {
  const identifier = 'CP1002605'
  test.beforeEach(async ({ page }) => {
    await mockForIdentifier(page, identifier)
  })
  test('Loading a draft populates filing as expected', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}?filingId=1`)
    // page loads
    await expect(page.getByText('Post Restoration Transition Application').first()).toBeVisible()
    // verify addresses are showing
    const addresses = page.getByTestId('section-addresses')
    await expect(addresses).toBeVisible()
    await expect(addresses.getByText(baseAddress.recordsOffice.mailingAddress.streetAddress)).toBeVisible()
    await expect(addresses.getByText(baseAddress.recordsOffice.deliveryAddress.streetAddress)).toBeVisible()
    await expect(addresses.getByText(baseAddress.registeredOffice.mailingAddress.streetAddress)).toBeVisible()
    await expect(addresses.getByText(baseAddress.registeredOffice.deliveryAddress.streetAddress)).toBeVisible()
    // verify draft director changes
    const directors = page.getByTestId('section-directors')
    await expect(directors).toBeVisible()
    await expect(directors.getByTestId('director-name'))
      .toContainText(baseParties.parties[0]?.officer.firstName || '')
    await expect(directors.getByTestId('director-badge')).toHaveText('Changed')
    await expect(directors.getByTestId('director-mailing'))
      .toContainText(draft.filing.transition.parties[0]?.mailingAddress.streetAddress || '')
    await expect(directors.getByTestId('director-delivery'))
      .toContainText(draft.filing.transition.parties[0]?.deliveryAddress.streetAddress || '')
    // verify share changes
    const shares = page.getByTestId('section-shares')
    await expect(shares).toBeVisible()
    const badges = await shares.getByTestId('share-badge').all()
    expect(badges).toHaveLength(2)
    expect(badges[0] as Locator).toHaveText('Added')
    expect(badges[1] as Locator).toHaveText('Removed')
    // verify completing party email
    const contact = page.getByTestId('section-contact')
    await expect(contact).toBeVisible()
    await expect(contact.getByTestId('documentDelivery.completingPartyEmail'))
      .toHaveValue(draft.filing.transition.contactPoint.email)
  })
})
