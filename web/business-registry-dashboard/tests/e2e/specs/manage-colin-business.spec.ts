/**
 * E2E coverage for affiliating COLIN businesses (BC/ULC/CC corps not yet loaded in LEAR) via the ManageBusiness modal.
 */
import { test, expect, type Locator } from '@playwright/test'
import { mockColinBusinessFlow, triggerManageBusiness } from '../utils/mock-colin-business'

const identifier = 'BC0870226'

// NB: never assert toBeVisible()/toBeHidden() on the dialog element itself - the
// role="dialog" wrapper only has fixed-position children, so its bounding box is
// zero-size and Playwright treats it as hidden even when the modal is on screen.
// Assert on attached/detached (or on the modal's content) instead.

const notMigratedText = /has not been migrated to the new BC Business Registry/

/** The warning alert ModalBase renders above the modal title. */
function colinAlert (dialog: Locator): Locator {
  return dialog.locator('p', { hasText: notMigratedText })
}

test.describe('Manage Business - COLIN business affiliation', () => {
  test('COLIN business happy path: syncs from COLIN before opening modal, lists passcode and email options', async ({ page }) => {
    const handles = await mockColinBusinessFlow(page, {
      identifier,
      flags: {
        'enable-colin-business-affiliation': true,
        'allowable-business-passcode-types': 'BC BEN CP ULC CC',
        'enable-affiliation-delegation': true
      },
      hasValidPassCode: true,
      contactsEmail: 'colin-contact@example.com',
      isLearBusiness: false
    })

    await triggerManageBusiness(page, identifier)

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeAttached()

    // Wait for the modal's onMounted option-gating calls to settle (loading spinner gone).
    await expect(page.getByText('Use the company password')).toBeVisible()
    await expect(page.getByText('Confirm authorization using your registered office email address')).toBeVisible()

    // The sync POST must happen before the modal's own option-gating GET requests.
    // (callOrder also records the regSearch triggered by ?populate=, so assert
    // relative order rather than absolute position.)
    expect(handles.callOrder).toContain('sync-from-colin')
    expect(handles.callOrder.indexOf('sync-from-colin')).toBeLessThan(handles.callOrder.indexOf('contacts'))
    expect(handles.callOrder.indexOf('sync-from-colin')).toBeLessThan(handles.callOrder.indexOf('authentication'))

    // the business is affiliable, but only as an amalgamating party - say so up front
    const alert = colinAlert(dialog)
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('COLIN TEST COMPANY')
    await expect(alert).toContainText('You can only use the company here for an Amalgamation')
    await expect(alert.getByRole('link', { name: 'Corporate Online' })).toBeVisible()
  })

  test('passcode add: shows the success modal, then highlights and scrolls to the new row', async ({ page }) => {
    const handles = await mockColinBusinessFlow(page, {
      identifier,
      flags: {
        'enable-colin-business-affiliation': true,
        'allowable-business-passcode-types': 'BC BEN CP ULC CC'
      },
      hasValidPassCode: true,
      contactsEmail: 'colin-contact@example.com',
      isLearBusiness: false
    })

    await triggerManageBusiness(page, identifier)

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeAttached()

    // passcode + email are both offered - pick the passcode option and submit
    await page.getByText('Use the company password').click()
    await dialog.getByTestId('formgroup-passcode-input').locator('input').fill('12345678')
    await dialog.getByRole('button', { name: /^Manage this/ }).click()

    // the ManageBusiness modal is swapped out for the success modal
    await expect(page.getByText('Success! COLIN TEST COMPANY has been added to your account.')).toBeVisible()
    expect(handles.callOrder).toContain('create-affiliation')

    // closing the success modal reloads the table with the new row highlighted and in view
    await page.getByRole('button', { name: 'OK' }).click()
    await expect(dialog).toHaveCount(0)

    const newRow = page.locator('tr.new-affiliation-row')
    await expect(newRow).toBeVisible()
    await expect(newRow).toContainText('COLIN TEST COMPANY')
    await expect(newRow).toBeInViewport()

    // exactly one reload after closing the success modal (plus the initial dashboard
    // load) - a double reload flashes the table's loader twice
    expect(handles.callOrder.filter(label => label === 'affiliations')).toHaveLength(2)
  })

  test('email option: pending request row renders after close, even with a null invite entity', async ({ page }) => {
    const handles = await mockColinBusinessFlow(page, {
      identifier,
      flags: {
        'enable-colin-business-affiliation': true,
        'enable-affiliation-invitation-request-access': true
      },
      contactsEmail: 'colin-contact@example.com',
      isLearBusiness: false,
      // pending invitations are only processed when the account already has an affiliation
      existingAffiliations: [{ identifier: 'BC0000001', legalName: 'EXISTING LEAR COMPANY', legalType: 'BEN' }]
    })

    await triggerManageBusiness(page, identifier)

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeAttached()

    // passcode types default to '' in the mock, so email is the only option and is auto-selected
    await expect(page.getByText('Confirm authorization using your registered office email address')).toBeVisible()
    await dialog.getByRole('button', { name: /^Manage this/ }).click()

    await expect(page.getByText('Authorization Email Sent')).toBeVisible()
    expect(handles.callOrder).toContain('create-invitation')

    await dialog.getByRole('button', { name: 'Close', exact: true }).last().click()
    await expect(dialog).toHaveCount(0)

    // the reload builds a row from the pending invite; auth-api returns entity: null for a COLIN business,
    // which was putting the table into an error state
    await expect(page.locator('tbody tr', { hasText: identifier })).toBeVisible()
    await expect(page.getByText('List not found')).toBeHidden()
  })

  test('no COLIN alert for a business already migrated to LEAR', async ({ page }) => {
    await mockColinBusinessFlow(page, {
      identifier,
      flags: {
        'enable-colin-business-affiliation': true,
        'allowable-business-passcode-types': 'BC BEN CP ULC CC'
      },
      modernized: true,
      isLearBusiness: true,
      hasValidPassCode: true,
      contactsEmail: 'lear-contact@example.com'
    })

    await triggerManageBusiness(page, identifier)

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeAttached()

    await expect(page.getByText('Use the company password')).toBeVisible()
    await expect(colinAlert(dialog)).toBeHidden()
  })

  test('delegation option is never offered for a COLIN business with no affiliated accounts', async ({ page }) => {
    await mockColinBusinessFlow(page, {
      identifier,
      flags: {
        'enable-colin-business-affiliation': true,
        'allowable-business-passcode-types': 'BC BEN CP ULC CC',
        'enable-affiliation-delegation': true
      },
      orgsDetails: [],
      isLearBusiness: false
    })

    await triggerManageBusiness(page, identifier)

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeAttached()

    // Wait for the modal to settle on some final option (or the dead-end state).
    await expect(page.getByText('Use the company password').or(page.getByText(/is still managed through/i))).toBeVisible()

    await expect(page.getByText('Request authorization from an account managing this company')).not.toBeVisible()
  })

  test('dead-end: business not found in COLIN shows the "still managed through Corporate Online" message', async ({ page }) => {
    await mockColinBusinessFlow(page, {
      identifier,
      flags: { 'enable-colin-business-affiliation': true },
      syncStatus: 404,
      contactsStatus: 404,
      authenticationStatus: 404,
      orgsDetails: [],
      isLearBusiness: false
    })

    await triggerManageBusiness(page, identifier)

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeAttached()

    await expect(page.getByText(/is still managed through/i)).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'Corporate Online' })).toBeVisible()

    // nothing to affiliate with, so the amalgamation-only alert would contradict
    // the dead-end message the body already shows
    await expect(colinAlert(dialog)).toBeHidden()

    const closeButton = dialog.getByRole('button', { name: 'Close', exact: true }).last()
    await expect(closeButton).toBeVisible()
    await closeButton.click()
    await expect(dialog).toHaveCount(0)
  })

  test('flag off: does not sync from COLIN before opening the modal', async ({ page }) => {
    const handles = await mockColinBusinessFlow(page, {
      identifier,
      flags: { 'enable-colin-business-affiliation': false },
      contactsStatus: 404,
      authenticationStatus: 404,
      orgsDetails: [],
      isLearBusiness: false
    })

    await triggerManageBusiness(page, identifier)

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeAttached()

    // Wait for the modal to settle so we know the flow has fully run its course.
    await expect(page.getByText(/is still managed through/i)).toBeVisible()

    expect(handles.callOrder).not.toContain('sync-from-colin')
  })
})
