---
"@sbc-connect/nuxt-business-base": patch
---

FormFolio offers the business's default folio or a different number for this transaction only (design from bcgov/entity#35355). It applies wherever FormFolio is used: when the business has a folio on file the two options show, otherwise the single input stays as before. The `defaultFolio` prop overrides the value from the business store.
