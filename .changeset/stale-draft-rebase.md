---
"@sbc-connect/nuxt-business-base": minor
---

Draft rebase: resume a draft over filings staff made since it was saved
- BREAKING: `initFiling(businessId, filingName, options)` takes an options object (`filingSubType`, `draftId`, `parties`, `offices`, `shareClasses`, `nameTranslations`, `resolutions`) and returns each requested section merged with the draft; `mergeDraftOffices: false` for read-only offices
- BREAKING: `getBusinessAddresses(businessId, officeTypes?, date?, force?)` returns UI-shaped rows only; the `'table'` form, `formatAddressTableState` and `formatDraftTableState` are removed
- BREAKING: `saveOrUpdateDraftFiling(identifier, body, isSubmission, filingId?, opts?)` - last argument is `{ baseTransactionId?, headers? }`
- `saveOrSubmitFiling`: sends `baseTransactionId` from `useDraftRebase().getSaveOptions`; `syncUrlDraftParam` option
- new `useDraftRebase`, `utils/draft-rebase`, `useBusinessService.getFilingChanges`, `useBusinessQuery.filingChanges` / `filingChangesOptions`: resolve the Legal API `/changes` report against the draft
- `getBusinessParties(..., force)`
- `getCachedOrFetch(options, force)`: a forced fetch joins a request already in flight instead of aborting it
- `TableBusinessState.modifiedByStaff`, "MODIFIED BY STAFF" badge in `getTableBadges`, `ManageYourCompanyFieldBadge` `modifiedByStaff` prop
