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
- `TableBusinessState.modifiedByStaff`, "MODIFIED BY STAFF" badge in `getTableBadges` (shown only while the row has no action of its own; undo brings it back), `ManageYourCompanyFieldBadge` `modifiedByStaff` prop
- new `AlertDraftRebase`: the warning under a filing heading listing what staff changed per section since the draft was started (reads `useDraftRebase().report`; hidden until a draft is rebased); `DraftChangeConflict` / `DraftChangeApplied` / `DraftChangeAbsorbed` gain the Legal API's `change: added | modified | removed`; `resolveDraftConflicts` pairs share classes by `rowId` before name (a staff rename substitutes the renamed class instead of keeping the draft's old-name row beside it); `courtOrders` joins `DraftChangesSection` / `StaffModifiedKeys` / `staleIds` (correction drafts: the draft's row for a court order staff changed is dropped so the current one shows through, badged by id)
- `useFilingModals().openDraftStaleModal`: `openSaveFilingErrorModal` shows it instead of the generic error when a rebased submission hit 409 (the work is parked as a draft; "Review Changes" reloads the page, "Return to My Business" leaves)
- BREAKING: the dead `useFilingModals().openPendingTaskOnSaveOrSubmitModal` and its `modal.error.filing.pendingTaskOnSaveOrSubmit` strings are removed
- `useFilingPage().submitFiling` keeps the resumed draft id in the url when the failed submit carried no filing
- `useFilingModals().openGetDraftChangesErrorModal`: `initFiling` opens it and returns no draft when the changes report fails for any reason but a 404 (the 404 still resumes the draft as saved)
- `BusinessLedgerItem.filedByStaff` (optional, copied onto the bootstrap ledger item) - the submitter side legal-api reports on every ledger row
