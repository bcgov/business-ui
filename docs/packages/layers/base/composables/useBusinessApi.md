# Business API Composable (useBusinessApi)

This composable is a service layer for talking to the Business API (lear) and the Auth API (entity info only). All responses are stongly typed to provide better DX. **Errors are not caught in these methods**, this allows handling of specific error responses by the end user.

## Methods

- getFilingById
- deleteFilingById
- postFiling
- saveOrUpdateDraftFiling
- getBusiness
- getParties
- getTasks
- getPendingTask
- getAndValidateDraftFiling
- createFilingPayload
- getAuthInfo

## Examples:

### Concurrent Requests

```ts
const businessApi = useBusinessApi()
const businessId = 'BC1234567'

const [business, officers] = await Promise.all([
  businessApi.getBusiness(businessId),
  businessApi.getParties(businessId, { classType: 'officer' })
])

// business typed as BusinessData | BusinessDataSlim
// parties typed as OrgPerson[]
```

### Typescript Function Overloads

[TS Function Overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads) are used where appropriate to correctly narrow the response type.

```ts
const businessApi = useBusinessApi()
const businessId = 'BC1234567'

const business = await businessApi.getBusiness(businessId)
const businessSlim = await businessApi.getBusiness(businessId, true) // { query: { slim: true } }

// business typed as BusinessData
// businessSlim typed as BusinessDataSlim
```

### Typescript Intersection

[TS intersection](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types) is used where appropriate to correctly narrow the types.

```ts
const businessApi = useBusinessApi()
const business = { ...businessInfo }

const payload = businessApi.createFilingPayload<{
  changeOfOfficers: ChangeOfOfficersData,
  someOtherFiling: SomeOtherFilingData
}>(
  business,
  'multiFilingPayload',
  { 
    changeOfOfficers: { ...data },
    someOtherFiling: { ...data }
  }
)

// safely access these properties
payload.filing.changeOfOfficers.anythingDefined
payload.filing.someOtherFiling.anythingDefined
```

## Testing

When writing tests for functionality that uses useBusinessApi, mock the composable to isolate your component and control the API responses.

### Mocking for Unit Tests (Vitest)

You can use the [mockNuxtImport](https://nuxt.com/docs/4.x/getting-started/testing#mocknuxtimport) utility to replace the real composable with a mock object.

#### Example:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

const mockBusinessApi = {
  getBusiness: vi.fn(),
  getParties: vi.fn(),
  getPendingTask: vi.fn(),
  getAndValidateDraftFiling: vi.fn(),
  getAuthInfo: vi.fn(),
  getTasks: vi.fn()
}
mockNuxtImport('useBusinessApi', () => () => mockBusinessApi)

describe('MyComponent', () => {
  it('should call getBusiness on mount', async () => {
    mockBusinessApi.getBusiness.mockResolvedValue({ legalName: 'Test Inc.' })

    const wrapper = await mountSuspended(MyComponent)

    expect(mockBusinessApi.getBusiness).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('Test Inc.')
  })
})
```

### Mocking for End-to-End Tests (Playwright)

In End-to-End (E2E) tests, mock the network requests that the composable makes using Playwright's page.route() function.

#### Examples:

##### Success Response

```ts
import { test, expect } from '@playwright/test'

test('should display the business name from the mocked API', async ({ page }) => {
  const identifier = 'BC1234567'

  // match the url for any of the methods
  await page.route(`*/**/businesses/${identifier}`, async (route) => {
    await route.fulfill({ json: { business: { legalName: 'Test Inc.', ...otherData } } });
  });

  await page.goto(`/some-page-that-uses-the-composable/${identifier}`);

  await expect(page.getByText('Test Inc.')).toBeVisible();
});
```

##### Error Response

```ts
import { test, expect } from '@playwright/test'

test('should display an error message', async ({ page }) => {
  const identifier = 'BC1234567'

  // match the url for any of the methods
  await page.route(`*/**/businesses/${identifier}`, async (route) => {
    await route.fulfill({ status: 401 });
  });

  await page.goto(`/some-page-that-uses-the-composable/${identifier}`);

  await expect(page.getByText('Test Inc.')).not.toBeVisible();
  await expect(page.getByText('Unauthorized')).toBeVisible();
});
```
