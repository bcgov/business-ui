---
"@sbc-connect/nuxt-business-base": minor
---

Director Change rows follow the design: Cease is the main button, the dropdown opens Change address or Change legal name on its own, inline in the row with a Reset button
- `TableLabelOverrides` gains `removeLabel`, `removeIcon`, `addLabel` and `headers`; `getPartyTableColumns` takes header overrides and `TablePartyColumnOptions` (ISO appointment date, no "to current").
- `TableColumnActions`, `TableBusiness`, `TableParty` and `ManageParties` accept `editOptions` (one dropdown entry per subset of actions, passed along with `init-edit`) and `primaryAction` (`'edit'` or `'remove'`). Defaults are unchanged.
- `ManageParties` gains `hideTableHeading` (add button alone above the table) and `columnOptions`; `partyFormProps` gains `inlineEdit`, `showReset` and `doneFirst`; `SubFormWrapper` and `FormPartyDetails` get a Reset button (`showReset`, `resetDisabled`, `reset`) and `doneFirst`, and `FormPartyDetails` forwards `container` (default `true`); in ManageParties, Reset restores the party on record for the fields of the open edit, as the Vue 2 director change did.
- `FormPartyName` takes `correctionFormUrl` and `hideLabel`; the new `getRegisterCorrectionFormUrl(legalType)` picks the register correction form by business type (form 58 for coops).
- `getDirectorChangeManagePartiesProps` turns all of this on for director change, with delivery before mailing and an "Appointed/Elected" header.
