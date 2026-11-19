---
"@sbc-connect/nuxt-business-base": minor
---

Court order form redesign (plain court order section, standalone filing section and the correction sub form)
- `FormCourtOrderPoa`: one "Court Order" row with the number above the Plan of Arrangement checkbox; the hint (`text.courtOrderNumberHint`) sits in the card above the input and the error shows under the input with the caution icon; input label is `label.courtOrderNumberIfExists`; checking Plan of Arrangement with no number shows `validation.courtOrderNumberRequired` right away
- `FormCourtOrderPoaFields`: one "Court Order" row with the number above the Plan of Arrangement checkbox; "Court Order Details" is a multi-line `ConnectTextarea` that autogrows and stays resizable (`label.courtOrderDetails` / `label.courtOrderDetailsOpt`)
- `FormCourtOrderPoaFullFileUpload`: opt-in `supportingDocsCheckbox` variant puts the supporting documents upload behind an "Add supporting documents" checkbox (`v-model:has-supporting-docs`, `label.addSupportingDocuments`, `supportingDocsError`) - disabled while supporting documents exist; without it the supporting upload always shows, as before
- `getCourtOrderPoaFullSchema`: UI-only `hasSupportingDocs` field (derived true from the files on parse, omitted from the manage court orders edit equality check); with `isFileOrDetailsRequired` it errors with `validation.addSupportingDocsOrUncheck` when checked with nothing uploaded; new `hasActiveSupportingDoc` helper
- `FormCourtOrderPoaFullFiling`: uses the checkbox variant and no longer renders a visible legend (the fieldset keeps its accessible name)
- `FormCourtOrderPoaFullFileUploadItem.readonly`: hides the file actions for review displays
- Court order max upload size is now 50 MB
- BREAKING: `FormCourtOrderPoaFullFiling` `order` prop is removed
- BREAKING: `label.courtOrderText`, `label.addCourtOrderText`, `label.addCourtOrderTextOpt`, `label.courtOrderNumberOpt` and `text.courtOrderAndPoaDescription` are removed
