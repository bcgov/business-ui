---
"@sbc-connect/nuxt-business-base": patch
---

Add the reviewImportedData filing type, its REVIEW_IMPORTED_DATA_FILING permission mapping and filing name. Address schemas and ManageOffices accept `bcCanadaOnly: 'delivery'` (delivery address only), ManageOffices gains a `hideRemove` prop, and BusinessWarning.data types the missing info `officeType` / `partyId` keys.
