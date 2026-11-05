---
"@sbc-connect/nuxt-business-base": minor
---

Address form options for the Review Imported Data filing
- New `AddressFormProps` (`bcCanadaOnly`, `validateOnOpen`, `noPoBox`, `hideSameAs`, `disabledFields`) is the single way to configure `FormAddress` from `FormOfficeDetails`, `FormPartyDetails`, `ManageOffices` (`addressFormProps`) and `ManageParties` (`partyFormProps.addressFormProps`).
- BREAKING: `bcCanadaOnly` and `validateOnOpen` moved off `ManageOffices` / `FormOfficeDetails` / `FormPartyDetails` / `partyFormProps` into `addressFormProps` (e.g. `bc-canada-only` becomes `:address-form-props="{ bcCanadaOnly: true }"`).
- `getAddressSchema` / `getAddressWithIdSchema` take a `noPoBox` option: the delivery address street cannot be a PO Box. Off by default.
- `hideSameAs` drops the 'same as mailing' checkbox; the caller keeps `sameAs` false on the model.
- `disabledFields` renders the listed inputs disabled and skips their validation errors (`getEditableAddressErrors`).
