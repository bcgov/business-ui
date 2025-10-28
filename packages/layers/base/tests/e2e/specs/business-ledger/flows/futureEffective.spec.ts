import { test, expect } from '@playwright/test'
import { DateTime } from 'luxon'

import { FilingType } from '../../../../../app/enums/filing-type'
import { toFormattedDateStr } from '../../../../../app/utils/date'
import { mockApiCallsForLedger } from '../../../../mocks/mock-helpers'

const today = DateTime.fromJSDate(new Date(), { zone: 'America/Vancouver' })
const tomorrow = (today.plus({ days: 1 })).set({ hour: 0, minute: 1 })
const futureDateStr = `${tomorrow.weekdayShort}, ${tomorrow.day} ${tomorrow.monthShort} ${tomorrow.year} 00:01:00 PDT`

test.describe('Business Ledger Tests (future effective)', () => {
  test.beforeEach(async ({ page }) => {
    const identifier = 'BC1234567'
    await mockApiCallsForLedger(
      page,
      identifier,
      [
        {
          type: FilingType.INCORPORATION_APPLICATION,
          overrides: [
            { key: 'effectiveDate', value: futureDateStr },
            { key: 'isFutureEffective', value: true },
            { key: 'status', value: 'PAID' }
          ]
        },
        {
          type: FilingType.CHANGE_OF_ADDRESS,
          overrides: [
            { key: 'effectiveDate', value: futureDateStr },
            { key: 'isFutureEffective', value: true },
            { key: 'status', value: 'PAID' }
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
        'BC Limited Company Incorporation Application',
        'Address Change'
      ],
      subtitle: [
        // eslint-disable-next-line max-len
        `FUTURE EFFECTIVE FILINGPAID (filed by Tester Testing on Feb 21, 2025) EFFECTIVE as of ${toFormattedDateStr(tomorrow.toJSDate(), DateTime.DATE_MED)}`,
        // eslint-disable-next-line max-len
        `FILED AND PENDING (filed by Tester Testing on Oct 10, 2025) EFFECTIVE as of ${toFormattedDateStr(tomorrow.toJSDate(), DateTime.DATE_MED)}`
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
        'Future Effective Date',
        'Filed and Pending'
      ],
      bodyText1: [
        // eslint-disable-next-line max-len
        `The incorporation will take effect on ${toFormattedDateStr(tomorrow.toJSDate(), DateTime.DATE_FULL)} at 12:01 am Pacific time.`,
        // eslint-disable-next-line max-len
        `The address change will take effect on ${toFormattedDateStr(tomorrow.toJSDate(), DateTime.DATE_FULL)} at 12:01 am Pacific time.`
      ],
      bodyText2: [
        // eslint-disable-next-line max-len
        'If you no longer wish to file this incorporation, you must submit a Notice of Withdrawal Form and a $20.00 fee to BC Registries. You must provide BC Registries with enough time to process the withdrawal before the effective date and time. If you withdraw this record, your filing fees will not be refunded.',
        // eslint-disable-next-line max-len
        'If you no longer wish to file this address change, you must submit a Notice of Withdrawal Form and a $20.00 fee to BC Registries. You must provide BC Registries with enough time to process the withdrawal before the effective date and time. If you withdraw this record, your filing fees will not be refunded.'
      ]
    }
    for (let i = 0; i < ledgerItems.length; i++) {
      const item = ledgerItems[i]!
      const ledgerItemBody = item.getByTestId('business-ledger-item-body')
      await expect(ledgerItemBody).not.toBeVisible()
      // expand
      const headerDocumentsBtn = item.getByTestId('business-ledger-item-header')
        .getByTestId('business-ledger-item-header-dropdown-btn').getByRole('button')
      await headerDocumentsBtn.click()
      await page.waitForLoadState('networkidle')
      // verify
      await expect(ledgerItemBody).toBeVisible()
      const bodyText = ledgerItemBody.getByTestId('business-ledger-item-body-text')
      await expect(bodyText).toBeVisible()
      await expect(bodyText.getByTestId('business-help-contact')).toBeVisible()
      await expect(bodyText.getByText(expectedDisplay.bodyTitle[i]!)).toBeVisible()
      await expect(bodyText.getByText(expectedDisplay.bodyText1[i]!)).toBeVisible()
      await expect(bodyText.getByText(expectedDisplay.bodyText2[i]!)).toBeVisible()
      await expect(bodyText.getByText(
        // eslint-disable-next-line max-len
        'BC Registries Contact InformationMonday to Friday, 8:30am - 4:30pm Pacific Time Toll Free: 1-877-370-1033 Victoria Office: 1-250-370-1033 Email: BCRegistries@gov.bc.ca'
      )).toBeVisible()
    }
  })
})
