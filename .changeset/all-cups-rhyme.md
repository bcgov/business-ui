---
"@sbc-connect/nuxt-business-base": minor
---

BREAKING CHANGES: Remove useBusinessApi composable, createFilingPayload now comes from useFiling while all api requests are now inside useBusinessService. Replaced all implementations of useBusinessApi with useBusinessService.
