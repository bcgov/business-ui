---
"@sbc-connect/nuxt-business-base": minor
---

Court order filing follow-up (required document and details, supporting documents checkbox, radio default)
- `getCourtOrderPoaFullSchema`: with `isFileAndDetailsRequired` an active court order document is now required (`validation.courtOrderDocumentRequired` on `files`); order details no longer satisfy the rule
- `getCourtOrderPoaFullSchema`: with `isFileAndDetailsRequired` the order details are also required (`connect.validation.fieldRequired` on `orderDetails`); `FormCourtOrderPoaFields` sets `aria-required` on the details textarea
- `FormCourtOrderPoaFullFileUpload` / `FormCourtOrderPoaFields`: new `courtOrderFileError` prop renders that error under the Upload Court Order button (`FormCourtOrderPoaFullFiling` passes it)
- `FormCourtOrderPoaFullFileUpload` checkbox variant: "Add supporting documents" is always enabled; unchecking with supporting documents uploaded asks first (`modal.removeSupportingDocs`, `label.removeDocuments`) and Remove Documents removes them all
- Radio groups: the default (list) radio ring is now `ring-neutral`, matching the checkbox
- BREAKING: `validation.enterCourtOrderOrUploadFile` is removed
- BREAKING: the `isFileOrDetailsRequired` schema context option and component prop (`FormCourtOrderPoaFields`, `FormCourtOrderPoaFullFileUpload`, its fieldset) are renamed `isFileAndDetailsRequired`
