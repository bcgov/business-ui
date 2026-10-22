---
"@sbc-connect/nuxt-business-base": patch
---

Add showFormerName opt-in to getPartyNameColumn
- Add `showFormerName` parameter (default `false`) to `getPartyNameColumn` to gate the "Formerly [OLD NAME]" display.
- When `true`, shows the previous name in italic below the new name for NAME_CHANGED parties.
- No existing table is affected by default; callers that need the feature (e.g. the COD director table) must pass `showFormerName: true`.
