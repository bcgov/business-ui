---
"@sbc-connect/nuxt-business-base": patch
---

Add an opt-in default folio option to FormFolio
- New `defaultFolio` prop offers "Use Default Folio or Reference Number" or "Enter a different number for this transaction only". Without it, FormFolio is unchanged.
- Used by the AGM Location Change review page.

Add the `connect-pay-tombstone-buttons-split` layout and `ButtonControlGroup` component
- The layout puts the right button group (cancel/submit) under the fee summary and keeps the left group (back/save) in the bottom bar.
