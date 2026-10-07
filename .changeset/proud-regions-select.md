---
"@sbc-connect/nuxt-business-base": minor
---

New FormForeignJurisdiction section form + getForeignJurisdictionSchema for the consent/continuation-out filings: country select (Canada/US pinned first) with a region select for CA/US only — Canadian regions exclude BC and include Federal, US regions are states — matching legal-api's validate_foreign_jurisdiction rules; region clears on country change.
