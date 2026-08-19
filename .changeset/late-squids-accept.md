---
"@sbc-connect/nuxt-business-base": minor
---

- **ManageCourtOrders**: Added `addDefaultValues` prop to support pre-populating default state when adding a new court order.
- **FormCourtOrderPoaFull / Schema**: Updated `effectOfOrder` default handling in schema normalization to ensure consistent boolean conversion.
- **Court Order Formatters**: Added utility functions to normalize court order data between table UI state and backend API payloads.
- **useManageX Composables**: Added a reactive `hasChanges` computed property across management composables (`useManageCourtOrders`, `useManageOffices`, `useManageShareStructure`, etc.) to track section mutation states.
