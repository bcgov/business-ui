# Filing Tombstone Composable (useFilingTombstone)

This is a wrapper composable used to manage the state of the main "tombstone" header on filing pages. This composable can programatically set any text, buttons, links, badges, etc in the tombstone component. Please see the [ConnectTombstone Examples](https://github.com/bcgov/connect-nuxt/tree/main/packages/layers/base/.playground/app/pages/examples/components/ConnectTombstone) for full usage details.

## Methods

- setFilingDefault
- resetFilingTombstone

## State

- filingTombstone

## Examples:

```ts
const { setFilingDefault, filingTombstone } = useFilingTombstone()
const businessApi = useBusinessApi()
const businessId = 'BC1234567'

try {
  filingTombstone.value.loading = true

  const [business, authInfo] = await Promise.all([
    businessApi.getBusiness(businessId),
    businessApi.getAuthInfo(businessId)
  ])

  setFilingDefault(business, authInfo)
} catch {
  // handle errors
} finally {
  filingTombstone.value.loading = false
}
```

## Testing

When writing tests for functionality that uses useFilingTombstone, mock the composable to isolate your component.

### Mocking for Unit Tests (Vitest)

You can use the [mockNuxtImport](https://nuxt.com/docs/4.x/getting-started/testing#mocknuxtimport) utility to replace the real composable with a mock object.

#### Example:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import MyPageComponent from '~/pages/MyPageComponent.vue'

const mockSetFilingDefault = vi.fn()
mockNuxtImport('useFilingTombstone', () => {
  return () => ({
    setFilingDefault: mockSetFilingDefault,
    filingTombstone: ref({}),
    resetFilingTombstone: vi.fn()
  })
})

const mockBusinessApi = {
  getBusiness: vi.fn().mockResolvedValue({ legalName: 'Test Inc.' }),
  getAuthInfo: vi.fn().mockResolvedValue({ corpType: { desc: 'Limited Co.' } })
}
mockNuxtImport('useBusinessApi', () => () => mockBusinessApi)


describe('MyPageComponent', () => {
  it('should call setFilingDefault with the correct data on mount', async () => {
    await mountSuspended(MyPageComponent)

    expect(mockSetFilingDefault).toHaveBeenCalledOnce()
    
    expect(mockSetFilingDefault).toHaveBeenCalledWith(
      expect.objectContaining({ legalName: 'Test Inc.' }),
      expect.objectContaining({ corpType: { desc: 'Limited Co.' } })
    )
  })
})
```

### End-to-End Tests (Playwright)

Access the tombstone by test-id.

```ts
import { test, expect } from '@playwright/test'

test('should display the business name in the tombstone', async ({ page }) => {
  // filing layout test-id only
  const tombstone = page.getByTestId('business-filing-tombstone')
  await expect(tombstone).toBeVisible()
  await expect(tombstone).toContainText('Test Inc.')
});
```
