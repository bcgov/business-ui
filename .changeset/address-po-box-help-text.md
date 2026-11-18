---
"@sbc-connect/nuxt-business-base": minor
---

`FormAddress` delivery addresses cannot be a PO Box by default (`noPoBox` now defaults to `true`), with the "Address cannot be a PO Box" hint under the delivery street. Pass `noPoBox: false` to allow a PO Box delivery address (e.g. liquidators); the hint is hidden then.
