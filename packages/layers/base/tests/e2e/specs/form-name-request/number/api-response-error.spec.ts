import { test, expect } from '@playwright/test'

import { fillOutNrNumber } from '../../../test-utils'

const API_FAILURE_RESPONSE_CASES = [
  {
    testName: '400',
    statusCode: 400,
    // eslint-disable-next-line max-len
    expectedMsg: 'We could not find a match for the information you have entered. Please verify the NR Number and try again.'
  },
  {
    testName: '403',
    statusCode: 403,
    // eslint-disable-next-line max-len
    expectedMsg: 'We could not find a match for the information you have entered. Please verify the NR Number and try again.'
  },
  {
    testName: '404',
    statusCode: 404,
    // eslint-disable-next-line max-len
    expectedMsg: 'We could not find a match for the information you have entered. Please verify the NR Number and try again.'
  },
  {
    testName: '500',
    statusCode: 500,
    expectedMsg: 'An unexpected error has occurred.'
  }
]

test.describe('NameRequestNumber - api error validation', () => {
  API_FAILURE_RESPONSE_CASES.forEach(({ testName, statusCode, expectedMsg }) => {
    test(testName, async ({ page }) => {
      await page.goto('./en-CA/examples/components/Form/NameRequest/Number')
      await page.waitForLoadState('networkidle')
      page.route('**/api/v2/nameRequests/**/validate', async (route) => {
        await route.fulfill({ status: statusCode })
      })
      await fillOutNrNumber(page, 'NR 1234567')

      const nrNumberGrp = page.getByTestId('form-group-nr-number')
      await expect(nrNumberGrp).toContainText(expectedMsg)
    })
  })
})
