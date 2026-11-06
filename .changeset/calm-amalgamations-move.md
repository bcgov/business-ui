---
"@sbc-connect/nuxt-business-base": minor
---

Refactor ManageAmalgamation component and useManageAmalgamation composable
- Moved amalgamation component and composable to be under the `/manage` directory.
- Renamed the active amalgamation models to `active-subject` (the statement model stays `active-amal-stmnt`), and the default model name to `activeSubject`. Added a `statementModelName` prop.
- Moved `preventActions` and `actionPreventedSignal` into `ManageAmalgamationProps` - not available on the readonly variants.
- ManageAmalgamation now uses useManageCommon for variants, allowed actions, label overrides and alerts, and shows the task guard alert when an action is prevented from the table or statement.
- ManageAmalgamationStatement now receives the parent `stateKey`.
- useManageAmalgamation uses cloneDeep and getIsExistingRecord, and undoSubject no longer shares a reference between the old and new state.
- TableAmalgamation syncs isEditing from the expanded state and accepts `hideActionsWhen`.
