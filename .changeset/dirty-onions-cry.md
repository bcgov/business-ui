---
"@sbc-connect/nuxt-business-base": minor
---

### Components
- **New** - Resolution date sub form
- **New** - HelpExpansion
- **New** - SubFormFieldWrapper
- `ManageShareStructure` - Add resolution date components and methods
- `BusinessTable` - Add `hideTableHeader` and `trDividerFullWidth` props

### Composables
- `useManageShareStructure`
  - Rename `tableState` ref -> `shareClasses`
  - Add `resolutionDates` ref
  - Add resolution date methods

### Utils
- Add resolution table columns configurations
- Add resolution date Zod validation schema

### Services
- Add resolutions query hook, query options, and API service methods
