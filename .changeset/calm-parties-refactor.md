---
"@sbc-connect/nuxt-business-base": minor
---

Refactor ManageParties component and useManageParties composable
- Moved party component and composable to be under the `/manage` directory.
- Renamed the active party model to `active-subject` and kept the default `modelName` as `activeParty`.
- useManageParties only handles table state, accepts an optional `cleanupFn` and uses generic subject naming (`addSubject`, `removeSubject`, `undoSubject`, `editSubject`).
- Table rows are now identified by `new.id` - new parties get a generated UI id which is not sent to the API.
- ManageParties now uses useManageCommon for variants, allowed actions, label overrides and alerts.
