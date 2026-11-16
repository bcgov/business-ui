---
"@sbc-connect/nuxt-business-base": minor
---

Refactor ManageAmalgamation component and useManageAmalgamation composable
- Moved amalgamation component and composable to be under the `/manage` directory.
- Combined the amalgamating business and statement models into a single `active-subject` model, typed by the new `getActiveAmalgamationSchema()` zod discriminated union (`key: 'business' | 'statement'`), matching ManageShareStructure. Removed the `active-amal-stmnt` model, and the default model name is now `activeSubject`. Consumers nested in a parent UForm pass `model-name="<key>.value"`.
- Removed `getActiveAmalgamationCorrectSchema`/`getActiveAmalgamationCorrectStatementSchema` and their types; `addSubject`, `editSubject` and `updateStatement` in useManageAmalgamation now take `ActiveAmalgamationSchema`.
- Moved `preventActions` and `actionPreventedSignal` into `ManageAmalgamationProps` - not available on the readonly variants.
- ManageAmalgamation now uses useManageCommon for variants, allowed actions, label overrides and alerts, and shows the task guard alert when an action is prevented from the table or statement.
- ManageAmalgamationStatement now receives the parent `stateKey`.
- useManageAmalgamation uses cloneDeep and getIsExistingRecord, and undoSubject no longer shares a reference between the old and new state.
- TableAmalgamation syncs isEditing from the expanded state and accepts `hideActionsWhen`.
