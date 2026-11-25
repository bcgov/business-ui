---
"@sbc-connect/nuxt-business-base": patch
---

Add a staff variant to `FormConfirmAuthorization` with a required Completing Party name field
- New optional `showCompletingParty` prop shows a required Completing Party field above the authorization section and uses the completing party wording for the description and checkbox label. When `order` is passed, the two sections are numbered consecutively.
- For all usages: the section heading now reads "Authorization", the date is shown in bold long format (e.g. "November 24, 2026"), "Business Corporations Act" is italicized in the offence note, and only the checkbox border (not the label text) turns red on validation failure.
- `getConfirmAuthorizationSchema` now includes an optional `completingParty` field, so existing callers are unaffected.
- Added `getConfirmAuthorizationStaffSchema` (completing party required, trimmed) and `getConfirmAuthorizationDefaults` (unchecked, empty starting state).
