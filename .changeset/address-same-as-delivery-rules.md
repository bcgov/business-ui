---
"@sbc-connect/nuxt-business-base": patch
---

`FormAddress` "Delivery Address same as Mailing Address" works with the delivery-only rules (`bcCanadaOnly: 'delivery'`, `noPoBox`):
- While checked, the delivery address mirrors mailing address edits instead of resetting and unchecking.
- A delivery-only error (e.g. a PO Box street, or outside BC when only the delivery address must be in BC) unchecks it and shows the delivery inputs, prefilled with the mailing address, with the error. The page scrolls to the first delivery error and focuses it. Errors both addresses share stay on the mailing inputs with the box left checked.
- The box is greyed out while the mailing address cannot be used as the delivery address.
