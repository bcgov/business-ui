# Business Tombstone Composable (useBusinessTombstone)

This is a wrapper composable used to manage the state of the main "tombstone" header on filing/dashboard pages. This composable can programatically set any text, buttons, links, badges, etc in the tombstone component. Please see the [ConnectTombstone Examples](https://github.com/bcgov/connect-nuxt/tree/main/packages/layers/base/.playground/app/pages/examples/components/ConnectTombstone) for full usage details.

## Methods

- resetTombstone
- setFilingDefault
- setPublicDefault

## State

- businessTombstone

## Examples:

```ts
const { setFilingDefault, businessTombstone } = useBusinessTombstone()
const service = useBusinessService()
const businessId = 'BC1234567'

try {
  businessTombstone.value.loading = true

  const [business, authInfo] = await Promise.all([
    service.getBusiness(businessId),
    service.getAuthInfo(businessId)
  ])

  setFilingDefault(business, authInfo)
} catch {
  // handle errors
} finally {
  businessTombstone.value.loading = false
}
```

## Testing

When writing tests for functionality that uses useBusinessTombstone, mock the composable to isolate your component.

### Mocking for Unit Tests (Vitest)

You can use the [mockNuxtImport](https://nuxt.com/docs/4.x/getting-started/testing#mocknuxtimport) utility to replace the real composable with a mock object.

#### Example:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import MyPageComponent from '~/pages/MyPageComponent.vue'

const mockSetFilingDefault = vi.fn()
mockNuxtImport('useBusinessTombstone', () => {
  return () => ({
    setFilingDefault: mockSetFilingDefault,
    businessTombstone: ref({}),
    resetTombstone: vi.fn()
  })
})

const mockBusinessService = {
  getBusiness: vi.fn().mockResolvedValue({ legalName: 'Test Inc.' }),
  getAuthInfo: vi.fn().mockResolvedValue({ corpType: { desc: 'Limited Co.' } })
}
mockNuxtImport('useBusinessService', () => () => mockBusinessService)


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
