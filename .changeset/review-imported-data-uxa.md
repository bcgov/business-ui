---
"@sbc-connect/nuxt-business-base": minor
---

ManageOffices / ManageParties: add a `before-table` slot for a notice above the table, a `validateOnOpen` option (ManageOffices prop / `partyFormProps.validateOnOpen`) that opens an address form with its validation errors shown, and `labelOverrides.invalidAddress` to mark incomplete mailing / delivery addresses in their table cells. FormAddress: `validateOnMount` prop.

FormAddress: the "Delivery Address same as Mailing Address" checkbox now leads the Delivery Address section (Components 2.0); the delivery inputs render under it while unchecked.
