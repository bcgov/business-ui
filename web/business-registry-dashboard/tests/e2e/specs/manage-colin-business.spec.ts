/**
 * E2E coverage for affiliating COLIN businesses (BC/ULC/CC corps not yet loaded in LEAR) via the ManageBusiness modal.
 */
import { test, expect } from '@playwright/test'
import { mockColinBusinessFlow, triggerManageBusiness } from '../utils/mock-colin-business'

const identifier = 'BC0870226'

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
    await expect(dialog).toBeVisible()

    // Wait for the modal's onMounted option-gating calls to settle (loading spinner gone).
    await expect(page.getByText('Use the company password')).toBeVisible()
    await expect(page.getByText('Confirm authorization using your registered office email address')).toBeVisible()

    // The sync POST must happen before the modal's own option-gating GET requests.
    // (callOrder also records the regSearch triggered by ?populate=, so assert
    // relative order rather than absolute position.)
    expect(handles.callOrder).toContain('sync-from-colin')
    expect(handles.callOrder.indexOf('sync-from-colin')).toBeLessThan(handles.callOrder.indexOf('contacts'))
    expect(handles.callOrder.indexOf('sync-from-colin')).toBeLessThan(handles.callOrder.indexOf('authentication'))
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
    await expect(dialog).toBeVisible()

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
    await expect(dialog).toBeVisible()

    await expect(page.getByText(/is still managed through/i)).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'Corporate Online' })).toBeVisible()

    const closeButton = dialog.getByRole('button', { name: 'Close', exact: true }).last()
    await expect(closeButton).toBeVisible()
    await closeButton.click()
    await expect(dialog).not.toBeVisible()
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
    await expect(dialog).toBeVisible()

    // Wait for the modal to settle so we know the flow has fully run its course.
    await expect(page.getByText(/is still managed through/i)).toBeVisible()

    expect(handles.callOrder).not.toContain('sync-from-colin')
  })
})
