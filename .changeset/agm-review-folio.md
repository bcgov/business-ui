---
"@sbc-connect/nuxt-business-base": patch
---

FormFolio follows the folio design from bcgov/entity#35355 wherever it is used: when the business has a folio on file it offers "Use Default Folio or Reference Number" or "Enter a different number for this transaction only", otherwise the single input stays as before. The section is marked optional, the section and card texts follow the design for both states, and the folio max length is 30 characters for all filings. The `defaultFolio` prop overrides the value from the business store.
