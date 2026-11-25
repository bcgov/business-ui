import { test, expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

import i18n from '#business/i18n/locales/en-CA'
import { fillOutAddress } from '#business/tests/e2e/test-utils'

// the playground page picks the address rule by office type:
// - registered / records office: bcCanadaOnly: 'delivery' + noPoBox - the delivery address must be a physical
//   location in BC, Canada; the mailing address may be anywhere, including a PO Box
// - liquidation records office: bcCanadaOnly: true + noPoBox - both addresses must be in BC, Canada; only the
//   delivery address must be a physical location (the mailing address may be a BC PO Box)
test.describe('ManageOffices - bcCanadaOnly', () => {
  const sameAsLabel = i18n.label.deliveryAddressSameAsMailing
  const bcError = i18n.validation.addressMustBeInBc

  test.beforeEach(async ({ page }) => {
    await page.goto('./en-CA/examples/components/Manage/Offices/bc-canada-only')
    await page.waitForLoadState('networkidle')
  })

  // opens the office with 'same as' unchecked (the mock registered office has identical addresses, so it opens checked)
  async function openOfficeEdit(page: Page, office: 'Registered Office' | 'Liquidation Records Office') {
    const table = page.getByRole('table')
    const row = table.locator('tbody').getByRole('row').filter({ hasText: office })
    await row.getByRole('button', { name: 'Change' }).click()
    const subForm = page.getByTestId('office-address-form')
    await expect(subForm).toBeVisible()
    const sameAs = subForm.getByRole('checkbox', { name: sameAsLabel })
    await expect(async () => {
      if (await sameAs.isChecked()) {
        await sameAs.click({ force: true })
      }
      await expect(sameAs).not.toBeChecked()
    }).toPass()
    return subForm
  }

  async function selectRegion(page: Page, subForm: Locator, type: 'mailing' | 'delivery', region: string) {
    const regionSelect = subForm.getByTestId(`${type}-address-input-region`)
    await expect(regionSelect).toBeEnabled()
    await regionSelect.click()
    const optionsList = page.getByRole('listbox')
    await expect(optionsList).toBeVisible()
    await optionsList.getByRole('option', { name: region }).click()
    await expect(optionsList).not.toBeVisible()
  }

  test('Should accept a non-BC mailing address with a BC delivery address', async ({ page }) => {
    const subForm = await openOfficeEdit(page, 'Registered Office')

    await selectRegion(page, subForm, 'mailing', 'Alberta')
    await subForm.getByRole('button', { name: 'Done' }).click()

    await expect(page.getByTestId('office-address-form')).toHaveCount(0)
  })

  test('Should show an inline error for a non-BC delivery region', async ({ page }) => {
    const subForm = await openOfficeEdit(page, 'Registered Office')

    await selectRegion(page, subForm, 'delivery', 'Alberta')
    await subForm.getByRole('button', { name: 'Done' }).click()

    await expect(subForm.getByText(bcError).first()).toBeVisible()
    // the form stays open (done blocked by validation)
    await expect(page.getByTestId('office-address-form')).toBeVisible()
  })

  test('Should uncheck "same as" and show the BC error on the delivery address when the mailing province changes',
    async ({ page }) => {
      const subForm = await openOfficeEdit(page, 'Registered Office')
      const sameAs = subForm.getByRole('checkbox', { name: sameAsLabel })
      await sameAs.check({ force: true })

      await selectRegion(page, subForm, 'mailing', 'Alberta')

      await expect(sameAs).not.toBeChecked()
      const deliveryRegion = subForm.getByTestId('delivery-address-input-region')
      await expect(deliveryRegion).toContainText('Alberta')
      await expect(deliveryRegion).toHaveAttribute('aria-invalid', 'true')
      // the user is taken to the delivery error
      await expect(deliveryRegion).toBeFocused()
      // the mailing address may be outside BC - no error there
      await expect(subForm.getByTestId('mailing-address-input-region')).not.toHaveAttribute('aria-invalid', 'true')
      await expect(subForm.getByText(bcError)).toHaveCount(1)
    })

  test('Should grey out "same as" while the mailing address is a PO Box', async ({ page }) => {
    const subForm = await openOfficeEdit(page, 'Registered Office')
    const sameAs = subForm.getByRole('checkbox', { name: sameAsLabel })
    const mailingStreet = subForm.getByTestId('mailing-address-input-street')

    await mailingStreet.fill('PO Box 234')

    await expect(sameAs).toBeDisabled()

    // a physical mailing address makes it available again
    await mailingStreet.fill('456 New St')
    await expect(sameAs).toBeEnabled()
  })

  test('Should accept a BC PO Box mailing address but not as the delivery address', async ({ page }) => {
    const subForm = await openOfficeEdit(page, 'Registered Office')
    const sameAs = subForm.getByRole('checkbox', { name: sameAsLabel })
    await sameAs.check({ force: true })

    // the PO Box check waits for the mailing inputs to lose focus
    const mailingStreet = subForm.getByTestId('mailing-address-input-street')
    await mailingStreet.fill('PO Box 234')
    await mailingStreet.blur()

    // a PO Box is a delivery only error - 'same as' unchecks to show the delivery address with the error
    await expect(sameAs).not.toBeChecked()
    const deliveryStreet = subForm.getByTestId('delivery-address-input-street')
    await expect(deliveryStreet).toHaveValue('PO Box 234')
    await expect(deliveryStreet).toHaveAttribute('aria-invalid', 'true')
    await expect(deliveryStreet).toBeFocused()
    await expect(sameAs).toBeDisabled()

    // a physical delivery address fixes it - the PO Box mailing address is accepted
    await deliveryStreet.fill('456 New St')
    await subForm.getByRole('button', { name: 'Done' }).click()

    await expect(page.getByTestId('office-address-form')).toHaveCount(0)
    await expect(page.getByTestId('offices-payload')).toContainText('PO Box 234')
    await expect(page.getByTestId('offices-payload')).toContainText('456 New St')
  })

  test('Should accept a BC, Canada address', async ({ page }) => {
    const subForm = await openOfficeEdit(page, 'Registered Office')

    await fillOutAddress(page, {
      streetAddress: '456 New St',
      addressCity: 'Victoria',
      addressRegion: 'British Columbia',
      addressCountry: 'CA',
      postalCode: 'V8V 1V1',
      deliveryInstructions: ''
    }, 'mailing', true, subForm)

    await subForm.getByRole('button', { name: 'Done' }).click()

    await expect(page.getByTestId('office-address-form')).toHaveCount(0)
    await expect(page.getByTestId('offices-payload')).toContainText('456 New St')
  })

  // the delivery rules match the registered office (covered above) and the rule details are covered by the schema
  // unit tests - these only check the playground applies the both-in-BC rule to the liquidation records office
  test.describe('liquidation records office', () => {
    test('Should show an inline error for a non-BC mailing region', async ({ page }) => {
      const subForm = await openOfficeEdit(page, 'Liquidation Records Office')

      await selectRegion(page, subForm, 'mailing', 'Alberta')
      await subForm.getByRole('button', { name: 'Done' }).click()

      await expect(subForm.getByTestId('mailing-address-input-region')).toHaveAttribute('aria-invalid', 'true')
      await expect(subForm.getByText(bcError).first()).toBeVisible()
      await expect(page.getByTestId('office-address-form')).toBeVisible()
    })

    test('Should accept a BC PO Box mailing address with a physical BC delivery address', async ({ page }) => {
      const subForm = await openOfficeEdit(page, 'Liquidation Records Office')

      await subForm.getByTestId('mailing-address-input-street').fill('PO Box 234')
      await subForm.getByRole('button', { name: 'Done' }).click()

      await expect(page.getByTestId('office-address-form')).toHaveCount(0)
      await expect(page.getByTestId('offices-payload')).toContainText('PO Box 234')
    })

    test('Should keep "same as" checked and clear the error when the mailing province goes back to BC',
      async ({ page }) => {
        const subForm = await openOfficeEdit(page, 'Liquidation Records Office')
        const sameAs = subForm.getByRole('checkbox', { name: sameAsLabel })
        // retry like openOfficeEdit - the form can still be settling, so a single click may not register
        await expect(async () => {
          if (!(await sameAs.isChecked())) {
            await sameAs.click({ force: true })
          }
          await expect(sameAs).toBeChecked()
        }).toPass()

        // outside BC - the error is shared by both addresses, so it shows on the mailing address and stays checked
        await selectRegion(page, subForm, 'mailing', 'Alberta')
        await expect(subForm.getByTestId('mailing-address-input-region')).toHaveAttribute('aria-invalid', 'true')
        await expect(sameAs).toBeChecked()

        // back in BC - the hidden delivery address's error must clear too, not uncheck 'same as'
        await selectRegion(page, subForm, 'mailing', 'British Columbia')
        await expect(sameAs).toBeChecked()
        await expect(subForm.getByTestId('delivery-address-input-region')).toHaveCount(0)
        await expect(subForm.getByText(bcError)).toHaveCount(0)

        await subForm.getByRole('button', { name: 'Done' }).click()
        await expect(page.getByTestId('office-address-form')).toHaveCount(0)
      })
  })
})
