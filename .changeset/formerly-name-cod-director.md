---
"@sbc-connect/nuxt-business-base": patch
---

Show "Formerly [OLD NAME]" under the new name for NAME_CHANGED parties
- `getPartyNameColumn`, `getPartyTableColumns`, `TableParty` and `ManageParties` show the previous name in italic below the new name wherever a party's name was changed (Change of Directors, corrections, officer change and any other party table).
- `showFormerName` defaults to `true`; pass `false` to opt a table out.
