---
"@sbc-connect/nuxt-business-base": patch
---

Show formerly name in director table for NAME_CHANGED directors
- Display "Formerly [OLD NAME]" in italic below the new name in the Name column when a director has the NAME_CHANGED action.
- Uses `row.original.old?.name` to derive the former name from the pre-change state.
