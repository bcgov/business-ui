---
"@sbc-connect/nuxt-business-base": patch
---

Show "Formerly [OLD NAME]" for renamed directors in Change of Directors
- Add opt-in `showFormerName` (default `false`) to `getPartyNameColumn`, `getPartyTableColumns`, `TableParty` and `ManageParties`, since these are shared by every party type.
- When `true`, shows the previous name in italic below the new name for NAME_CHANGED parties.
- `getDirectorChangeManagePartiesProps` now sets `showFormerName: true`, so COD director tables show the former name.
