import { test, expect } from '@playwright/test'

import { DissolutionType } from '#business/app/enums/dissolution-type'
import { fillOutCertify, fillOutCourtOrder, fillOutFolio } from '#business/tests/e2e/test-utils'
import { mockCommonApiCallsForFiling } from '#test-mocks'

import { DelayOption } from '~~/app/enums/delay-option'
import { DISDE } from '~~/tests/mocks'
import { navigateToDodPage } from '~~/tests/e2e/test-utils'

const identifier = 'BC1234567'

test.describe('Delay of Dissolution - Filing Submit', () => {
  test.describe('Happy Path', () => {
    const testCases = [
      {
        testName: 'Non-staff',
        heading: 'Delay of Dissolution or Cancellation',
        isStaff: false,
        addToLedger: true,
        innerPayload: {
          dissolutionType: DissolutionType.DELAY,
          delayType: DelayOption.DEFAULT
        },
        headerPayload: {
          certifiedBy: 'Fred Jones',
          folioNumber: 'folio123'
        }
      }
      // FUTURE: needs auth layer changes before uncommenting
      //   - will work once we can mock the account as staff (tested with isStaff in store as true)
      // {
      //   testName: 'Staff-default',
      //   heading: 'Stay of Dissolution or Cancellation',
      //   isStaff: true,
      //   addToLedger: false,
      //   innerPayload: {
      //     courtOrder: {
      //       hasPlanOfArrangement: true,
      //       fileNumber: '12345'
      //     },
      //     dissolutionType: DissolutionType.DELAY,
      //     delayType: DelayOption.DEFAULT
      //   },
      //   headerPayload: {
      //     folioNumber: 'folio123'
      //   }
      // }
    ]
    testCases.forEach(({ testName, heading, isStaff, addToLedger, innerPayload, headerPayload }) => {
      test.beforeEach(async ({ page }) => {
        mockCommonApiCallsForFiling(page, identifier, undefined, DISDE, undefined)
        await navigateToDodPage(page, identifier)
        await page.waitForLoadState('networkidle')
      })
      test(testName, async ({ page }) => {
        expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 10000 })
        if (headerPayload.folioNumber) {
          await fillOutFolio(page, headerPayload.folioNumber)
        }
        if (isStaff) {
          await fillOutCourtOrder(
            page,
            {
              hasPoa: innerPayload.courtOrder?.hasPlanOfArrangement,
              courtOrderNumber: innerPayload.courtOrder?.fileNumber
            }
          )
          if (addToLedger) {
            const addLedgerCheckbox = page.getByRole(
              'checkbox', { name: 'Yes create a ledger item for this stay of dissolution' })
            expect(addLedgerCheckbox).toBeVisible()
            await addLedgerCheckbox.check()
          }
        } else {
          await fillOutCertify(page, headerPayload.certifiedBy!)
        }
        const submitRequest = page.waitForRequest(`**/businesses/${identifier}/filings`, { timeout: 10000 })
        await page.getByRole('button', { name: 'Submit' }).click({ force: true })
        const request = await submitRequest
        const requestBody = request.postDataJSON() as FilingSubmissionBody<{ dissolution: DissolutionPayload }>
        expect(requestBody.filing.dissolution).toEqual(innerPayload)
        expect(requestBody.filing.header.folioNumber).toEqual(headerPayload.folioNumber)
        const requestHeaders = request.headers()
        if (isStaff) {
          expect(requestHeaders['hide-in-ledger']).toBe(String(!addToLedger))
        } else {
          expect(requestHeaders['hide-in-ledger']).toBe('false')
          expect(requestBody.filing.header.certifiedBy).toEqual(headerPayload.certifiedBy)
        }
        // should be redirected to business dashboard on success
        await page.waitForURL(
          `${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}**`,
          { timeout: 5000 }
        )
        expect(page.url()).toContain(`${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}${identifier}`)
      })
    })
  })
})
