---
"@sbc-connect/nuxt-business-base": minor
---

Address form options for the Review Imported Data filing
- `getAddressSchema` / `getAddressWithIdSchema` take a `noPoBox` option: the delivery address street cannot be a PO Box (raised on the mailing street while 'same as' is checked). Off by default.
- `FormAddress` takes `noPoBox`, `hideSameAs` (drops the 'same as mailing' checkbox) and `disabledFields` (per-address inputs to render disabled).
- `FormOfficeDetails`, `FormPartyDetails`, `ManageOffices` (`addressFormProps`) and `ManageParties` (`partyFormProps.addressFormProps`) pass them through.
