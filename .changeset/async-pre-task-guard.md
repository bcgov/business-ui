---
"@sbc-connect/nuxt-business-base": patch
---

Extended `FilingPagePreTaskGuard` type to support async guards (`boolean | Promise<boolean>`) and await the result in `useFilingPage` submit and save handlers.
