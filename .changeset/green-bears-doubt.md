---
"@sbc-connect/nuxt-business-base": minor
---

- ManageShareStructure: handle standalone resolution date sync automatically
  - Add an optional `resolutionDate` property to `useManageShareStructure` options.
  - Sync standalone date input directly into the `resolutionDates` array whenever provided and valid.
  - Update `ManageShareStructure` to display all dates when in `readonly` variant or omit the active standalone date outside of readonly variant.
