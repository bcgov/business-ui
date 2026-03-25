import { test, expect } from '@playwright/test'
import { fillOutNrNumber, selectDone } from '../../../test-utils'
import { getNameRequestMock } from '../../../../mocks/name-request'

const INPUT_FORMAT_CASES = [
  {
    testName: 'Valid input - NR 1234567',
    input: 'NR 1234567',
    expectedInput: 'NR 1234567',
    expectedMsg: 'Example: NR 1234567'
  },
  {
    testName: 'Valid input - NR1234567',
    input: 'NR1234567',
    expectedInput: 'NR 1234567',
    expectedMsg: 'Example: NR 1234567'
  },
  {
    testName: 'Valid input - 1234567',
    input: '1234567',
    expectedInput: 'NR 1234567',
    expectedMsg: 'Example: NR 1234567'
  },
  {
    testName: 'Invalid input - NR 123456',
    input: 'NR 123456',
    expectedInput: 'NR 123456',
    expectedMsg: 'Name Request Number is invalid'
  },
  {
    testName: 'Invalid input - 1234abc',
    input: '1234abc',
    expectedInput: 'NR 1234',
    expectedMsg: 'Name Request Number is invalid'
  },
  {
    testName: 'Invalid - no input',
    input: '',
    expectedInput: '',
    expectedMsg: 'Name Request Number is required'
  }
]

test.describe('NameRequestNumber - format validation', () => {
  INPUT_FORMAT_CASES.forEach(({ testName, input, expectedInput, expectedMsg }) => {
    test(testName, async ({ page }) => {
      await page.goto('./en-CA/examples/components/Form/NameRequest/Number')
      await page.waitForLoadState('networkidle')
      page.route('**/api/v2/nameRequests/**/validate', async (route) => {
        await route.fulfill({ json: getNameRequestMock() })
      })
      await fillOutNrNumber(page, input)
      if (testName === 'Invalid - no input') {
        // click Done to trigger validation
        await selectDone(page)
      }
      const nrInput = page.getByTestId('nr-number-input')
      await expect(nrInput).toHaveValue(expectedInput)
      const nrNumberGrp = page.getByTestId('form-group-nr-number')
      await expect(nrNumberGrp).toContainText(expectedMsg)
    })
  })
})
