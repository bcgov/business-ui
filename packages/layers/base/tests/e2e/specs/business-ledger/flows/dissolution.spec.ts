import { test, expect } from '@playwright/test'

import { FilingType } from '../../../../../app/enums/filing-type'
import { mockApiCallsForLedger } from '../../../../mocks/mock-helpers'

test.describe('Business Ledger Tests (dissolution)', () => {
  test.beforeEach(async ({ page }) => {
    const identifier = 'BC1234567'
    const adminOverrideData = {
      applicationDate: '2024-07-16T23:17:24.157435+00:00',
      dissolution: {
        dissolutionDate: '2024-07-16',
        dissolutionType: 'administrative'
      },
      legalFilings: ['dissolution'],
      order: {
        orderDetails: 'test'
      }
    }
    await mockApiCallsForLedger(
      page,
      identifier,
      [
        // voluntary (defualt from mock json)
        { type: FilingType.DISSOLUTION },
        // admin (mock data partially overridden)
        {
          type: FilingType.DISSOLUTION,
          overrides: [
            { key: 'filingId', value: 1234 },
            { key: 'filingSubType', value: 'administrative' },
            { key: 'displayName', value: 'Administrative Dissolution' },
            { key: 'data', value: adminOverrideData }
          ]
        }
      ]
    )
    await page.goto('./examples/components/BusinessLedger')
    await page.waitForLoadState('networkidle')
    const input = page.getByTestId('identifier-input')
    input.fill(identifier)
    const loadLedgerBtn = page.getByRole('button', { name: 'Load Business Ledger' })
    await loadLedgerBtn.click()
    await page.waitForLoadState('networkidle')
  })

  test('Loading the ledger works displays these items as expected', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    expect(ledgerItems.length).toBe(2)
    const expectedDisplay = {
      title: [
        'Voluntary Dissolution',
        'Administrative Dissolution'
      ],
      subtitle: [
        'FILED AND PAID (filed by Tester Testing on Dec 12, 2024) EFFECTIVE as of Dec 12, 2024',
        'FILED (filed by Tester Testing on Dec 12, 2024) EFFECTIVE as of Dec 12, 2024'
      ]
    }
    for (let i = 0; i < ledgerItems.length; i++) {
      const item = ledgerItems[i]!
      const header = item.getByTestId('business-ledger-item-header')
      const headerTitle = header.getByTestId('business-ledger-item-header-title')
      const headerSubtitle = header.getByTestId('business-ledger-item-header-subtitle')
      // Header
      await expect(header).toBeVisible()
      // title
      await expect(headerTitle).toBeVisible()
      await expect(headerTitle).toHaveText(expectedDisplay.title[i]!)
      // subtitle
      await expect(headerSubtitle).toBeVisible()
      await expect(headerSubtitle).toHaveText(expectedDisplay.subtitle[i]!)
    }
  })

  test('Expanding the ledger items displays as expected', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    expect(ledgerItems.length).toBe(2)
    const expectedDisplay = {
      bodyTitle: [
        'Dissolution Completed',
        ''
      ],
      bodyText: [
        // eslint-disable-next-line max-len
        'The Company 0887698 B.C. LTD. was successfully dissolved on December 12, 2024 at 11:46 am Pacific time. The Company has been struck from the register and dissolved, and ceased to be a registered Company under the Business Corporations Act.',
        // Due to orderDetails
        'test'
      ],
      bodyDisclaimer: [
        'You are required to retain a copy of all the dissolution documents in your records book.',
        ''
      ]
    }
    for (let i = 0; i < ledgerItems.length; i++) {
      const item = ledgerItems[i]!
      const ledgerItemBody = item.getByTestId('business-ledger-item-body')
      await expect(ledgerItemBody).not.toBeVisible()
      // expand
      const headerDocumentsBtn = item.getByTestId('business-ledger-item-header')
        .getByTestId('business-ledger-item-header-dropdown-btn')
      await headerDocumentsBtn.click()
      await page.waitForLoadState('networkidle')
      // verify
      await expect(ledgerItemBody).toBeVisible()
      const bodyText = ledgerItemBody.getByTestId('business-ledger-item-body-text')
      await expect(bodyText).toBeVisible()
      await expect(bodyText.getByText(expectedDisplay.bodyTitle[i]!)).toBeVisible()
      await expect(bodyText.getByText(expectedDisplay.bodyText[i]!)).toBeVisible()
      await expect(bodyText.getByText(expectedDisplay.bodyDisclaimer[i]!)).toBeVisible()
    }
  })
})
