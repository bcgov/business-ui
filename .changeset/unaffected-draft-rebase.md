---
"@sbc-connect/nuxt-business-base": patch
---

Draft rebase: no warning or conflict for filings that changed nothing the draft holds
- `AlertDraftRebase`: hidden when the report lists no changes (the unknown-base warning still shows)
- `saveOrSubmitFiling`: a submission that hit 409 re-reads the `/changes` report for the parked draft and resubmits once at the new base when it lists no changes; `useDraftRebase().advanceBaseIfUnaffected`
