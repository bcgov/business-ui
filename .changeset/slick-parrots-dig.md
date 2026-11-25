---
"@sbc-connect/nuxt-business-base": patch
---

Add optional `showCompletingParty` prop to `FormConfirmAuthorization` for staff filings. When set, a required Completing Party name field is shown above the authorization section and the checkbox and description use the completing party wording. The authorization date now displays in bold long format (e.g. "November 24, 2026") and "Business Corporations Act" is italicized in the offence note. `getConfirmAuthorizationSchema` accepts an optional `requireCompletingParty` option.
