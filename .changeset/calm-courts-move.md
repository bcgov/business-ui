---
"@sbc-connect/nuxt-business-base": minor
---

Refactor ManageCourtOrders component and useManageCourtOrders composable
- Moved court order component and composable to be under the `/manage` directory.
- Renamed the active court order model to `active-subject` and the default `modelName` to `activeSubject`.
- Moved `preventActions` and `actionPreventedSignal` into `ManageCourtOrdersProps` - not available on the readonly variants.
- ManageCourtOrders now uses useManageCommon for variants, allowed actions, label overrides and alerts.
- useManageCourtOrders uses cloneDeep and getIsExistingRecord, and undoSubject no longer shares a reference between the old and new state.
- TableCourtOrder syncs isEditing from the expanded state.
