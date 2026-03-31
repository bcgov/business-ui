# Business Service (useBusinessService)

The `useBusinessService` acts as an abstraction layer over the reactive `useBusinessQuery`. It is designed for contexts where you need to `await` data manually without the need for Vue's reactive hook lifecycle.

All responses are strongly typed to provide better DX. Errors are not caught in these methods. All errors are allowed to propagate so the caller can handle specific use cases as necessary.

---

## Service vs. Query

| Context | Recommended | Why? |
| :--- | :--- | :--- |
| **Vue Components / Pages** | `useBusinessQuery` | Best for UI. It provides reactive isLoading and error states so the interface stays in sync automatically. |
| **Pinia Stores** | `useBusinessService` | Best for State. Allows you to await data inside actions without the risk of memory leaks or lifecycle errors. |
| **Route Guards / Middleware** | `useBusinessService` | Best for Logic. Good for blocking navigation until you’ve validated data or verified permissions. |
| **Complex Tasks** | `useBusinessService` | Best for Control. Ideal for running multiple requests in a row (Promise.all) or handling "if-then" logic. |

[!IMPORTANT]
**Memory & Garbage Collection** > Avoid calling `useBusinessQuery` outside of a component's setup context (e.g., in a Pinia Store or a global utility). Doing so creates a subscription tied to the global scope rather than a component lifecycle. This keeps the query "active" indefinitely, preventing Pinia Colada from marking the data as inactive and disabling automatic garbage collection. Always use `useBusinessService` in stores and global contexts to ensure data is fetched and released properly.

[!TIP]
Avoid using this service in a .vue file. If you find yourself manually creating `const loading = ref(true)` before calling this service, you should be using useBusinessQuery instead.

---

## Features

### Pinia Colada Integration
This service is built on top of [Pinia Colada](https://pinia-colada.esm.dev/). 
* **Caching:** All `GET` requests automatically check the global cache.
* **Manual Refetch:** Pass the `force: true` parameter to bypass the cache and trigger a fresh network request.

### TypeScript
- **Function Overloads:** Methods like `getBusiness` use overloads to narrow the return type. If you pass `slim: true`, the return type automatically changes to `BusinessDataSlim`.

### Standardized API Access
Uses the [$businessApi](../plugins/business-api.md) plugin internally, ensuring that the base URL, authentication header, account ID, app source and API key are automatically added to every request.

---

## Methods

- getAddresses
- getAndValidateDraftFiling
- getAuthInfo
- getAuthorizedActions
- getBusiness
- getBootstrapFiling
- getDocument
- getFiling
- getFilingComments
- getFilingDocumentUrls
- getLedger
- getLinkedNameRequest
- getShareClasses
- getTasks
- getParties
- postFiling
- saveOrUpdateDraftFiling
- deleteFiling

---

## Examples

### Sequential and Concurrent Requests
Ideal for "Setup" logic where you need multiple pieces of data before proceeding.

```ts
const service = useBusinessService()
const businessId = 'BC1234567'

// Concurrent fetching
const [business, officers] = await Promise.all([
  service.getBusiness(businessId),
  service.getParties(businessId, { classType: 'officer' })
])
```

### Usage in a Pinia Store
Since Pinia actions are standard functions, the Service is the correct choice here to avoid memory leaks.

```ts
export const useFilingStore = defineStore('filing', () => {
  const service = useBusinessService()

  async function loadInitialData(id: string) {
    const data = await service.getBusiness(id)
    return data
  }
})
```

## Testing
When writing tests for functionality that uses useBusinessService, mock the service to isolate your component and control the API responses.

### Mocking for Unit Tests (Vitest)
You can use the [mockNuxtImport](https://nuxt.com/docs/4.x/getting-started/testing#mocknuxtimport) utility to replace the real service with a mock object.

#### Example:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

const mockBusinessService = {
  getBusiness: vi.fn(),
  getParties: vi.fn(),
  getPendingTask: vi.fn(),
  getAndValidateDraftFiling: vi.fn(),
  getAuthInfo: vi.fn(),
  getTasks: vi.fn()
}
mockNuxtImport('useBusinessService', () => () => mockBusinessService)

describe('MyComponent', () => {
  it('should call getBusiness on mount', async () => {
    mockBusinessService.getBusiness.mockResolvedValue({ legalName: 'Test Inc.' })

    const wrapper = await mountSuspended(MyComponent)

    expect(mockBusinessService.getBusiness).toHaveBeenCalledOnce()
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
