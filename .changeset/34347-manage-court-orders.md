---
"@sbc-connect/nuxt-business-base": minor
---

### Components
- **New** - `TableCourtOrder` table component and column utilities
- **New** - `ManageCourtOrders` feature component

### Composables
- `useManageCourtOrders`
  - Table state management
  - Methods for add, edit, remove, and undo actions

### Schemas & Models
- Update court order Zod schemas to align with JSON schema and form models

### Services
- Add court orders query hook, service abstraction, and API interface

### Utils & i18n
- Add `isEqualOmit` object comparison utility
- Add court order i18n translation keys