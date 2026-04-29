import { test, expect } from '@playwright/test'

test.describe('ManageShareStructure (currency other)', () => {
  test('Should render table with expected data', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageShareStructure/currency-other')
    await page.waitForLoadState('networkidle')

    const table = page.getByRole('table')
    await expect(table).toBeVisible()

    // has expected rows
    const rows = await table.locator('tbody').getByRole('row').all()
    expect(rows.length).toBe(10) // 7 visible + 3 hidden rows for expansion slot
    // has expected columns
    const classA = await rows[0]!.locator('td').all()
    expect(classA.length).toBe(6)
    expect(classA[0]!).toHaveText('Class A - Common Stock Shares')
    expect(classA[1]!).toHaveText('No Maximum')
    expect(classA[2]!).toHaveText('1')
    expect(classA[3]!).toHaveText('Percent of the share')
    expect(classA[4]!).toHaveText('Yes')
    expect(classA[5]!).toHaveText('Change')

    const classASeries = await rows[2]!.locator('td').all()
    expect(classASeries.length).toBe(6)
    expect(classASeries[0]!).toHaveText('Seed Shares')
    expect(classASeries[1]!).toHaveText('No Maximum')
    expect(classASeries[2]!).toHaveText('No Par Value')
    expect(classASeries[3]!).toHaveText('')
    expect(classASeries[4]!).toHaveText('Yes')
    expect(classASeries[5]!).toHaveText('Change')

    const classB = await rows[3]!.locator('td').all()
    expect(classB.length).toBe(6)
    expect(classB[0]!).toHaveText('Class B - Preferred Stock Shares')
    expect(classB[1]!).toHaveText('No Maximum')
    expect(classB[2]!).toHaveText('2')
    expect(classB[3]!).toHaveText('Percent of Company’s Net')
    expect(classB[4]!).toHaveText('Yes')
    expect(classB[5]!).toHaveText('Change')

    const classBSeries1 = await rows[5]!.locator('td').all()
    expect(classBSeries1.length).toBe(6)
    expect(classBSeries1[0]!).toHaveText('Pre-Seed Shares')
    expect(classBSeries1[1]!).toHaveText('No Maximum')
    expect(classBSeries1[2]!).toHaveText('No Par Value')
    expect(classBSeries1[3]!).toHaveText('')
    expect(classBSeries1[4]!).toHaveText('Yes')
    expect(classBSeries1[5]!).toHaveText('Change')

    const classBSeries2 = await rows[6]!.locator('td').all()
    expect(classBSeries2.length).toBe(6)
    expect(classBSeries2[0]!).toHaveText('Seed Shares')
    expect(classBSeries2[1]!).toHaveText('No Maximum')
    expect(classBSeries2[2]!).toHaveText('No Par Value')
    expect(classBSeries2[3]!).toHaveText('')
    expect(classBSeries2[4]!).toHaveText('Yes')
    expect(classBSeries2[5]!).toHaveText('Change')

    const classC = await rows[7]!.locator('td').all()
    expect(classC.length).toBe(6)
    expect(classC[0]!).toHaveText('Class C - Executive stock Shares')
    expect(classC[1]!).toHaveText('No Maximum')
    expect(classC[2]!).toHaveText('100')
    expect(classC[3]!).toHaveText('Bitcoin')
    expect(classC[4]!).toHaveText('Yes')
    expect(classC[5]!).toHaveText('Change')

    const ClassCSeries = await rows[9]!.locator('td').all()
    expect(ClassCSeries.length).toBe(6)
    expect(ClassCSeries[0]!).toHaveText('Pre-Seed Shares')
    expect(ClassCSeries[1]!).toHaveText('No Maximum')
    expect(ClassCSeries[2]!).toHaveText('No Par Value')
    expect(ClassCSeries[3]!).toHaveText('')
    expect(ClassCSeries[4]!).toHaveText('Yes')
    expect(ClassCSeries[5]!).toHaveText('Change')
  })

  test('Should be able to add share class', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageShareStructure/currency-other')
    await page.waitForLoadState('networkidle')

    const scForm = page.getByTestId('share-class-form')

    const table = page.getByRole('table')
    await expect(table).toBeVisible()

    // open add share class form
    await page.getByRole('button', { name: 'Add Share Class' }).click()
    await expect(scForm).toBeVisible()

    // fill and add share class
    await scForm.getByTestId('share-class-name-input').fill('Class D')
    await scForm.getByTestId('max-number-shares-input').fill('1000')
    await scForm.getByTestId('par-value-input').fill('10')
    await scForm.getByTestId('par-value-currency-input').click()
    await page.getByRole('option', { name: 'CAD' }).click()
    await scForm.getByText('This share class has special rights or restrictions').click()
    await scForm.getByRole('button', { name: 'Done' }).click()
    await expect(scForm).not.toBeVisible()

    // new share class should be in table
    const classD = await table.getByRole('row').filter({ hasText: 'Class D Shares ' }).locator('td').all()
    expect(classD.length).toBe(6)
    expect(classD[0]!).toContainText('Class D Shares')
    expect(classD[1]!).toHaveText('1000')
    expect(classD[2]!).toHaveText('$10.00')
    expect(classD[3]!).toHaveText('CAD')
    expect(classD[4]!).toHaveText('Yes')
    expect(classD[5]!).toHaveText('Edit')
  })

  test('Should not be able to add share series to a class with a currencyAdditional value', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageShareStructure/currency-other')
    await page.waitForLoadState('networkidle')

    const ssForm = page.getByTestId('share-series-form')
    const table = page.getByRole('table')
    const classA = table.getByRole('row').filter({ hasText: 'Class A - Common Stock Shares' })

    await expect(table).toBeVisible()

    // open add share series form and fill
    await classA.getByRole('button', { name: 'More Actions' }).click()
    await page.getByRole('menuitem', { name: 'Add Series' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Unsupported Currency Type')
    await expect(dialog).toContainText('Current currency is invalid. Update the share class currency to add a new series.')

    await expect(ssForm).not.toBeAttached()
  })

  test('Should be able to edit share class with `OTHER` currency type', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageShareStructure/currency-other')
    await page.waitForLoadState('networkidle')

    const scForm = page.getByTestId('share-class-form')
    const table = page.getByRole('table')
    const classABeforeEdit = table.getByRole('row').filter({ hasText: 'Class A - Common Stock Shares' })

    await expect(table).toBeVisible()

    // assert pre-edited Class A info
    const classABeforeEditColumns = await classABeforeEdit!.locator('td').all()
    const assertClassABeforeEdit = () => {
      expect(classABeforeEditColumns.length).toBe(6)
      expect(classABeforeEditColumns[0]!).toHaveText('Class A - Common Stock Shares')
      expect(classABeforeEditColumns[1]!).toHaveText('No Maximum')
      expect(classABeforeEditColumns[2]!).toHaveText('1')
      expect(classABeforeEditColumns[3]!).toHaveText('Percent of the share')
      expect(classABeforeEditColumns[4]!).toHaveText('Yes')
      expect(classABeforeEditColumns[5]!).toHaveText('Change')
    }
    assertClassABeforeEdit()

    // open edit share class form
    await classABeforeEdit.getByRole('button', { name: 'Change' }).click()
    await expect(scForm).toBeVisible()

    await scForm.getByTestId('share-class-name-input').fill('Class A - Common Stock Updated')

    // par value section should have 'Currency Update' alert and currency input should show invalid state
    const pvSection = scForm.getByTestId('par-value-section')
    await expect(pvSection).toBeVisible()
    await expect(pvSection.getByTestId('currency-update-alert')).toBeVisible()
    const currencyField = pvSection.getByTestId('form-field-currency')
    await expect(currencyField).toContainText('This field is required')
    const currencyInput = currencyField.getByTestId('par-value-currency-input')
    await expect(currencyInput).toHaveAttribute('aria-invalid', 'true')
    await expect(currencyInput).toHaveAttribute('required')

    // selecting a valid currency will hide the 'Currency Update' alert
    await scForm.getByTestId('par-value-currency-input').click()
    await page.getByRole('option', { name: 'CAD' }).click()
    await expect(pvSection.getByTestId('currency-update-alert')).not.toBeVisible()

    // close form
    await scForm.getByRole('button', { name: 'Done' }).click()
    await expect(scForm).not.toBeVisible()

    // assert post-edited Class A info
    const classAAfterEdit = table.getByRole('row').filter({ hasText: 'Class A - Common Stock Updated Shares' })
    const classAAfterEditColumns = await classAAfterEdit!.locator('td').all()
    expect(classAAfterEditColumns.length).toBe(6)
    expect(classAAfterEditColumns[0]!).toHaveText('Class A - Common Stock Updated SharesCHANGED')
    expect(classAAfterEditColumns[1]!).toHaveText('No Maximum')
    expect(classAAfterEditColumns[2]!).toHaveText('$1.00')
    expect(classAAfterEditColumns[3]!).toHaveText('CAD')
    expect(classAAfterEditColumns[4]!).toHaveText('Yes')
    expect(classAAfterEditColumns[5]!).toHaveText('Undo')

    // should be able to undo edits and restore currencyAdditional value
    await classAAfterEdit.getByRole('button', { name: 'Undo' }).click()
    assertClassABeforeEdit()
  })
})
