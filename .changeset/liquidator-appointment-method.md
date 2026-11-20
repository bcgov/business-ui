---
"@sbc-connect/nuxt-business-base": minor
---

`ManageParties` renders a liquidator specific sub form (`FormLiquidatorDetails`) when `roleType` is Liquidator, in place of `FormPartyDetails`:
- "Appointed by" the company or the court (required), with a required court order number when appointed by the court. Stored on the liquidator role's `meta` (`appointmentMethod`, `courtOrderNumber`), matching the business-schemas relationship schema.
- A required effective date, stored on the liquidator role's `appointmentDate` (bounded by `partyFormProps.effectiveDateBounds`).
