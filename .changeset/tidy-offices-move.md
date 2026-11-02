---
"@sbc-connect/nuxt-business-base": minor
---

Refactor ManageOffices component and useManageOffices composable
- Moved office component and composable to be under the `/manage` directory.
- Renamed the active office model to `active-subject` and the default `modelName` to `activeSubject`.
- Moved `preventActions` and `actionPreventedSignal` into `ManageOfficesProps` - not available on the readonly variants.
