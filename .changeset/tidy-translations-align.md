---
"@sbc-connect/nuxt-business-base": minor
---

Align ManageNameTranslations with the manage conventions. Move component to components/Manage/NameTranslations and composable to composables/manage. useManageNameTranslations now only handles tableState, accepts an optional opts.cleanupFn, uses generic subject naming (addSubject, editSubject, removeSubject, undoSubject), updates rows by new.id and uses cloneDeep and isEqualOmit. ManageNameTranslations handles expanded/adding state locally, uses useManageCommon and no longer requires the active-name-translation model. TableNameTranslation sets get-row-id to row.new.id and syncs isEditing from the expanded state.
